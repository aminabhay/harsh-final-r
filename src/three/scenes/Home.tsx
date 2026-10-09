import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { ui, useUi } from '../../lib/ui';
import { openAlbum, openKeepsake, greetPari } from '../../lib/actions';
import { Character, RestingPari } from '../Character';
import { useWorld } from '../context';
import { G, Island, Label, PhotoFrame, Vase, mat, roseGold, useCanvasTexture, useClickable } from '../parts';

/** Chapter five: their cosy miniature home, with a few optional things to tap. */


function Room() {
  const wall = mat('#FBEDE8', { rough: 0.95 });
  return (
    <group>
      <mesh geometry={G.box} material={mat('#E8CDB5', { rough: 0.8 })} position={[0, 0.02, -0.4]} scale={[7.2, 0.04, 6]} receiveShadow />
      {/* floorboards */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} geometry={G.box} material={mat('#DCBFA6')} position={[-3.6 + i * 0.6 + 0.3, 0.041, -0.4]} scale={[0.01, 0.002, 6]} />
      ))}
      <mesh geometry={G.box} material={wall} position={[0, 1.5, -3.4]} scale={[7.2, 3, 0.12]} receiveShadow />
      <mesh geometry={G.box} material={wall} position={[-3.6, 1.5, -0.4]} scale={[0.12, 3, 6]} receiveShadow />
      <mesh geometry={G.box} material={roseGold()} position={[0, 0.06, -3.33]} scale={[7.2, 0.1, 0.04]} />
      <mesh geometry={G.box} material={roseGold()} position={[-3.53, 0.06, -0.4]} scale={[0.04, 0.1, 6]} />
      {/* rug */}
      <mesh geometry={G.cyl} material={mat(palette.lavender, { rough: 1 })} position={[0.1, 0.05, -0.6]} scale={[1.9, 0.01, 1.3]} receiveShadow />
    </group>
  );
}

function SeaWindow() {
  const tex = useCanvasTexture(512, 384, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#CFE7F3');
    sky.addColorStop(1, '#FFF1E6');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    const sea = g.createLinearGradient(0, h * 0.55, 0, h);
    sea.addColorStop(0, '#5EC2C4');
    sea.addColorStop(1, '#A7E3D9');
    g.fillStyle = sea;
    g.fillRect(0, h * 0.55, w, h * 0.45);
    g.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 16; i++) g.fillRect((i * 83) % w, h * 0.6 + (i % 5) * 22, 30, 2);
    // overwater villas
    g.fillStyle = '#B98A6A';
    [0.2, 0.32, 0.44].forEach((x) => {
      g.fillRect(w * x, h * 0.5, 40, 12);
      g.beginPath();
      g.moveTo(w * x - 6, h * 0.5);
      g.lineTo(w * x + 20, h * 0.44);
      g.lineTo(w * x + 46, h * 0.5);
      g.fill();
      g.fillRect(w * x + 6, h * 0.53, 3, 14);
      g.fillRect(w * x + 30, h * 0.53, 3, 14);
    });
    g.fillRect(w * 0.18, h * 0.555, w * 0.32, 3);
    // palm
    g.strokeStyle = '#7A6150';
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(w * 0.86, h);
    g.quadraticCurveTo(w * 0.8, h * 0.6, w * 0.84, h * 0.32);
    g.stroke();
    g.fillStyle = '#6E9C80';
    for (let k = 0; k < 6; k++) {
      g.save();
      g.translate(w * 0.84, h * 0.32);
      g.rotate((k / 6) * Math.PI * 2);
      g.beginPath();
      g.ellipse(36, 0, 40, 9, 0.2, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  });
  return (
    <group position={[0.9, 1.75, -3.33]}>
      <mesh geometry={G.box} material={mat(palette.ivory)} scale={[2.2, 1.5, 0.06]} />
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[2.0, 1.3]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh geometry={G.box} material={mat(palette.ivory)} position={[0, 0, 0.05]} scale={[0.05, 1.3, 0.02]} />
      <mesh geometry={G.box} material={mat(palette.ivory)} position={[0, 0, 0.05]} scale={[2.0, 0.05, 0.02]} />
      <mesh geometry={G.box} material={roseGold()} position={[0, -0.78, 0.08]} scale={[2.3, 0.05, 0.18]} />
      {/* sheer curtains */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={G.box} material={mat(palette.softPink, { opacity: 0.85 })} position={[s * 1.2, 0, 0.1]} scale={[0.3, 1.7, 0.03]} />
      ))}
    </group>
  );
}

function Sofa() {
  const fabric = mat('#C9B5DE', { rough: 0.95 });
  return (
    <group position={[0.9, 0, -2.55]}>
      <mesh geometry={G.box} material={fabric} position={[0, 0.25, 0]} scale={[2.2, 0.4, 0.85]} castShadow receiveShadow />
      <mesh geometry={G.box} material={fabric} position={[0, 0.65, -0.33]} scale={[2.2, 0.6, 0.22]} castShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={G.box} material={fabric} position={[s * 1.12, 0.45, 0]} scale={[0.22, 0.52, 0.85]} castShadow />
      ))}
      <mesh geometry={G.box} material={mat(palette.blush)} position={[-0.6, 0.6, -0.15]} rotation={[0.2, 0.2, 0.1]} scale={[0.38, 0.32, 0.1]} castShadow />
      <mesh geometry={G.box} material={mat(palette.mint)} position={[0.6, 0.6, -0.15]} rotation={[0.2, -0.2, -0.1]} scale={[0.38, 0.32, 0.1]} castShadow />
    </group>
  );
}

function CoachingBoard() {
  const tex = useCanvasTexture(512, 360, (g, w, h) => {
    g.fillStyle = '#F4FAF6';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#6E9C80';
    g.lineWidth = 4;
    g.strokeRect(20, 60, w - 40, h - 80);
    g.beginPath();
    g.moveTo(w / 2, 60);
    g.lineTo(w / 2, h - 20);
    g.stroke();
    g.beginPath();
    g.arc(w / 2, (h + 40) / 2, 34, 0, Math.PI * 2);
    g.stroke();
    g.font = '700 34px sans-serif';
    g.fillStyle = '#B98276';
    [[120, 140], [150, 250], [230, 190]].forEach(([x, y]) => g.fillText('X', x, y));
    g.strokeStyle = '#43363C';
    g.lineWidth = 3;
    [[330, 130], [360, 240], [290, 200]].forEach(([x, y]) => {
      g.beginPath();
      g.arc(x, y, 14, 0, Math.PI * 2);
      g.stroke();
    });
    g.setLineDash([8, 8]);
    g.strokeStyle = '#B98276';
    g.beginPath();
    g.moveTo(140, 140);
    g.quadraticCurveTo(220, 90, 300, 150);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = '#43363C';
    g.font = '600 30px Georgia, serif';
    g.textAlign = 'center';
    g.fillText('SKOROST UNITED', w / 2, 42);
  });
  return (
    <group position={[-2.6, 0, -1.3]} rotation={[0, 0.75, 0]}>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} geometry={G.cyl} material={roseGold()} position={[x, 0.75, 0]} scale={[0.025, 1.5, 0.025]} castShadow />
      ))}
      <mesh geometry={G.box} material={mat('#FFFFFF')} position={[0, 1.15, 0]} scale={[1.15, 0.8, 0.04]} castShadow />
      <mesh position={[0, 1.15, 0.022]}>
        <planeGeometry args={[1.1, 0.76]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
    </group>
  );
}

function KickableBall() {
  const { reduced } = useWorld();
  const kick = useUi((s) => s.footballKick);
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(10);
  const lastKick = useRef(kick);
  useFrame((_, dt) => {
    if (kick !== lastKick.current) {
      lastKick.current = kick;
      t.current = 0;
    }
    if (!ref.current) return;
    t.current += dt;
    const k = t.current;
    if (reduced || k > 1.4) {
      ref.current.position.set(-1.7, 0.15, 0.5);
      return;
    }
    // a small hop and roll, then back to rest
    const hop = Math.abs(Math.sin(k * Math.PI * 1.6)) * Math.exp(-k * 2.2) * 0.55;
    ref.current.position.set(-1.7 + Math.sin(k * 3) * 0.12, 0.15 + hop, 0.5);
    ref.current.rotation.z -= dt * 8 * Math.exp(-k * 1.5);
  });
  const click = useClickable(() => ui.kick());
  return (
    <mesh ref={ref} position={[-1.7, 0.15, 0.5]} {...click} castShadow>
      <icosahedronGeometry args={[0.13, 1]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.5} flatShading />
    </mesh>
  );
}

function Kitchen() {
  // Rimi's apron on a hook + recipe book on a side table.
  const apron = new THREE.Shape();
  apron.moveTo(-0.18, 0.3);
  apron.lineTo(0.18, 0.3);
  apron.lineTo(0.2, 0.05);
  apron.lineTo(0.28, -0.02);
  apron.lineTo(0.24, -0.5);
  apron.lineTo(-0.24, -0.5);
  apron.lineTo(-0.28, -0.02);
  apron.lineTo(-0.2, 0.05);
  apron.closePath();
  return (
    <group>
      <group position={[-3.52, 1.6, -2.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={G.cyl} material={roseGold()} position={[0, 0.42, 0.03]} rotation={[Math.PI / 2, 0, 0]} scale={[0.02, 0.08, 0.02]} />
        <mesh position={[0, 0, 0.03]} castShadow>
          <shapeGeometry args={[apron]} />
          <meshStandardMaterial color={palette.blush} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={G.box} material={mat(palette.ivory)} position={[0, -0.18, 0.035]} scale={[0.26, 0.14, 0.004]} />
      </group>
      <group position={[-1.85, 0, -2.6]}>
        <mesh geometry={G.cyl} material={mat(palette.wood)} position={[0, 0.3, 0]} scale={[0.32, 0.04, 0.32]} castShadow />
        <mesh geometry={G.cyl} material={mat(palette.wood)} position={[0, 0.15, 0]} scale={[0.04, 0.3, 0.04]} />
        <group position={[0, 0.36, 0]} rotation={[0, 0.4, 0]}>
          <mesh geometry={G.box} material={mat('#9E6B6B')} scale={[0.32, 0.06, 0.24]} castShadow />
          <mesh geometry={G.box} material={mat(palette.paper)} position={[0.01, 0, 0]} scale={[0.3, 0.05, 0.22]} />
          <Label size={0.04} position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]} color={palette.ivory}>
            Recipes
          </Label>
        </group>
      </group>
    </group>
  );
}

function Keepsake() {
  const click = useClickable(openKeepsake);
  return (
    <group position={[2.9, 0, 0.3]} rotation={[0, -0.6, 0]} {...click}>
      {/* a little travel case with tags and a shell */}
      <mesh geometry={G.box} material={mat(palette.sea, { rough: 0.6 })} position={[0, 0.3, 0]} scale={[0.55, 0.45, 0.22]} castShadow />
      <mesh geometry={G.box} material={roseGold()} position={[0, 0.3, 0]} scale={[0.56, 0.04, 0.23]} />
      <mesh geometry={G.torus} material={roseGold()} position={[0, 0.56, 0]} scale={[0.09, 0.07, 1]} />
      <mesh geometry={G.box} material={mat(palette.butter)} position={[0.2, 0.18, 0.12]} rotation={[0, 0, 0.3]} scale={[0.12, 0.07, 0.005]} />
      <Label size={0.035} font="sans" position={[0.2, 0.18, 0.126]} rotation={[0, 0, 0.3]}>
        MLE
      </Label>
      <mesh geometry={G.sphere} material={mat('#FBE3D6', { rough: 0.4 })} position={[-0.42, 0.06, 0.08]} scale={[0.09, 0.06, 0.08]} castShadow />
      <mesh geometry={G.box} scale={[0.9, 0.8, 0.6]} position={[0, 0.35, 0]} visible={false} />
    </group>
  );
}

function PetBed() {
  return (
    <group position={[1.6, 0, 0.75]}>
      <mesh geometry={G.cyl} material={mat(palette.softPink, { rough: 1 })} position={[0, 0.07, 0]} scale={[0.75, 0.1, 0.55]} receiveShadow />
      <mesh position={[0, 0.12, 0]} scale={[0.72, 0.52, 1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1, 0.14, 12, 40]} />
        <meshStandardMaterial color={palette.blush} roughness={1} />
      </mesh>
    </group>
  );
}

export function HomeScene() {
  const r = islands.home.radius;
  const ping = useUi((s) => s.pariPing);
  return (
    <Island radius={r} top={palette.paper}>
      <Room />
      <SeaWindow />
      <Sofa />
      <CoachingBoard />
      <Kitchen />
      <Keepsake />
      <PetBed />
      <KickableBall />
      {/* photo frames on the back wall open the album */}
      <group position={[-1.75, 1.85, -3.3]}>
        <PhotoFrame imageKey="couplePortrait" width={0.62} height={0.48} onSelect={() => openAlbum(0)} />
      </group>
      <group position={[-1.15, 1.3, -3.3]}>
        <PhotoFrame imageKey="album05" width={0.36} height={0.44} onSelect={() => openAlbum(5)} border={0.04} />
      </group>
      <group position={[-2.3, 1.3, -3.3]}>
        <PhotoFrame imageKey="album06" width={0.36} height={0.44} onSelect={() => openAlbum(6)} border={0.04} />
      </group>
      <Vase position={[2.55, 0, -2.75]} blooms={[palette.blush, '#FFFFFF', palette.lavender, palette.butter]} />
      <Character id="harsh" position={[-0.35, 0, -0.75]} rotationY={0.35} />
      <Character id="rimi" position={[0.35, 0, -0.7]} rotationY={-0.3} />
      <RestingPari island="home" play={['idle', 'tailWag']} ping={ping} onSelect={greetPari} />
    </Island>
  );
}
