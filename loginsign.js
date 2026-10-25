// ===== Elossence auth (localStorage demo) =====
const USERS_KEY = "elossence_users";      // all registered users
const SESSION_KEY = "elossence_session";  // currently logged-in user (email)

// Works from root pages and from subfolders like /men/ or /women/
const scriptEl = document.querySelector('script[src$="loginsign.js"]');
const BASE = scriptEl ? scriptEl.getAttribute("src").replace("loginsign.js", "") : "";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function getCurrentUser() {
  const email = localStorage.getItem(SESSION_KEY);
  return getUsers().find(u => u.email === email) || null;
}
function showMessage(text, type) {
  const box = document.getElementById("formMessage");
  if (!box) return;
  box.textContent = text;
  box.className = "form-message " + type;
}
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

// ----- Sign up -----
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  if (getCurrentUser()) window.location.href = BASE + "index.html";

  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const [nameInput, emailInput, passInput] = signupForm.querySelectorAll("input");
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    if (!name) return showMessage("Please enter your full name.", "error");
    if (!isValidEmail(email)) return showMessage("Please enter a valid email.", "error");
    if (password.length < 6) return showMessage("Password must be at least 6 characters.", "error");

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return showMessage("An account with this email already exists.", "error");
    }

    users.push({ name, email, password });
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, email);
    showMessage("Account created! Redirecting...", "success");
    setTimeout(() => (window.location.href = BASE + "index.html"), 800);
  });
}

// ----- Login -----
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  if (getCurrentUser()) window.location.href = BASE + "index.html";

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const [emailInput, passInput] = loginForm.querySelectorAll("input");
    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    if (!isValidEmail(email)) return showMessage("Please enter a valid email.", "error");

    const user = getUsers().find(u => u.email === email);
    if (!user) return showMessage("No account found. Please sign up first.", "error");
    if (user.password !== password) return showMessage("Incorrect password.", "error");

    localStorage.setItem(SESSION_KEY, email);
    showMessage("Welcome back, " + user.name.split(" ")[0] + "! Redirecting...", "success");
    setTimeout(() => (window.location.href = BASE + "index.html"), 800);
  });

  // Forgot password link (simple demo)
  const forgot = document.querySelector(".auth-links a[href='#']");
  if (forgot) forgot.addEventListener("click", function (e) {
    e.preventDefault();
    showMessage("Password reset isn't available in this demo.", "error");
  });
}

// ----- Navbar: show Login / Logout on every page that includes this script -----
const nav = document.querySelector(".nav-links");
if (nav) {
  const user = getCurrentUser();
  const link = document.createElement("a");
  if (user) {
    link.href = "#";
    link.textContent = "Logout (" + user.name.split(" ")[0] + ")";
    link.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem(SESSION_KEY);
      window.location.href = BASE + "login.html";
    });
  } else {
    link.href = BASE + "login.html";
    link.textContent = "Login";
  }
  nav.appendChild(link);
}