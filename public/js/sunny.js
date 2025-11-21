let temperature = 40;

const sun = document.getElementById("sun");
const mouth = document.getElementById("mouth");
const sweat = document.getElementById("sweat");
const eyes = document.querySelectorAll(".eye");
const mainCloud = document.getElementById("mainCloud");
const frontCloud = document.getElementById("frontCloud");
const allClouds = document.querySelectorAll(
  ".cloud, .main-cloud, .front-cloud"
);

gsap.to(sun, {
  y: "-=10",
  duration: 3,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});
gsap.to(sun, {
  scale: 1.04,
  duration: 4,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});
gsap.to(sun, {
  boxShadow: "0 0 60px rgba(255,215,0,1)",
  duration: 2,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});

eyes.forEach((eye) => {
  gsap.to(eye, {
    scaleY: 0.2,
    duration: 0.12,
    repeat: -1,
    yoyo: true,
    repeatDelay: 3 + Math.random() * 4,
    ease: "power1.inOut",
  });
});

// Background clouds animation
const clouds = document.querySelectorAll(".cloud");
const card = document.querySelector(".weather-card");
clouds.forEach((cloud) => {
  const randomStart = Math.random() * card.offsetWidth;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const travel = 200 + Math.random() * 200;
  const duration = 10 + Math.random() * 6;
  const delay = Math.random() * 5;
  gsap.set(cloud, { x: randomStart * direction });
  gsap.to(cloud, {
    x: `+=${travel * direction}`,
    duration: duration,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    delay: delay,
  });
  gsap.to(cloud, {
    y: `+=${5 + Math.random() * 5}`,
    duration: 4 + Math.random() * 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
});

// Eyes follow cursor
document.addEventListener("mousemove", (e) => {
  eyes.forEach((eye) => {
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    gsap.to(eye, {
      x: Math.cos(angle) * 3,
      y: Math.sin(angle) * 3,
      duration: 0.18,
    });
  });
});

function updateBackground(temp) {
  const card = document.querySelector(".weather-card");
  if (temp <= 30) {
    card.style.background = "linear-gradient(to top, #4facfe 0%, #dff6ff 100%)";
  } else {
    card.style.background = "linear-gradient(to bottom, #ffecd2, #fcb69f)";
  }
}

function updateSunColor(temp) {
  const sun = document.getElementById("sun");
  if (temp > 30) {
    sun.style.background =
      "radial-gradient(circle, #ffe27a 0%, #f7a04b 60%, #f68a6d 90%)";
  } else {
    sun.style.background = "radial-gradient(circle, #ffec85 0%, #facc15 70%)";
  }
}

function applyMood(temp) {
  gsap.killTweensOf(sweat);
  gsap.killTweensOf(mainCloud);
  gsap.killTweensOf(frontCloud);
  gsap.to(allClouds, { opacity: 1, duration: 1, display: "block" });
  updateBackground(temp);
  updateSunColor(temp);

  if (temp <= 25) {
    gsap.to(mouth, {
      width: "45%",
      height: 10,
      borderRadius: "0 0 40px 40px",
      duration: 0.4,
    });
    gsap.to(mainCloud, {
      y: "+=6",
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(frontCloud, {
      y: "-=5",
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(sun, {
      left: "30%",
      top: "18%",
      duration: 1.5,
      ease: "sine.inOut",
    });
  } else if (temp <= 30) {
    gsap.to(mouth, {
      borderRadius: "0 0 60px 60px",
      height: 10,
      width: "52%",
      duration: 0.4,
    });
    gsap.to(sun, {
      left: "30%",
      top: "18%",
      duration: 1.5,
      ease: "sine.inOut",
    });
  } else if (temp <= 45) {
    gsap.to(mouth, {
      borderRadius: "50%",
      height: 6,
      width: "35%",
      duration: 0.4,
    });
    gsap.to(sweat, {
      opacity: 1,
      scale: 1,
      y: "+=18",
      duration: 1.4,
      repeat: -1,
      yoyo: true,
    });
    gsap.to(sun, {
      left: "50%",
      top: "22%",
      duration: 1.5,
      ease: "sine.inOut",
    });
    allClouds.forEach((cloud) => {
      cloud.style.zIndex = 0;
      gsap.to(cloud, {
        opacity: 0.2 + Math.random() * 0.2,
        duration: 2,
        delay: Math.random() * 2,
        display: "block",
      });
      gsap.to(cloud, {
        x: "+=" + (100 + Math.random() * 150),
        y: "+=" + (3 + Math.random() * 4),
        duration: 8 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 3,
      });
    });
  } else {
    gsap.to(mouth, {
      borderRadius: "0",
      height: 4,
      width: "30%",
      background: "#600",
      duration: 0.4,
    });
    gsap.to(sweat, {
      opacity: 1,
      scale: 1.1,
      y: "+=22",
      duration: 1,
      yoyo: true,
      repeat: -1,
    });
    gsap.to(allClouds, { opacity: 0.2, duration: 1.5, display: "block" });
    gsap.to(sun, {
      left: "50%",
      top: "22%",
      duration: 1.5,
      ease: "sine.inOut",
    });
  }
}

applyMood(temperature);
