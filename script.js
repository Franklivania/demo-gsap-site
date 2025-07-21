gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Draggable);

// --- HERO TEXT ANIMATION ---
const heroText = document.querySelectorAll(
  "#hero-text, .hero-text, [data-hero-text]"
);

if (heroText && heroText.length) {
  const split = new SplitText(heroText, { type: "chars,words" });
  gsap.from(split.chars, {
    scrollTrigger: {
      trigger: heroText,
      start: "top 80%",
      toggleActions: "play none none none",
    },
    opacity: 1,
    yPercent: 200,
    stagger: 0.07,
    duration: 0.8,
    ease: "power3.out",
  });
}

// --- REVEAL TEXT ANIMATION ---
const revealText = document.querySelectorAll(".text-container .reveal-text");

if (revealText.length) {
  revealText.forEach((text) => {
    const split = new SplitText(text, { type: "words" });
    gsap.from(split.words, {
      scrollTrigger: {
        trigger: text,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      opacity: 1,
      yPercent: 200,
      duration: 1,
      stagger: 0.02,
      ease: "power2.out",
    });
  });
}

// --- BRIGHT TEXT SCROLL HIGHLIGHT ---
const brightTextPara = document.querySelector('.bright-text');
if (brightTextPara) {
  const split = new SplitText(brightTextPara, { type: 'words' });
  split.words.forEach(word => word.classList.add('highlight-fade'));

  gsap.to(split.words, {
    scrollTrigger: {
      trigger: brightTextPara,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: true,
    },
    color: 'var(--color-white)',
    stagger: {
      each: 0.07,
      amount: 0.7
    },
    ease: 'power2.out',
    onUpdate: function() {
      split.words.forEach(word => {
        if (window.getComputedStyle(word).color === 'rgb(242, 242, 242)') {
          word.classList.remove('highlight-fade');
        }
      });
    }
  });
}

// --- TRAIL EFFECT (MOUSE & TOUCH) ---
const content = [
  "./assets/images/one.svg",
  "./assets/images/two.svg",
  "./assets/images/three.svg",
  "./assets/images/four.svg",
  "./assets/images/five.svg",
  "./assets/images/six.svg",
  "./assets/images/seven.svg",
  "./assets/images/eight.svg"
];

const container = document.body;

let currentImageIndex = 0;
let lastX = null;
let lastY = null;
let distanceThreshold = window.innerWidth < 900 ? 100 : 180;

window.addEventListener("resize", () => {
  distanceThreshold = window.innerWidth < 900 ? 100 : 180;
});

function createTrail(x, y) {
  const trail = document.createElement("img");
  trail.classList.add("display-trail");
  trail.src = content[currentImageIndex];
  container.appendChild(trail);

  currentImageIndex = (currentImageIndex + 1) % content.length;

  gsap.set(trail, {
    x: x,
    y: y,
    scale: 0,
    opacity: 0,
    rotation: gsap.utils.random(-20, 20),
    pointerEvents: "none"
  });

  gsap.to(trail, {
    scale: 1,
    opacity: 1,
    duration: 0.4,
    ease: "power2.out",
  });

  gsap.to(trail, {
    scale: 0.2,
    opacity: 0,
    duration: 1,
    delay: 0.3,
    ease: "power2.in",
    onComplete: () => {
      trail.remove();
    }
  });
}

// --- Mouse trail ---
window.addEventListener("mousemove", (e) => {
  if (lastX === null || lastY === null) {
    lastX = e.clientX;
    lastY = e.clientY;
    createTrail(e.clientX, e.clientY);
    return;
  }
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > distanceThreshold) {
    createTrail(e.clientX, e.clientY);
    lastX = e.clientX;
    lastY = e.clientY;
  }
});

// --- Touch trail for mobile ---
window.addEventListener("touchmove", (e) => {
  if (!e.touches || e.touches.length === 0) return;
  const touch = e.touches[0];
  if (lastX === null || lastY === null) {
    lastX = touch.clientX;
    lastY = touch.clientY;
    createTrail(touch.clientX, touch.clientY);
    return;
  }
  const dx = touch.clientX - lastX;
  const dy = touch.clientY - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > distanceThreshold) {
    createTrail(touch.clientX, touch.clientY);
    lastX = touch.clientX;
    lastY = touch.clientY;
  }
}, { passive: true });

window.addEventListener("touchend", () => {
  lastX = null;
  lastY = null;
});

// --- CARD STACK LOGIC ---

const time_content = [
  {
    title: "🌞 Summer",
    desc: "Long, sun-drenched days. The air is thick with the scent of blooming flowers and sunscreen. Laughter echoes from beaches, picnics, and late-night walks. In tropical places, the monsoon brings warm rains, lush green, and the thrill of thunder.",
    question: "Did you ever feel truly free during summer?"
  },
  {
    title: "🍂 Autumn",
    desc: "Leaves turn gold and crimson, crunching underfoot. The air grows crisp, inviting sweaters and warm drinks. Harvest festivals and cozy evenings remind us to savor change. In some regions, this is the time of harvest and gratitude.",
    question: "Have you ever welcomed a big change in autumn?"
  },
  {
    title: "❄️ Winter",
    desc: "Frosty mornings, breath visible in the air. Snow blankets the world in silence, or rain patters on windows in milder climates. Fires crackle, stories are shared, and hearts draw closer. In tropical zones, the dry season brings clear skies and cool breezes.",
    question: "Do you find comfort in winter's quiet moments?"
  },
  {
    title: "🌱 Spring",
    desc: "The world awakens—buds burst, birds sing, and hope returns. Days grow longer, and everything feels possible. In tropical places, the rains return, painting the earth in vibrant green and filling rivers anew.",
    question: "Have you ever started something new in spring?"
  },
  {
    title: "💧 Rainy / Dry Season",
    desc: "In tropical lands, the year is marked by the rhythm of rain and sun. The rainy season brings life and renewal; the dry season, rest and reflection. Each has its own beauty and challenges.",
    question: "Do you appreciate the changes each season brings?"
  }
];

const cardsContainer = document.getElementById("cards-container");
const addBtn = document.getElementById("add");
const removeBtn = document.getElementById("remove");

// Create a wrapper for the card
let cardWrapper = document.createElement("div");
cardWrapper.id = "card-stack";
cardWrapper.style.position = "relative";
cardWrapper.style.width = "100%";
cardWrapper.style.height = "18em";
const buttonsDiv = document.getElementById("buttons");
cardsContainer.insertBefore(cardWrapper, buttonsDiv);

let cardQueue = [...time_content];

function createCard(cardData) {
  const card = document.createElement("div");
  card.className = "season-card";
  card.innerHTML = `
    <h2>${cardData.title}</h2>
    <p>${cardData.desc}</p>
    <h4>${cardData.question}</h4>
  `;
  return card;
}

function renderCardStack() {
  cardWrapper.innerHTML = "";
  const maxStack = Math.min(3, cardQueue.length);
  for (let i = 0; i < maxStack; i++) {
    const card = createCard(cardQueue[i]);
    card.classList.add("season-card");
    card.style.zIndex = 10 - i;
    if (i === 0) {
      card.style.pointerEvents = "auto";
      card.style.transform = "translateX(-50%) scale(1)";
      card.style.opacity = "1";
    } else {
      const offset = 20 * i
      const scale = 1 - 0.08 * i;
      const opacity = 1 - 0.25 * i;
      card.style.pointerEvents = "none";
      card.style.transform = `translateX(calc(-50% + ${offset}px)) scale(${scale})`;
      card.style.opacity = `${opacity}`;
    }
    cardWrapper.appendChild(card);
    if (i === 0) setupDraggable(card);
  }
}

function animateButtonGlow(btn, color) {
  gsap.to(btn, {
    boxShadow: `0 0 24px 6px ${color}`,
    duration: 0.2,
  });
}
function resetButtonGlow(btn) {
  gsap.to(btn, {
    boxShadow: "3px 3px 0 var(--color-blue-dark)",
    duration: 0.2,
  });
}
function animateButtonCheck(btn) {
  gsap.to(btn, {
    background: "var(--color-green)",
    duration: 0.15,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      gsap.to(btn, { background: "var(--color-orange)", duration: 0.2 });
    },
  });
}
function animateButtonShake(btn) {
  gsap.fromTo(
    btn,
    { x: 0 },
    {
      x: 0,
      keyframes: [
        { x: -10, duration: 0.07 },
        { x: 10, duration: 0.07 },
        { x: -6, duration: 0.07 },
        { x: 6, duration: 0.07 },
        { x: 0, duration: 0.07 },
      ],
      onComplete: () => {
        gsap.to(btn, { x: 0, duration: 0.1 });
      },
    }
  );
}

// --- DRAGGABLE LOGIC, OPTIMIZED FOR MOBILE ---
function setupDraggable(card) {
  let dragDir = null;
  let dragThreshold = window.innerWidth < 600 ? 40 : 80; // Lower threshold for mobile
  let isDragging = false;

  // Remove any previous Draggable instance on this card
  if (card._draggableInstance && typeof card._draggableInstance.kill === "function") {
    card._draggableInstance.kill();
  }

  // Use touch-action CSS for better mobile drag
  card.style.touchAction = "pan-y";

  // Create Draggable
  card._draggableInstance = Draggable.create(card, {
    type: "x",
    edgeResistance: 0.65,
    bounds: cardWrapper,
    inertia: true,
    allowNativeTouchScrolling: false,
    minimumMovement: 6,
    onPress: function () {
      isDragging = false;
    },
    onDragStart: function () {
      isDragging = true;
    },
    onDrag: function () {
      if (this.x > 0) {
        dragDir = "right";
        animateButtonGlow(addBtn, "var(--color-green)");
        resetButtonGlow(removeBtn);
      } else if (this.x < 0) {
        dragDir = "left";
        animateButtonGlow(removeBtn, "var(--color-orange)");
        resetButtonGlow(addBtn);
      } else {
        dragDir = null;
        resetButtonGlow(addBtn);
        resetButtonGlow(removeBtn);
      }
    },
    onRelease: function () {
      card._lastDir = dragDir;
      // Use a lower threshold for mobile screens
      dragThreshold = window.innerWidth < 600 ? 40 : 80;
      if (dragDir === "right" && this.x > dragThreshold) {
        animateButtonCheck(addBtn);
        moveCardToBack("right");
      } else if (dragDir === "left" && this.x < -dragThreshold) {
        animateButtonShake(removeBtn);
        moveCardToBack("left");
      } else {
        gsap.to(card, {
          x: 0,
          opacity: 1,
          duration: 0.3,
          ease: "elastic.out(1, 0.5)",
        });
        resetButtonGlow(addBtn);
        resetButtonGlow(removeBtn);
      }
      isDragging = false;
    },
    onClick: function (e) {
      // Prevent accidental click on card after drag on mobile
      if (isDragging) {
        e.preventDefault();
        return false;
      }
    },
    cursor: "grab",
    activeCursor: "grabbing"
  })[0];
}

// --- MOVE CARD TO BACK ---
// Accepts direction: "right" or "left"
function moveCardToBack(direction) {
  const topCard = cardWrapper.querySelector('.season-card');
  if (!topCard) return;
  // If direction is not provided, fallback to last drag direction
  let dir = direction;
  if (!dir) {
    dir = topCard._lastDir || "right";
  }
  gsap.to(topCard, {
    x: dir === 'right' ? window.innerWidth : -window.innerWidth,
    opacity: 0,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () => {
      cardQueue.push(cardQueue.shift());
      renderCardStack();
      resetButtonGlow(addBtn);
      resetButtonGlow(removeBtn);
      const newTop = cardWrapper.querySelector('.season-card');
      if (newTop) {
        gsap.fromTo(newTop, { scale: 0.9, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
      }
    },
  });
}

// --- BUTTON CLICK LOGIC ---
addBtn.addEventListener("click", () => {
  const topCard = cardWrapper.querySelector('.season-card');
  if (!topCard) return;
  animateButtonCheck(addBtn);
  moveCardToBack("right");
});
removeBtn.addEventListener("click", () => {
  const topCard = cardWrapper.querySelector('.season-card');
  if (!topCard) return;
  animateButtonShake(removeBtn);
  moveCardToBack("left");
});

// --- INITIAL RENDER ---
renderCardStack();

// --- RESPONSIVE: Re-render card stack on resize for mobile drag threshold ---
window.addEventListener("resize", () => {
  renderCardStack();
});

// --- LOADER LOGIC ---
document.body.style.overflow = 'hidden'; // Prevent scroll during load

function allAssetsLoaded(callback) {
  // Wait for DOM, images, and video
  const images = Array.from(document.images);
  const videos = Array.from(document.querySelectorAll('video'));
  let loaded = 0;
  const total = images.length + videos.length;

  if (total === 0) {
    callback();
    return;
  }

  function check() {
    loaded++;
    if (loaded >= total) callback();
  }

  images.forEach(img => {
    if (img.complete) check();
    else img.addEventListener('load', check, { once: true });
    img.addEventListener('error', check, { once: true });
  });

  videos.forEach(video => {
    if (video.readyState >= 3) check();
    else video.addEventListener('loadeddata', check, { once: true });
    video.addEventListener('error', check, { once: true });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader-overlay');
  const bar = loader.querySelector('.loader-bar');
  const percent = loader.querySelector('.loader-percent');

  // Animate progress to 100
  let progress = { value: 0 };
  gsap.to(progress, {
    value: 100,
    duration: 2.2,
    ease: 'power1.inOut',
    onUpdate: () => {
      bar.style.width = `${progress.value}%`;
      percent.textContent = `${Math.round(progress.value)}%`;
    }
  });

  // Wait for all assets, then slide up loader
  allAssetsLoaded(() => {
    gsap.to(progress, {
      value: 100,
      duration: 0.5,
      onUpdate: () => {
        bar.style.width = `${progress.value}%`;
        percent.textContent = `${Math.round(progress.value)}%`;
      },
      onComplete: () => {
        gsap.to(loader, {
          y: '-100%',
          duration: 0.9,
          ease: 'power3.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
      }
    });
  });
});

