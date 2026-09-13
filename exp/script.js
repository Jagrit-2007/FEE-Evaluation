// Hamburger menu (same behavior as index.html's inline script)
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
});

// Outfit data shown when a look is opened
const OUTFITS = {
  "Baddie Aesthetic": [
    { img: "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=600&q=80", title: "Cropped Leather & Denim", desc: "Structured brown leather jacket, fitted tee, straight denim, dark shades." },
    { img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80", title: "Boot-Cut Statement", desc: "Chunky boots, wide-leg trousers, oversized blazer." },
    { img: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=600&q=80", title: "Monochrome Edge", desc: "All-brown layering with matte accessories." }
  ],
  "Streetwear": [
    { img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80", title: "Utility Layers", desc: "Oversized cargo jacket, relaxed joggers, clean sneakers." },
    { img: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=600&q=80", title: "Urban Neutral", desc: "Warm brown hoodie, straight denim, canvas crossbody." },
    { img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=80", title: "Street Tailoring", desc: "Boxy jacket, wide trousers, low-profile trainers." }
  ],
  "Summer Fits": [
    { img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", title: "Golden Hour Crop", desc: "Earth-tone crop top with relaxed linen cargos." },
    { img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80", title: "Sundown Set", desc: "Bronzed tones, lightweight slip, woven sandals." },
    { img: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=600&q=80", title: "Terracotta Ease", desc: "Breathable fabrics in warm rose and clay." }
  ],
  "Winter Fits": [
    { img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80", title: "Trench & Turtleneck", desc: "Heavy trench coat over a fitted turtleneck." },
    { img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80", title: "Faux Fur Luxe", desc: "Chocolate brown faux fur coat, tailored trousers." },
    { img: "https://images.unsplash.com/photo-1548624313-0396c75f66f6?auto=format&fit=crop&w=600&q=80", title: "Structured Layers", desc: "Sharp blazer, wool scarf, knee-high boots." }
  ],
  "Autumn Look": [
    { img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80", title: "Caramel Knit", desc: "Deep caramel knit sweater, mocha leather pants." },
    { img: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=600&q=80", title: "Vintage Rust", desc: "Rust-toned coat, layered accessories." },
    { img: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=600&q=80", title: "Harvest Layers", desc: "Warm layering built around mocha and rose tones." }
  ],
  "Top Picks": [
    { img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80", title: "High Contrast Bronze", desc: "Iconic silhouette in bronze and dark plum." },
    { img: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=600&q=80", title: "Signature Layering", desc: "Structured outerwear over soft neutrals." },
    { img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80", title: "Archive Staple", desc: "A timeless combination from the archive." }
  ]
};

function openLookbook(category) {
  const overlay = document.getElementById("pageOverlay");
  const title = document.getElementById("overlayTitle");
  const grid = document.getElementById("lookbookGrid");

  title.textContent = category;
  grid.innerHTML = "";

  (OUTFITS[category] || []).forEach((item) => {
    const card = document.createElement("div");
    card.className = "wf-outfit-card";
    card.innerHTML =
      '<img src="' + item.img + '" alt="' + item.title + '">' +
      '<div class="wf-outfit-info">' +
        '<h4 class="serif">' + item.title + '</h4>' +
        '<p>' + item.desc + '</p>' +
      '</div>';
    grid.appendChild(card);
  });

  overlay.classList.add("is-open");
}

function closeLookbook() {
  document.getElementById("pageOverlay").classList.remove("is-open");
}