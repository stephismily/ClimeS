const snowman = document.getElementById("snowman");
const pupilLeft = document.getElementById("pupilLeft");
const pupilRight = document.getElementById("pupilRight");
const card = document.getElementById("snowCard");

// Generate ❄️ snowflakes dynamically
for (let i = 0; i < 40; i++) {
  const snowflake = document.createElement("div");
  snowflake.classList.add("snowflake");
  snowflake.textContent = "❆";

  snowflake.style.left = `${Math.random() * 100}%`;
  snowflake.style.top = `${-Math.random() * 100}px`;
  snowflake.style.animationDuration = `${3 + Math.random() * 3}s`;
  snowflake.style.animationDelay = `${Math.random() * 3}s`;
  snowflake.style.fontSize = `${18 + Math.random() * 8}px`;
  snowflake.style.opacity = 0.6 + Math.random() * 0.4;
  snowflake.style.transform = `rotate(${Math.random() * 360}deg)`;

  card.appendChild(snowflake);
}

// Move snowman & eyes with cursor
document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 100;
  const y = (e.clientY / window.innerHeight - 0.5) * 50;

  gsap.to(snowman, {
    x: x * 0.4,
    y: y * 0.3,
    duration: 0.4,
    ease: "power2.out",
  });

  gsap.to([pupilLeft, pupilRight], {
    x: x * 0.15,
    y: y * 0.15,
    duration: 0.2,
    ease: "power1.out",
  });
});
