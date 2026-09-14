/* =========================================================
   PRANAV — Blood Request Controller
   File: js/request.js
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initRequest);

  function initRequest() {
    const form =
      document.querySelector("#bloodRequestForm") ||
      document.querySelector("form[data-request-form]");

    if (!form) return;

    form.addEventListener("submit", handleSubmit);
  }

  /* ---------------------------------------------------------
     Submit request
     --------------------------------------------------------- */

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const request = {
      id: generateRequestId(),
      bloodGroup: getValue(formData, "bloodGroup"),
      component: getValue(formData, "component"),
      units: getValue(formData, "units"),
      urgency: getValue(formData, "urgency"),
      city: getValue(formData, "city"),
      district: getValue(formData, "district"),
      hospital: getValue(formData, "hospital"),
      requiredDate: getValue(formData, "requiredDate"),
      requiredTime: getValue(formData, "requiredTime"),
      contactMethod: getValue(formData, "contactMethod"),
      contact: getValue(formData, "contact"),
      notes: getValue(formData, "notes"),

      status: "REQUEST CREATED",

      timeline: [
        {
          status: "REQUEST CREATED",
          time: new Date().toISOString()
        },
        {
          status: "REQUIREMENT ANALYSED",
          time: null
        },
        {
          status: "SEARCHING",
          time: null
        },
        {
          status: "POTENTIAL RESOURCE FOUND",
          time: null
        },
        {
          status: "VERIFICATION",
          time: null
        },
        {
          status: "COORDINATION",
          time: null
        },
        {
          status: "RESOLVED",
          time: null
        }
      ],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const validation = validateRequest(request);

    if (!validation.valid) {
      showMessage(validation.message, "error");
      return;
    }

    saveRequest(request);

    showMessage(
      `Request created successfully. Your PRANAV Request ID is ${request.id}`,
      "success"
    );

    updateRequestIdOnPage(request.id);

    setTimeout(() => {
      window.location.href = `tracking.html?id=${encodeURIComponent(
        request.id
      )}`;
    }, 1200);
  }

  /* ---------------------------------------------------------
     Read FormData safely
     --------------------------------------------------------- */

  function getValue(formData, name) {
    const value = formData.get(name);

    return value ? String(value).trim() : "";
  }

  /* ---------------------------------------------------------
     Validation
     --------------------------------------------------------- */

  function validateRequest(request) {
    if (!request.bloodGroup) {
      return {
        valid: false,
        message: "Please select a blood group."
      };
    }

    if (!request.component) {
      return {
        valid: false,
        message: "Please select the required blood component."
      };
    }

    if (!request.units) {
      return {
        valid: false,
        message: "Please enter the required units."
      };
    }

    const units = Number(request.units);

    if (!Number.isFinite(units) || units < 1) {
      return {
        valid: false,
        message: "Please enter a valid number of units."
      };
    }

    if (!request.urgency) {
      return {
        valid: false,
        message: "Please select the urgency level."
      };
    }

    if (!request.city && !request.district) {
      return {
        valid: false,
        message: "Please enter your city or district."
      };
    }

    if (!request.hospital) {
      return {
        valid: false,
        message: "Please enter the hospital or healthcare facility."
      };
    }

    return {
      valid: true,
      message: ""
    };
  }

  /* ---------------------------------------------------------
     Generate PRANAV Request ID
     Format: PR-YYYY-XXXXXX
     --------------------------------------------------------- */

  function generateRequestId() {
    const year = new Date().getFullYear();

    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    return `PR-${year}-${randomNumber}`;
  }

  /* ---------------------------------------------------------
     Save request
     --------------------------------------------------------- */

  function saveRequest(request) {
    try {
      localStorage.setItem(
        "pranavRequest",
        JSON.stringify(request)
      );

      localStorage.setItem(
        "pranavRequestId",
        request.id
      );

      // Maintain a small request history.
      const history = getRequestHistory();

      history.unshift(request);

      // Keep latest 10 requests in browser storage.
      const limitedHistory = history.slice(0, 10);

      localStorage.setItem(
        "pranavRequestHistory",
        JSON.stringify(limitedHistory)
      );
    } catch (error) {
      console.warn("Unable to save PRANAV request.", error);
    }
  }

  /* ---------------------------------------------------------
     Request history
     --------------------------------------------------------- */

  function getRequestHistory() {
    try {
      const stored = localStorage.getItem(
        "pranavRequestHistory"
      );

      if (!stored) return [];

      const history = JSON.parse(stored);

      return Array.isArray(history) ? history : [];
    } catch (error) {
      return [];
    }
  }

  /* ---------------------------------------------------------
     Get current request
     --------------------------------------------------------- */

  function getCurrentRequest() {
    try {
      const stored = localStorage.getItem("pranavRequest");

      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  /* ---------------------------------------------------------
     Update request status
     --------------------------------------------------------- */

  function updateRequestStatus(status) {
    const request = getCurrentRequest();

    if (!request) return null;

    request.status = status;
    request.updatedAt = new Date().toISOString();

    if (!Array.isArray(request.timeline)) {
      request.timeline = [];
    }

    const step = request.timeline.find(
      (item) => item.status === status
    );

    if (step && !step.time) {
      step.time = new Date().toISOString();
    }

    saveRequest(request);

    return request;
  }

  /* ---------------------------------------------------------
     Display generated ID
     --------------------------------------------------------- */

  function updateRequestIdOnPage(id) {
    const elements = document.querySelectorAll(
      "#requestId, .request-id, [data-request-id]"
    );

    elements.forEach((element) => {
      element.textContent = id;
    });
  }

  /* ---------------------------------------------------------
     Message UI
     --------------------------------------------------------- */

  function showMessage(message, type) {
    let box = document.querySelector(
      ".pranav-request-message"
    );

    if (!box) {
      box = document.createElement("div");
      box.className = "pranav-request-message";

      Object.assign(box.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "10000",
        maxWidth: "90%",
        padding: "14px 20px",
        borderRadius: "14px",
        background: "#ffffff",
        color: "#222222",
        boxShadow: "0 12px 35px rgba(0,0,0,.15)",
        fontSize: "14px",
        lineHeight: "1.5",
        textAlign: "center"
      });

      document.body.appendChild(box);
    }

    box.textContent = message;

    if (type === "error") {
      box.style.border = "1px solid #dc3545";
    } else {
      box.style.border = "1px solid #198754";
    }

    setTimeout(() => {
      if (box) box.remove();
    }, 4500);
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavRequest = {
    create: saveRequest,
    getCurrent: getCurrentRequest,
    getHistory: getRequestHistory,
    updateStatus: updateRequestStatus,
    generateId: generateRequestId
  };
})();
