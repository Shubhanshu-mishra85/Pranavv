/* =========================================================
   PRANAV — AI Assistant Controller
   Text • Hinglish • Voice • Emergency Guidance
   ========================================================= */

(function () {
  "use strict";

  let isListening = false;
  let recognition = null;

  document.addEventListener("DOMContentLoaded", function () {
    initializeAssistant();
    initializeVoiceRecognition();
    initializeQuickActions();
  });

  /* ---------- Initialize ---------- */

  function initializeAssistant() {
    const sendButton = document.querySelector(
      "[data-assistant-send]"
    );

    const input = document.querySelector(
      "[data-assistant-input]"
    );

    if (!input || !sendButton) {
      return;
    }

    sendButton.addEventListener("click", function () {
      sendMessage();
    });

    input.addEventListener("keydown", function (event) {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  /* ---------- Send Message ---------- */

  function sendMessage(text) {
    const input = document.querySelector(
      "[data-assistant-input]"
    );

    if (!text && input) {
      text = input.value.trim();
    }

    if (!text) {
      return;
    }

    if (input) {
      input.value = "";
      input.focus();
    }

    addMessage(text, "user");

    showTyping();

    window.setTimeout(function () {
      removeTyping();

      const response =
        generateResponse(text);

      addMessage(response.text, "ai", {
        actions: response.actions
      });
    }, 650);
  }

  /* ---------- Add Message ---------- */

  function addMessage(text, sender, options) {
    options = options || {};

    const container =
      document.querySelector(
        "[data-chat-messages]"
      ) ||
      document.querySelector(".chat-messages");

    if (!container) {
      return;
    }

    const message =
      document.createElement("div");

    message.className =
      "chat-message " +
      (sender === "user" ? "user" : "ai");

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "message-wrapper";

    if (sender === "ai") {
      const head =
        document.createElement("div");

      head.className =
        "ai-message-head";

      head.innerHTML =
        '<span class="ai-mini-icon">🤖</span>' +
        "<span>PRANAV Assistant</span>";

      wrapper.appendChild(head);
    }

    const bubble =
      document.createElement("div");

    bubble.className =
      "message-bubble";

    bubble.innerHTML =
      formatAssistantText(text);

    wrapper.appendChild(bubble);

    if (
      Array.isArray(options.actions) &&
      options.actions.length
    ) {
      const actions =
        document.createElement("div");

      actions.className =
        "quick-actions";

      options.actions.forEach(function (action) {
        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "quick-action";

        button.textContent =
          action.label;

        button.addEventListener(
          "click",
          function () {
            handleAction(action);
          }
        );

        actions.appendChild(button);
      });

      wrapper.appendChild(actions);
    }

    const time =
      document.createElement("div");

    time.className =
      "message-time";

    time.textContent =
      getCurrentTime();

    wrapper.appendChild(time);

    message.appendChild(wrapper);
    container.appendChild(message);

    scrollChatToBottom();
  }

  /* ---------- Text Formatting ---------- */

  function formatAssistantText(text) {
    const safe =
      window.PRANAV &&
      window.PRANAV.escapeHTML
        ? window.PRANAV.escapeHTML(text)
        : escapeHTML(text);

    return safe
      .replace(/\n/g, "<br>")
      .replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ---------- Typing Indicator ---------- */

  function showTyping() {
    const container =
      document.querySelector(
        "[data-chat-messages]"
      ) ||
      document.querySelector(".chat-messages");

    if (!container) return;

    removeTyping();

    const message =
      document.createElement("div");

    message.id =
      "pranav-typing-message";

    message.className =
      "chat-message ai";

    message.innerHTML =
      '<div class="message-wrapper">' +
        '<div class="ai-message-head">' +
          '<span class="ai-mini-icon">🤖</span>' +
          "<span>PRANAV Assistant</span>" +
        "</div>" +
        '<div class="typing-indicator">' +
          "<span></span>" +
          "<span></span>" +
          "<span></span>" +
        "</div>" +
      "</div>";

    container.appendChild(message);

    scrollChatToBottom();
  }

  function removeTyping() {
    const typing =
      document.getElementById(
        "pranav-typing-message"
      );

    if (typing) {
      typing.remove();
    }
  }

  /* ---------- Response Engine ---------- */

  function generateResponse(message) {
    const text =
      String(message)
        .toLowerCase()
        .trim();

    /* Emergency keywords */

    if (
      containsAny(text, [
        "emergency",
        "urgent",
        "बहुत जरूरी",
        "jaldi blood",
        "turant blood",
        "abhi blood"
      ])
    ) {
      return {
        text:
          "Agar situation emergency hai, pehle patient ke authorised hospital/facility se immediate coordination karein. PRANAV potential blood resources aur coordination steps dikhane mein help kar sakta hai. Availability ko authorised blood centre se verify karna zaroori hai.",
        actions: [
          {
            label: "🚨 Emergency Request",
            type: "navigate",
            url: "blood-request.html"
          },
          {
            label: "🔎 Find Resources",
            type: "navigate",
            url: "find-blood.html"
          }
        ]
      };
    }

    /* Blood requirement */

    if (
      containsAny(text, [
        "blood chahiye",
        "need blood",
        "blood required",
        "blood ki need",
        "blood चाहिए",
        "रक्त चाहिए"
      ])
    ) {
      return {
        text:
          "Bilkul. Aap PRANAV par blood requirement create kar sakte hain. Blood group, component, units, location aur hospital/facility ki basic details dene ke baad potential resources search kiye ja sakte hain. Final availability authorised centre se verify karein.",
        actions: [
          {
            label: "🩸 Create Request",
            type: "navigate",
            url: "blood-request.html"
          },
          {
            label: "🔎 Find Blood",
            type: "navigate",
            url: "find-blood.html"
          }
        ]
      };
    }

    /* Blood group */

    if (
      containsAny(text, [
        "o positive",
        "o+",
        "a positive",
        "a+",
        "b positive",
        "b+",
        "ab positive",
        "ab+",
        "o negative",
        "o-",
        "a negative",
        "a-",
        "b negative",
        "b-",
        "ab negative",
        "ab-"
      ])
    ) {
      return {
        text:
          "Blood group information mil gayi. PRANAV aapke requirement details ko structure karke potential resources search karne mein help kar sakta hai. Blood compatibility ya final transfusion decision healthcare professionals aur authorised blood centre par depend karta hai.",
        actions: [
          {
            label: "🩸 Create Request",
            type: "navigate",
            url: "blood-request.html"
          },
          {
            label: "🔎 Find Resources",
            type: "navigate",
            url: "find-blood.html"
          }
        ]
      };
    }

    /* Find blood */

    if (
      containsAny(text, [
        "find blood",
        "blood centre",
        "blood bank",
        "blood centre near",
        "nearby blood",
        "blood bank near"
      ])
    ) {
      return {
        text:
          "Main aapko potential blood resources discover karne ke liye Find Blood section par le ja sakta hoon. Results ko authorised facility se verify karna zaroori hai, kyunki availability change ho sakti hai.",
        actions: [
          {
            label: "🔎 Find Blood Resources",
            type: "navigate",
            url: "find-blood.html"
          }
        ]
      };
    }

    /* Tracking */

    if (
      containsAny(text, [
        "track",
        "tracking",
        "request status",
        "request id",
        "status check"
      ])
    ) {
      return {
        text:
          "Aap apna PRANAV Request ID use karke request journey aur current coordination status check kar sakte hain.",
        actions: [
          {
            label: "📋 Track Request",
            type: "navigate",
            url: "tracking.html"
          }
        ]
      };
    }

    /* Camps */

    if (
      containsAny(text, [
        "camp",
        "blood donation camp",
        "donation camp",
        "blood camp"
      ])
    ) {
      return {
        text:
          "PRANAV ke Camps section mein available camp information dekhi ja sakti hai. Camp details ko organiser ya authorised facility se verify karein.",
        actions: [
          {
            label: "📅 Explore Camps",
            type: "navigate",
            url: "camps.html"
          }
        ]
      };
    }

    /* Education */

    if (
      containsAny(text, [
        "blood group kya",
        "rbc",
        "platelet",
        "plasma",
        "blood component",
        "blood groups",
        "blood education"
      ])
    ) {
      return {
        text:
          "PRANAV Education section mein blood groups aur blood components ko simple language mein samjhaya gaya hai.",
        actions: [
          {
            label: "📚 Learn About Blood",
            type: "navigate",
            url: "blood-education.html"
          }
        ]
      };
    }

    /* Prescription */

    if (
      containsAny(text, [
        "prescription",
        "medicine",
        "dawai",
        "dawa",
        "tablet",
        "medicine check"
      ])
    ) {
      return {
        text:
          "Prescription Intelligence prescription image se visible medicine name, strength, dates aur doctor ke likhe instructions ko organise karne mein help kar sakta hai. AI/OCR output ko doctor ya pharmacist se verify karna zaroori hai. Main independently age-based dose calculate ya prescribe nahi karta.",
        actions: [
          {
            label: "📄 Check Prescription",
            type: "navigate",
            url: "prescription.html"
          }
        ]
      };
    }

    /* Easy Mode */

    if (
      containsAny(text, [
        "easy mode",
        "simple mode",
        "elderly",
        "voice help",
        "आसान"
      ])
    ) {
      return {
        text:
          "Easy Mode large buttons, simple language, guided steps aur voice-friendly interface ke saath healthcare coordination ko easier banata hai.",
        actions: [
          {
            label: "✨ Open Easy Mode",
            type: "navigate",
            url: "easy-mode.html"
          }
        ]
      };
    }

    /* Greeting */

    if (
      containsAny(text, [
        "hello",
        "hi",
        "hey",
        "namaste",
        "namaskar",
        "नमस्ते"
      ])
    ) {
      return {
        text:
          "Namaste! 👋 Main PRANAV Assistant hoon. Main blood-resource discovery, emergency request, request tracking, camps aur PRANAV ke features samajhne mein help kar sakta hoon.",
        actions: [
          {
            label: "🚨 Emergency Request",
            type: "navigate",
            url: "blood-request.html"
          },
          {
            label: "🔎 Find Blood",
            type: "navigate",
            url: "find-blood.html"
          },
          {
            label: "📋 Track Request",
            type: "navigate",
            url: "tracking.html"
          }
        ]
      };
    }

    /* Default */

    return {
      text:
        "Main PRANAV ke healthcare coordination features ke baare mein help kar sakta hoon. Aap simple language mein pooch sakte hain, jaise: “Mujhe O positive blood chahiye”, “nearby blood resource kaise find karein?” ya “meri request ka status kya hai?”",
      actions: [
        {
          label: "🩸 Blood Request",
          type: "navigate",
          url: "blood-request.html"
        },
        {
          label: "🔎 Find Resources",
          type: "navigate",
          url: "find-blood.html"
        },
        {
          label: "📋 Track Request",
          type: "navigate",
          url: "tracking.html"
        }
      ]
    };
  }

  /* ---------- Keyword Helper ---------- */

  function containsAny(text, keywords) {
    return keywords.some(function (keyword) {
      return text.includes(
        String(keyword).toLowerCase()
      );
    });
  }

  /* ---------- Quick Actions ---------- */

  function initializeQuickActions() {
    document
      .querySelectorAll(
        "[data-assistant-action]"
      )
      .forEach(function (button) {
        button.addEventListener(
          "click",
          function () {
            const text =
              button.getAttribute(
                "data-assistant-action"
              );

            if (text) {
              sendMessage(text);
            }
          }
        );
      });
  }

  function handleAction(action) {
    if (!action) return;

    if (action.type === "navigate") {
      if (action.url) {
        window.location.href =
          action.url;
      }

      return;
    }

    if (action.type === "message") {
      sendMessage(action.text || "");
      return;
    }

    if (
      action.type === "emergency"
    ) {
      window.location.href =
        "emergency.html";
    }
  }

  /* ---------- Voice Recognition ---------- */

  function initializeVoiceRecognition() {
    const voiceButton =
      document.querySelector(
        "[data-assistant-voice]"
      );

    if (!voiceButton) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      voiceButton.setAttribute(
        "aria-label",
        "Voice input is not supported on this browser"
      );

      voiceButton.addEventListener(
        "click",
        function () {
          if (window.PRANAV) {
            window.PRANAV.showToast(
              "Voice input is not supported in this browser."
            );
          }
        }
      );

      return;
    }

    recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;

    /*
     * Hinglish-friendly recognition.
     * Browser may interpret mixed language differently.
     */
    recognition.lang = "en-IN";

    recognition.onstart = function () {
      isListening = true;
      voiceButton.classList.add(
        "listening"
      );

      voiceButton.setAttribute(
        "aria-pressed",
        "true"
      );

      updateVoiceState(
        "Listening…"
      );
    };

    recognition.onresult =
      function (event) {
        let transcript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          transcript +=
            event.results[i][0]
              .transcript;
        }

        const input =
          document.querySelector(
            "[data-assistant-input]"
          );

        if (input) {
          input.value =
            transcript.trim();
        }
      };

    recognition.onerror =
      function () {
        stopVoiceRecognition();

        updateVoiceState(
          "Voice input unavailable"
        );
      };

    recognition.onend = function () {
      stopVoiceRecognition();

      const input =
        document.querySelector(
          "[data-assistant-input]"
        );

      if (
        input &&
        input.value.trim()
      ) {
        sendMessage();
      }
    };

    voiceButton.addEventListener(
      "click",
      function () {
        if (isListening) {
          stopVoiceRecognition();
        } else {
          startVoiceRecognition();
        }
      }
    );
  }

  function startVoiceRecognition() {
    if (!recognition) return;

    try {
      recognition.start();
    } catch (error) {
      updateVoiceState(
        "Please try again"
      );
    }
  }

  function stopVoiceRecognition() {
    isListening = false;

    const voiceButton =
      document.querySelector(
        "[data-assistant-voice]"
      );

    if (voiceButton) {
      voiceButton.classList.remove(
        "listening"
      );

      voiceButton.setAttribute(
        "aria-pressed",
        "false"
      );
    }

    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        /* Already stopped. */
      }
    }

    updateVoiceState("");
  }

  function updateVoiceState(text) {
    const state =
      document.querySelector(
        "[data-voice-state]"
      ) ||
      document.querySelector(
        ".voice-state"
      );

    if (state && text) {
      state.textContent = text;
    }
  }

  /* ---------- Chat Scroll ---------- */

  function scrollChatToBottom() {
    const container =
      document.querySelector(
        "[data-chat-messages]"
      ) ||
      document.querySelector(
        ".chat-messages"
      );

    if (!container) return;

    window.setTimeout(function () {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }, 50);
  }

  /* ---------- Current Time ---------- */

  function getCurrentTime() {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(new Date());
  }

  /* ---------- Public API ---------- */

  window.PRANAVAssistant = {
    sendMessage: sendMessage,
    addMessage: addMessage,
    generateResponse: generateResponse,
    startVoice: startVoiceRecognition,
    stopVoice: stopVoiceRecognition
  };

})();
