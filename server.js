const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key_123";

app.use(express.json());

const users = [];

// FULL-STACK FRONTEND: HTML + CSS + JavaScript
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JWT Authentication</title>
<style>
* { box-sizing: border-box; }
body {
  font-family: Arial, sans-serif;
  background: #eef2ff;
  margin: 0;
  padding: 20px;
}
.container {
  max-width: 430px;
  margin: 25px auto;
}
h1 { text-align: center; color: #2563eb; }
.card {
  background: white;
  padding: 22px;
  margin: 18px 0;
  border-radius: 12px;
  box-shadow: 0 4px 15px #00000012;
}
input, button {
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border-radius: 6px;
  font-size: 15px;
}
input { border: 1px solid #cbd5e1; }
button {
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover { background: #1d4ed8; }
#message { text-align: center; overflow-wrap: anywhere; }
#profile { color: #047857; font-weight: bold; }
</style>
</head>
<body>
<div class="container">
  <h1>JWT Authentication</h1>

  <div class="card">
    <h2>Register</h2>
    <form id="registerForm">
      <input id="regUser" placeholder="Username" required>
      <input id="regPass" type="password"
        placeholder="Password (minimum 6 characters)"
        minlength="6" required>
      <button type="submit">Register</button>
    </form>
  </div>

  <div class="card">
    <h2>Login</h2>
    <form id="loginForm">
      <input id="loginUser" placeholder="Username" required>
      <input id="loginPass" type="password"
        placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
  </div>

  <div class="card">
    <h2>Protected Profile</h2>
    <button id="profileBtn">View Profile</button>
    <p id="profile"></p>
    <button id="logoutBtn">Logout</button>
  </div>

  <p id="message" role="status"></p>
</div>

<script>
const message = document.getElementById("message");
const profile = document.getElementById("profile");

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Registration
document.getElementById("registerForm").onsubmit = async function(e) {
  e.preventDefault();
  try {
    const data = await api("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("regUser").value,
        password: document.getElementById("regPass").value
      })
    });
    message.textContent = data.message;
    this.reset();
  } catch (err) {
    message.textContent = err.message;
  }
};

// Login
document.getElementById("loginForm").onsubmit = async function(e) {
  e.preventDefault();
  try {
    const data = await api("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("loginUser").value,
        password: document.getElementById("loginPass").value
      })
    });
    localStorage.setItem("token", data.token);
    message.textContent = "Login successful!";
    this.reset();
  } catch (err) {
    message.textContent = err.message;
  }
};

// Protected profile
document.getElementById("profileBtn").onclick = async function() {
  const token = localStorage.getItem("token");
  if (!token) {
    message.textContent = "Please login first.";
    return;
  }
  try {
    const data = await api("/profile", {
      headers: { Authorization: "Bearer " + token }
    });
    profile.textContent = "Welcome, " + data.username;
    message.textContent = "Profile accessed successfully!";
  } catch (err) {
    profile.textContent = "";
    message.textContent = err.message;
    if (err.message === "Unauthorized") {
      localStorage.removeItem("token");
    }
  }
};

// Logout
document.getElementById("logoutBtn").onclick = function() {
  localStorage.removeItem("token");
  profile.textContent = "";
  message.textContent = "Logged out successfully.";
};
</script>
</body>
</html>
  `);
});

// POST /register
app.post("/register", async (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    !username.trim() ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const name = username.trim();

  if (users.some(user => user.username === name)) {
    return res.status(409).json({
      error: "Username already exists"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ username: name, password: hashedPassword });

  res.status(201).json({ message: "User registered" });
});

// POST /login
app.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  const user = users.find(u => u.username === username);

  if (
    !user ||
    typeof password !== "string" ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const token = jwt.sign(
    { username: user.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.status(200).json({ token });
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (
      err ||
      !decoded ||
      typeof decoded.username !== "string"
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
}

// GET /profile — protected route
app.get("/profile", authenticateToken, (req, res) => {
  res.status(200).json({ username: req.user.username });
});

// Start server
app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});