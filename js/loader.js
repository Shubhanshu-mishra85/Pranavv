/* =========================================================
   PRANAV — Blood Drop Loader
   Connecting People. Supporting Care.
   ========================================================= */

(function () {
  "use strict";

  var MAX_LOADER_TIME = 5000;
  var loaderStarted = Date.now();
  var loader = null;
  var finished = false;

  document.documentElement.classList.add("js");

  document.addEventListener("DOMContentLoaded", function () {
    loader = document.getElementById("page-loader");

    if (!loader) {
      revealPage();
      return;
    }

    setupLoader();

    window.setTimeout(function () {
      finishLoader();
    }, MAX_LOADER_TIME);
  });

  function setupLoader() {
    loader.setAttribute("aria-label", "Loading PRANAV");
    loader.setAttribute("role", "status");

    /*
     * Loader markup is generated only if the page does not
     * already contain its own loader animation.
     */
    if (!loader.querySelector(".pranav-loader-stage")) {
      loader.innerHTML =
        '<div class="pranav-loader-stage">' +
          '<div class="loader-drop" aria-hidden="true"></div>' +
          '<div class="loader-impact" aria-hidden="true"></div>' +
          '<div class="loader-ripple" aria-hidden="true"></div>' +
          '<div class="loader-splash" aria-hidden="true">' +
            '<span></span>' +
            '<span></span>' +
            '<span></span>' +
            '<span></span>' +
            '<span></span>' +
            '<span></span>' +
          '</div>' +
          '<div class="loader-brand">' +
            '<img src="assets/logo/pranav-logo.png" alt="PRANAV">' +
            '<div class="loader-wordmark">PRANAV</div>' +
            '<div class="loader-tagline">' +
              'Connecting People. Supporting Care.' +
            '</div>' +
            '<div class="loader-dots" aria-hidden="true">' +
              '<span></span>' +
              '<span></span>' +
              '<span></span>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    addLoaderStyles();

    requestAnimationFrame(function () {
      loader.classList.add("loader-active");
    });

    /*
     * Main reveal sequence:
     * drop → impact → splash → logo → wordmark → tagline
     */
    window.setTimeout(function () {
      if (loader) loader.classList.add("drop-impact");
    }, 850);

    window.setTimeout(function () {
      if (loader) loader.classList.add("show-splash");
    }, 1100);

    window.setTimeout(function () {
      if (loader) loader.classList.add("show-brand");
    }, 1550);

    window.setTimeout(function () {
      if (loader) loader.classList.add("show-tagline");
    }, 2050);

    window.setTimeout(function () {
      finishLoader();
    }, 3100);
  }

  function finishLoader() {
    if (finished) return;

    finished = true;

    if (!loader) {
      revealPage();
      return;
    }

    loader.classList.add("loader-exit");

    window.setTimeout(function () {
      loader.style.display = "none";
      revealPage();
    }, 550);
  }

  function revealPage() {
    document.body.classList.remove("loading");
    document.body.classList.add("page-ready");

    document.documentElement.classList.remove("loader-running");

    /*
     * Safety fallback:
     * Any content hidden by reveal classes becomes visible.
     */
    document
      .querySelectorAll(
        "[data-reveal], .reveal-pending"
      )
      .forEach(function (element) {
        element.classList.remove("reveal-pending");
        element.style.opacity = "";
        element.style.transform = "";
      });
  }

  function addLoaderStyles() {
    if (document.getElementById("pranav-loader-styles")) {
      return;
    }

    var style = document.createElement("style");

    style.id = "pranav-loader-styles";

    style.textContent = `
      #page-loader {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        overflow: hidden;
        background:
          radial-gradient(
            circle at 50% 35%,
            rgba(255,255,255,.95),
            rgba(229,250,243,.88) 42%,
            rgba(255,246,247,.94)
          );
        opacity: 1;
        visibility: visible;
        transition:
          opacity .5s ease,
          visibility .5s ease;
      }

      #page-loader.loader-exit {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .pranav-loader-stage {
        position: relative;
        width: min(100vw, 520px);
        height: min(100vh, 620px);
        display: grid;
        place-items: center;
      }

      .loader-drop {
        position: absolute;
        top: 9%;
        left: 50%;
        width: 46px;
        height: 61px;
        transform:
          translateX(-50%)
          rotate(45deg);
        transform-origin: center;
        border-radius:
          55% 55% 55% 8%;
        background:
          linear-gradient(
            145deg,
            #f05a70,
            #d92d45 55%,
            #a9142d
          );
        box-shadow:
          0 16px 35px rgba(189,32,56,.25);
        animation:
          pranavDropFall 1.25s
          cubic-bezier(.35,.05,.2,1)
          forwards;
      }

      .loader-drop::after {
        content: "";
        position: absolute;
        top: 10px;
        left: 10px;
        width: 10px;
        height: 16px;
        border-radius: 50%;
        background: rgba(255,255,255,.28);
        transform: rotate(-45deg);
      }

      @keyframes pranavDropFall {
        0% {
          opacity: 0;
          transform:
            translate(-50%, -90px)
            rotate(45deg)
            scale(.75);
        }

        15% {
          opacity: 1;
        }

        72% {
          transform:
            translate(-50%, 150px)
            rotate(45deg)
            scale(1);
        }

        86% {
          transform:
            translate(-50%, 185px)
            rotate(45deg)
            scale(1.04, .9);
        }

        100% {
          transform:
            translate(-50%, 205px)
            rotate(45deg)
            scale(.85, .58);
          opacity: .98;
        }
      }

      .loader-impact {
        position: absolute;
        top: 56%;
        left: 50%;
        width: 10px;
        height: 10px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: #d92d45;
        opacity: 0;
      }

      #page-loader.drop-impact .loader-impact {
        animation: impactFlash .55s ease-out forwards;
      }

      @keyframes impactFlash {
        0% {
          opacity: 0;
          transform:
            translate(-50%, -50%)
            scale(.3);
        }

        35% {
          opacity: 1;
          transform:
            translate(-50%, -50%)
            scale(1.8);
        }

        100% {
          opacity: 0;
          transform:
            translate(-50%, -50%)
            scale(2.4);
        }
      }

      .loader-ripple {
        position: absolute;
        top: 56%;
        left: 50%;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(217,45,69,.45);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(.2);
        opacity: 0;
      }

      #page-loader.drop-impact .loader-ripple {
        animation:
          rippleExpand .9s
          cubic-bezier(.2,.7,.2,1)
          .05s forwards;
      }

      @keyframes rippleExpand {
        0% {
          opacity: .8;
          transform:
            translate(-50%, -50%)
            scale(.2);
        }

        100% {
          opacity: 0;
          transform:
            translate(-50%, -50%)
            scale(15);
        }
      }

      .loader-splash {
        position: absolute;
        top: 56%;
        left: 50%;
        width: 8px;
        height: 8px;
        opacity: 0;
      }

      .loader-splash span {
        position: absolute;
        top: 0;
        left: 0;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #d92d45;
      }

      #page-loader.show-splash .loader-splash {
        opacity: 1;
      }

      #page-loader.show-splash
      .loader-splash span {
        animation:
          splashParticle .8s
          cubic-bezier(.2,.8,.2,1)
          forwards;
      }

      .loader-splash span:nth-child(1) {
        --x: -55px;
        --y: -35px;
      }

      .loader-splash span:nth-child(2) {
        --x: 60px;
        --y: -28px;
      }

      .loader-splash span:nth-child(3) {
        --x: -75px;
        --y: 8px;
      }

      .loader-splash span:nth-child(4) {
        --x: 72px;
        --y: 14px;
      }

      .loader-splash span:nth-child(5) {
        --x: -35px;
        --y: 48px;
      }

      .loader-splash span:nth-child(6) {
        --x: 42px;
        --y: 52px;
      }

      @keyframes splashParticle {
        0% {
          opacity: 1;
          transform: translate(0,0) scale(1);
        }

        100% {
          opacity: 0;
          transform:
            translate(var(--x), var(--y))
            scale(.35);
        }
      }

      .loader-brand {
        position: absolute;
        top: 56%;
        left: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform:
          translate(-50%, 25px)
          scale(.88);
        opacity: 0;
        transition:
          opacity .7s cubic-bezier(.22,1,.36,1),
          transform .7s cubic-bezier(.22,1,.36,1);
      }

      .loader-brand img {
        width: 74px;
        height: 74px;
        object-fit: contain;
        filter:
          drop-shadow(
            0 10px 20px
            rgba(23,135,99,.15)
          );
      }

      #page-loader.show-brand .loader-brand {
        opacity: 1;
        transform:
          translate(-50%, 0)
          scale(1);
      }

      .loader-wordmark {
        margin-top: 11px;
        color: #17212b;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          sans-serif;
        font-size: 1.65rem;
        font-weight: 950;
        letter-spacing: .15em;
        transform: translateY(10px);
        opacity: 0;
        transition:
          opacity .55s ease .12s,
          transform .55s ease .12s;
      }

      #page-loader.show-brand
      .loader-wordmark {
        opacity: 1;
        transform: translateY(0);
      }

      .loader-tagline {
        margin-top: 6px;
        color: #71808c;
        font-size: .72rem;
        font-weight: 650;
        letter-spacing: .03em;
        opacity: 0;
        transform: translateY(8px);
        transition:
          opacity .55s ease,
          transform .55s ease;
      }

      #page-loader.show-tagline
      .loader-tagline {
        opacity: 1;
        transform: translateY(0);
      }

      .loader-dots {
        display: flex;
        gap: 5px;
        margin-top: 15px;
      }

      .loader-dots span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #22a77a;
        animation:
          loaderDot 1.2s
          ease-in-out infinite;
      }

      .loader-dots span:nth-child(2) {
        animation-delay: .15s;
      }

      .loader-dots span:nth-child(3) {
        animation-delay: .3s;
      }

      @keyframes loaderDot {
        0%, 60%, 100% {
          opacity: .35;
          transform: translateY(0);
        }

        30% {
          opacity: 1;
          transform: translateY(-4px);
        }
      }

      @media (max-width: 520px) {
        .loader-drop {
          width: 38px;
          height: 50px;
        }

        .loader-brand img {
          width: 65px;
          height: 65px;
        }

        .loader-wordmark {
          font-size: 1.35rem;
        }

        .loader-tagline {
          font-size: .64rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .loader-drop {
          animation: none;
          opacity: 1;
          transform:
            translate(-50%, 200px)
            rotate(45deg);
        }

        .loader-impact,
        .loader-ripple,
        .loader-splash span,
        .loader-dots span {
          animation: none !important;
        }

        .loader-brand {
          opacity: 1;
          transform:
            translate(-50%, 0)
            scale(1);
        }

        .loader-wordmark,
        .loader-tagline {
          opacity: 1;
          transform: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /*
   * Last-resort safety fallback.
   * If anything prevents normal initialization,
   * never leave the entire website hidden.
   */
  window.setTimeout(function () {
    if (!finished) {
      finishLoader();
    }
  }, MAX_LOADER_TIME + 250);
})();
