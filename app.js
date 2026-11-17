(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // A compact menu keeps every section reachable on a phone.
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");
  if (menuToggle && siteNav) {
    const closeMenu = () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.querySelector(".menu-toggle__text").textContent = "Menu";
    };
    menuToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.querySelector(".menu-toggle__text").textContent = open ? "Close" : "Menu";
    });
    siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  // The mechanical switch changes the hero's copy, photo, light, and grid.
  const hero = document.querySelector(".hero");
  const modeSwitch = document.getElementById("modeSwitch");
  if (hero && modeSwitch) {
    modeSwitch.addEventListener("click", () => {
      const blueprint = hero.dataset.mode !== "blueprint";
      hero.dataset.mode = blueprint ? "blueprint" : "stage";
      modeSwitch.setAttribute("aria-checked", String(blueprint));
      modeSwitch.setAttribute(
        "aria-label",
        blueprint ? "Switch from blueprint mode to stage mode" : "Switch from stage mode to blueprint mode"
      );
    });
  }

  const heroVisual = document.getElementById("heroVisual");
  if (heroVisual && finePointer && !reduceMotion) {
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.setProperty("--px", `${(x * 13).toFixed(1)}px`);
      heroVisual.style.setProperty("--py", `${(y * 13).toFixed(1)}px`);
    }, { passive: true });
    heroVisual.addEventListener("pointerleave", () => {
      heroVisual.style.setProperty("--px", "0px");
      heroVisual.style.setProperty("--py", "0px");
    });
  }

  // Each filter is a real button; hidden cards leave the tab order.
  const filters = [...document.querySelectorAll("[data-filter]")];
  const roleCards = [...document.querySelectorAll(".role-card")];
  filters.forEach((filter) => filter.addEventListener("click", () => {
    const category = filter.dataset.filter;
    filters.forEach((item) => {
      const selected = item === filter;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    roleCards.forEach((card) => {
      card.hidden = category !== "all" && !card.dataset.category.split(" ").includes(category);
    });
  }));

  // Cue cards flip with click, Enter, or Space. The rail also scrolls by drag
  // on desktop and by the browser's native swipe gesture on touch screens.
  const cueRail = document.getElementById("cueRail");
  document.querySelectorAll(".cue-card").forEach((card) => {
    const button = card.querySelector(".cue-card__button");
    const front = card.querySelector(".cue-card__front");
    const back = card.querySelector(".cue-card__back");
    const frontLabel = button.getAttribute("aria-label");
    button.addEventListener("click", () => {
      const flipped = card.classList.toggle("is-flipped");
      button.setAttribute("aria-pressed", String(flipped));
      front.setAttribute("aria-hidden", String(flipped));
      back.setAttribute("aria-hidden", String(!flipped));
      button.setAttribute(
        "aria-label",
        flipped
          ? `${card.querySelector(".cue-card__back-title").textContent} ${card.querySelector(".cue-card__story").textContent} Flip back to the front.`
          : frontLabel
      );
    });
  });

  if (cueRail) {
    const getStep = () => {
      const card = cueRail.querySelector(".cue-card");
      return card ? card.getBoundingClientRect().width + 22 : 390;
    };
    const scrollRail = (direction) => cueRail.scrollBy({
      left: direction * getStep(),
      behavior: reduceMotion ? "auto" : "smooth"
    });
    document.getElementById("cuePrev")?.addEventListener("click", () => scrollRail(-1));
    document.getElementById("cueNext")?.addEventListener("click", () => scrollRail(1));

    let dragging = false;
    let moved = false;
    let blockClick = false;
    let startX = 0;
    let startScroll = 0;
    cueRail.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = cueRail.scrollLeft;
    });
    window.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) < 7 && !moved) return;
      moved = true;
      cueRail.scrollLeft = startScroll - distance;
      event.preventDefault();
    });
    window.addEventListener("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        blockClick = true;
        window.setTimeout(() => { blockClick = false; }, 90);
      }
    });
    cueRail.addEventListener("click", (event) => {
      if (!blockClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      blockClick = false;
    }, true);
  }

  // The crochet sunflower opens a short message and a momentary warm flash.
  const sunflower = document.getElementById("sunflowerButton");
  const message = document.getElementById("sunflowerMessage");
  const flash = document.querySelector(".sunflower-flash");
  let sunflowerTimer;
  if (sunflower && message && flash) {
    sunflower.addEventListener("click", () => {
      window.clearTimeout(sunflowerTimer);
      message.hidden = false;
      window.requestAnimationFrame(() => {
        message.classList.add("is-visible");
        flash.classList.add("is-active");
        sunflower.classList.add("is-active");
      });
      sunflowerTimer = window.setTimeout(() => {
        message.classList.remove("is-visible");
        flash.classList.remove("is-active");
        sunflower.classList.remove("is-active");
        window.setTimeout(() => { message.hidden = true; }, 400);
      }, 3400);
    });
  }

  // The cursor follows with a small lag, then becomes a label over actions.
  const cursor = document.querySelector(".spotlight-cursor");
  if (cursor && finePointer && !reduceMotion) {
    let currentX = -100, currentY = -100, pointerX = -100, pointerY = -100;
    let visible = false;
    let pill = false;
    const label = cursor.querySelector(".spotlight-cursor__label");
    document.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!visible) { visible = true; cursor.classList.add("is-visible"); }
      const action = event.target.closest("[data-cursor]");
      pill = Boolean(action);
      cursor.classList.toggle("is-pill", pill);
      cursor.classList.toggle("is-paper", Boolean(event.target.closest(".section-paper")));
      label.textContent = action?.dataset.cursor || "";
    }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
    const follow = () => {
      currentX += (pointerX - currentX) * 0.18;
      currentY += (pointerY - currentY) * 0.18;
      cursor.style.transform = `translate3d(${(currentX - (pill ? 58 : 22)).toFixed(1)}px,${(currentY - (pill ? 19 : 22)).toFixed(1)}px,0)`;
      window.requestAnimationFrame(follow);
    };
    window.requestAnimationFrame(follow);
  }

  // Motion is the framework-independent successor to Framer Motion. The
  // site remains usable if the CDN cannot load or motion is reduced.
  if (!reduceMotion) {
    const motionScript = document.createElement("script");
    motionScript.src = "https://cdn.jsdelivr.net/npm/motion@14.11.1/dist/motion.js";
    motionScript.async = true;
    motionScript.onload = () => {
      const Motion = window.Motion;
      if (!Motion?.animate || !Motion?.inView) return;
      [...document.querySelectorAll("[data-reveal]")].forEach((element, index) => {
        if (element.getBoundingClientRect().top < window.innerHeight - 20) return;
        element.style.opacity = "0";
        element.style.transform = "translateY(30px)";
        Motion.inView(element, (target) => {
          Motion.animate(target, { opacity: 1, transform: "translateY(0px)" }, {
            duration: .75,
            delay: (index % 3) * .08,
            ease: [.22, 1, .36, 1]
          });
        }, { amount: .12 });
      });
    };
    document.head.appendChild(motionScript);
  }

  // The headline numbers are readable before JavaScript and animate once.
  const stats = document.querySelector(".hero__stats");
  if (stats && !reduceMotion && "IntersectionObserver" in window) {
    let played = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || played) return;
      played = true;
      observer.disconnect();
      stats.querySelectorAll("strong").forEach((element) => {
        const end = Number(element.textContent);
        const start = performance.now();
        const frame = (now) => {
          const progress = Math.min((now - start) / 900, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = String(Math.round(end * eased)).padStart(2, "0");
          if (progress < 1) window.requestAnimationFrame(frame);
        };
        window.requestAnimationFrame(frame);
      });
    }, { threshold: .25 });
    observer.observe(stats);
  }
})();
