gsap.registerPlugin(ScrollTrigger, SplitText, Draggable);

// --- CONSTANTS AND CONFIG ---
const ANIMATION_CONFIG = {
  hero: { stagger: 0.07, duration: 0.8, ease: "power3.out" },
  reveal: { stagger: 0.02, duration: 1, ease: "power2.out" },
  bright: { stagger: 0.07, amount: 0.7, ease: "power2.out" },
  trail: { duration: 0.4, fadeDuration: 1, delay: 0.3, ease: "power2" },
  card: { duration: 0.4, ease: "power2" },
  loader: { progressDuration: 2.2, slideDuration: 0.9, ease: "power3.inOut" }
};

const TRAIL_IMAGES = [
  "./assets/images/one.svg",
  "./assets/images/two.svg",
  "./assets/images/three.svg",
  "./assets/images/four.svg",
  "./assets/images/five.svg",
  "./assets/images/six.svg",
  "./assets/images/seven.svg",
  "./assets/images/eight.svg"
];

const TIME_CONTENT = [
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

// --- UTILITY FUNCTIONS ---
const getDistanceThreshold = () => window.innerWidth < 900 ? 100 : 180;
const getDragThreshold = () => window.innerWidth < 600 ? 40 : 80;

// --- LOADER LOGIC ---
function initLoader(callback) {
  const loader = document.getElementById('loader-overlay');
  if (!loader) return callback(); // Fallback if loader is missing
  const bar = loader.querySelector('.loader-bar');
  const percent = loader.querySelector('.loader-percent');
  document.body.style.overflow = 'hidden';

  // Hide content during loader
  const contentElements = document.querySelectorAll(
    '#hero-text, .hero-text, [data-hero-text], .text-container .reveal-text, .bright-text, #cards-container'
  );
  gsap.set(contentElements, { opacity: 0 });

  let progress = { value: 0 };
  gsap.to(progress, {
    value: 100,
    duration: ANIMATION_CONFIG.loader.progressDuration,
    ease: ANIMATION_CONFIG.loader.ease,
    onUpdate: () => {
      if (bar && percent) {
        bar.style.width = `${progress.value}%`;
        percent.textContent = `${Math.round(progress.value)}%`;
      }
    },
    onComplete: () => {
      gsap.to(loader, {
        y: '-100%',
        duration: ANIMATION_CONFIG.loader.slideDuration,
        ease: ANIMATION_CONFIG.loader.ease,
        onComplete: () => {
          loader.style.display = 'none';
          document.body.style.overflow = '';
          // Make content visible after loader slides up
          gsap.set(contentElements, { opacity: 1 });
          callback();
        }
      });
    }
  });

  const assets = [...document.images, ...document.querySelectorAll('video')];
  if (!assets.length) return;
  let loaded = 0;
  assets.forEach(asset => {
    if (asset.complete || asset.readyState >= 3) loaded++;
    else asset.addEventListener('load', () => loaded++, { once: true });
    asset.addEventListener('error', () => loaded++, { once: true });
  });
}

// --- TEXT ANIMATIONS ---
function initTextAnimations() {
  const heroText = document.querySelectorAll("#hero-text, .hero-text, [data-hero-text]");
  if (heroText.length) {
    heroText.forEach(text => {
      const split = new SplitText(text, { type: "chars,words" });
      gsap.from(split.chars, {
        scrollTrigger: {
          trigger: text,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        opacity: 0,
        yPercent: 200,
        stagger: ANIMATION_CONFIG.hero.stagger,
        duration: ANIMATION_CONFIG.hero.duration,
        ease: ANIMATION_CONFIG.hero.ease
      });
    });
  }

  const revealText = document.querySelectorAll(".text-container .reveal-text");
  if (revealText.length) {
    revealText.forEach(text => {
      const split = new SplitText(text, { type: "words" });
      gsap.from(split.words, {
        scrollTrigger: {
          trigger: text,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        opacity: 0,
        yPercent: 200,
        duration: ANIMATION_CONFIG.reveal.duration,
        stagger: ANIMATION_CONFIG.reveal.stagger,
        ease: ANIMATION_CONFIG.reveal.ease
      });
    });
  }

  const brightTextPara = document.querySelector('.bright-text');
  if (brightTextPara) {
    const split = new SplitText(brightTextPara, { type: 'words' });
    split.words.forEach(word => word.classList.add('highlight-fade'));
    gsap.to(split.words, {
      scrollTrigger: {
        trigger: brightTextPara,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true
      },
      color: 'var(--color-white)',
      stagger: {
        each: ANIMATION_CONFIG.bright.stagger,
        amount: ANIMATION_CONFIG.bright.amount
      },
      ease: ANIMATION_CONFIG.bright.ease,
      onUpdate: function() {
        split.words.forEach(word => {
          if (window.getComputedStyle(word).color === 'rgb(242, 242, 242)') {
            word.classList.remove('highlight-fade');
          }
        });
      }
    });
  }
}

// --- TRAIL EFFECT ---
function initTrailEffect() {
  let currentImageIndex = 0;
  let lastX = null, lastY = null;
  let distanceThreshold = getDistanceThreshold();

  window.addEventListener("resize", () => {
    distanceThreshold = getDistanceThreshold();
  }, { passive: true });

  function createTrail(x, y) {
    const trail = document.createElement("img");
    trail.classList.add("display-trail");
    trail.src = TRAIL_IMAGES[currentImageIndex];
    document.body.appendChild(trail);
    currentImageIndex = (currentImageIndex + 1) % TRAIL_IMAGES.length;

    gsap.set(trail, {
      x, y, scale: 0, opacity: 0,
      rotation: gsap.utils.random(-20, 20),
      pointerEvents: "none"
    });

    gsap.to(trail, {
      scale: 1,
      opacity: 1,
      duration: ANIMATION_CONFIG.trail.duration,
      ease: `${ANIMATION_CONFIG.trail.ease}.out`
    });

    gsap.to(trail, {
      scale: 0.2,
      opacity: 0,
      duration: ANIMATION_CONFIG.trail.fadeDuration,
      delay: ANIMATION_CONFIG.trail.delay,
      ease: `${ANIMATION_CONFIG.trail.ease}.in`,
      onComplete: () => trail.remove()
    });
  }

  function handleMove(clientX, clientY) {
    if (lastX === null || lastY === null) {
      lastX = clientX;
      lastY = clientY;
      createTrail(clientX, clientY);
      return;
    }
    const dx = clientX - lastX;
    const dy = clientY - lastY;
    if (Math.sqrt(dx * dx + dy * dy) > distanceThreshold) {
      createTrail(clientX, clientY);
      lastX = clientX;
      lastY = clientY;
    }
  }

  window.addEventListener("mousemove", e => handleMove(e.clientX, e.clientY));
  window.addEventListener("touchmove", e => {
    if (e.touches?.length) handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("touchend", () => {
    lastX = null;
    lastY = null;
  }, { passive: true });
}

// --- CARD STACK LOGIC ---
function initCardStack() {
  const cardsContainer = document.getElementById("cards-container");
  const addBtn = document.getElementById("add");
  const removeBtn = document.getElementById("remove");
  if (!cardsContainer || !addBtn || !removeBtn) return;

  const cardWrapper = document.createElement("div");
  cardWrapper.id = "card-stack";
  Object.assign(cardWrapper.style, {
    position: "relative",
    width: "100%",
    height: "18em"
  });
  cardsContainer.insertBefore(cardWrapper, document.getElementById("buttons"));

  let cardQueue = [...TIME_CONTENT];

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
      card.style.zIndex = 10 - i;
      card.style.transform = i === 0 
        ? "translateX(-50%) scale(1)"
        : `translateX(calc(-50% + ${20 * i}px)) scale(${1 - 0.08 * i})`;
      card.style.opacity = i === 0 ? 1 : 1 - 0.25 * i;
      card.style.pointerEvents = i === 0 ? "auto" : "none";
      cardWrapper.appendChild(card);
      if (i === 0) setupDraggable(card);
    }
  }

  function animateButtonGlow(btn, color) {
    gsap.to(btn, {
      boxShadow: `0 0 24px 6px ${color}`,
      duration: 0.2
    });
  }

  function resetButtonGlow(btn) {
    gsap.to(btn, {
      boxShadow: "3px 3px 0 var(--color-blue-dark)",
      duration: 0.2
    });
  }

  function animateButtonCheck(btn) {
    gsap.to(btn, {
      background: "var(--color-green)",
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      onComplete: () => gsap.to(btn, { background: "var(--color-orange)", duration: 0.2 })
    });
  }

  function animateButtonShake(btn) {
    gsap.fromTo(btn, { x: 0 }, {
      keyframes: [
        { x: -10, duration: 0.07 },
        { x: 10, duration: 0.07 },
        { x: -6, duration: 0.07 },
        { x: 6, duration: 0.07 },
        { x: 0, duration: 0.07 }
      ]
    });
  }

  function setupDraggable(card) {
    if (card._draggableInstance) card._draggableInstance.kill();
    card.style.touchAction = "pan-y";
    let dragDir = null;
    let isDragging = false;

    card._draggableInstance = Draggable.create(card, {
      type: "x",
      edgeResistance: 0.65,
      bounds: cardWrapper,
      inertia: true,
      allowNativeTouchScrolling: false,
      minimumMovement: 6,
      onPress: () => isDragging = false,
      onDragStart: () => isDragging = true,
      onDrag: function() {
        dragDir = this.x > 0 ? "right" : this.x < 0 ? "left" : null;
        if (dragDir === "right") {
          animateButtonGlow(addBtn, "var(--color-green)");
          resetButtonGlow(removeBtn);
        } else if (dragDir === "left") {
          animateButtonGlow(removeBtn, "var(--color-orange)");
          resetButtonGlow(addBtn);
        } else {
          resetButtonGlow(addBtn);
          resetButtonGlow(removeBtn);
        }
      },
      onRelease: function() {
        card._lastDir = dragDir;
        const threshold = getDragThreshold();
        if (dragDir === "right" && this.x > threshold) {
          animateButtonCheck(addBtn);
          moveCardToBack("right");
        } else if (dragDir === "left" && this.x < -threshold) {
          animateButtonShake(removeBtn);
          moveCardToBack("left");
        } else {
          gsap.to(card, {
            x: 0,
            opacity: 1,
            duration: 0.3,
            ease: "elastic.out(1, 0.5)"
          });
          resetButtonGlow(addBtn);
          resetButtonGlow(removeBtn);
        }
        isDragging = false;
      },
      onClick: e => {
        if (isDragging) {
          e.preventDefault();
          return false;
        }
      },
      cursor: "grab",
      activeCursor: "grabbing"
    })[0];
  }

  function moveCardToBack(direction) {
    const topCard = cardWrapper.querySelector('.season-card');
    if (!topCard) return;
    const dir = direction || topCard._lastDir || "right";
    gsap.to(topCard, {
      x: dir === 'right' ? window.innerWidth : -window.innerWidth,
      opacity: 0,
      duration: ANIMATION_CONFIG.card.duration,
      ease: `${ANIMATION_CONFIG.card.ease}.in`,
      onComplete: () => {
        cardQueue.push(cardQueue.shift());
        renderCardStack();
        resetButtonGlow(addBtn);
        resetButtonGlow(removeBtn);
        const newTop = cardWrapper.querySelector('.season-card');
        if (newTop) {
          gsap.fromTo(newTop, 
            { scale: 0.9, opacity: 0.7 }, 
            { scale: 1, opacity: 1, duration: ANIMATION_CONFIG.card.duration, ease: `${ANIMATION_CONFIG.card.ease}.out` }
          );
        }
      }
    });
  }

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

  window.addEventListener("resize", renderCardStack, { passive: true });
  renderCardStack();
}

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  initLoader(() => {
    initTextAnimations();
    initTrailEffect();
    initCardStack();
  });
});