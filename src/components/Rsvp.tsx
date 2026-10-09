import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { events, type EventId } from '../config/events';
import { story } from '../config/story';
import { rsvpConfig } from '../config/rsvp';
import { formatShortDate, formatEventTime } from '../lib/dates';
import { looksLikeEmail, looksLikePhone, newSubmissionId, submitRsvp } from '../lib/rsvp';
import { storage } from '../lib/device';
import { Paw } from './icons';
import { PariSays } from './PariSays';

type Attending = 'yes' | 'no' | '';
interface Draft {
  fullName: string;
  contactType: 'email' | 'phone';
  contact: string;
  attending: Attending;
  events: EventId[];
  partySize: string;
  dietary: string;
  message: string;
  songRequest: string;
}

const EMPTY: Draft = { fullName: '', contactType: 'email', contact: '', attending: '', events: [], partySize: '1', dietary: '', message: '', songRequest: '' };
const DRAFT_KEY = 'hr-rsvp-draft';
const SENT_KEY = 'hr-rsvp-sent';

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success' } | { kind: 'error'; message: string };
type Errors = Partial<Record<'fullName' | 'contact' | 'attending' | 'events' | 'partySize', string>>;

function loadDraft(): Draft {
  try {
    const raw = storage.get(DRAFT_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function validate(d: Draft): Errors {
  const e: Errors = {};
  if (d.fullName.trim().length < 2) e.fullName = 'Please enter your full name.';
  if (!d.contact.trim()) e.contact = d.contactType === 'email' ? 'Please enter an email address.' : 'Please enter a phone number.';
  else if (d.contactType === 'email' && !looksLikeEmail(d.contact)) e.contact = 'That email address doesn’t look quite right.';
  else if (d.contactType === 'phone' && !looksLikePhone(d.contact)) e.contact = 'Please enter a phone number with country code, e.g. +91 98765 43210.';
  if (!d.attending) e.attending = 'Please let us know if you can join.';
  if (d.attending === 'yes') {
    if (!d.events.length) e.events = 'Please choose at least one celebration.';
    const n = Number(d.partySize);
    if (!Number.isInteger(n) || n < 1 || n > rsvpConfig.maxPartySize) e.partySize = `Please enter a number from 1 to ${rsvpConfig.maxPartySize}.`;
  }
  return e;
}

export function RsvpSection() {
  const s = story.rsvp;
  const [d, setD] = useState<Draft>(loadDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [alreadySent] = useState(() => storage.get(SENT_KEY) === '1');
  const [hp, setHp] = useState('');
  const submissionId = useRef(newSubmissionId());
  const inFlight = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Keep a local draft (this device only) so a guest can come back to it.
  useEffect(() => {
    if (status.kind === 'success') return;
    const t = setTimeout(() => {
      const isEmpty = JSON.stringify(d) === JSON.stringify(EMPTY);
      if (isEmpty) storage.remove(DRAFT_KEY);
      else storage.set(DRAFT_KEY, JSON.stringify(d));
    }, 400);
    return () => clearTimeout(t);
  }, [d, status.kind]);

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((prev) => ({ ...prev, [k]: v }));
    if (status.kind === 'error') setStatus({ kind: 'idle' });
    // A changed form is a new submission.
    submissionId.current = newSubmissionId();
  };

  const toggleEvent = (id: EventId) => update('events', d.events.includes(id) ? d.events.filter((x) => x !== id) : [...d.events, id]);

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (inFlight.current || status.kind === 'success') return;
    const errs = validate(d);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (hp) return; // bot trap
    inFlight.current = true;
    setStatus({ kind: 'submitting' });
    const result = await submitRsvp({
      submissionId: submissionId.current,
      fullName: d.fullName.trim(),
      contact: d.contact.trim(),
      contactType: d.contactType,
      events: d.attending === 'yes' ? d.events : [],
      partySize: d.attending === 'yes' ? Number(d.partySize) : 0,
      dietary: d.dietary.trim(),
      message: d.message.trim(),
      songRequest: d.songRequest.trim(),
      submittedAt: new Date().toISOString(),
    });
    inFlight.current = false;
    if (result.ok) {
      setStatus({ kind: 'success' });
      storage.remove(DRAFT_KEY);
      storage.set(SENT_KEY, '1');
    } else {
      setStatus({ kind: 'error', message: result.error });
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const errorList = useMemo(() => Object.entries(errors) as [keyof Errors, string][], [errors]);
  const fieldId = (k: string) => `rsvp-${k}`;
  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p className="field__error" id={`${fieldId(k)}-err`}>
        {errors[k]}
      </p>
    ) : null;
  const describe = (k: keyof Errors, hint?: string) => [errors[k] ? `${fieldId(k)}-err` : '', hint ?? ''].filter(Boolean).join(' ') || undefined;

  const submitting = status.kind === 'submitting';
  const firstName = d.fullName.trim().split(/\s+/)[0];

  return (
    <section id="rsvp" data-chapter="rsvp" className="chapter chapter--rsvp" aria-labelledby="rsvp-title">
      <div className="rsvp">
        <div className="rsvp__intro">
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 id="rsvp-title" className="chapter__title">
            {s.title}
          </h2>
          <p>{s.intro}</p>
        </div>

        {status.kind === 'success' ? (
          <div className="rsvp-done" ref={statusRef} tabIndex={-1} role="status">
            <div className="paw-stamp" aria-hidden="true">
              <Paw width={64} height={64} />
            </div>
            <h3>Thank you{firstName ? `, ${firstName}` : ''}!</h3>
            <p>Your RSVP has been sent to Harsh &amp; Rimi. Pari has stamped it personally.</p>
          </div>
        ) : (
          <form className="rsvp-form" onSubmit={onSubmit} noValidate>
            {alreadySent && <p className="small-note">You’ve already sent an RSVP from this device. Sending again will update it.</p>}
            {errorList.length > 0 && (
              <div className="error-summary" ref={summaryRef} tabIndex={-1} role="alert">
                <p>
                  <strong>Please check {errorList.length === 1 ? 'one thing' : `${errorList.length} things`}:</strong>
                </p>
                <ul>
                  {errorList.map(([k, m]) => (
                    <li key={k}>
                      <a href={`#${fieldId(k === 'attending' ? 'attending-yes' : k === 'events' ? `ev-${events[0].id}` : k)}`}>{m}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="field">
              <label htmlFor={fieldId('fullName')}>Full name</label>
              <input id={fieldId('fullName')} name="name" autoComplete="name" value={d.fullName} onChange={(e) => update('fullName', e.target.value)} aria-invalid={!!errors.fullName} aria-describedby={describe('fullName')} required />
              {err('fullName')}
            </div>

            <fieldset className="field">
              <legend>How can we reach you?</legend>
              <div className="segmented">
                {(['email', 'phone'] as const).map((t) => (
                  <label key={t} className="segmented__opt">
                    <input type="radio" name="contactType" value={t} checked={d.contactType === t} onChange={() => update('contactType', t)} />
                    <span>{t === 'email' ? 'Email' : 'Phone'}</span>
                  </label>
                ))}
              </div>
              <label htmlFor={fieldId('contact')} className="visually-hidden">
                {d.contactType === 'email' ? 'Email address' : 'Phone number'}
              </label>
              <input
                id={fieldId('contact')}
                type={d.contactType === 'email' ? 'email' : 'tel'}
                inputMode={d.contactType === 'email' ? 'email' : 'tel'}
                autoComplete={d.contactType === 'email' ? 'email' : 'tel'}
                placeholder={d.contactType === 'email' ? 'you@example.com' : '+91 …'}
                value={d.contact}
                onChange={(e) => update('contact', e.target.value)}
                aria-invalid={!!errors.contact}
                aria-describedby={describe('contact', `${fieldId('contact')}-hint`)}
                required
              />
              <p className="field__hint" id={`${fieldId('contact')}-hint`}>
                Only Harsh &amp; Rimi will see this. It is never shown publicly.
              </p>
              {err('contact')}
            </fieldset>

            <fieldset className="field" aria-describedby={describe('attending')}>
              <legend>Will you be joining?</legend>
              <div className="choice-row">
                <label className="choice">
                  <input id={fieldId('attending-yes')} type="radio" name="attending" checked={d.attending === 'yes'} onChange={() => update('attending', 'yes')} />
                  <span>Joyfully attending</span>
                </label>
                <label className="choice">
                  <input type="radio" name="attending" checked={d.attending === 'no'} onChange={() => update('attending', 'no')} />
                  <span>Sending love from afar</span>
                </label>
              </div>
              {err('attending')}
            </fieldset>

            {d.attending === 'yes' && (
              <>
                <fieldset className="field" aria-describedby={describe('events')}>
                  <legend>Which celebrations will you join?</legend>
                  <div className="event-checks">
                    {events.map((e) => {
                      const sd = formatShortDate(e);
                      return (
                        <label key={e.id} className="check" style={{ ['--accent' as string]: e.accent }}>
                          <input id={fieldId(`ev-${e.id}`)} type="checkbox" checked={d.events.includes(e.id)} onChange={() => toggleEvent(e.id)} />
                          <span>
                            <strong>{e.name}</strong>
                            <small>
                              {sd.day} {sd.month} · {formatEventTime(e)} · {e.city}
                            </small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {err('events')}
                </fieldset>

                <div className="field field--narrow">
                  <label htmlFor={fieldId('partySize')}>Number of guests in your party</label>
                  <p className="field__hint" id={`${fieldId('partySize')}-hint`}>
                    Including yourself.
                  </p>
                  <input
                    id={fieldId('partySize')}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={rsvpConfig.maxPartySize}
                    value={d.partySize}
                    onChange={(e) => update('partySize', e.target.value)}
                    aria-invalid={!!errors.partySize}
                    aria-describedby={describe('partySize', `${fieldId('partySize')}-hint`)}
                  />
                  {err('partySize')}
                </div>

                <div className="field">
                  <label htmlFor={fieldId('dietary')}>
                    Dietary requirements <span className="optional">(optional)</span>
                  </label>
                  <input id={fieldId('dietary')} value={d.dietary} onChange={(e) => update('dietary', e.target.value)} placeholder="e.g. vegetarian, nut allergy" />
                </div>

                <div className="field">
                  <label htmlFor={fieldId('song')}>
                    Sangeet song request <span className="optional">(optional)</span>
                  </label>
                  <input id={fieldId('song')} value={d.songRequest} onChange={(e) => update('songRequest', e.target.value)} placeholder="A song that will get you dancing" />
                </div>
              </>
            )}

            <div className="field">
              <label htmlFor={fieldId('message')}>
                Message for the couple <span className="optional">(optional)</span>
              </label>
              <textarea id={fieldId('message')} rows={3} value={d.message} onChange={(e) => update('message', e.target.value)} />
            </div>

            <div className="hp" aria-hidden="true">
              <label>
                Leave this empty
                <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
              </label>
            </div>

            <div className="rsvp-form__footer">
              <button type="submit" className="btn btn--primary" disabled={submitting} aria-disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Sending…
                  </>
                ) : (
                  'Send RSVP'
                )}
              </button>
            </div>

            <div ref={statusRef} tabIndex={-1} aria-live="polite" className="rsvp-status">
              {status.kind === 'error' && (
                <div className="notice notice--error" role="alert">
                  <p>
                    <strong>Your RSVP wasn’t sent.</strong> {status.message} Your answers are still here, so please try again.
                  </p>
                </div>
              )}
            </div>
          </form>
        )}
        <PariSays>{s.pari}</PariSays>
      </div>
    </section>
  );
}
