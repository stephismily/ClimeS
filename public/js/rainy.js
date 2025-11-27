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

// 🌫️ Fog-style drifting background clouds
gsap.utils.toArray(".bg-cloud").forEach((cloud, i) => {
  gsap.to(cloud, {
    x: "-=400",
    duration: 35 + i * 10,
    repeat: -1,
    ease: "linear",
    modifiers: {
      x: gsap.utils.unitize((x) => parseFloat(x) % 400),
    },
  });

  // Depth bobbing
  gsap.to(cloud, {
    y: "+=12",
    duration: 5 + i * 0.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
});

// 👀 Eye blinking
eyes.forEach((eye) => {
  gsap.to(eye, {
    scaleY: 0.3,
    duration: 0.15,
    repeat: -1,
    yoyo: true,
    repeatDelay: 3,
  });
});

// 🌧️ Raindrops fall
document.querySelectorAll(".raindrop").forEach((drop) => {
  const startTop = parseFloat(drop.style.top);
  const startPixels = (startTop / 100) * window.innerHeight;
  gsap.to(drop, {
    top: window.innerHeight,
    duration: 2.5 + Math.random() * 1,
    ease: "linear",
    repeat: -1,
    delay: Math.random() * 2,
    onRepeat: () => {
      gsap.set(drop, { top: startPixels });
    },
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
