// Compresses the supplied character GLBs for runtime delivery.
// Originals stay untouched in /models-source; output goes to /public/models.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, quantize, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'models-source';
const OUT = 'public/models';

await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

for (const file of readdirSync(SRC).filter((f) => f.endsWith('.glb'))) {
  const doc = await io.read(join(SRC, file));
  await doc.transform(dedup(), prune(), weld(), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await io.write(join(OUT, file), doc);
  const before = statSync(join(SRC, file)).size;
  const after = statSync(join(OUT, file)).size;
  console.log(`${file}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
}
