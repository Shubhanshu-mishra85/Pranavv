/* =========================================================
   PRANAV — Easy Mode Controller
   File: js/easy-mode.js
   ========================================================= */

(function () {
  "use strict";

  const TOTAL_STEPS = 5;
  let currentStep = 1;

  document.addEventListener("DOMContentLoaded", initEasyMode);

  function initEasyMode() {
    setupStepNavigation();
    setupLanguageControls();
    setupVoiceControls();
    setupQuickActions();

    restoreStep();
    updateStepUI();
  }

  /* ---------------------------------------------------------
     Step navigation
     --------------------------------------------------------- */

  function setupStepNavigation() {
    const nextButtons = document.querySelectorAll(
      "[data-easy-next]"
    );

    const previousButtons = document.querySelectorAll(
      "[data-easy-prev]"
    );

    nextButtons.forEach((button) => {
      button.addEventListener("click", () => {
        nextStep();
      });
    });

    previousButtons.forEach((button) => {
      button.addEventListener("click", () => {
        previousStep();
      });
    });

    const stepButtons = document.querySelectorAll(
      "[data-easy-step]"
    );

    stepButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const step = Number(
          button.dataset.easyStep
        );

        if (
          Number.isInteger(step) &&
          step >= 1 &&
          step <= TOTAL_STEPS
        ) {
          currentStep = step;
          saveStep();
          updateStepUI();
        }
      });
    });
  }

  function nextStep() {
    if (currentStep < TOTAL_STEPS) {
      currentStep += 1;

      saveStep();
      updateStepUI();

      speakCurrentStep();
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      currentStep -= 1;

      saveStep();
      updateStepUI();
    }
  }

  /* ---------------------------------------------------------
     Update step UI
     --------------------------------------------------------- */

  function updateStepUI() {
    const sections = document.querySelectorAll(
      "[data-easy-section]"
    );

    sections.forEach((section) => {
      const step = Number(
        section.dataset.easySection
      );

      const active = step === currentStep;

      section.hidden = !active;
      section.classList.toggle(
        "active",
        active
      );
    });

    const indicators = document.querySelectorAll(
      "[data-easy-indicator]"
    );

    indicators.forEach((indicator) => {
      const step = Number(
        indicator.dataset.easyIndicator
      );

      indicator.classList.toggle(
        "active",
        step === currentStep
      );

      indicator.classList.toggle(
        "completed",
        step < currentStep
      );

      indicator.setAttribute(
        "aria-current",
        step === currentStep
          ? "step"
          : "false"
      );
    });

    updateProgress();

    updateNavigationButtons();
  }

  function updateProgress() {
    const progress =
      ((currentStep - 1) /
        (TOTAL_STEPS - 1)) *
      100;

    const bars = document.querySelectorAll(
      "[data-easy-progress]"
    );

    bars.forEach((bar) => {
      bar.style.width = `${Math.min(
        100,
        Math.max(0, progress)
      )}%`;

      bar.setAttribute(
        "aria-valuenow",
        String(currentStep)
      );
    });

    const labels = document.querySelectorAll(
      "[data-easy-step-count]"
    );

    labels.forEach((label) => {
      label.textContent =
        `Step ${currentStep} of ${TOTAL_STEPS}`;
    });
  }

  function updateNavigationButtons() {
    const previousButtons =
      document.querySelectorAll(
        "[data-easy-prev]"
      );

    const nextButtons =
      document.querySelectorAll(
        "[data-easy-next]"
      );

    previousButtons.forEach((button) => {
      button.disabled = currentStep === 1;
    });

    nextButtons.forEach((button) => {
      button.disabled =
        currentStep === TOTAL_STEPS;
    });
  }

  /* ---------------------------------------------------------
     Language controls
     --------------------------------------------------------- */

  function setupLanguageControls() {
    const buttons = document.querySelectorAll(
      "[data-easy-language]"
    );

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const language =
          button.dataset.easyLanguage;

        if (!language) return;

        setLanguage(language);

        buttons.forEach((item) => {
          item.classList.toggle(
            "active",
            item.dataset.easyLanguage ===
              language
          );
        });
      });
    });
  }

  function setLanguage(language) {
    try {
      localStorage.setItem(
        "pranavEasyLanguage",
        language
      );
    } catch (error) {
      console.warn(
        "Unable to save language preference."
      );
    }

    document.documentElement.lang =
      language;

    document.body.dataset.language =
      language;

    /*
     * The HTML can provide translated text
     * using data attributes:
     *
     * data-en="Find Blood"
     * data-hi="रक्त खोजें"
     */

    const translatable =
      document.querySelectorAll(
        "[data-en][data-hi]"
      );

    translatable.forEach((element) => {
      if (language === "hi") {
        element.textContent =
          element.dataset.hi;
      } else {
        element.textContent =
          element.dataset.en;
      }
    });

    speakText(
      language === "hi"
        ? "भाषा हिंदी में बदल दी गई है।"
        : "Language changed to English."
    );
  }

  /* ---------------------------------------------------------
     Voice controls
     --------------------------------------------------------- */

  function setupVoiceControls() {
    const listenButtons =
      document.querySelectorAll(
        "[data-easy-listen]"
      );

    listenButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target =
          button.dataset.easyListen;

        let text = "";

        if (target) {
          const element =
            document.querySelector(target);

          text = element
            ? element.textContent
            : "";
        } else {
          text =
            document.querySelector(
              "[data-easy-section].active"
            )?.textContent || "";
        }

        speakText(text);
      });
    });

    const stopButtons =
      document.querySelectorAll(
        "[data-easy-stop-voice]"
      );

    stopButtons.forEach((button) => {
      button.addEventListener("click", stopSpeaking);
    });

    const voiceInputButtons =
      document.querySelectorAll(
        "[data-easy-voice-input]"
      );

    voiceInputButtons.forEach((button) => {
      button.addEventListener(
        "click",
        startVoiceInput
      );
    });
  }

  /* ---------------------------------------------------------
     Text-to-speech
     --------------------------------------------------------- */

  function speakCurrentStep() {
    const section =
      document.querySelector(
        "[data-easy-section].active"
      );

    if (!section) return;

    const text =
      section.dataset.speak ||
      section.textContent;

    speakText(text);
  }

  function speakText(text) {
    if (
      !text ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    stopSpeaking();

    const utterance =
      new SpeechSynthesisUtterance(
        String(text).trim()
      );

    const language =
      getSavedLanguage();

    utterance.lang =
      language === "hi"
        ? "hi-IN"
        : "en-IN";

    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      document.body.classList.add(
        "pranav-speaking"
      );

      updateVoiceState("Speaking");
    };

    utterance.onend = () => {
      document.body.classList.remove(
        "pranav-speaking"
      );

      updateVoiceState("Ready");
    };

    utterance.onerror = () => {
      document.body.classList.remove(
        "pranav-speaking"
      );

      updateVoiceState("Voice unavailable");
    };

    window.speechSynthesis.speak(
      utterance
    );
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    document.body.classList.remove(
      "pranav-speaking"
    );

    updateVoiceState("Ready");
  }

  function updateVoiceState(state) {
    const elements = document.querySelectorAll(
      "[data-easy-voice-state]"
    );

    elements.forEach((element) => {
      element.textContent = state;
    });
  }

  /* ---------------------------------------------------------
     Voice input
     --------------------------------------------------------- */

  function startVoiceInput() {
    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      showMessage(
        "Voice input is not supported in this browser. You can type instead."
      );
      return;
    }

    const recognition =
      new Recognition();

    recognition.lang =
      getSavedLanguage() === "hi"
        ? "hi-IN"
        : "en-IN";

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    updateVoiceState("Listening");

    document.body.classList.add(
      "pranav-listening"
    );

    recognition.start();

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript ||
        "";

      const target =
        document.querySelector(
          "[data-easy-voice-target]"
        );

      if (target) {
        target.value = transcript;

        target.dispatchEvent(
          new Event("input", {
            bubbles: true
          })
        );
      }

      showMessage(
        `Heard: ${transcript}`
      );
    };

    recognition.onerror = () => {
      showMessage(
        "I couldn't understand the voice input. Please try again or type instead."
      );
    };

    recognition.onend = () => {
      document.body.classList.remove(
        "pranav-listening"
      );

      updateVoiceState("Ready");
    };
  }

  /* ---------------------------------------------------------
     Quick actions
     --------------------------------------------------------- */

  function setupQuickActions() {
    const actions = document.querySelectorAll(
      "[data-easy-action]"
    );

    actions.forEach((button) => {
      button.addEventListener("click", () => {
        const action =
          button.dataset.easyAction;

        handleAction(action);
      });
    });
  }

  function handleAction(action) {
    switch (action) {
      case "blood":
      case "request":
        window.location.href =
          "blood-request.html";
        break;

      case "find":
      case "resource":
        window.location.href =
          "find-blood.html";
        break;

      case "assistant":
        window.location.href =
          "assistant.html";
        break;

      case "track":
        window.location.href =
          "tracking.html";
        break;

      case "emergency":
        window.location.href =
          "emergency.html";
        break;

      case "home":
        window.location.href =
          "index.html";
        break;

      default:
        break;
    }
  }

  /* ---------------------------------------------------------
     Saved state
     --------------------------------------------------------- */

  function saveStep() {
    try {
      localStorage.setItem(
        "pranavEasyStep",
        String(currentStep)
      );
    } catch (error) {
      console.warn(
        "Unable to save Easy Mode step."
      );
    }
  }

  function restoreStep() {
    try {
      const stored =
        Number(
          localStorage.getItem(
            "pranavEasyStep"
          )
        );

      if (
        Number.isInteger(stored) &&
        stored >= 1 &&
        stored <= TOTAL_STEPS
      ) {
        currentStep = stored;
      }

      const language =
        localStorage.getItem(
          "pranavEasyLanguage"
        );

      if (language) {
        setLanguage(language);
      }
    } catch (error) {
      currentStep = 1;
    }
  }

  function getSavedLanguage() {
    try {
      return (
        localStorage.getItem(
          "pranavEasyLanguage"
        ) || "en"
      );
    } catch (error) {
      return "en";
    }
  }

  /* ---------------------------------------------------------
     Message
     --------------------------------------------------------- */

  function showMessage(message) {
    let box = document.querySelector(
      ".pranav-easy-message"
    );

    if (!box) {
      box = document.createElement("div");

      box.className =
        "pranav-easy-message";

      Object.assign(box.style, {
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%)",
        zIndex: "10000",
        width: "min(90%, 520px)",
        padding: "15px 20px",
        borderRadius: "16px",
        background: "#ffffff",
        color: "#222222",
        boxShadow:
          "0 14px 40px rgba(0,0,0,.16)",
        textAlign: "center",
        fontSize: "15px",
        lineHeight: "1.5"
      });

      document.body.appendChild(box);
    }

    box.textContent = message;

    setTimeout(() => {
      if (box) {
        box.remove();
      }
    }, 4500);
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavEasyMode = {
    next: nextStep,

    previous: previousStep,

    goTo: function (step) {
      const value = Number(step);

      if (
        !Number.isInteger(value) ||
        value < 1 ||
        value > TOTAL_STEPS
      ) {
        return;
      }

      currentStep = value;

      saveStep();
      updateStepUI();
    },

    getStep: function () {
      return currentStep;
    },

    setLanguage,

    speak: speakText,

    stopSpeaking
  };
})();
