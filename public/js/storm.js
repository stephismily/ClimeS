const flash = document.getElementById("flash");
const cloudFace = document.getElementById("cloudFace");
const mouth = document.getElementById("mouth");
const pupils = document.querySelectorAll(".pupil");
const bolts = [
  document.getElementById("boltCenter"),
  document.getElementById("boltRight"),
  document.getElementById("boltLeft"),
];

// ☁️ Floating main cloud
gsap.to(cloudFace, {
  y: "-=8",
  duration: 3,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});

// 🌫️ Background clouds drift
gsap.to(".bg-cloud.one", {
  x: "+=600",
  duration: 40,
  repeat: -1,
  ease: "none",
});
gsap.to(".bg-cloud.two", {
  x: "+=800",
  duration: 60,
  repeat: -1,
  ease: "none",
});
gsap.to(".bg-cloud.three", {
  x: "+=700",
  duration: 50,
  repeat: -1,
  ease: "none",
});

// 😱 Trembling mouth
gsap.to(mouth, {
  y: "+=2",
  x: "+=1",
  yoyo: true,
  repeat: -1,
  duration: 0.08,
  ease: "sine.inOut",
});

// 🌧️ Heavy rain
const drops = document.querySelectorAll(".raindrop");
drops.forEach((drop) => {
  const delay = Math.random();
  const duration = 0.5 + Math.random() * 0.3;
  gsap.set(drop, { y: -40 - Math.random() * 60 });
  gsap.to(drop, { y: "+=460", duration, ease: "linear", repeat: -1, delay });
});

// ⚡ Lightning order (center → right → left)
function strikeOrder() {
  const order = [bolts[0], bolts[1], bolts[2]];
  order.forEach((bolt, i) => {
    gsap.delayedCall(i, () => {
      const tl = gsap.timeline();
      tl.to(bolt, { opacity: 1, duration: 0.08 })
        .to(bolt, { opacity: 0, duration: 0.12 })
        .to(bolt, { opacity: 1, duration: 0.08 })
        .to(bolt, { opacity: 0, duration: 0.2 });

      // 🌩️ Screen flash
      gsap.fromTo(
        flash,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        }
      );

      // 💥 Shake
      gsap.to(".weather-card", {
        x: "+=5",
        yoyo: true,
        repeat: 3,
        duration: 0.05,
      });
    });
  });
  gsap.delayedCall(3, strikeOrder);
}
strikeOrder();

// 👀 Eye follow cursor
document.addEventListener("mousemove", (e) => {
  const rect = cloudFace.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / 50;
  const dy = (e.clientY - cy) / 50;

  pupils.forEach((p) => {
    p.style.transform = `translate(${dx}px, ${dy}px)`;
  });
});
