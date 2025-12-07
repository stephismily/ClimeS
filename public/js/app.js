document.addEventListener("DOMContentLoaded", () => {
  // Insert navbar
  const navbar = `
    <header>
      <div class="logo">ClimeS</div>

      <nav class="nav-links">
        <a href="index.html">Home</a>
        <a href="globe.html">Weather</a>
        <a href="team.html">Our Team</a>
      </nav>

      <div class="auth-buttons" id="authArea"></div>
    </header>
  `;

  document.body.insertAdjacentHTML("afterbegin", navbar);

  // --- AUTH LOGIC ---
  const authArea = document.getElementById("authArea");

  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    user = null;
  }

  // If logged in
  if (token && user && user.name) {
    authArea.innerHTML = `
      <span style="color:white; margin-right:15px; font-weight:500;">
        Hi, ${user.name}
      </span>
      <button id="logoutBtn">Logout</button>
    `;

    // Logout logic
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    });
  } else {
    // If NOT logged in
    authArea.innerHTML = `
      <button onclick="window.location.href='login.html'">
        Sign In / Sign Up
      </button>
    `;
  }
});
