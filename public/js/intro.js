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

// 🔗 DOM elements
const globeSection = document.getElementById("globeSection");
const scrollArea = document.querySelector(".scroll-area");
const welcomeContainer = document.getElementById("welcomeContainer");

// 🎬 Scroll zoom animation (camera only)
const zoomTween = gsap.to(camera.position, {
  z: 300,
  ease: "power2.inOut",
  scrollTrigger: {
    trigger: ".scroll-area",
    start: "top top",
    end: "bottom bottom",
    scrub: 2,
  },
});

// ✅ When user reaches bottom of intro, reveal globe & freeze scroll
ScrollTrigger.create({
  trigger: ".scroll-area",
  start: "bottom bottom",
  once: true,
  onEnter: () => {
    // 1) Fade-in globe iframe
    globeSection.classList.add("visible");

    // 2) Fade out welcome glass box (if present)
    if (welcomeContainer) {
      gsap.to(welcomeContainer, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          welcomeContainer.style.display = "none";
        },
      });
    }

    // 3) Cross-fade OUT the 3D intro canvas
    gsap.to(canvas, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      onComplete: () => {
        canvas.style.display = "none";
      },
    });

    // 4) Stop all ScrollTriggers for the intro (no more camera zoom / scroll effects)
    const allTriggers = ScrollTrigger.getAll();
    allTriggers.forEach((t) => {
      // don't kill the one we just created, but disabling is fine
      t.disable(false);
    });

    // 5) Hard lock page scroll so user can't move up/down anymore
    setTimeout(() => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      // optional: zero out scroll inertia
      window.scrollTo({
        top: window.scrollY,
        left: 0,
        behavior: "instant" in window ? "instant" : "auto",
      });
    }, 900); // after fade mostly done
  },
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
