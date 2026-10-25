// ===== Elossence Auth Engine (Vanilla JS + LocalStorage) =====
const USERS_KEY = "elossence_users";          // List of registered users: [{ name, email, password }]
const CURRENT_USER_KEY = "elossence_current_user"; // Active session: { name, email }
const SESSION_KEY = "elossence_session";      // Active session email string

// Determine base path for relative URLs whether from root or subfolders
const scriptEl = document.querySelector('script[src*="loginsign.js"]');
const BASE = (scriptEl && scriptEl.getAttribute("src").includes("../")) ? "../" : "";

// Helper to retrieve all registered users from local machine storage
function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const initialUsers = (typeof window !== "undefined" && window.DEFAULT_LOCAL_USERS && window.DEFAULT_LOCAL_USERS.length)
        ? window.DEFAULT_LOCAL_USERS
        : [
            { name: "Jagrit Bansal", email: "demo@elossence.com", password: "password123", role: "Inner Circle Member" }
          ];
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(raw) || [];
  } catch (e) {
    return (typeof window !== "undefined" && window.DEFAULT_LOCAL_USERS) || [];
  }
}



function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn("Storage error:", e);
  }
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
    const email = localStorage.getItem(SESSION_KEY);
    if (email) {
      const found = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        const uObj = { name: found.name, email: found.email };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(uObj));
        return uObj;
      }
    }
  } catch (e) {}
  return null;
}

function setSessionUser(user) {
  const sessionData = { name: user.name, email: user.email };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
  localStorage.setItem(SESSION_KEY, user.email);
}

function clearSessionUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(SESSION_KEY);
}

function showMessage(text, type) {
  const box = document.getElementById("formMessage");
  if (!box) return;
  box.textContent = text;
  box.className = "form-message " + type;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----- Sign Up -----
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const container = document.querySelector(".auth-form-container");
    if (container) {
      container.innerHTML = `
        <h2 class="serif">Already Signed In</h2>
        <p style="margin-bottom: 1.5rem;">You are currently signed in as <strong style="color: var(--plum);">${currentUser.name}</strong> (${currentUser.email}).</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="${BASE}index.html" style="padding: 0.9rem 1.8rem; background: var(--plum); color: var(--ivory); text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; display: inline-block;">Go to Home</a>
          <button id="authLogoutBtn" style="padding: 0.9rem 1.8rem; background: transparent; border: 1px solid var(--plum); color: var(--plum); text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; cursor: pointer;">Sign Out</button>
        </div>
      `;
      const btn = document.getElementById("authLogoutBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          clearSessionUser();
          window.location.reload();
        });
      }
    }
  } else {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const inputs = signupForm.querySelectorAll("input");
      const name = (inputs[0] ? inputs[0].value : "").trim();
      const email = (inputs[1] ? inputs[1].value : "").trim().toLowerCase();
      const password = inputs[2] ? inputs[2].value : "";

      if (!name || name.length < 2) {
        return showMessage("Please enter your full name (at least 2 letters).", "error");
      }
      if (!isValidEmail(email)) {
        return showMessage("Please enter a valid email address.", "error");
      }
      if (password.length < 6) {
        return showMessage("Password must be at least 6 characters.", "error");
      }

      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        return showMessage("An account with this email already exists. Please sign in.", "error");
      }

      const newUser = { name, email, password };
      users.push(newUser);
      saveUsers(users);
      setSessionUser(newUser);

      showMessage("Account created! Welcome, " + name.split(" ")[0] + ". Redirecting...", "success");
      setTimeout(() => {
        window.location.href = BASE + "index.html";
      }, 750);
    });
  }
}

// ----- Login -----
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const container = document.querySelector(".auth-form-container");
    if (container) {
      container.innerHTML = `
        <h2 class="serif">Already Signed In</h2>
        <p style="margin-bottom: 1.5rem;">You are currently signed in as <strong style="color: var(--plum);">${currentUser.name}</strong> (${currentUser.email}).</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="${BASE}index.html" style="padding: 0.9rem 1.8rem; background: var(--plum); color: var(--ivory); text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; display: inline-block;">Go to Home</a>
          <button id="authLogoutBtn" style="padding: 0.9rem 1.8rem; background: transparent; border: 1px solid var(--plum); color: var(--plum); text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; cursor: pointer;">Sign Out</button>
        </div>
      `;
      const btn = document.getElementById("authLogoutBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          clearSessionUser();
          window.location.reload();
        });
      }
    }
  } else {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const inputs = loginForm.querySelectorAll("input");
      const email = (inputs[0] ? inputs[0].value : "").trim().toLowerCase();
      const password = inputs[1] ? inputs[1].value : "";

      if (!email) {
        return showMessage("Please enter your email address.", "error");
      }
      if (!isValidEmail(email)) {
        return showMessage("Please enter a valid email address.", "error");
      }
      if (!password) {
        return showMessage("Please enter your password.", "error");
      }

      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email);

      if (!user) {
        return showMessage("No account found with this email. Please sign up first.", "error");
      }
      if (user.password !== password) {
        return showMessage("Incorrect password. Please verify and try again.", "error");
      }

      setSessionUser(user);
      showMessage("Welcome back, " + user.name.split(" ")[0] + "! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = BASE + "index.html";
      }, 750);
    });

    // Forgot password link
    const forgot = document.querySelector(".auth-links a[href='#']");
    if (forgot) {
      forgot.addEventListener("click", function (e) {
        e.preventDefault();
        const emailInput = loginForm.querySelector("input[type='email']");
        const emailVal = emailInput ? emailInput.value.trim().toLowerCase() : "";
        if (emailVal) {
          const user = getUsers().find(u => u.email.toLowerCase() === emailVal);
          if (user) {
            showMessage(`Demo password reminder for ${user.email}: "${user.password}"`, "success");
            return;
          }
        }
        showMessage("Enter your email address above to view your demo password.", "error");
      });
    }
  }
}

// ----- Update Navbar Actions on Auth pages if present -----
document.addEventListener("DOMContentLoaded", function () {

  const navActions = document.querySelector(".nav-actions");
  if (navActions) {
    const user = getCurrentUser();
    if (user && user.name) {
      navActions.innerHTML = `
        <span style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--plum); display: flex; align-items: center; gap: 6px; font-weight: 500;">
          <span style="color: var(--rose);">✦</span> ${user.name.split(" ")[0]}
        </span>
        <button id="navLogoutBtnTop" style="background: transparent; border: 1px solid var(--plum); color: var(--plum); padding: 0.4rem 0.9rem; font-size: 11px; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; transition: all 0.3s ease;">Logout</button>
      `;
      const btn = document.getElementById("navLogoutBtnTop");
      if (btn) {
        btn.addEventListener("click", function () {
          clearSessionUser();
          window.location.reload();
        });
      }
    } else {
      navActions.innerHTML = `
        <button onclick="window.location.href='${BASE}login.html'">Login</button>
        <button class="dark" onclick="window.location.href='${BASE}signup.html'">Sign Up</button>
      `;
    }
  }
});