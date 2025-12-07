document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("message");

  msg.textContent = "Checking credentials...";
  msg.style.color = "#2aa8ff";

  try {
    const res = await fetch("https://climes.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      msg.style.color = "#4caf50";
      msg.textContent = "Login successful! Redirecting...";
      localStorage.setItem("authToken", data.token);

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    } else {
      msg.style.color = "#ff4444";
      msg.textContent = data.message || "Login failed";
    }
  } catch (err) {
    msg.style.color = "#ff4444";
    msg.textContent = "Server error. Try again.";
    console.error(err);
  }
});
