/* ============================================================
   NexGen SaaS Landing Page — script.js
   Vanilla JavaScript, no dependencies.
   Features:
     - Dark mode toggle with localStorage persistence
     - Responsive hamburger menu
     - Smooth scroll for nav links
     - Scroll-triggered animations (IntersectionObserver)
     - Navbar background on scroll
     - Button ripple effects
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. Dark Mode Toggle
     Reads from localStorage on load.
     Toggles 'dark' class on <html> on click.
  ---------------------------------------------------------- */
  const html = document.documentElement;
  const darkToggle       = document.getElementById("dark-toggle");
  const darkToggleMobile = document.getElementById("dark-toggle-mobile");

  // Mobile dark toggle icon elements
  const iconMoonM = document.getElementById("icon-moon-m");
  const iconSunM  = document.getElementById("icon-sun-m");

  function syncMobileIcons(isDark) {
    if (!iconMoonM || !iconSunM) return;
    iconMoonM.style.display = isDark ? "none"  : "block";
    iconSunM.style.display  = isDark ? "block" : "none";
  }

  // Apply saved preference immediately (before paint)
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    html.classList.add("dark");
    syncMobileIcons(true);
  }

  function toggleDark() {
    html.classList.toggle("dark");
    const isDark = html.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    syncMobileIcons(isDark);
  }

  if (darkToggle)       darkToggle.addEventListener("click", toggleDark);
  if (darkToggleMobile) darkToggleMobile.addEventListener("click", toggleDark);

  /* ----------------------------------------------------------
     2. Navbar — Scroll Background
     Adds 'scrolled' class when user scrolls past 20px.
  ---------------------------------------------------------- */
  const navbar = document.getElementById("navbar");

  function handleScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // run once on load

  /* ----------------------------------------------------------
     3. Hamburger Menu
     Toggles mobile nav open/closed.
     Closes when a link is clicked or backdrop is tapped.
  ---------------------------------------------------------- */
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const hamburgerWrap = document.getElementById("hamburger-wrap");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-links a, .btn-mobile-cta");

  function openMenu() {
    if (!mobileMenu || !hamburgerWrap) return;
    mobileMenu.classList.add("open");
    hamburgerWrap.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!mobileMenu || !hamburgerWrap) return;
    mobileMenu.classList.remove("open");
    hamburgerWrap.classList.remove("open");
    document.body.style.overflow = "";
  }

  function toggleMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.contains("open") ? closeMenu() : openMenu();
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", toggleMenu);
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ----------------------------------------------------------
     4. Smooth Scroll
     Intercepts clicks on same-page anchor links.
     Works for both desktop and mobile nav links.
  ---------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var target = e.target.closest("a[href^='#']");
    if (!target) return;

    var id = target.getAttribute("href").slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;

    e.preventDefault();

    var navHeight = navbar ? navbar.offsetHeight : 0;
    var offset = el.getBoundingClientRect().top + window.scrollY - navHeight - 12;

    window.scrollTo({ top: offset, behavior: "smooth" });
  });

  // Logo click → scroll to top
  var logo = document.getElementById("nav-logo");
  if (logo) {
    logo.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----------------------------------------------------------
     5. Scroll Animations (IntersectionObserver)
     Elements with class 'fade-up' or 'scale-in' animate
     when they enter the viewport.
  ---------------------------------------------------------- */
  var animationTargets = document.querySelectorAll(".fade-up, .scale-in");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    animationTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: just show everything
    animationTargets.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ----------------------------------------------------------
     6. Button Ripple Effect
     Adds a visual ripple when buttons are clicked.
  ---------------------------------------------------------- */
  function createRipple(e) {
    var btn = e.currentTarget;
    var circle = document.createElement("span");
    var diameter = Math.max(btn.clientWidth, btn.clientHeight);
    var radius = diameter / 2;
    var rect = btn.getBoundingClientRect();

    circle.style.cssText = [
      "position: absolute",
      "border-radius: 50%",
      "pointer-events: none",
      "width: " + diameter + "px",
      "height: " + diameter + "px",
      "left: " + (e.clientX - rect.left - radius) + "px",
      "top: " + (e.clientY - rect.top - radius) + "px",
      "background: rgba(255,255,255,0.25)",
      "transform: scale(0)",
      "animation: ripple-anim 0.55s linear",
    ].join(";");

    // Inject animation keyframe once
    if (!document.getElementById("ripple-style")) {
      var style = document.createElement("style");
      style.id = "ripple-style";
      style.textContent =
        "@keyframes ripple-anim { to { transform: scale(3); opacity: 0; } }";
      document.head.appendChild(style);
    }

    btn.style.overflow = "hidden";
    btn.style.position = "relative";
    btn.appendChild(circle);

    circle.addEventListener("animationend", function () {
      circle.remove();
    });
  }

  var rippleTargets = document.querySelectorAll(
    ".btn-primary, .btn-plan-primary, .btn-cta-main, .btn-mobile-cta"
  );

  rippleTargets.forEach(function (btn) {
    btn.addEventListener("click", createRipple);
  });

  /* ----------------------------------------------------------
     7. Current Year in Footer
  ---------------------------------------------------------- */
  var yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();
