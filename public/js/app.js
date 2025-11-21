document.addEventListener("DOMContentLoaded", () => {
  const navbar = `
    <header>
      <div class="logo">ClimeS</div>

      <nav class="nav-links">
        <a href="../index.html">Home</a>
        <a href="html/globe.html">Weather</a>
        <a href="html/team.html">Our Team</a>
      </nav>

      <div class="auth-buttons" id="authArea"></div>
    </header>
  `;

  document.body.insertAdjacentHTML("afterbegin", navbar);

  // --- auth logic ---
  const authArea = document.getElementById("authArea");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    authArea.innerHTML = `
      <span style="color:white; margin-right:15px;">Hi, ${user.name}</span>
      <button id="logoutBtn">Logout</button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    });
  } else {
    authArea.innerHTML = `
      <button onclick="window.location.href='/html/login.html'">
        Sign In / Sign Up
      </button>
    `;
  }
});
