const fogCloud = document.getElementById("fogCloud");
const eyes = document.querySelectorAll(".eye");

// ☁️ Floating cloud breathing motion
gsap.to(fogCloud, {
  y: "-=10",
  scale: 1.03,
  duration: 4,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});

// 👀 Gentle blinking
eyes.forEach((eye) => {
  gsap.to(eye, {
    scaleY: 0.3,
    duration: 0.15,
    repeat: -1,
    yoyo: true,
    repeatDelay: 3 + Math.random() * 4,
    ease: "power1.inOut",
  });
});

// 👁️ Eyes follow mouse
document.addEventListener("mousemove", (e) => {
  eyes.forEach((eye) => {
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const moveX = Math.cos(angle) * 3;
    const moveY = Math.sin(angle) * 3;
    gsap.to(eye, { x: moveX, y: moveY, duration: 0.2, ease: "sine.out" });
  });
});

// 🌫️ Mist drift
gsap.to(".mist1", {
  x: "+=80",
  duration: 15,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});
gsap.to(".mist2", {
  x: "-=100",
  duration: 18,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});
gsap.to(".mist3", {
  x: "+=60",
  duration: 20,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});

// ☁️ Background clouds
gsap.utils.toArray(".bg-cloud").forEach((cloud, i) => {
  gsap.to(cloud, {
    x: "-=400",
    duration: 40 + i * 10,
    repeat: -1,
    ease: "linear",
    modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % 400) },
  });
});

// ☁️ Foreground sun clouds
gsap.utils.toArray(".sun-cloud").forEach((cloud, i) => {
  gsap.to(cloud, {
    y: "+=10",
    duration: 4 + i * 0.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
});

// 💨 Floating fog particles
gsap.utils.toArray(".particle").forEach((p) => {
  gsap.to(p, {
    x: "+=" + (Math.random() * 100 - 50),
    y: "+=" + (Math.random() * 40 - 20),
    opacity: 0.3 + Math.random() * 0.4,
    duration: 6 + Math.random() * 6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
});

// ☀️ Enhanced warm sun pulsing glow
gsap.to(".sun", {
  opacity: 0.6,
  scale: 1.08,
  duration: 5,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});
