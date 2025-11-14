// ✅ Your API login function (unchanged)
async function loginUser(email) {
  const response = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  console.log("Login Response:", data);
  return data;
}

// ✅ Handle Form Submit
const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailInput").value.trim();

  messageBox.textContent = "Logging in...";
  messageBox.style.color = "#2b88c6";

  try {
    const result = await loginUser(email);

    if (result.success) {
      messageBox.textContent = "Login successful!";
      messageBox.style.color = "#4caf50";

      // Redirect after login (optional)
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);
    } else {
      messageBox.textContent = result.message || "Login failed.";
      messageBox.style.color = "#ff4444";
    }
  } catch (error) {
    console.error("Login Error:", error);
    messageBox.textContent = "Server error. Try again.";
    messageBox.style.color = "#ff4444";
  }
});
