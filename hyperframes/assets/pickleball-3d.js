import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.2/+esm';

// Indoor pickleball: matte lime shell with 26 round holes cut clean through.
// The shell is hollow, so each hole shows the brighter inner wall and, past it,
// whatever is behind the ball. That offset crescent is what reads as 3D.
const HOLE_COUNT = 26;
const HOLE_ANGLE = 0.17; // angular radius of a hole, in radians
const WALL = 0.93; // inner wall radius; 1 - WALL is the shell thickness

function holeDirections() {
  const dirs = [];
  for (let i = 0; i < HOLE_COUNT; i++) {
    const y = 1 - (i + 0.5) * 2 / HOLE_COUNT;
    const r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    dirs.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return dirs;
}

function holedMaterial(params, dirs) {
  const material = new THREE.MeshStandardMaterial(params);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHoles = { value: dirs };
    shader.uniforms.uHoleCos = { value: Math.cos(HOLE_ANGLE) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>',
        '#include <common>\nvarying vec3 vLocal;\nuniform vec3 uHoles[' + HOLE_COUNT + '];\nuniform float uHoleCos;')
      .replace('void main() {',
        'void main() {\n  vec3 dirL = normalize(vLocal);\n' +
        '  for (int i = 0; i < ' + HOLE_COUNT + '; i++) { if (dot(dirL, uHoles[i]) > uHoleCos) discard; }');
  };
  return material;
}

export function createPickleball(canvas, options = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(options.pixelRatio || Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  camera.position.set(0, 0, 5.2);

  const ball = new THREE.Group();
  scene.add(ball);

  const dirs = holeDirections();
  const geometry = new THREE.SphereGeometry(1, 96, 72);
  const outer = holedMaterial({ color: 0xc4ea12, roughness: 0.62 }, dirs);
  const inner = holedMaterial({ color: 0xe6ff1c, emissive: 0x6f8a00, emissiveIntensity: 0.55, roughness: 0.7, side: THREE.BackSide }, dirs);
  ball.add(new THREE.Mesh(geometry, outer));
  const innerMesh = new THREE.Mesh(geometry, inner);
  innerMesh.scale.setScalar(WALL);
  ball.add(innerMesh);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x50661e, 2.2));
  const key = new THREE.DirectionalLight(0xfff6d8, 2.6);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe9ffb0, 0.9);
  fill.position.set(4, -2, 2);
  scene.add(fill);

  function resize() {
    const width = options.width || canvas.clientWidth || 320;
    const height = options.height || canvas.clientHeight || 320;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  // progress 0..1 maps to two and a half full turns, tumbling on two axes.
  function renderAt(progress) {
    const p = Math.max(0, Math.min(1, progress));
    ball.rotation.set(0.35 + p * Math.PI * 2, -0.4 + p * Math.PI * 5, p * 0.4);
    ball.position.set(Math.sin(p * Math.PI) * 0.16, Math.sin(p * Math.PI * 2) * 0.09, 0);
    renderer.render(scene, camera);
  }

  function dispose() {
    geometry.dispose();
    outer.dispose();
    inner.dispose();
    renderer.dispose();
  }

  resize();
  renderAt(0);
  return { resize, renderAt, dispose };
}
