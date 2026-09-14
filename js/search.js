/* =========================================================
   PRANAV — Blood Resource Search Controller
   File: js/search.js
   ========================================================= */

(function () {
  "use strict";

  const DATA_FILE = "data/blood-centres.json";

  let resources = [];

  document.addEventListener("DOMContentLoaded", initSearch);

  async function initSearch() {
    await loadResources();
    setupSearchForm();
    setupQuickFilters();
    renderResources(resources);
  }

  /* ---------------------------------------------------------
     Load resource data
     --------------------------------------------------------- */

  async function loadResources() {
    try {
      const response = await fetch(DATA_FILE, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Unable to load resource data.");
      }

      const data = await response.json();

      resources = Array.isArray(data)
        ? data
        : Array.isArray(data.bloodCentres)
        ? data.bloodCentres
        : [];

    } catch (error) {
      console.warn(
        "PRANAV resource data could not be loaded.",
        error
      );

      resources = getFallbackResources();
    }
  }

  /* ---------------------------------------------------------
     Search form
     --------------------------------------------------------- */

  function setupSearchForm() {
    const form =
      document.querySelector("#bloodSearchForm") ||
      document.querySelector("form[data-search-form]");

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(form);

      const filters = {
        bloodGroup: getValue(formData, "bloodGroup"),
        component: getValue(formData, "component"),
        city: getValue(formData, "city"),
        district: getValue(formData, "district"),
        resourceType: getValue(
          formData,
          "resourceType"
        ),
        verification: getValue(
          formData,
          "verification"
        )
      };

      searchResources(filters);
    });
  }

  /* ---------------------------------------------------------
     Quick filter buttons
     --------------------------------------------------------- */

  function setupQuickFilters() {
    const buttons = document.querySelectorAll(
      "[data-search-filter]"
    );

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const type = this.dataset.searchFilter;
        const value = this.dataset.value || "";

        const filters = {};

        if (type === "bloodGroup") {
          filters.bloodGroup = value;
        }

        if (type === "component") {
          filters.component = value;
        }

        if (type === "resourceType") {
          filters.resourceType = value;
        }

        searchResources(filters);
      });
    });
  }

  /* ---------------------------------------------------------
     Search resources
     --------------------------------------------------------- */

  function searchResources(filters = {}) {
    const results = resources.filter((resource) => {
      return matchesFilters(resource, filters);
    });

    renderResources(results);
    updateResultCount(results.length);

    return results;
  }

  /* ---------------------------------------------------------
     Filter matching
     --------------------------------------------------------- */

  function matchesFilters(resource, filters) {
    if (
      filters.bloodGroup &&
      !matchesText(
        resource.bloodGroup,
        filters.bloodGroup
      )
    ) {
      return false;
    }

    if (
      filters.component &&
      !matchesText(
        resource.component,
        filters.component
      )
    ) {
      return false;
    }

    if (
      filters.city &&
      !matchesText(resource.city, filters.city)
    ) {
      return false;
    }

    if (
      filters.district &&
      !matchesText(
        resource.district,
        filters.district
      )
    ) {
      return false;
    }

    if (
      filters.resourceType &&
      !matchesText(
        resource.resourceType,
        filters.resourceType
      )
    ) {
      return false;
    }

    if (
      filters.verification &&
      !matchesText(
        resource.verificationStatus,
        filters.verification
      )
    ) {
      return false;
    }

    return true;
  }

  /* ---------------------------------------------------------
     Text matching
     --------------------------------------------------------- */

  function matchesText(value, search) {
    if (!value || !search) return false;

    const source = String(value)
      .toLowerCase()
      .trim();

    const target = String(search)
      .toLowerCase()
      .trim();

    return source.includes(target);
  }

  /* ---------------------------------------------------------
     Render results
     --------------------------------------------------------- */

  function renderResources(results) {
    const container =
      document.querySelector("#bloodResults") ||
      document.querySelector(".blood-results") ||
      document.querySelector("[data-blood-results]");

    if (!container) return;

    container.innerHTML = "";

    if (!results.length) {
      renderEmptyState(container);
      return;
    }

    results.forEach((resource) => {
      container.appendChild(
        createResourceCard(resource)
      );
    });
  }

  /* ---------------------------------------------------------
     Resource card
     --------------------------------------------------------- */

  function createResourceCard(resource) {
    const card = document.createElement("article");

    card.className = "blood-resource-card";

    const name =
      resource.name ||
      resource.centreName ||
      resource.bloodCentre ||
      "Blood Resource";

    const location = [
      resource.city,
      resource.district
    ]
      .filter(Boolean)
      .join(", ");

    const verification =
      resource.verificationStatus ||
      "Verification Required";

    const component =
      resource.component ||
      "Blood component information unavailable";

    const bloodGroup =
      resource.bloodGroup ||
      "Group information unavailable";

    const updated =
      resource.lastUpdated ||
      "Update time unavailable";

    const distance =
      resource.distance !== undefined
        ? `${resource.distance} km`
        : "Distance unavailable";

    card.innerHTML = `
      <div class="resource-card-top">
        <span class="resource-type">
          ${escapeHTML(
            resource.resourceType ||
              "Potential Resource"
          )}
        </span>

        <span class="verification-badge">
          ${escapeHTML(verification)}
        </span>
      </div>

      <h3>${escapeHTML(name)}</h3>

      <p class="resource-location">
        📍 ${escapeHTML(location || "Location unavailable")}
      </p>

      <div class="resource-details">
        <div>
          <strong>Blood Group</strong>
          <span>${escapeHTML(bloodGroup)}</span>
        </div>

        <div>
          <strong>Component</strong>
          <span>${escapeHTML(component)}</span>
        </div>

        <div>
          <strong>Distance</strong>
          <span>${escapeHTML(distance)}</span>
        </div>

        <div>
          <strong>Last Updated</strong>
          <span>${escapeHTML(updated)}</span>
        </div>
      </div>

      <div class="resource-notice">
        Potential resource only. Availability may change.
        Confirm with the authorised blood centre/facility
        before relying on this information.
      </div>

      <div class="resource-actions">
        ${createCallButton(resource)}
        ${createNavigateButton(resource)}
        ${createDetailsButton(resource)}
      </div>
    `;

    return card;
  }

  /* ---------------------------------------------------------
     Call button
     --------------------------------------------------------- */

  function createCallButton(resource) {
    const phone =
      resource.phone ||
      resource.contact ||
      "";

    if (!phone) {
      return `
        <button
          type="button"
          class="resource-btn disabled"
          disabled
        >
          📞 Call
        </button>
      `;
    }

    return `
      <a
        class="resource-btn"
        href="tel:${escapeAttribute(phone)}"
        aria-label="Call ${escapeAttribute(
          resource.name || "blood centre"
        )}"
      >
        📞 Call
      </a>
    `;
  }

  /* ---------------------------------------------------------
     Navigate button
     --------------------------------------------------------- */

  function createNavigateButton(resource) {
    const query = [
      resource.name,
      resource.address,
      resource.city,
      resource.district
    ]
      .filter(Boolean)
      .join(", ");

    if (!query) {
      return `
        <button
          type="button"
          class="resource-btn disabled"
          disabled
        >
          🧭 Navigate
        </button>
      `;
    }

    const mapUrl =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(query);

    return `
      <a
        class="resource-btn"
        href="${escapeAttribute(mapUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        🧭 Navigate
      </a>
    `;
  }

  /* ---------------------------------------------------------
     Details button
     --------------------------------------------------------- */

  function createDetailsButton(resource) {
    return `
      <button
        type="button"
        class="resource-btn details-btn"
        data-resource-details
      >
        ℹ️ Details
      </button>
    `;
  }

  /* ---------------------------------------------------------
     Empty state
     --------------------------------------------------------- */

  function renderEmptyState(container) {
    container.innerHTML = `
      <div class="search-empty-state">
        <div class="empty-icon">🩸</div>

        <h3>No potential resources found</h3>

        <p>
          Try another blood group, component, city or district.
          Availability information should always be confirmed
          with an authorised blood centre.
        </p>
      </div>
    `;
  }

  /* ---------------------------------------------------------
     Result count
     --------------------------------------------------------- */

  function updateResultCount(count) {
    const elements = document.querySelectorAll(
      "#resultCount, .result-count, [data-result-count]"
    );

    elements.forEach((element) => {
      element.textContent = `${count} potential resource${
        count === 1 ? "" : "s"
      } found`;
    });
  }

  /* ---------------------------------------------------------
     Form value
     --------------------------------------------------------- */

  function getValue(formData, name) {
    const value = formData.get(name);

    return value ? String(value).trim() : "";
  }

  /* ---------------------------------------------------------
     Safe HTML
     --------------------------------------------------------- */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHTML(value);
  }

  /* ---------------------------------------------------------
     Demo fallback data
     --------------------------------------------------------- */

  function getFallbackResources() {
    return [
      {
        id: "DEMO-001",
        name: "Demo Blood Centre A",
        resourceType: "Blood Centre",
        bloodGroup: "O+",
        component: "Whole Blood",
        city: "Lucknow",
        district: "Lucknow",
        distance: 3.2,
        verificationStatus: "Demo Data",
        lastUpdated: "Prototype",
        phone: ""
      },
      {
        id: "DEMO-002",
        name: "Demo Blood Centre B",
        resourceType: "Blood Centre",
        bloodGroup: "A+",
        component: "RBC",
        city: "Lucknow",
        district: "Lucknow",
        distance: 6.8,
        verificationStatus: "Demo Data",
        lastUpdated: "Prototype",
        phone: ""
      },
      {
        id: "DEMO-003",
        name: "Demo Resource C",
        resourceType: "Potential Resource",
        bloodGroup: "B+",
        component: "Platelets",
        city: "Kanpur",
        district: "Kanpur Nagar",
        distance: 78,
        verificationStatus: "Verification Required",
        lastUpdated: "Prototype",
        phone: ""
      }
    ];
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavSearch = {
    search: searchResources,

    getResources: function () {
      return [...resources];
    },

    reload: loadResources
  };
})();
