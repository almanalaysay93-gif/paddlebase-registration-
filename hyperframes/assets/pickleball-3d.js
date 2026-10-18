import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.2/+esm';

export function createPickleball(canvas, options = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(options.pixelRatio || Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
  camera.position.set(0, 0, 5.2);

  const ball = new THREE.Group();
  scene.add(ball);

  const shellGeometry = new THREE.SphereGeometry(1, 64, 48);
  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd9f532,
    roughness: 0.38,
    clearcoat: 0.16,
    clearcoatRoughness: 0.42
  });
  ball.add(new THREE.Mesh(shellGeometry, shellMaterial));

  const holeGeometry = new THREE.CircleGeometry(0.087, 20);
  const rimGeometry = new THREE.TorusGeometry(0.087, 0.011, 6, 20);
  const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x536817, roughness: 1, side: THREE.DoubleSide });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xe7ff58, roughness: 0.6 });
  const forward = new THREE.Vector3(0, 0, 1);

  for (let i = 0; i < 40; i++) {
    const y = 1 - (i + 0.5) * 2 / 40;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    const normal = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    const orientation = new THREE.Quaternion().setFromUnitVectors(forward, normal);
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    hole.position.copy(normal).multiplyScalar(1.006);
    rim.position.copy(normal).multiplyScalar(1.012);
    hole.quaternion.copy(orientation);
    rim.quaternion.copy(orientation);
    ball.add(hole, rim);
  }

  scene.add(new THREE.HemisphereLight(0xffffff, 0x456326, 2.1));
  const sunlight = new THREE.DirectionalLight(0xffedba, 3.2);
  sunlight.position.set(-3, 5, 5);
  scene.add(sunlight);
  const rimLight = new THREE.DirectionalLight(0xa4def5, 1.4);
  rimLight.position.set(4, -1, -3);
  scene.add(rimLight);

  function resize() {
    const width = options.width || canvas.clientWidth || 320;
    const height = options.height || canvas.clientHeight || 320;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function renderAt(progress) {
    const position = Math.max(0, Math.min(1, progress));
    ball.rotation.set(0.12 + position * Math.PI * 1.5, -0.5 + position * Math.PI * 3.5, position * 0.28);
    ball.position.set(Math.sin(position * Math.PI) * 0.16, Math.sin(position * Math.PI * 2) * 0.09, 0);
    renderer.render(scene, camera);
  }

  function dispose() {
    shellGeometry.dispose();
    shellMaterial.dispose();
    holeGeometry.dispose();
    rimGeometry.dispose();
    holeMaterial.dispose();
    rimMaterial.dispose();
    renderer.dispose();
  }

  resize();
  renderAt(0);
  return { resize, renderAt, dispose };
}
