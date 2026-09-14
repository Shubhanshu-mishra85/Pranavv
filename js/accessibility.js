/* =========================================================
   PRANAV — Accessibility Controller
   File: js/accessibility.js
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "pranavAccessibility";

  const defaultSettings = {
    largeText: false,
    highContrast: false,
    reducedMotion: false,
    easyMode: false
  };

  let settings = loadSettings();

  document.addEventListener(
    "DOMContentLoaded",
    initAccessibility
  );

  /* ---------------------------------------------------------
     Initialize
     --------------------------------------------------------- */

  function initAccessibility() {
    applySettings();
    setupControls();
    setupKeyboardSupport();
    setupMotionPreference();
    updateControlStates();
  }

  /* ---------------------------------------------------------
     Accessibility controls
     --------------------------------------------------------- */

  function setupControls() {
    const controls = document.querySelectorAll(
      "[data-accessibility]"
    );

    controls.forEach((control) => {
      control.addEventListener("click", () => {
        const action =
          control.dataset.accessibility;

        handleAccessibilityAction(action);
      });
    });

    const checkboxes = document.querySelectorAll(
      "input[data-accessibility]"
    );

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const action =
          checkbox.dataset.accessibility;

        setSetting(
          action,
          checkbox.checked
        );
      });
    });
  }

  /* ---------------------------------------------------------
     Actions
     --------------------------------------------------------- */

  function handleAccessibilityAction(action) {
    switch (action) {
      case "large-text":
      case "largeText":
        toggleSetting("largeText");
        break;

      case "high-contrast":
      case "highContrast":
        toggleSetting("highContrast");
        break;

      case "reduced-motion":
      case "reducedMotion":
        toggleSetting("reducedMotion");
        break;

      case "easy-mode":
      case "easyMode":
        toggleSetting("easyMode");
        break;

      case "reset":
      case "reset-accessibility":
        resetSettings();
        break;

      default:
        break;
    }
  }

  /* ---------------------------------------------------------
     Settings
     --------------------------------------------------------- */

  function toggleSetting(setting) {
    if (!(setting in settings)) return;

    settings[setting] = !settings[setting];

    saveSettings();
    applySettings();
    updateControlStates();
  }

  function setSetting(setting, value) {
    if (!(setting in settings)) return;

    settings[setting] = Boolean(value);

    saveSettings();
    applySettings();
    updateControlStates();
  }

  /* ---------------------------------------------------------
     Apply settings
     --------------------------------------------------------- */

  function applySettings() {
    const body = document.body;

    if (!body) return;

    body.classList.toggle(
      "pranav-large-text",
      settings.largeText
    );

    body.classList.toggle(
      "pranav-high-contrast",
      settings.highContrast
    );

    body.classList.toggle(
      "pranav-reduced-motion",
      settings.reducedMotion
    );

    body.classList.toggle(
      "pranav-easy-mode-active",
      settings.easyMode
    );

    document.documentElement.setAttribute(
      "data-large-text",
      String(settings.largeText)
    );

    document.documentElement.setAttribute(
      "data-high-contrast",
      String(settings.highContrast)
    );

    document.documentElement.setAttribute(
      "data-reduced-motion",
      String(settings.reducedMotion)
    );

    document.documentElement.setAttribute(
      "data-easy-mode",
      String(settings.easyMode)
    );
  }

  /* ---------------------------------------------------------
     Control states
     --------------------------------------------------------- */

  function updateControlStates() {
    const controls = document.querySelectorAll(
      "[data-accessibility]"
    );

    controls.forEach((control) => {
      const action =
        control.dataset.accessibility;

      const setting = normalizeAction(action);

      if (!(setting in settings)) return;

      const active = settings[setting];

      control.classList.toggle(
        "active",
        active
      );

      control.setAttribute(
        "aria-pressed",
        String(active)
      );

      if (
        control.tagName === "INPUT" &&
        control.type === "checkbox"
      ) {
        control.checked = active;
      }
    });
  }

  function normalizeAction(action) {
    switch (action) {
      case "large-text":
        return "largeText";

      case "high-contrast":
        return "highContrast";

      case "reduced-motion":
        return "reducedMotion";

      case "easy-mode":
        return "easyMode";

      default:
        return action;
    }
  }

  /* ---------------------------------------------------------
     Keyboard support
     --------------------------------------------------------- */

  function setupKeyboardSupport() {
    document.addEventListener(
      "keydown",
      function (event) {
        /*
         * Alt + L = Large text
         * Alt + H = High contrast
         * Alt + M = Reduced motion
         * Alt + E = Easy Mode
         */

        if (!event.altKey) return;

        const key = event.key.toLowerCase();

        if (key === "l") {
          event.preventDefault();
          toggleSetting("largeText");
        }

        if (key === "h") {
          event.preventDefault();
          toggleSetting("highContrast");
        }

        if (key === "m") {
          event.preventDefault();
          toggleSetting("reducedMotion");
        }

        if (key === "e") {
          event.preventDefault();
          toggleSetting("easyMode");
        }
      }
    );
  }

  /* ---------------------------------------------------------
     Respect system reduced-motion preference
     --------------------------------------------------------- */

  function setupMotionPreference() {
    if (
      !window.matchMedia
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (mediaQuery.matches) {
      settings.reducedMotion = true;

      saveSettings();
      applySettings();
      updateControlStates();
    }

    const listener = (event) => {
      if (event.matches) {
        settings.reducedMotion = true;
      }

      saveSettings();
      applySettings();
      updateControlStates();
    };

    if (
      typeof mediaQuery.addEventListener ===
      "function"
    ) {
      mediaQuery.addEventListener(
        "change",
        listener
      );
    } else if (
      typeof mediaQuery.addListener ===
      "function"
    ) {
      mediaQuery.addListener(listener);
    }
  }

  /* ---------------------------------------------------------
     Storage
     --------------------------------------------------------- */

  function loadSettings() {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!stored) {
        return {
          ...defaultSettings
        };
      }

      const parsed = JSON.parse(stored);

      return {
        ...defaultSettings,
        ...parsed
      };
    } catch (error) {
      return {
        ...defaultSettings
      };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.warn(
        "Unable to save accessibility settings."
      );
    }
  }

  /* ---------------------------------------------------------
     Reset
     --------------------------------------------------------- */

  function resetSettings() {
    settings = {
      ...defaultSettings
    };

    saveSettings();
    applySettings();
    updateControlStates();
  }

  /* ---------------------------------------------------------
     Screen-reader helper
     --------------------------------------------------------- */

  function announce(message) {
    const region =
      document.querySelector(
        "#pranavLiveAnnouncement"
      ) ||
      createAnnouncementRegion();

    region.textContent = "";

    setTimeout(() => {
      region.textContent = message;
    }, 20);
  }

  function createAnnouncementRegion() {
    const region =
      document.createElement("div");

    region.id =
      "pranavLiveAnnouncement";

    region.setAttribute(
      "aria-live",
      "polite"
    );

    region.setAttribute(
      "aria-atomic",
      "true"
    );

    Object.assign(region.style, {
      position: "fixed",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0"
    });

    document.body.appendChild(region);

    return region;
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavAccessibility = {
    getSettings: function () {
      return {
        ...settings
      };
    },

    toggle: toggleSetting,

    set: setSetting,

    reset: resetSettings,

    announce
  };
})();
