/**
 * Elossence - Main JavaScript Engine
 * Luxury Fashion Showcase & Client Services
 */

document.addEventListener('DOMContentLoaded', () => {
  initIntroAnimation();
  initHamburger();
  initNewsletter();
  initContactForm();
  initThankYouPage();
  updateNavSession();
});

/* =====================================================
   0. INTRO ANIMATION SESSION CONTROLLER
===================================================== */
function initIntroAnimation() {
  const intro = document.getElementById('ellosence-intro');
  if (intro && intro.style.display !== 'none') {
    // After animation finishes (3.2s delay + 1.2s fade), remove from layout
    setTimeout(() => {
      if (intro) intro.style.display = 'none';
    }, 4500);
  }
  // Record that the session has started so intro never replays when clicking Home
  try {
    sessionStorage.setItem('elossence_intro_seen', 'true');
  } catch (e) {
    /* ignore private mode storage blocks */
  }
}

/* =====================================================
   1. LUXURY TOAST NOTIFICATION
===================================================== */
function showToast(message, icon = '✦') {
  let toast = document.querySelector('.elossence-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'elossence-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4200);
}

/* =====================================================
   2. HAMBURGER MENU NAVIGATION
===================================================== */
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }
}

/* =====================================================
   3. NEWSLETTER SUBSCRIPTION & REDIRECTION
===================================================== */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('newsletter-email');
  const feedbackMsg = document.getElementById('newsletter-msg');

  // Fallback for generic newsletter markup if IDs are not present
  const fallbackSection = document.querySelector('.newsletter');
  const targetForm = form || (fallbackSection ? fallbackSection.querySelector('.form-group') : null);
  const targetInput = emailInput || (fallbackSection ? fallbackSection.querySelector('input[type="email"]') : null);
  const targetBtn = fallbackSection ? fallbackSection.querySelector('button') : null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handleSubscription(emailValue) {
    const cleanEmail = (emailValue || '').trim();

    if (!cleanEmail) {
      setFeedback('Please enter your email address.', true);
      if (targetInput) targetInput.focus();
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setFeedback('Please provide a valid email address (e.g. name@domain.com).', true);
      if (targetInput) targetInput.focus();
      return;
    }

    // Save subscriber to localStorage
    try {
      const stored = localStorage.getItem('elossence_subscribers');
      const subscribers = stored ? JSON.parse(stored) : [];

      const exists = subscribers.some(sub => (typeof sub === 'string' ? sub : sub.email).toLowerCase() === cleanEmail.toLowerCase());

      if (!exists) {
        subscribers.push({
          email: cleanEmail,
          subscribedAt: new Date().toISOString()
        });
        localStorage.setItem('elossence_subscribers', JSON.stringify(subscribers));
      }

      localStorage.setItem('elossence_last_subscriber', cleanEmail);
    } catch (e) {
      console.warn('Storage error:', e);
    }

    setFeedback('Preparing your invitation...', false);

    // Redirect to Thank You page
    const targetUrl = `thankyou.html?email=${encodeURIComponent(cleanEmail)}`;
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 450);
  }

  function setFeedback(msg, isError) {
    if (feedbackMsg) {
      feedbackMsg.textContent = msg;
      feedbackMsg.className = `newsletter-feedback ${isError ? 'error' : 'success'}`;
    } else {
      showToast(msg, isError ? '⚠' : '✓');
    }
    if (targetInput) {
      if (isError) {
        targetInput.style.borderColor = '#b94a48';
      } else {
        targetInput.style.borderColor = '';
      }
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubscription(targetInput ? targetInput.value : '');
    });
  } else if (targetBtn && targetInput) {
    targetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSubscription(targetInput.value);
    });

    targetInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubscription(targetInput.value);
      }
    });
  }
}

/* =====================================================
   4. CONTACT US FORM FUNCTIONALITY
===================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const successState = document.getElementById('contactSuccess');
  const resetBtn = document.getElementById('btnResetContact');

  const fields = {
    name: document.getElementById('contactName'),
    email: document.getElementById('contactEmail'),
    subject: document.getElementById('contactSubject'),
    message: document.getElementById('contactMessage')
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(name, element) {
    if (!element) return true;
    const val = element.value.trim();
    const errorContainer = document.getElementById(`error-${name}`);
    let errorMessage = '';

    if (name === 'name' && val.length < 2) {
      errorMessage = 'Please enter your full name.';
    } else if (name === 'email') {
      if (!val) {
        errorMessage = 'Email address is required.';
      } else if (!emailRegex.test(val)) {
        errorMessage = 'Please provide a valid email format.';
      }
    } else if (name === 'subject' && !val) {
      errorMessage = 'Please select a topic of inquiry.';
    } else if (name === 'message' && val.length < 10) {
      errorMessage = 'Please include a message with at least 10 characters.';
    }

    if (errorMessage) {
      element.classList.add('error');
      if (errorContainer) errorContainer.textContent = errorMessage;
      return false;
    } else {
      element.classList.remove('error');
      if (errorContainer) errorContainer.textContent = '';
      return true;
    }
  }

  // Live validation on blur
  Object.keys(fields).forEach(key => {
    const el = fields[key];
    if (el) {
      el.addEventListener('blur', () => validateField(key, el));
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) {
          validateField(key, el);
        }
      });
    }
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(fields).forEach(key => {
      const valid = validateField(key, fields[key]);
      if (!valid) isValid = false;
    });

    if (!isValid) {
      showToast('Please correct the highlighted fields.', '⚠');
      return;
    }

    const submitBtn = contactForm.querySelector('.btn-contact-submit');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Inquiry';
    if (submitBtn) {
      submitBtn.textContent = 'Transmitting...';
      submitBtn.disabled = true;
    }

    // Generate ticket reference
    const ticketId = 'ELO-' + Math.floor(100000 + Math.random() * 900000);
    const inquiryData = {
      id: ticketId,
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      subject: fields.subject.value,
      message: fields.message.value.trim(),
      submittedAt: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem('elossence_inquiries');
      const inquiries = stored ? JSON.parse(stored) : [];
      inquiries.unshift(inquiryData);
      localStorage.setItem('elossence_inquiries', JSON.stringify(inquiries));
    } catch (err) {
      console.warn('Storage error on inquiry:', err);
    }

    setTimeout(() => {
      // Transition to success state
      contactForm.style.display = 'none';
      if (successState) {
        successState.style.display = 'block';

        const nameDisplay = document.getElementById('successClientName');
        const emailDisplay = document.getElementById('successClientEmail');
        const ticketDisplay = document.getElementById('successTicketId');

        if (nameDisplay) nameDisplay.textContent = inquiryData.name;
        if (emailDisplay) emailDisplay.textContent = inquiryData.email;
        if (ticketDisplay) ticketDisplay.textContent = ticketId;
      }

      showToast('Your inquiry has been delivered to the atelier concierge.', '✦');

      if (submitBtn) {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    }, 600);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      contactForm.reset();
      Object.keys(fields).forEach(key => {
        const el = fields[key];
        if (el) el.classList.remove('error');
        const errorContainer = document.getElementById(`error-${key}`);
        if (errorContainer) errorContainer.textContent = '';
      });
      if (successState) successState.style.display = 'none';
      contactForm.style.display = 'flex';
      fields.name.focus();
    });
  }
}

/* =====================================================
   5. THANK YOU / SUBSCRIBED PAGE DISPLAY
===================================================== */
function initThankYouPage() {
  const emailDisplay = document.getElementById('user-email');
  if (!emailDisplay) return;

  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email');
  const storedEmail = localStorage.getItem('elossence_last_subscriber');

  const finalEmail = emailParam || storedEmail || 'your email';
  emailDisplay.textContent = finalEmail;
}

/* =====================================================
   6. USER SESSION STATE IN NAVBAR
===================================================== */
function updateNavSession() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  try {
    const rawUser = localStorage.getItem('elossence_current_user');
    if (!rawUser) return;

    const user = JSON.parse(rawUser);
    if (!user || !user.name) return;

    // Check if we are inside a subfolder (men/ or women/)
    const isInSubfolder = window.location.pathname.includes('/men/') || window.location.pathname.includes('/women/');
    const homePath = isInSubfolder ? '../index.html' : 'index.html';

    navActions.innerHTML = `
      <span style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--plum); display: flex; align-items: center; gap: 6px;">
        <span style="color: var(--rose);">✦</span> ${user.name.split(' ')[0]}
      </span>
      <button id="navLogoutBtn" style="background: transparent; border: 1px solid var(--plum); color: var(--plum); padding: 0.4rem 0.9rem; font-size: 11px; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; transition: all 0.3s ease;">Logout</button>
    `;

    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('elossence_current_user');
        showToast('Signed out of Elossence.', '✦');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      });
    }
  } catch (err) {
    console.warn('Session parse error:', err);
  }
}



// wishlist

// Get saved outfits from localStorage
function getWishlist() {
  return JSON.parse(localStorage.getItem("elossence_wishlist")) || [];
}

// Save outfits to localStorage
function saveWishlist(items) {
  localStorage.setItem("elossence_wishlist", JSON.stringify(items));
}

// Update the number beside the navbar heart
function updateWishlistCount() {
  const count = getWishlist().length;

  document.querySelectorAll(".wishlist-count").forEach(function (element) {
    element.textContent = count;
  });
}

// Add or remove an outfit
function toggleWishlist(button, id, name, image, category) {
  const items = getWishlist();

  // Identify the outfit's page so different outfits don't clash
  const pagePath = window.location.pathname;
  const uniqueId = pagePath + "|" + id;

  const existingIndex = items.findIndex(function (item) {
    return item.id === uniqueId;
  });

  if (existingIndex !== -1) {
    items.splice(existingIndex, 1);
    button.classList.remove("active");
    button.textContent = "♡";
  } else {
    // Make the image path work from wishlist.html
    const folder = category.toLowerCase();
const imagePath = image.startsWith("http")
    ? image
    : folder + "/" + image.replace(/^\.\//, "");    items.push({
      id: uniqueId,
      name: name,
      image: imagePath,
      category: category
    });

    button.classList.add("active");
    button.textContent = "♥";
  }

  saveWishlist(items);
  updateWishlistCount();

  if (typeof showToast === "function") {
    showToast(
      existingIndex !== -1 ? "Removed from wishlist" : "Added to wishlist",
      existingIndex !== -1 ? "♡" : "♥"
    );
  }

  renderWishlist();
}

// Make saved hearts appear filled when a page opens
function syncWishlistButtons() {
  const items = getWishlist();
  const pagePath = window.location.pathname;

  document.querySelectorAll(".wishlist-btn").forEach(function (button) {
   const match = button.getAttribute("onclick").match(
  /toggleWishlist\(this,\s*'([^']+)'/
);
    if (!match) return;

    const uniqueId = pagePath + "|" + match[1];
    const saved = items.some(function (item) {
      return item.id === uniqueId;
    });

    button.classList.toggle("active", saved);
    button.textContent = saved ? "♥" : "♡";
  });
}

// Display saved outfits on wishlist.html
function renderWishlist() {
  const container = document.getElementById("wishlist-items");

  if (!container) return;

  const items = getWishlist();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-wishlist">
        <h2>Your wishlist is empty ♡</h2>
        <p>Explore outfits and tap a heart to save your favourites.</p>
        <a href="men/men.html">Explore men's fashion</a>
        &nbsp; | &nbsp;
        <a href="women/index.html">Explore women's fashion</a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(function (item) {
    return `
      <div class="wishlist-card">
        <img src="${item.image}" alt="${item.name}">
        <div class="wishlist-info">
          <h3>${item.name}</h3>
          <p>${item.category} fashion</p>
          <button class="remove-wishlist"
            onclick="removeFromWishlist('${item.id}')">
            Remove ♡
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Remove an outfit from the wishlist
function removeFromWishlist(id) {
  const items = getWishlist().filter(function (item) {
    return item.id !== id;
  });

  saveWishlist(items);
  updateWishlistCount();
  renderWishlist();
  syncWishlistButtons();
}

// Run when the page loads
document.addEventListener("DOMContentLoaded", function () {
  updateWishlistCount();
  syncWishlistButtons();
  renderWishlist();
});
