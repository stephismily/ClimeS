document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("message");

  msg.textContent = "Creating account...";
  msg.style.color = "#2b88c6";

  const response = await fetch(" https://climes.onrender.com/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (data.success) {
    msg.style.color = "#4caf50";
    msg.textContent = "Signup successful! Redirecting...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  } else {
    msg.style.color = "#ff4444";
    msg.textContent = data.message;
  }
});
