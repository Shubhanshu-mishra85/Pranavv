/* =========================================================
   PRANAV — Emergency Mode Controller
   File: js/emergency.js
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initEmergencyMode();
  });

  function initEmergencyMode() {
    setupEmergencyButtons();
    setupEmergencyRequest();
    setupFacilityContact();
    setupTracking();
    setupAssistant();
  }

  /* ---------------------------------------------------------
     Emergency action buttons
     --------------------------------------------------------- */

  function setupEmergencyButtons() {
    const buttons = document.querySelectorAll(
      "[data-emergency-action], .emergency-action"
    );

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const action =
          button.dataset.emergencyAction ||
          button.dataset.action ||
          button.getAttribute("data-target");

        handleEmergencyAction(action);
      });
    });
  }

  function handleEmergencyAction(action) {
    if (!action) return;

    switch (action) {
      case "blood":
      case "need-blood":
      case "request":
        goTo("blood-request.html");
        break;

      case "find":
      case "find-blood":
      case "resource":
        goTo("find-blood.html");
        break;

      case "assistant":
      case "ai":
        goTo("assistant.html");
        break;

      case "facility":
      case "contact":
        contactFacility();
        break;

      case "track":
      case "tracking":
        goTo("tracking.html");
        break;

      default:
        if (action.endsWith(".html")) {
          goTo(action);
        }
    }
  }

  /* ---------------------------------------------------------
     Emergency request
     --------------------------------------------------------- */

  function setupEmergencyRequest() {
    const requestButtons = document.querySelectorAll(
      "#emergencyRequestBtn, [data-action='emergency-request'], [data-emergency='request']"
    );

    requestButtons.forEach((button) => {
      button.addEventListener("click", () => {
        saveEmergencySession();
        goTo("blood-request.html");
      });
    });
  }

  function saveEmergencySession() {
    try {
      const session = {
        active: true,
        mode: "emergency",
        startedAt: new Date().toISOString()
      };

      localStorage.setItem(
        "pranavEmergencySession",
        JSON.stringify(session)
      );
    } catch (error) {
      console.warn("Unable to save emergency session.", error);
    }
  }

  /* ---------------------------------------------------------
     Facility contact
     --------------------------------------------------------- */

  function setupFacilityContact() {
    const buttons = document.querySelectorAll(
      "#contactFacilityBtn, [data-action='contact-facility']"
    );

    buttons.forEach((button) => {
      button.addEventListener("click", contactFacility);
    });
  }

  function contactFacility() {
    const facility =
      localStorage.getItem("pranavFacilityPhone") ||
      localStorage.getItem("facilityPhone");

    if (facility) {
      window.location.href = `tel:${facility}`;
      return;
    }

    showMessage(
      "Please use the authorised healthcare facility's official contact number."
    );
  }

  /* ---------------------------------------------------------
     Tracking
     --------------------------------------------------------- */

  function setupTracking() {
    const trackingButtons = document.querySelectorAll(
      "#trackRequestBtn, [data-action='track-request']"
    );

    trackingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        goTo("tracking.html");
      });
    });
  }

  /* ---------------------------------------------------------
     AI Assistant
     --------------------------------------------------------- */

  function setupAssistant() {
    const assistantButtons = document.querySelectorAll(
      "#assistantBtn, [data-action='assistant'], [data-emergency='assistant']"
    );

    assistantButtons.forEach((button) => {
      button.addEventListener("click", () => {
        goTo("assistant.html");
      });
    });
  }

  /* ---------------------------------------------------------
     Navigation
     --------------------------------------------------------- */

  function goTo(page) {
    if (!page) return;

    window.location.href = page;
  }

  /* ---------------------------------------------------------
     Simple message helper
     --------------------------------------------------------- */

  function showMessage(message) {
    const existing = document.querySelector(".pranav-emergency-message");

    if (existing) {
      existing.textContent = message;
      return;
    }

    const box = document.createElement("div");

    box.className = "pranav-emergency-message";
    box.textContent = message;

    Object.assign(box.style, {
      position: "fixed",
      left: "50%",
      bottom: "24px",
      transform: "translateX(-50%)",
      zIndex: "9999",
      maxWidth: "90%",
      padding: "14px 18px",
      borderRadius: "14px",
      background: "#ffffff",
      color: "#222222",
      boxShadow: "0 12px 35px rgba(0,0,0,.16)",
      fontSize: "14px",
      lineHeight: "1.5",
      textAlign: "center"
    });

    document.body.appendChild(box);

    setTimeout(() => {
      box.remove();
    }, 4000);
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavEmergency = {
    start: saveEmergencySession,
    goTo,
    contactFacility,
    showMessage
  };
})();
