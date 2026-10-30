import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three/webgpu';
import { tailGeometry } from '../src/scenes/avatar.js';

for (const [segments, radial] of [[24, 6], [42, 10]]) {
  test(`tail geometry is finite and has no degenerate triangles (${segments}/${radial})`, () => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(-.4, .2, -.2),
      new THREE.Vector3(-1.2, 1, -.35), new THREE.Vector3(-1.3, 2, -.15), new THREE.Vector3(-1, 2.4, .1),
    ]);
    const geometry = tailGeometry(curve, segments, radial);
    for (const name of ['position', 'normal', 'color', 'uv']) {
      assert.ok([...geometry.attributes[name].array].every(Number.isFinite), `${name} contains NaN or Infinity`);
    }
    const positions = geometry.attributes.position, indices = geometry.index;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < indices.count; i += 3) {
      a.fromBufferAttribute(positions, indices.getX(i)); b.fromBufferAttribute(positions, indices.getX(i + 1)); c.fromBufferAttribute(positions, indices.getX(i + 2));
      const area = b.sub(a).cross(c.sub(a)).length();
      assert.ok(area > 1e-8, `degenerate triangle at index ${i}`);
    }
    geometry.dispose();
  });
}
