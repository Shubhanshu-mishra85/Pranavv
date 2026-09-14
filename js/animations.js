/* =========================================================
   PRANAV — UI Animation Controller
   Scroll Reveal • Counters • Motion
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initializeRevealAnimations();
    initializeCounters();
    initializeParallax();
  });

  /* ---------- Scroll Reveal ---------- */

  function initializeRevealAnimations() {
    const elements = document.querySelectorAll(
      "[data-reveal], .reveal-on-scroll"
    );

    if (!elements.length) return;

    /*
     * If IntersectionObserver is unavailable,
     * reveal everything immediately.
     */
    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        revealElement(element);
      });

      return;
    }

    elements.forEach(function (element) {
      if (!element.classList.contains("reveal")) {
        element.classList.add("reveal-pending");
      }
    });

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          revealElement(entry.target);
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });

    /*
     * Safety fallback:
     * content becomes visible even if observer gets stuck.
     */
    window.setTimeout(function () {
      elements.forEach(function (element) {
        revealElement(element);
      });
    }, 4000);
  }

  function revealElement(element) {
    element.classList.remove("reveal-pending");

    if (!element.classList.contains("reveal")) {
      element.classList.add("reveal");
    }

    element.setAttribute("data-revealed", "true");
  }

  /* ---------- Number Counters ---------- */

  function initializeCounters() {
    const counters = document.querySelectorAll(
      "[data-counter]"
    );

    if (!counters.length) return;

    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (counter) {
        setCounterValue(counter);
      });

      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.5
      }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(element) {
    if (element.dataset.counterAnimated === "true") {
      return;
    }

    element.dataset.counterAnimated = "true";

    const target = Number(
      element.getAttribute("data-counter")
    );

    if (!Number.isFinite(target)) {
      return;
    }

    const duration = Number(
      element.getAttribute("data-counter-duration")
    ) || 1200;

    const decimals = Number(
      element.getAttribute("data-counter-decimals")
    ) || 0;

    const prefix =
      element.getAttribute("data-counter-prefix") || "";

    const suffix =
      element.getAttribute("data-counter-suffix") || "";

    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(
        elapsed / duration,
        1
      );

      /*
       * Ease-out curve for a smoother premium feel.
       */
      const eased =
        1 - Math.pow(1 - progress, 3);

      const value = target * eased;

      element.textContent =
        prefix +
        value.toFixed(decimals) +
        suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function setCounterValue(element) {
    const target = Number(
      element.getAttribute("data-counter")
    );

    if (!Number.isFinite(target)) return;

    const decimals = Number(
      element.getAttribute("data-counter-decimals")
    ) || 0;

    const prefix =
      element.getAttribute("data-counter-prefix") || "";

    const suffix =
      element.getAttribute("data-counter-suffix") || "";

    element.textContent =
      prefix +
      target.toFixed(decimals) +
      suffix;
  }

  /* ---------- Subtle Hero Parallax ---------- */

  function initializeParallax() {
    const elements = document.querySelectorAll(
      "[data-parallax]"
    );

    if (!elements.length) return;

    /*
     * Respect users who prefer reduced motion.
     */
    if (
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY || 0;

      elements.forEach(function (element) {
        const speed =
          Number(
            element.getAttribute("data-parallax")
          ) || 0.08;

        const rect =
          element.getBoundingClientRect();

        const viewportHeight =
          window.innerHeight;

        if (
          rect.bottom < 0 ||
          rect.top > viewportHeight
        ) {
          return;
        }

        const offset =
          (scrollY - element.offsetTop) *
          speed;

        element.style.transform =
          "translate3d(0," +
          offset +
          "px,0)";
      });

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(
            updateParallax
          );

          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Hover Motion ---------- */

  function initializeMagneticButtons() {
    const buttons = document.querySelectorAll(
      "[data-magnetic]"
    );

    if (!buttons.length) return;

    if (
      window.matchMedia &&
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
    ) {
      return;
    }

    buttons.forEach(function (button) {
      button.addEventListener(
        "mousemove",
        function (event) {
          const rect =
            button.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left -
            rect.width / 2;

          const y =
            event.clientY -
            rect.top -
            rect.height / 2;

          const strength =
            Number(
              button.getAttribute(
                "data-magnetic-strength"
              )
            ) || 0.12;

          button.style.transform =
            "translate(" +
            x * strength +
            "px," +
            y * strength +
            "px)";
        }
      );

      button.addEventListener(
        "mouseleave",
        function () {
          button.style.transform = "";
        }
      );
    });
  }

  initializeMagneticButtons();

  /* ---------- Ripple Effect ---------- */

  document.addEventListener(
    "click",
    function (event) {
      const button =
        event.target.closest(
          "[data-ripple]"
        );

      if (!button) return;

      const rect =
        button.getBoundingClientRect();

      const ripple =
        document.createElement("span");

      ripple.className =
        "pranav-ripple";

      const size =
        Math.max(
          rect.width,
          rect.height
        );

      ripple.style.width =
        size + "px";

      ripple.style.height =
        size + "px";

      ripple.style.left =
        event.clientX -
        rect.left -
        size / 2 +
        "px";

      ripple.style.top =
        event.clientY -
        rect.top -
        size / 2 +
        "px";

      if (
        getComputedStyle(button)
          .position === "static"
      ) {
        button.style.position =
          "relative";
      }

      button.style.overflow =
        "hidden";

      button.appendChild(ripple);

      window.setTimeout(function () {
        ripple.remove();
      }, 650);
    }
  );

  /* ---------- Ripple Styles ---------- */

  if (
    !document.getElementById(
      "pranav-ripple-style"
    )
  ) {
    const style =
      document.createElement("style");

    style.id =
      "pranav-ripple-style";

    style.textContent = `
      .pranav-ripple {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        background: rgba(255,255,255,.32);
        transform: scale(0);
        animation: pranavRipple .65s ease-out forwards;
      }

      @keyframes pranavRipple {
        to {
          transform: scale(2.4);
          opacity: 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .pranav-ripple {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ---------- Public API ---------- */

  window.PRANAVAnimations = {
    reveal: revealElement,
    animateCounter: animateCounter
  };

})();
