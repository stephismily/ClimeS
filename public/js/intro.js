// js/intro.js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
camera.position.z = 2500;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;

// 🌟 Starfield
const starCount = 20000;
const starGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < positions.length; i++) {
  positions[i] = (Math.random() - 0.5) * 6000;
}

starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const starTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/sprites/circle.png"
);
const starMaterial = new THREE.PointsMaterial({
  map: starTexture,
  color: 0xffffff,
  size: 4,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  opacity: 0.9,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

scene.fog = new THREE.FogExp2(0x000010, 0.00025);

function animate() {
  requestAnimationFrame(animate);
  stars.rotation.y += 0.0004;
  stars.rotation.x += 0.0002;
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 🧩 Keep Three.js responsive on resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  ScrollTrigger.refresh();
}

window.addEventListener("resize", onWindowResize);

// 🎬 Scroll zoom animation (only camera zoom now, no overlay)
gsap.to(camera.position, {
  z: 300,
  ease: "power2.inOut",
  scrollTrigger: {
    trigger: ".scroll-area",
    start: "top top",
    end: "bottom bottom",
    scrub: 2
  }
});

// 🌍 Globe section (we only reveal it based on scroll)
const globeSection = document.getElementById("globeSection");

// When user scrolls to the end of the scroll-area, smoothly cross-fade to globe
ScrollTrigger.create({
  trigger: ".scroll-area",
  start: "bottom bottom",
  once: true,
  onEnter: () => {
    // 1) fade IN globe (uses CSS transition + visible class)
    globeSection.classList.add("visible");

    // 2) cross-fade OUT the 3D intro canvas
    gsap.to(canvas, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      onComplete: () => {
        canvas.style.display = "none"; // remove it so globe is fully interactive
      }
    });
  }
});
