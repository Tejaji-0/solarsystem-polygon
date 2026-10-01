import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ---------------------------------------------------------------------------
// A little 3D solar system. Sizes and distances aren't to real scale (Neptune
// would be miles off-screen if they were) but the order of the planets, the
// relative speeds, and the textures are all real.
// ---------------------------------------------------------------------------

const container = document.getElementById("scene");

// --- renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- scene + camera ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 60, 130);

// orbit controls so you can drag/zoom around
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 20;
controls.maxDistance = 600;

// --- texture loading ---
// the loading manager lets us hide the "Loading…" overlay once every texture
// has actually finished downloading.
const loadingEl = document.getElementById("loading");
const manager = new THREE.LoadingManager();
manager.onLoad = () => {
  loadingEl.style.opacity = "0";
  setTimeout(() => (loadingEl.style.display = "none"), 600);
};
const loader = new THREE.TextureLoader(manager);

function tex(file) {
  const t = loader.load(`textures/${file}`);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// --- starfield background ---
// a giant sphere turned inside-out with the milky way mapped onto it.
const starGeo = new THREE.SphereGeometry(900, 64, 64);
const starMat = new THREE.MeshBasicMaterial({
  map: tex("stars_milky_way.jpg"),
  side: THREE.BackSide,
});
scene.add(new THREE.Mesh(starGeo, starMat));

// --- lighting ---
// the sun is the only real light source. a faint ambient keeps the night
// sides from going pure black.
const sunLight = new THREE.PointLight(0xffffff, 2.4, 0, 0.4);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x222233, 1.0));

// --- the sun ---
// MeshBasicMaterial so it ignores lighting and always looks lit up.
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(12, 64, 64),
  new THREE.MeshBasicMaterial({ map: tex("sun.jpg") })
);
scene.add(sun);

// a soft glow sprite around the sun
const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    color: 0xffcc66,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
glow.scale.set(60, 60, 1);
sun.add(glow);

// builds a soft radial-gradient texture on the fly for the sun's glow
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,220,150,0.9)");
  g.addColorStop(0.3, "rgba(255,180,80,0.4)");
  g.addColorStop(1, "rgba(255,150,50,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// ---------------------------------------------------------------------------
// planet definitions. distance = radius of orbit, size = sphere radius,
// speed = orbital speed (just a relative number), spin = how fast it rotates.
// ---------------------------------------------------------------------------
const PLANETS = [
  {
    name: "Mercury", file: "mercury.jpg", size: 1.6, distance: 22,
    speed: 0.048, spin: 0.004, tilt: 0.03,
    desc: "The smallest planet and the closest to the Sun. A day on Mercury lasts longer than its year.",
    stats: { Diameter: "4,879 km", "Day length": "59 Earth days", Moons: "0" },
  },
  {
    name: "Venus", file: "venus.jpg", size: 2.4, distance: 32,
    speed: 0.035, spin: -0.002, tilt: 2.6,
    desc: "The hottest planet thanks to a runaway greenhouse atmosphere. It spins backwards compared to most planets.",
    stats: { Diameter: "12,104 km", "Day length": "243 Earth days", Moons: "0" },
  },
  {
    name: "Earth", file: "earth_daymap.jpg", size: 2.6, distance: 44,
    speed: 0.029, spin: 0.02, tilt: 0.41, moon: true,
    desc: "Home. The only world we know of with liquid water on its surface and, so far, the only one with life.",
    stats: { Diameter: "12,742 km", "Day length": "24 hours", Moons: "1" },
  },
  {
    name: "Mars", file: "mars.jpg", size: 2.0, distance: 56,
    speed: 0.024, spin: 0.018, tilt: 0.44,
    desc: "The red planet. Its colour comes from iron oxide — rust — covering the surface. Home to the tallest volcano in the solar system.",
    stats: { Diameter: "6,779 km", "Day length": "24.6 hours", Moons: "2" },
  },
  {
    name: "Jupiter", file: "jupiter.jpg", size: 7.5, distance: 78,
    speed: 0.013, spin: 0.04, tilt: 0.05,
    desc: "The giant of the system — more than twice as massive as all the other planets combined. The Great Red Spot is a storm bigger than Earth.",
    stats: { Diameter: "139,820 km", "Day length": "9.9 hours", Moons: "95" },
  },
  {
    name: "Saturn", file: "saturn.jpg", size: 6.2, distance: 100,
    speed: 0.0096, spin: 0.038, tilt: 0.47, ring: true,
    desc: "Famous for its spectacular rings, made of countless chunks of ice and rock. It's so light it would float in water.",
    stats: { Diameter: "116,460 km", "Day length": "10.7 hours", Moons: "146" },
  },
  {
    name: "Uranus", file: "uranus.jpg", size: 4.2, distance: 122,
    speed: 0.0068, spin: 0.03, tilt: 1.71,
    desc: "An ice giant that rotates on its side, probably knocked over by a massive collision long ago.",
    stats: { Diameter: "50,724 km", "Day length": "17 hours", Moons: "28" },
  },
  {
    name: "Neptune", file: "neptune.jpg", size: 4.0, distance: 142,
    speed: 0.0054, spin: 0.032, tilt: 0.49,
    desc: "The windiest planet, with gusts faster than the speed of sound. It was the first planet found by maths before being seen.",
    stats: { Diameter: "49,244 km", "Day length": "16 hours", Moons: "16" },
  },
];

// keep track of everything we need to animate / click on
const planetMeshes = [];
const orbitRings = [];

// shared geometry for the thin orbit-line rings
function makeOrbitRing(radius) {
  const points = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: 0x4a5578,
    transparent: true,
    opacity: 0.5,
  });
  return new THREE.LineLoop(geo, mat);
}

// build each planet
PLANETS.forEach((p) => {
  // a pivot at the centre that we rotate to make the planet orbit
  const pivot = new THREE.Object3D();
  scene.add(pivot);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(p.size, 48, 48),
    new THREE.MeshStandardMaterial({
      map: tex(p.file),
      roughness: 0.95,
      metalness: 0.0,
    })
  );
  mesh.position.x = p.distance;
  mesh.rotation.z = p.tilt; // axial tilt
  mesh.userData = p; // stash the data so clicks can read it
  pivot.add(mesh);

  // give it a random starting angle so they're not all lined up
  pivot.rotation.y = Math.random() * Math.PI * 2;

  // orbit line
  const ring = makeOrbitRing(p.distance);
  scene.add(ring);
  orbitRings.push(ring);

  // Saturn's rings
  if (p.ring) {
    const ringGeo = new THREE.RingGeometry(p.size + 2, p.size + 6, 64);
    // remap the UVs so the texture wraps around the ring radially
    fixRingUVs(ringGeo);
    const ringMesh = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({
        map: tex("saturn_ring.png"),
        side: THREE.DoubleSide,
        transparent: true,
      })
    );
    ringMesh.rotation.x = Math.PI / 2 - 0.4;
    mesh.add(ringMesh);
  }

  // Earth's moon — a small grey sphere on its own little pivot
  if (p.moon) {
    const moonPivot = new THREE.Object3D();
    mesh.add(moonPivot);
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 24, 24),
      new THREE.MeshStandardMaterial({ map: tex("moon.jpg"), roughness: 1 })
    );
    moon.position.x = p.size + 3;
    moonPivot.add(moon);
    p._moonPivot = moonPivot;
  }

  planetMeshes.push(mesh);
  p._pivot = pivot;
  p._mesh = mesh;
});

// RingGeometry's default UVs don't line up with a strip texture, so rebuild
// them based on the radius of each vertex.
function fixRingUVs(geo) {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v = new THREE.Vector3();
  const inner = geo.parameters.innerRadius;
  const outer = geo.parameters.outerRadius;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = (v.length() - inner) / (outer - inner);
    uv.setXY(i, r, 0.5);
  }
  uv.needsUpdate = true;
}

// ---------------------------------------------------------------------------
// clicking on a planet
// ---------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const infoCard = document.getElementById("info");
const infoName = document.getElementById("info-name");
const infoDesc = document.getElementById("info-desc");
const infoStats = document.getElementById("info-stats");

function showInfo(p) {
  infoName.textContent = p.name;
  infoDesc.textContent = p.desc;
  infoStats.innerHTML = "";
  for (const [key, value] of Object.entries(p.stats)) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    dd.textContent = value;
    infoStats.append(dt, dd);
  }
  infoCard.classList.remove("hidden");
}

// only treat it as a click if the pointer didn't really move (so dragging the
// camera doesn't open a card every time).
let downX = 0;
let downY = 0;
renderer.domElement.addEventListener("pointerdown", (e) => {
  downX = e.clientX;
  downY = e.clientY;
});
renderer.domElement.addEventListener("pointerup", (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(planetMeshes);
  if (hits.length > 0) {
    showInfo(hits[0].object.userData);
  }
});

document.getElementById("info-close").addEventListener("click", () => {
  infoCard.classList.add("hidden");
});

// ---------------------------------------------------------------------------
// UI controls
// ---------------------------------------------------------------------------
let orbitsVisible = true;
let paused = false;
let speedMultiplier = 1;

const toggleOrbitsBtn = document.getElementById("toggle-orbits");
toggleOrbitsBtn.addEventListener("click", () => {
  orbitsVisible = !orbitsVisible;
  orbitRings.forEach((r) => (r.visible = orbitsVisible));
  toggleOrbitsBtn.textContent = orbitsVisible ? "Hide orbits" : "Show orbits";
});

const toggleSpinBtn = document.getElementById("toggle-spin");
toggleSpinBtn.addEventListener("click", () => {
  paused = !paused;
  toggleSpinBtn.textContent = paused ? "Play" : "Pause";
});

document.getElementById("speed").addEventListener("input", (e) => {
  speedMultiplier = parseFloat(e.target.value);
});

// ---------------------------------------------------------------------------
// animation loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (!paused) {
    // scale by 60 so the numbers behave the same regardless of frame rate
    const step = dt * 60 * speedMultiplier;

    sun.rotation.y += 0.0015 * step;

    PLANETS.forEach((p) => {
      p._pivot.rotation.y += p.speed * step * 0.1; // orbit the sun
      p._mesh.rotation.y += p.spin * step;          // spin on axis
      if (p._moonPivot) p._moonPivot.rotation.y += 0.03 * step;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// keep things sharp when the window resizes
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
