//const API_URL = "http://localhost:5000"
const API_URL = "https://landing-page-o9gq.onrender.com"

async function register(e) {
  e.preventDefault(); 
  
  // Fetching values using the class names from RegistrationForm_2.html
  const name = document.querySelector(".name-container").value;
  const email = document.querySelector(".email-container").value;
  const password = document.querySelector(".pwd-container").value;

  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    alert(data.message || "Registration complete");
    
    if(response.ok) {
        // Redirect to Login upon successful account creation
        window.location.href = "index.html"; 
    }
  } catch (error) {
    alert("Cannot connect to server");
  }
}

async function login(e) {
  e.preventDefault();

  // Fetching values using the class names from Login_2.html
  const email = document.querySelector(".email-container-login").value;
  const password = document.querySelector(".pwd-container-login").value;

  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      // Redirect to the dashboard upon successful login
      window.location.href = "home.html"; 
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    alert("Cannot connect to server");
  }
}

// Attach event listeners based on which page is currently loaded
document.addEventListener("DOMContentLoaded", () => {
  const registerButton = document.querySelector(".signup-btn");
  if (registerButton) {
    registerButton.addEventListener("click", register);
  }

  const loginButton = document.querySelector(".signup-btn-login");
  if (loginButton) {
    loginButton.addEventListener("click", login);
  }

  // Handle the Logout link on home.html
  const logoutLink = document.querySelector('nav a[href="RegistrationForm.html"]');
  if (logoutLink && logoutLink.innerText === "Logout") {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault(); // Stop the default link behavior
      localStorage.removeItem("token"); // Clear the session
      window.location.href = "index.html"; // Send back to login
    });
  }
});