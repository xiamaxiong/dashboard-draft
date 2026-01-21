/**
 * Galaxy Spiral Chart - Theme Aware
 * Uses 'themeData' and 'theme' injected by CodeChartRenderer
 */
const themeThree = themeData?.threejs || {};
const bgValue = themeThree.backgroundColor || '#050505';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

// Handle Theme Background (Dark / Light / Transparent)
if (bgValue === 'transparent' || theme === 'transparent') {
  renderer.setClearColor(0x000000, 0); // Fully transparent
  scene.background = null;
} else {
  const bgColor = new THREE.Color(bgValue);
  scene.background = bgColor;
  renderer.setClearColor(bgColor, 1);
}

container.appendChild(renderer.domElement);

// --- Galaxy Parameters (Aligned with Plotly Theme Colors) ---
const parameters = {
  count: 30000,
  size: 3,
  radius: 400,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  // Using Plotly standard colorway colors
  insideColor: new THREE.Color(0xEF553B), // Plotly Red-ish
  outsideColor: new THREE.Color(0x636efa) // Plotly Blue
};

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(parameters.count * 3);
const colors = new Float32Array(parameters.count * 3);

for (let i = 0; i < parameters.count; i++) {
  const i3 = i * 3;
  const r = Math.random() * parameters.radius;
  const spinAngle = (r / parameters.radius) * parameters.spin * Math.PI * 2;
  const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

  const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
  const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (parameters.randomness * r * 0.5);
  const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;

  positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
  positions[i3 + 1] = randomY;
  positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

  const mixedColor = parameters.insideColor.clone();
  mixedColor.lerp(parameters.outsideColor, r / parameters.radius);

  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const canvas = document.createElement('canvas');
canvas.width = 32;
canvas.height = 32;
const ctx = canvas.getContext('2d');
const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 32, 32);
const texture = new THREE.CanvasTexture(canvas);

const material = new THREE.PointsMaterial({
  size: parameters.size,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  map: texture,
  transparent: true
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

camera.position.set(0, 300, 500);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

let animationId;
const animate = () => {
  animationId = requestAnimationFrame(animate);
  particles.rotation.y += 0.0005;
  controls.update();
  renderer.render(scene, camera);
};
animate();

return () => {
  cancelAnimationFrame(animationId);
  controls.dispose();
  geometry.dispose();
  material.dispose();
  texture.dispose();
  renderer.dispose();
  if (container.contains(renderer.domElement)) {
    container.removeChild(renderer.domElement);
  }
};