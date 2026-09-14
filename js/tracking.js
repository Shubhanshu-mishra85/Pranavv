/* =========================================================
   PRANAV — Request Tracking Controller
   File: js/tracking.js
   ========================================================= */

(function () {
  "use strict";

  const STEPS = [
    "REQUEST CREATED",
    "REQUIREMENT ANALYSED",
    "SEARCHING",
    "POTENTIAL RESOURCE FOUND",
    "VERIFICATION",
    "COORDINATION",
    "RESOLVED"
  ];

  document.addEventListener("DOMContentLoaded", initTracking);

  function initTracking() {
    setupTrackingForm();
    loadRequestFromUrl();
    loadCurrentRequest();
  }

  /* ---------------------------------------------------------
     Tracking form
     --------------------------------------------------------- */

  function setupTrackingForm() {
    const form =
      document.querySelector("#trackingForm") ||
      document.querySelector("form[data-tracking-form]");

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const input =
        form.querySelector("#requestId") ||
        form.querySelector("[name='requestId']") ||
        form.querySelector("input");

      const requestId = input
        ? input.value.trim()
        : "";

      if (!requestId) {
        showMessage("Please enter your PRANAV Request ID.");
        return;
      }

      findRequest(requestId);
    });
  }

  /* ---------------------------------------------------------
     URL Request ID
     Example:
     tracking.html?id=PR-2026-123456
     --------------------------------------------------------- */

  function loadRequestFromUrl() {
    const params = new URLSearchParams(
      window.location.search
    );

    const id = params.get("id");

    if (id) {
      findRequest(id);
    }
  }

  /* ---------------------------------------------------------
     Load current request
     --------------------------------------------------------- */

  function loadCurrentRequest() {
    const request = getCurrentRequest();

    if (!request) return;

    // Don't overwrite a request loaded from URL.
    const params = new URLSearchParams(
      window.location.search
    );

    if (params.get("id")) return;

    renderRequest(request);
  }

  /* ---------------------------------------------------------
     Find request
     --------------------------------------------------------- */

  function findRequest(requestId) {
    const normalizedId = requestId
      .trim()
      .toUpperCase();

    const currentRequest = getCurrentRequest();

    if (
      currentRequest &&
      String(currentRequest.id).toUpperCase() === normalizedId
    ) {
      renderRequest(currentRequest);
      return;
    }

    const history = getRequestHistory();

    const request = history.find(
      (item) =>
        item &&
        String(item.id).toUpperCase() === normalizedId
    );

    if (request) {
      renderRequest(request);
      return;
    }

    showNotFound();
  }

  /* ---------------------------------------------------------
     Read current request
     --------------------------------------------------------- */

  function getCurrentRequest() {
    try {
      const value = localStorage.getItem(
        "pranavRequest"
      );

      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  /* ---------------------------------------------------------
     Request history
     --------------------------------------------------------- */

  function getRequestHistory() {
    try {
      const value = localStorage.getItem(
        "pranavRequestHistory"
      );

      if (!value) return [];

      const history = JSON.parse(value);

      return Array.isArray(history) ? history : [];
    } catch (error) {
      return [];
    }
  }

  /* ---------------------------------------------------------
     Render request
     --------------------------------------------------------- */

  function renderRequest(request) {
    hideNotFound();

    updateText(
      "#displayRequestId",
      request.id || "—"
    );

    updateText(
      "#requestStatus",
      request.status || "REQUEST CREATED"
    );

    updateText(
      "#trackingBloodGroup",
      request.bloodGroup || "—"
    );

    updateText(
      "#trackingComponent",
      request.component || "—"
    );

    updateText(
      "#trackingUnits",
      request.units || "—"
    );

    updateText(
      "#trackingHospital",
      request.hospital || "—"
    );

    updateText(
      "#trackingLocation",
      request.city ||
        request.district ||
        "—"
    );

    renderTimeline(request);
  }

  /* ---------------------------------------------------------
     Timeline
     --------------------------------------------------------- */

  function renderTimeline(request) {
    const timeline =
      document.querySelector("#trackingTimeline") ||
      document.querySelector(".tracking-timeline") ||
      document.querySelector("[data-tracking-timeline]");

    if (!timeline) return;

    timeline.innerHTML = "";

    const currentIndex = getCurrentStepIndex(
      request.status
    );

    STEPS.forEach((step, index) => {
      const item = document.createElement("div");

      item.className = "tracking-step";

      if (index < currentIndex) {
        item.classList.add("completed");
      }

      if (index === currentIndex) {
        item.classList.add("active");
      }

      const timelineData = Array.isArray(request.timeline)
        ? request.timeline.find(
            (entry) => entry.status === step
          )
        : null;

      const timeText = timelineData && timelineData.time
        ? formatDate(timelineData.time)
        : index < currentIndex
        ? "Completed"
        : index === currentIndex
        ? "Current step"
        : "Pending";

      item.innerHTML = `
        <div class="tracking-step-marker">
          ${index < currentIndex ? "✓" : index + 1}
        </div>

        <div class="tracking-step-content">
          <h4>${escapeHTML(step)}</h4>
          <p>${escapeHTML(timeText)}</p>
        </div>
      `;

      timeline.appendChild(item);
    });
  }

  /* ---------------------------------------------------------
     Current step
     --------------------------------------------------------- */

  function getCurrentStepIndex(status) {
    const index = STEPS.indexOf(
      String(status || "").toUpperCase()
    );

    return index >= 0 ? index : 0;
  }

  /* ---------------------------------------------------------
     Date formatter
     --------------------------------------------------------- */

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Updated";
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  /* ---------------------------------------------------------
     Update text safely
     --------------------------------------------------------- */

  function updateText(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
      element.textContent = value;
    }
  }

  /* ---------------------------------------------------------
     Not found state
     --------------------------------------------------------- */

  function showNotFound() {
    const result =
      document.querySelector("#trackingResult") ||
      document.querySelector(".tracking-result");

    if (result) {
      result.classList.add("hidden");
    }

    const empty =
      document.querySelector("#trackingNotFound") ||
      document.querySelector(".tracking-not-found");

    if (empty) {
      empty.classList.remove("hidden");
      empty.textContent =
        "No request was found with this Request ID. Please verify the ID and try again.";
    } else {
      showMessage(
        "No request found. Please verify your PRANAV Request ID."
      );
    }
  }

  function hideNotFound() {
    const result =
      document.querySelector("#trackingResult") ||
      document.querySelector(".tracking-result");

    if (result) {
      result.classList.remove("hidden");
    }

    const empty =
      document.querySelector("#trackingNotFound") ||
      document.querySelector(".tracking-not-found");

    if (empty) {
      empty.classList.add("hidden");
    }
  }

  /* ---------------------------------------------------------
     Message
     --------------------------------------------------------- */

  function showMessage(message) {
    let box = document.querySelector(
      ".pranav-tracking-message"
    );

    if (!box) {
      box = document.createElement("div");
      box.className = "pranav-tracking-message";

      Object.assign(box.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "9999",
        maxWidth: "90%",
        padding: "14px 18px",
        borderRadius: "14px",
        background: "#ffffff",
        color: "#222222",
        boxShadow: "0 12px 35px rgba(0,0,0,.15)",
        textAlign: "center",
        fontSize: "14px"
      });

      document.body.appendChild(box);
    }

    box.textContent = message;

    setTimeout(() => {
      box.remove();
    }, 4000);
  }

  /* ---------------------------------------------------------
     HTML escaping
     --------------------------------------------------------- */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavTracking = {
    find: findRequest,
    render: renderRequest,
    getCurrent: getCurrentRequest
  };
})();
