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
  updateWishlistCount();
  syncWishlistButtons();
  renderWishlist();
  initRecentlyViewedAutoTrack();
  initOutfitCardTracking();
  renderRecentlyViewed();
});

/* =====================================================
   0. INTRO ANIMATION SESSION CONTROLLER
===================================================== */
function initIntroAnimation() {
  const intro = document.getElementById('ellosence-intro');
  if (intro && intro.style.display !== 'none') {
    setTimeout(() => {
      if (intro) intro.style.display = 'none';
    }, 4500);
  }
  try {
    sessionStorage.setItem('elossence_intro_seen', 'true');
  } catch (e) {
    /* ignore storage blocks */
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
  }, 3500);
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

    const normalizedPath = window.location.pathname.replace(/\\/g, '/');
    const isInSubfolder = normalizedPath.includes('/men/') || normalizedPath.includes('/women/');
    const targetUrl = (isInSubfolder ? '../' : '') + `thankyou.html?email=${encodeURIComponent(cleanEmail)}`;
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
      targetInput.style.borderColor = isError ? '#b94a48' : '';
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

    const ticketId = 'ELO-' + Math.floor(100000 + Math.random() * 900000);
    const inquiryData = {
      id: ticketId,
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      subject: fields.subject.value,
      message: fields.message.value.trim(),
      submittedAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem('elossence_inquiries');
      const inquiries = stored ? JSON.parse(stored) : [];
      inquiries.unshift(inquiryData);
      localStorage.setItem('elossence_inquiries', JSON.stringify(inquiries));
    } catch (err) {
      console.warn('Storage error on inquiry:', err);
    }

    setTimeout(() => {
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

  const normalizedPath = window.location.pathname.replace(/\\/g, '/');
  const isInSubfolder = normalizedPath.includes('/men/') || normalizedPath.includes('/women/');
  const base = isInSubfolder ? '../' : '';

  let user = null;
  try {
    const raw = localStorage.getItem('elossence_current_user');
    if (raw) user = JSON.parse(raw);
    if (!user) {
      const email = localStorage.getItem('elossence_session');
      if (email) {
        const users = JSON.parse(localStorage.getItem('elossence_users')) || [];
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (found) user = { name: found.name, email: found.email };
      }
    }
  } catch (e) {
    user = null;
  }

  if (user && user.name) {
    const firstName = user.name.split(' ')[0];
    navActions.innerHTML = `
      <span id="navUserBadge" style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--plum); display: flex; align-items: center; gap: 6px; font-weight: 500; cursor: pointer;" title="Logged in as ${user.name} (${user.email})">
        <span style="color: var(--rose);">✦</span> ${firstName}
      </span>
      <button id="navLogoutBtn" style="background: transparent; border: 1px solid var(--plum); color: var(--plum); padding: 0.4rem 0.9rem; font-size: 11px; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; transition: all 0.3s ease;">Logout</button>
    `;

    const userBadge = document.getElementById('navUserBadge');
    if (userBadge) {
      userBadge.addEventListener('click', () => {
        showToast(`Account: ${user.name} (${user.email}) - Stored in localStorage`, '✦');
      });
    }

    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('elossence_current_user');
        localStorage.removeItem('elossence_session');
        showToast('Signed out of Elossence.', '✦');
        setTimeout(() => {
          updateNavSession();
          window.location.reload();
        }, 350);
      });
    }
  } else {
    navActions.innerHTML = `
      <button onclick="window.location.href='${base}login.html'">Login</button>
      <button class="dark" onclick="window.location.href='${base}signup.html'">Sign Up</button>
    `;
  }
}

/* =====================================================
   7. WISHLIST ENGINE (LOCALSTORAGE)
===================================================== */

/**
 * Resolves local image paths to the correct root relative path
 */
function resolveWishlistImagePath(image, category, name) {
  if (!image) return "images/signatureMen.jpeg";

  // Map legacy picsum traditional placeholders to real local photos
  if (image.includes("picsum.photos/seed/trad-0") || name === "Silk saree + statement jewellery") {
    return "women/images2/traditional1.jpeg";
  }
  if (image.includes("picsum.photos/seed/trad-1") || name === "Anarkali suit + juttis") {
    return "women/images2/traditional2.jpeg";
  }
  if (image.includes("picsum.photos/seed/trad-2") || name === "Lehenga choli + potli bag") {
    return "women/images2/traditional3.jpeg";
  }
  if (image.includes("picsum.photos/seed/trad-3") || name === "Embroidered kurta + churidar") {
    return "women/images2/traditional4.jpeg";
  }
  if (image.includes("picsum.photos/seed/trad-4") || name === "Banarasi dupatta + fitted blouse") {
    return "women/images2/traditional5.jpeg";
  }
  if (image.includes("picsum.photos/seed/trad-5") || name === "Sharara set + oxidised jewellery") {
    return "women/images2/traditional6.jpeg";
  }

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
    return image;
  }

  let clean = image.replace(/^\.\//, "").replace(/^\//, "");

  // If already prefixed with women/ or men/
  if (clean.startsWith("women/") || clean.startsWith("men/")) {
    return clean;
  }

  // Root images list
  const rootImages = [
    "backImageMen.jpeg",
    "cash,mereOvercoatMen.jpeg",
    "ivoryWomen.jpeg",
    "noirWomen.jpeg",
    "onyxMen.jpeg",
    "pleatedtrousersMen.jpeg",
    "ribbedMockWOmen.jpeg",
    "signatureMen.jpeg",
    "signinImage.jpeg",
    "toppick.jpeg",
    "wideLegWomen.jpeg"
  ];
  const filename = clean.split("/").pop();
  if (clean.startsWith("images/") && rootImages.includes(filename)) {
    return clean;
  }

  const cat = (category || "").toLowerCase();
  const currentPath = (typeof window !== "undefined" && window.location ? window.location.pathname.replace(/\\/g, "/") : "");
  const isWomen = cat.includes("women") || currentPath.includes("/women/");
  const isMen = cat.includes("men") || currentPath.includes("/men/");

  if (isWomen) {
    return "women/" + clean;
  }
  if (isMen) {
    return "men/" + clean;
  }

  // Auto-detect based on file patterns
  if (clean.startsWith("images2/") || clean.includes("streetwear") || clean.includes("casual")) {
    return "women/" + clean;
  }

  return clean;
}

function handleWishlistImgError(img, origImage, category) {
  if (img.dataset.failed) return;
  img.dataset.failed = "true";

  const clean = (origImage || "").replace(/^\.\//, "").replace(/^\//, "");
  const cat = (category || "").toLowerCase();

  if (cat.includes("women") && !clean.startsWith("women/")) {
    img.src = "women/" + clean;
    return;
  }
  if (cat.includes("men") && !clean.startsWith("men/")) {
    img.src = "men/" + clean;
    return;
  }
  img.src = "images/signatureMen.jpeg";
}

function getWishlist() {
  try {
    let items = JSON.parse(localStorage.getItem("elossence_wishlist")) || [];
    let updated = false;

    // Auto-repair any stored items whose image paths were missing folder prefixes
    items = items.map(item => {
      if (!item || !item.image) return item;
      const fixed = resolveWishlistImagePath(item.image, item.category, item.name);
      if (fixed !== item.image) {
        item.image = fixed;
        updated = true;
      }
      return item;
    });

    if (updated) {
      localStorage.setItem("elossence_wishlist", JSON.stringify(items));
    }
    return items;
  } catch (e) {
    return [];
  }
}

function saveWishlist(items) {
  try {
    localStorage.setItem("elossence_wishlist", JSON.stringify(items));
  } catch (e) {
    console.warn("Storage error on wishlist:", e);
  }
}

function updateWishlistCount() {
  const count = getWishlist().length;
  document.querySelectorAll(".wishlist-count").forEach(element => {
    element.textContent = count;
  });
}

function toggleWishlist(button, id, name, image, category) {
  const items = getWishlist();
  const normalizedPath = window.location.pathname.replace(/\\/g, '/');
  const uniqueId = id || (normalizedPath + "|" + name);

  const existingIndex = items.findIndex(item => item.id === uniqueId || (item.name === name && item.category === category));

  if (existingIndex !== -1) {
    items.splice(existingIndex, 1);
    if (button) {
      button.classList.remove("active");
      button.classList.remove("is-saved");
      button.textContent = "♡";
    }
    showToast(`Removed "${name}" from wishlist.`, "♡");
  } else {
    const normalizedImage = resolveWishlistImagePath(image, category);

    items.push({
      id: uniqueId,
      name: name,
      image: normalizedImage,
      category: category
    });

    if (button) {
      button.classList.add("active");
      button.classList.add("is-saved");
      button.textContent = "♥";
    }
    showToast(`Added "${name}" to wishlist.`, "♥");
  }

  saveWishlist(items);
  updateWishlistCount();
  syncWishlistButtons();
  renderWishlist();
}

function syncWishlistButtons() {
  const items = getWishlist();

  document.querySelectorAll(".wishlist-btn").forEach(button => {
    const onclickAttr = button.getAttribute("onclick");
    if (!onclickAttr) return;

    const match = onclickAttr.match(/toggleWishlist\([^,]+,\s*'([^']+)'(?:,\s*'([^']+)')?/);
    if (!match) return;

    const targetId = match[1];
    const targetName = match[2];

    const isSaved = items.some(item => item.id === targetId || (targetName && item.name === targetName));

    button.classList.toggle("active", isSaved);
    button.classList.toggle("is-saved", isSaved);
    button.textContent = isSaved ? "♥" : "♡";
  });
}

function renderWishlist() {
  const container = document.getElementById("wishlist-items");
  if (!container) return;

  const items = getWishlist();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-wishlist" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <h2 style="font-size: 2.5rem; color: var(--rose); margin-bottom: 10px;">Your wishlist is empty ♡</h2>
        <p style="color: var(--plum-soft); margin-bottom: 24px; font-size: 1.05rem;">Explore curated looks and tap the heart on any outfit to save your favorites.</p>
        <div>
          <a href="men/men.html" style="color: var(--plum); border-bottom: 1px solid var(--rose); padding-bottom: 4px; margin-right: 20px; font-weight: 500;">Explore Men's Edit &rarr;</a>
          <a href="women/index.html" style="color: var(--plum); border-bottom: 1px solid var(--rose); padding-bottom: 4px; font-weight: 500;">Explore Women's Edit &rarr;</a>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const resolvedImg = resolveWishlistImagePath(item.image, item.category, item.name);
    let catText = item.category || "Women";
    if (!catText.toUpperCase().includes("COLLECTION")) {
      catText = catText + " Collection";
    }

    return `
      <div class="wishlist-card">
        <img src="${resolvedImg}" alt="${item.name}" onerror="handleWishlistImgError(this, '${item.image}', '${item.category}')">
        <div class="wishlist-info">
          <h3>${item.name}</h3>
          <p>${catText}</p>
          <button class="remove-wishlist" onclick="removeFromWishlist('${item.id}')">
            Remove ♡
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function removeFromWishlist(id) {
  const items = getWishlist().filter(item => item.id !== id);
  saveWishlist(items);
  updateWishlistCount();
  renderWishlist();
  syncWishlistButtons();
  showToast("Item removed from wishlist.", "♡");
}

/* =====================================================
   8. RECENTLY VIEWED ENGINE (LOCALSTORAGE)
===================================================== */
const RECENT_KEY = "elossence_recently_viewed";

/**
 * Returns recently viewed items. If storage is initially empty,
 * seeds four elegant curated starter items so that outfits/files are ALWAYS visible!
 */
function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) {
      const defaultRecent = [
        {
          id: "trend-noir",
          name: "Noir Structured Blazer",
          category: "Women · Formal",
          image: "images/noirWomen.jpeg",
          url: "women/formal.html",
          timestamp: Date.now() - 3000
        },
        {
          id: "men-casual",
          name: "Men's Casual Minimalist Ensemble",
          category: "Men · Casual",
          image: "men/images/casual fr.jpg",
          url: "men/casual.html",
          timestamp: Date.now() - 2000
        },
        {
          id: "trend-organza",
          name: "Organza Silk Wrap",
          category: "Women · Traditional",
          image: "images/ivoryWomen.jpeg",
          url: "women/traditional.html",
          timestamp: Date.now() - 1000
        },
        {
          id: "trend-overcoat",
          name: "Cashmere Monochrome Overcoat",
          category: "Men · Formal",
          image: "images/cash,mereOvercoatMen.jpeg",
          url: "men/formal.html",
          timestamp: Date.now()
        }
      ];
      localStorage.setItem(RECENT_KEY, JSON.stringify(defaultRecent));
      return defaultRecent;
    }
    return JSON.parse(raw) || [];
  } catch (e) {
    return [];
  }
}

function saveRecentlyViewed(items) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Storage error on recently viewed:", e);
  }
}

/**
 * Normalizes relative URLs and image paths based on current subfolder
 */
function resolvePath(path) {
  if (!path || path.startsWith('http') || path.startsWith('data:')) return path;
  const normalizedPath = window.location.pathname.replace(/\\/g, '/');
  const isInSubfolder = normalizedPath.includes('/men/') || normalizedPath.includes('/women/');
  if (isInSubfolder) {
    return '../' + path.replace(/^\.\//, '');
  }
  return path.replace(/^\.\//, '');
}

/**
 * Record a look into Recently Viewed (max 8 items, latest first)
 */
function addRecentlyViewed(item) {
  if (!item || !item.name) return;

  const items = getRecentlyViewed();
  const filtered = items.filter(i => i.id !== item.id && i.name !== item.name);

  filtered.unshift({
    id: item.id || 'recent-' + Date.now(),
    name: item.name,
    category: item.category || 'Curated Look',
    image: item.image,
    url: item.url || '#',
    timestamp: Date.now()
  });

  const capped = filtered.slice(0, 8);
  saveRecentlyViewed(capped);
  renderRecentlyViewed();
}

/**
 * Clears Recently Viewed history
 */
function clearRecentlyViewed() {
  localStorage.setItem(RECENT_KEY, JSON.stringify([]));
  renderRecentlyViewed();
  showToast('Recently viewed history cleared.', '✦');
}

/**
 * Auto-detects outfit style page view (e.g. casual.html, formal.html, etc.)
 */
function initRecentlyViewedAutoTrack() {
  const normalizedPath = window.location.pathname.replace(/\\/g, '/');
  const isMenSubfolder = normalizedPath.includes('/men/');
  const isWomenSubfolder = normalizedPath.includes('/women/');

  if (!isMenSubfolder && !isWomenSubfolder) return;

  if (normalizedPath.endsWith('men.html') || normalizedPath.endsWith('index.html')) return;

  const pageFilename = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
  const heroH1 = document.querySelector('.hero-text h1') || document.querySelector('h1');
  const heroImg = document.querySelector('.hero-img img') || document.querySelector('.hero-split img');

  if (heroH1 && heroImg) {
    const styleName = heroH1.textContent.trim();
    const gender = isMenSubfolder ? 'Men' : 'Women';
    const folder = isMenSubfolder ? 'men' : 'women';
    const relativeImg = heroImg.getAttribute('src');

    addRecentlyViewed({
      id: `${gender.toLowerCase()}-${styleName.toLowerCase()}`,
      name: `${gender}'s ${styleName} Ensemble`,
      category: `${gender} · ${styleName}`,
      image: `${folder}/${relativeImg.replace(/^\.\//, '')}`,
      url: `${folder}/${pageFilename}`
    });
  }
}

/**
 * Enables clicking on outfit cards to track them into Recently Viewed
 */
function initOutfitCardTracking() {
  document.querySelectorAll('.card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.wishlist-btn')) return;

      const img = card.querySelector('img');
      const cap = card.querySelector('.card-cap') || card.querySelector('h3') || card.querySelector('h4');
      const name = cap ? cap.textContent.trim() : (img ? img.alt : 'Curated Look');
      const imgSrc = img ? img.getAttribute('src') : '';

      const normalizedPath = window.location.pathname.replace(/\\/g, '/');
      const isMen = normalizedPath.includes('/men/');
      const isWomen = normalizedPath.includes('/women/');
      const folder = isMen ? 'men' : (isWomen ? 'women' : '');
      const gender = isMen ? 'Men' : (isWomen ? 'Women' : 'Editorial');

      let resolvedImg = imgSrc;
      if (folder && !imgSrc.startsWith('http') && !imgSrc.startsWith(folder + '/')) {
        resolvedImg = folder + '/' + imgSrc.replace(/^\.\//, '');
      }

      const pageFilename = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
      const pageUrl = folder ? `${folder}/${pageFilename}` : pageFilename;

      addRecentlyViewed({
        id: 'card-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20),
        name: name,
        category: `${gender} · Look`,
        image: resolvedImg,
        url: pageUrl
      });
      showToast(`Added "${name}" to Recently Viewed.`, '✦');
    });
  });
}

/**
 * Helper to track when a user clicks on a Trending or Featured item
 */
function trackTrendingClick(id, name, category, image, url) {
  addRecentlyViewed({
    id: id,
    name: name,
    category: category,
    image: image,
    url: url
  });

  if (url && url !== '#') {
    const normalizedPath = window.location.pathname.replace(/\\/g, '/');
    const isInSubfolder = normalizedPath.includes('/men/') || normalizedPath.includes('/women/');
    const dest = isInSubfolder ? '../' + url : url;
    window.location.href = dest;
  }
}

/**
 * Renders Recently Viewed section on any page having #recently-viewed-container
 */
function renderRecentlyViewed() {
  const container = document.getElementById("recently-viewed-container");
  if (!container) return;

  const items = getRecentlyViewed();
  const wishlist = getWishlist();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="recently-viewed-empty">
        <p>No recently viewed outfits yet. Explore our curated collections to build your browsing history.</p>
        <div class="recently-viewed-empty-links">
          <a href="${resolvePath('men/men.html')}">Explore Men's Edit &rarr;</a>
          <a href="${resolvePath('women/index.html')}">Explore Women's Edit &rarr;</a>
        </div>
      </div>
    `;
    const clearBtn = document.getElementById("btnClearRecent");
    if (clearBtn) clearBtn.style.display = "none";
    return;
  }

  const clearBtn = document.getElementById("btnClearRecent");
  if (clearBtn) clearBtn.style.display = "inline-block";

  container.innerHTML = `
    <div class="recently-grid">
      ${items.map(item => {
        const isSaved = wishlist.some(w => w.name === item.name || w.id === item.id);
        const resolvedImg = resolvePath(item.image);
        const resolvedUrl = resolvePath(item.url);

        return `
          <div class="recent-card">
            <div class="recent-img-wrap">
              <a href="${resolvedUrl}">
                <img src="${resolvedImg}" alt="${item.name}" loading="lazy">
              </a>
              <button class="wishlist-btn ${isSaved ? 'active is-saved' : ''}" 
                onclick="event.stopPropagation(); toggleWishlist(this, '${item.id}', '${item.name}', '${item.image}', '${item.category}')"
                title="Save to Wishlist">
                ${isSaved ? '♥' : '♡'}
              </button>
            </div>
            <div class="recent-info">
              <span class="recent-tag">${item.category}</span>
              <h4 class="serif"><a href="${resolvedUrl}">${item.name}</a></h4>
              <a href="${resolvedUrl}" class="recent-link">View Look &rarr;</a>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
