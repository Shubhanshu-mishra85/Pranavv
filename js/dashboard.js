/* =========================================================
   PRANAV — Dashboard Controller
   File: js/dashboard.js
   ========================================================= */

(function () {
  "use strict";

  const DEMO_DATA_FILE = "data/demo-data.json";

  let dashboardData = null;

  document.addEventListener("DOMContentLoaded", initDashboard);

  async function initDashboard() {
    await loadDashboardData();
    renderDashboard();
    setupDashboardActions();
  }

  /* ---------------------------------------------------------
     Load dashboard data
     --------------------------------------------------------- */

  async function loadDashboardData() {
    try {
      const response = await fetch(DEMO_DATA_FILE, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Dashboard data unavailable.");
      }

      const data = await response.json();

      dashboardData = data.dashboard || data;

    } catch (error) {
      console.warn(
        "Using PRANAV prototype dashboard data.",
        error
      );

      dashboardData = getFallbackDashboardData();
    }
  }

  /* ---------------------------------------------------------
     Render dashboard
     --------------------------------------------------------- */

  function renderDashboard() {
    if (!dashboardData) return;

    renderStats();
    renderRequests();
    renderVerificationQueue();
    renderAlerts();
    renderResourceTrends();
  }

  /* ---------------------------------------------------------
     Statistics
     --------------------------------------------------------- */

  function renderStats() {
    const stats = dashboardData.stats || {};

    setText(
      "#emergencyRequests",
      stats.emergencyRequests ?? 0
    );

    setText(
      "#potentialMatches",
      stats.potentialMatches ?? 0
    );

    setText(
      "#verificationQueue",
      stats.verificationQueue ?? 0
    );

    setText(
      "#activeCoordination",
      stats.activeCoordination ?? 0
    );

    setText(
      "#resolvedRequests",
      stats.resolvedRequests ?? 0
    );

    setText(
      "#totalResources",
      stats.totalResources ?? 0
    );
  }

  /* ---------------------------------------------------------
     Emergency requests
     --------------------------------------------------------- */

  function renderRequests() {
    const container =
      document.querySelector("#dashboardRequests") ||
      document.querySelector("[data-dashboard-requests]");

    if (!container) return;

    const requests =
      dashboardData.requests || [];

    container.innerHTML = "";

    if (!requests.length) {
      container.innerHTML = `
        <div class="dashboard-empty">
          No active emergency requests.
        </div>
      `;
      return;
    }

    requests.forEach((request) => {
      const card = document.createElement("div");

      card.className = "dashboard-request-card";

      card.innerHTML = `
        <div class="dashboard-request-main">
          <span class="request-id">
            ${escapeHTML(request.id || "—")}
          </span>

          <h4>
            ${escapeHTML(
              request.bloodGroup || "Unknown"
            )}
            ·
            ${escapeHTML(
              request.component || "Component"
            )}
          </h4>

          <p>
            ${escapeHTML(
              request.location || "Location unavailable"
            )}
          </p>
        </div>

        <div class="dashboard-request-meta">
          <span class="urgency ${getUrgencyClass(
            request.urgency
          )}">
            ${escapeHTML(
              request.urgency || "Normal"
            )}
          </span>

          <span class="request-status">
            ${escapeHTML(
              request.status || "REQUEST CREATED"
            )}
          </span>
        </div>
      `;

      container.appendChild(card);
    });
  }

  /* ---------------------------------------------------------
     Verification queue
     --------------------------------------------------------- */

  function renderVerificationQueue() {
    const container =
      document.querySelector(
        "#verificationQueueList"
      ) ||
      document.querySelector(
        "[data-verification-queue]"
      );

    if (!container) return;

    const queue =
      dashboardData.verificationQueueItems || [];

    container.innerHTML = "";

    if (!queue.length) {
      container.innerHTML = `
        <div class="dashboard-empty">
          Verification queue is clear.
        </div>
      `;
      return;
    }

    queue.forEach((item) => {
      const row = document.createElement("div");

      row.className =
        "verification-queue-item";

      row.innerHTML = `
        <div>
          <strong>
            ${escapeHTML(item.name || "Resource")}
          </strong>

          <p>
            ${escapeHTML(
              item.location || "Location unavailable"
            )}
          </p>
        </div>

        <span class="verification-status">
          ${escapeHTML(
            item.status || "Verification Required"
          )}
        </span>
      `;

      container.appendChild(row);
    });
  }

  /* ---------------------------------------------------------
     Alerts
     --------------------------------------------------------- */

  function renderAlerts() {
    const container =
      document.querySelector("#dashboardAlerts") ||
      document.querySelector("[data-dashboard-alerts]");

    if (!container) return;

    const alerts =
      dashboardData.alerts || [];

    container.innerHTML = "";

    alerts.forEach((alert) => {
      const item = document.createElement("div");

      item.className = `dashboard-alert ${getAlertClass(
        alert.type
      )}`;

      item.innerHTML = `
        <span class="alert-icon">
          ${getAlertIcon(alert.type)}
        </span>

        <div>
          <strong>
            ${escapeHTML(
              alert.title || "Dashboard Alert"
            )}
          </strong>

          <p>
            ${escapeHTML(
              alert.message || ""
            )}
          </p>
        </div>
      `;

      container.appendChild(item);
    });
  }

  /* ---------------------------------------------------------
     Resource trends
     --------------------------------------------------------- */

  function renderResourceTrends() {
    const container =
      document.querySelector("#resourceTrends") ||
      document.querySelector("[data-resource-trends]");

    if (!container) return;

    const trends =
      dashboardData.resourceTrends || [];

    container.innerHTML = "";

    trends.forEach((trend) => {
      const item = document.createElement("div");

      item.className = "trend-item";

      item.innerHTML = `
        <div class="trend-label">
          <span>
            ${escapeHTML(
              trend.label || "Resource"
            )}
          </span>

          <strong>
            ${escapeHTML(
              String(trend.value ?? 0)
            )}
          </strong>
        </div>

        <div class="trend-bar">
          <span
            style="width:${getPercentage(
              trend.value,
              trend.max
            )}%"
          ></span>
        </div>
      `;

      container.appendChild(item);
    });
  }

  /* ---------------------------------------------------------
     Dashboard actions
     --------------------------------------------------------- */

  function setupDashboardActions() {
    const refreshButtons =
      document.querySelectorAll(
        "[data-dashboard-refresh]"
      );

    refreshButtons.forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          button.disabled = true;

          await loadDashboardData();
          renderDashboard();

          button.disabled = false;
        }
      );
    });

    const requestButtons =
      document.querySelectorAll(
        "[data-dashboard-request]"
      );

    requestButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const id =
          button.dataset.dashboardRequest;

        if (!id) return;

        window.location.href =
          `tracking.html?id=${encodeURIComponent(id)}`;
      });
    });
  }

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */

  function setText(selector, value) {
    const element =
      document.querySelector(selector);

    if (element) {
      element.textContent = String(value);
    }
  }

  function getUrgencyClass(urgency) {
    const value = String(
      urgency || ""
    ).toLowerCase();

    if (
      value.includes("critical") ||
      value.includes("emergency")
    ) {
      return "critical";
    }

    if (
      value.includes("high") ||
      value.includes("urgent")
    ) {
      return "high";
    }

    return "normal";
  }

  function getAlertClass(type) {
    const value = String(
      type || ""
    ).toLowerCase();

    if (value === "critical") return "critical";
    if (value === "warning") return "warning";
    if (value === "success") return "success";

    return "info";
  }

  function getAlertIcon(type) {
    const value = String(
      type || ""
    ).toLowerCase();

    if (value === "critical") return "🚨";
    if (value === "warning") return "⚠️";
    if (value === "success") return "✓";

    return "ℹ️";
  }

  function getPercentage(value, max) {
    const numericValue =
      Number(value) || 0;

    const numericMax =
      Number(max) || 100;

    if (numericMax <= 0) return 0;

    return Math.min(
      100,
      Math.max(
        0,
        (numericValue / numericMax) * 100
      )
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

  /* ---------------------------------------------------------
     Prototype fallback data
     --------------------------------------------------------- */

  function getFallbackDashboardData() {
    return {
      stats: {
        emergencyRequests: 12,
        potentialMatches: 27,
        verificationQueue: 5,
        activeCoordination: 8,
        resolvedRequests: 34,
        totalResources: 18
      },

      requests: [
        {
          id: "PR-2026-104821",
          bloodGroup: "O+",
          component: "RBC",
          location: "Lucknow",
          urgency: "Emergency",
          status: "VERIFICATION"
        },
        {
          id: "PR-2026-204713",
          bloodGroup: "B+",
          component: "Platelets",
          location: "Kanpur",
          urgency: "High",
          status: "SEARCHING"
        },
        {
          id: "PR-2026-318420",
          bloodGroup: "A+",
          component: "RBC",
          location: "Prayagraj",
          urgency: "Normal",
          status: "COORDINATION"
        }
      ],

      verificationQueueItems: [
        {
          name: "Demo Blood Centre A",
          location: "Lucknow",
          status: "Verification Required"
        },
        {
          name: "Demo Blood Centre B",
          location: "Kanpur",
          status: "Verification Required"
        }
      ],

      alerts: [
        {
          type: "critical",
          title: "Emergency request requires attention",
          message:
            "A high-priority request is currently awaiting verification."
        },
        {
          type: "warning",
          title: "Resource information may change",
          message:
            "Confirm availability with the authorised blood centre."
        }
      ],

      resourceTrends: [
        {
          label: "O+",
          value: 78,
          max: 100
        },
        {
          label: "A+",
          value: 64,
          max: 100
        },
        {
          label: "B+",
          value: 52,
          max: 100
        },
        {
          label: "AB+",
          value: 31,
          max: 100
        }
      ]
    };
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavDashboard = {
    refresh: async function () {
      await loadDashboardData();
      renderDashboard();
    },

    getData: function () {
      return dashboardData;
    }
  };
})();
