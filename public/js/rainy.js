const cloudFace = document.getElementById("cloudFace");
const eyes = document.querySelectorAll(".eye");

// ☁️ Floating cloud
gsap.to(cloudFace, {
  y: "-=12",
  duration: 3,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});

// 🌫️ Moving background clouds
gsap.utils.toArray(".bg-cloud").forEach((cloud, i) => {
  gsap.to(cloud, {
    x: "-=600",
    duration: 20 + i * 10,
    repeat: -1,
    ease: "linear",
    modifiers: {
      x: gsap.utils.unitize((x) => parseFloat(x) % 600),
    },
  });
});

// 👀 Eye blinking
eyes.forEach((eye) => {
  gsap.to(eye, {
    scaleY: 0.3,
    duration: 0.15,
    repeat: -1,
    yoyo: true,
    repeatDelay: 3 + Math.random() * 2,
  });
});

// 🌧️ Raindrops fall
document.querySelectorAll(".raindrop").forEach((drop) => {
  gsap.set(drop, { y: -30 - Math.random() * 50 });
  gsap.to(drop, {
    y: "+=280",
    duration: 1 + Math.random() * 0.6,
    ease: "linear",
    repeat: -1,
    delay: Math.random() * 2,
  });
});

// 👀 Eyes follow cursor
document.addEventListener("mousemove", (e) => {
  const rect = cloudFace.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = (e.clientX - centerX) / 40;
  const dy = (e.clientY - centerY) / 40;

  eyes.forEach((eye) => {
    eye.style.transform = `translate(${dx}px, ${dy}px)`;
  });
});
