/* =========================================================
   PRANAV — Medicine Information Controller
   File: js/medicine.js
   ========================================================= */

(function () {
  "use strict";

  let prescription = null;

  document.addEventListener(
    "DOMContentLoaded",
    initMedicine
  );

  function initMedicine() {
    loadPrescription();
    setupSearch();
    setupRefresh();
    renderMedicinePage();
  }

  /* ---------------------------------------------------------
     Load prescription data
     --------------------------------------------------------- */

  function loadPrescription() {
    try {
      const stored =
        localStorage.getItem(
          "pranavPrescription"
        );

      if (!stored) {
        prescription = null;
        return;
      }

      const data = JSON.parse(stored);

      if (
        !data ||
        typeof data !== "object"
      ) {
        prescription = null;
        return;
      }

      prescription = data;
    } catch (error) {
      console.warn(
        "Unable to load prescription data."
      );

      prescription = null;
    }
  }

  /* ---------------------------------------------------------
     Render page
     --------------------------------------------------------- */

  function renderMedicinePage() {
    const medicines =
      prescription?.medicines;

    if (
      !Array.isArray(medicines) ||
      medicines.length === 0
    ) {
      renderEmptyState();
      return;
    }

    renderPatientInfo();
    renderMedicines(medicines);
  }

  /* ---------------------------------------------------------
     Patient information
     --------------------------------------------------------- */

  function renderPatientInfo() {
    setText(
      "#medicinePatientName",
      prescription.patientName ||
        "Not available"
    );

    setText(
      "#medicinePatientAge",
      prescription.patientAge ||
        "Not available"
    );

    setText(
      "#medicineAnalyzedAt",
      prescription.analyzedAt
        ? formatDate(
            prescription.analyzedAt
          )
        : "Not available"
    );
  }

  /* ---------------------------------------------------------
     Medicine list
     --------------------------------------------------------- */

  function renderMedicines(medicines) {
    const container =
      document.querySelector(
        "#medicineList"
      ) ||
      document.querySelector(
        "[data-medicine-list]"
      );

    if (!container) return;

    container.innerHTML = "";

    medicines.forEach(
      (medicine, index) => {
        container.appendChild(
          createMedicineCard(
            medicine,
            index
          )
        );
      }
    );
  }

  /* ---------------------------------------------------------
     Medicine card
     --------------------------------------------------------- */

  function createMedicineCard(
    medicine,
    index
  ) {
    const card =
      document.createElement("article");

    card.className =
      "medicine-information-card";

    const expiryStatus =
      getExpiryStatus(
        medicine.expiryDate
      );

    const verificationRequired =
      hasIncompleteInformation(
        medicine
      );

    card.innerHTML = `
      <div class="medicine-header">

        <div>
          <span class="medicine-number">
            Medicine ${index + 1}
          </span>

          <h3>
            ${escapeHTML(
              medicine.name ||
                "Medicine name unclear"
            )}
          </h3>
        </div>

        <span class="medicine-status ${expiryStatus.className}">
          ${escapeHTML(
            expiryStatus.label
          )}
        </span>

      </div>

      <div class="medicine-grid">

        ${infoItem(
          "Strength",
          medicine.strength ||
            "Not clearly visible"
        )}

        ${infoItem(
          "Form",
          medicine.form ||
            "Not available"
        )}

        ${infoItem(
          "Dose as written",
          medicine.doseAsWritten ||
            "Not specified"
        )}

        ${infoItem(
          "Frequency as written",
          medicine.frequencyAsWritten ||
            "Not specified"
        )}

        ${infoItem(
          "Duration as written",
          medicine.durationAsWritten ||
            "Not specified"
        )}

        ${infoItem(
          "Batch Number",
          medicine.batchNumber ||
            "Not available"
        )}

        ${infoItem(
          "Manufacturing Date",
          medicine.manufacturingDate ||
            "Not available"
        )}

        ${infoItem(
          "Expiry Date",
          medicine.expiryDate ||
            "Not available"
        )}

      </div>

      ${
        verificationRequired
          ? `
            <div class="medicine-verification-alert">
              <strong>
                ⚠ Verification required
              </strong>

              <p>
                Some information is missing or unclear.
                Verify the medicine and instructions
                with the original prescription,
                medicine packaging, doctor or pharmacist.
              </p>
            </div>
          `
          : ""
      }

      <div class="medicine-safety-box">
        <strong>PRANAV Medication Safety</strong>

        <p>
          The information above reflects what was
          extracted or written on the prescription.
          PRANAV does not independently calculate,
          increase, decrease or prescribe a medicine dose.
        </p>
      </div>
    `;

    return card;
  }

  /* ---------------------------------------------------------
     Information item
     --------------------------------------------------------- */

  function infoItem(label, value) {
    return `
      <div class="medicine-info-item">

        <span>
          ${escapeHTML(label)}
        </span>

        <strong>
          ${escapeHTML(value)}
        </strong>

      </div>
    `;
  }

  /* ---------------------------------------------------------
     Expiry status
     --------------------------------------------------------- */

  function getExpiryStatus(expiryDate) {
    if (!expiryDate) {
      return {
        label: "Expiry not verified",
        className: "unknown"
      };
    }

    const parsed =
      parseDate(expiryDate);

    if (!parsed) {
      return {
        label: "Expiry needs verification",
        className: "unknown"
      };
    }

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    parsed.setHours(
      0,
      0,
      0,
      0
    );

    if (parsed < today) {
      return {
        label: "Expired",
        className: "expired"
      };
    }

    return {
      label: "Expiry date available",
      className: "valid"
    };
  }

  /* ---------------------------------------------------------
     Check incomplete information
     --------------------------------------------------------- */

  function hasIncompleteInformation(
    medicine
  ) {
    const requiredFields = [
      medicine.name,
      medicine.strength,
      medicine.doseAsWritten
    ];

    return requiredFields.some(
      (field) =>
        !field ||
        String(field).trim() === ""
    );
  }

  /* ---------------------------------------------------------
     Date parser
     --------------------------------------------------------- */

  function parseDate(value) {
    if (!value) return null;

    const text =
      String(value).trim();

    /*
     * Supports common formats:
     * YYYY-MM-DD
     * DD-MM-YYYY
     * DD/MM/YYYY
     * MM/YYYY
     */

    let match =
      text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/
      );

    if (match) {
      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      );
    }

    match =
      text.match(
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
      );

    if (match) {
      return new Date(
        Number(match[3]),
        Number(match[2]) - 1,
        Number(match[1])
      );
    }

    match =
      text.match(
        /^(\d{1,2})[\/-](\d{4})$/
      );

    if (match) {
      return new Date(
        Number(match[2]),
        Number(match[1]),
        0
      );
    }

    const parsed =
      new Date(text);

    return Number.isNaN(
      parsed.getTime()
    )
      ? null
      : parsed;
  }

  /* ---------------------------------------------------------
     Search medicine
     --------------------------------------------------------- */

  function setupSearch() {
    const input =
      document.querySelector(
        "#medicineSearch"
      );

    if (!input) return;

    input.addEventListener(
      "input",
      function () {
        const query =
          this.value
            .toLowerCase()
            .trim();

        const medicines =
          prescription?.medicines;

        if (
          !Array.isArray(medicines)
        ) {
          return;
        }

        const filtered =
          medicines.filter(
            (medicine) => {
              const text = [
                medicine.name,
                medicine.strength,
                medicine.form
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

              return text.includes(query);
            }
          );

        renderMedicines(filtered);
      }
    );
  }

  /* ---------------------------------------------------------
     Refresh
     --------------------------------------------------------- */

  function setupRefresh() {
    const button =
      document.querySelector(
        "[data-refresh-medicine]"
      ) ||
      document.querySelector(
        "#refreshMedicineBtn"
      );

    if (!button) return;

    button.addEventListener(
      "click",
      function () {
        loadPrescription();
        renderMedicinePage();
      }
    );
  }

  /* ---------------------------------------------------------
     Empty state
     --------------------------------------------------------- */

  function renderEmptyState() {
    const container =
      document.querySelector(
        "#medicineList"
      ) ||
      document.querySelector(
        "[data-medicine-list]"
      );

    if (!container) return;

    container.innerHTML = `
      <div class="medicine-empty-state">

        <div class="empty-icon">
          💊
        </div>

        <h3>
          No prescription information available
        </h3>

        <p>
          Upload and analyse a prescription first,
          or confirm the medication information directly
          with the prescribing doctor or pharmacist.
        </p>

        <a
          href="prescription.html"
          class="primary-btn"
        >
          Analyse Prescription
        </a>

      </div>
    `;
  }

  /* ---------------------------------------------------------
     Set text
     --------------------------------------------------------- */

  function setText(
    selector,
    value
  ) {
    const element =
      document.querySelector(
        selector
      );

    if (element) {
      element.textContent =
        String(value);
    }
  }

  /* ---------------------------------------------------------
     Date formatter
     --------------------------------------------------------- */

  function formatDate(value) {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not available";
    }

    return date.toLocaleString(
      [],
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  /* ---------------------------------------------------------
     Safe HTML
     --------------------------------------------------------- */

  function escapeHTML(value) {
    return String(value)
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavMedicine = {

    getPrescription:
      function () {
        return prescription;
      },

    getMedicines:
      function () {
        return Array.isArray(
          prescription?.medicines
        )
          ? [
              ...prescription.medicines
            ]
          : [];
      },

    refresh:
      function () {
        loadPrescription();
        renderMedicinePage();
      },

    checkExpiry:
      getExpiryStatus
  };
})();
