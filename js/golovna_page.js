//Масштаб для ноутбуків (ширина 1181–1439px)
const DESIGN_WIDTH = 1440;
const SCALE_MIN = 1181;
const root = document.documentElement;

function applyScale() {
  const w = root.clientWidth;
  if (w >= SCALE_MIN && w < DESIGN_WIDTH) {
    root.style.setProperty("--ds", (w / DESIGN_WIDTH).toFixed(5));
    root.classList.add("is-scaled");
  } else {
    root.style.removeProperty("--ds");
    root.classList.remove("is-scaled");
  }
}

applyScale();
window.addEventListener("resize", applyScale);
window.addEventListener("load", applyScale);

document.addEventListener("DOMContentLoaded", () => {
  applyScale();

  // Бургер-меню (телефон і планшет)
  const burgerBtn = document.getElementById("burgerBtn");
  const mainNav = document.getElementById("mainNav");

  if (burgerBtn && mainNav) {
    burgerBtn.setAttribute("aria-controls", "mainNav");

    const closeMenu = () => {
      mainNav.classList.remove("open");
      burgerBtn.setAttribute("aria-expanded", "false");
    };

    burgerBtn.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      burgerBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // закриваємо меню: клік по пункту, клік поза меню, клавіша Esc
    mainNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("click", (e) => {
      if (!mainNav.contains(e.target) && !burgerBtn.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
    // великий екран — меню завжди закрите
    window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => {
      if (e.matches) closeMenu();
    });
  }

  //FAQ
  const faqItems = document.querySelectorAll(".faq-item");
  const noHover = window.matchMedia("(hover: none)");

  faqItems.forEach((item) => {
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    const toggleFaq = () => {
      const wasOpen = item.classList.contains("open");
      faqItems.forEach((el) => {
        el.classList.remove("open");
        el.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        item.setAttribute("aria-expanded", "true");
      }
    };

    item.addEventListener("click", () => {
      if (noHover.matches) toggleFaq();
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFaq();
      }
    });
  });

  //Таймер зворотного відліку (15 хвилин)
  let remainingSeconds = 15 * 60;
  const minEl = document.getElementById("timerMinutes");
  const secEl = document.getElementById("timerSeconds");

  function tickTimer() {
    if (!minEl || !secEl) return;
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    minEl.textContent = String(m).padStart(2, "0");
    secEl.textContent = String(s).padStart(2, "0");
    if (remainingSeconds > 0) {
      remainingSeconds--;
    }
  }
  tickTimer();
  setInterval(tickTimer, 1000);

  //Слайдери (фото «Про нас», «Комфорт», відгуки)
  //Слайдер вмикається сам, коли картки не вміщуються (клас .is-scrollable)
  document.querySelectorAll("[data-carousel]").forEach(initCarousel);

  function initCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    const prev = carousel.querySelector(".carousel-btn--prev");
    const next = carousel.querySelector(".carousel-btn--next");
    const dotsBox = carousel.querySelector(".carousel-dots");
    if (!track) return;

    let dots = [];
    let raf = 0;

    track.setAttribute("role", "region");
    track.setAttribute("aria-label", carousel.getAttribute("data-carousel-label") || "Слайдер");
    track.tabIndex = 0;

    // слайди = діти стрічки (display:contents «розгортаємо»)
    function getSlides() {
      const list = [];
      (function collect(parent) {
        Array.from(parent.children).forEach((el) => {
          if (getComputedStyle(el).display === "contents") collect(el);
          else if (el.offsetWidth > 0) list.push(el);
        });
      })(track);
      return list;
    }

    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const isScrollable = () => track.clientWidth > 0 && maxScroll() > 6;

    // крок = відстань між початками сусідніх карток
    function pitch() {
      const list = getSlides();
      return list.length > 1 ? list[1].offsetLeft - list[0].offsetLeft : track.clientWidth;
    }
    const pages = () => Math.max(1, Math.round(maxScroll() / pitch()) + 1);

    function pageIndex() {
      if (track.scrollLeft >= maxScroll() - 2) return pages() - 1;
      return Math.min(pages() - 1, Math.round(track.scrollLeft / pitch()));
    }

    function toPage(i) {
      const left = Math.min(maxScroll(), Math.max(0, i * pitch()));
      track.scrollTo({ left: left, behavior: "smooth" });
    }

    // стрілки по колу: з останньої картки — на першу і навпаки
    function step(dir) {
      let i = pageIndex() + dir;
      if (i >= pages()) i = 0;
      if (i < 0) i = pages() - 1;
      toPage(i);
    }

    function buildDots() {
      if (!dotsBox) return;
      const n = pages();
      if (dots.length === n) return;
      dotsBox.innerHTML = "";
      dots = [];
      for (let i = 0; i < n; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "carousel-dot";
        b.setAttribute("aria-label", "Слайд " + (i + 1) + " з " + n);
        b.addEventListener("click", () => toPage(i));
        dotsBox.appendChild(b);
        dots.push(b);
      }
    }

    function update() {
      const scrollable = isScrollable();
      carousel.classList.toggle("is-scrollable", scrollable);
      if (!scrollable) return;
      buildDots();
      const idx = pageIndex();
      dots.forEach((d, k) => {
        if (k === idx) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    }

    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    if (prev) prev.addEventListener("click", () => step(-1));
    if (next) next.addEventListener("click", () => step(1));

    track.addEventListener("scroll", schedule, { passive: true });
    track.addEventListener("keydown", (e) => {
      if (!isScrollable()) return;
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });

    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(track);

    schedule();
  }

  //Модальне вікно + валідація форми
  const modal = document.getElementById("contactModal");
  const modalTitle = document.getElementById("modalTitle");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const openModalBtns = document.querySelectorAll(".open-modal-btn");
  const leadForm = document.getElementById("leadForm");
  const formSuccess = document.getElementById("formSuccess");

  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modalTitle.textContent = btn.getAttribute("data-subject") || "Залишити заявку";
      formSuccess.textContent = "";
      modal.classList.add("open");
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => modal.classList.remove("open"));
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  }

  if (leadForm) {
    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("leadName");
      const phoneInput = document.getElementById("leadPhone");
      const nameError = document.getElementById("nameError");
      const phoneError = document.getElementById("phoneError");

      let valid = true;
      nameError.textContent = "";
      phoneError.textContent = "";

      if (nameInput.value.trim().length < 2) {
        nameError.textContent = "Введіть ім'я (мінімум 2 літери)";
        valid = false;
      }

      if (phoneInput.value.replace(/\D/g, "").length < 10) {
        phoneError.textContent = "Введіть коректний номер телефону";
        valid = false;
      }

      if (valid) {
        formSuccess.textContent = "Дякуємо! Заявку успішно надіслано.";
        leadForm.reset();
        setTimeout(() => modal.classList.remove("open"), 2000);
      }
    });
  }
});
