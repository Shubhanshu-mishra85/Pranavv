/* =========================================================
   PRANAV — Prescription Intelligence Controller
   File: js/prescription.js
   ========================================================= */

(function () {
  "use strict";

  let currentPrescription = null;

  document.addEventListener(
    "DOMContentLoaded",
    initPrescription
  );

  function initPrescription() {
    setupUpload();
    setupPreview();
    setupAnalyzeButton();
    setupResetButton();
    loadSavedPrescription();
  }

  /* ---------------------------------------------------------
     Upload
     --------------------------------------------------------- */

  function setupUpload() {
    const input =
      document.querySelector("#prescriptionUpload") ||
      document.querySelector(
        "input[type='file'][accept*='image']"
      );

    if (!input) return;

    input.addEventListener("change", function () {
      const file = this.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showMessage(
          "Please select a prescription image.",
          "error"
        );

        this.value = "";
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showMessage(
          "Please choose an image smaller than 10 MB.",
          "error"
        );

        this.value = "";
        return;
      }

      previewImage(file);
      showAnalyzeButton();
    });
  }

  /* ---------------------------------------------------------
     Preview
     --------------------------------------------------------- */

  function setupPreview() {
    const dropZone =
      document.querySelector(
        "[data-prescription-dropzone]"
      );

    if (!dropZone) return;

    ["dragenter", "dragover"].forEach(
      (eventName) => {
        dropZone.addEventListener(
          eventName,
          (event) => {
            event.preventDefault();
            dropZone.classList.add("dragging");
          }
        );
      }
    );

    ["dragleave", "drop"].forEach(
      (eventName) => {
        dropZone.addEventListener(
          eventName,
          (event) => {
            event.preventDefault();
            dropZone.classList.remove(
              "dragging"
            );
          }
        );
      }
    );

    dropZone.addEventListener(
      "drop",
      (event) => {
        const file =
          event.dataTransfer?.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
          showMessage(
            "Please drop a prescription image.",
            "error"
          );
          return;
        }

        previewImage(file);
        showAnalyzeButton();
      }
    );
  }

  function previewImage(file) {
    const preview =
      document.querySelector(
        "#prescriptionPreview"
      ) ||
      document.querySelector(
        "[data-prescription-preview]"
      );

    if (!preview) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      if (
        preview.tagName === "IMG"
      ) {
        preview.src = event.target.result;
        preview.hidden = false;
      } else {
        preview.innerHTML = `
          <img
            src="${event.target.result}"
            alt="Prescription preview"
          >
        `;
      }

      preview.classList.add("visible");
    };

    reader.readAsDataURL(file);
  }

  /* ---------------------------------------------------------
     Analyze button
     --------------------------------------------------------- */

  function setupAnalyzeButton() {
    const button =
      document.querySelector(
        "#analyzePrescriptionBtn"
      ) ||
      document.querySelector(
        "[data-analyze-prescription]"
      );

    if (!button) return;

    button.addEventListener(
      "click",
      analyzePrescription
    );
  }

  async function analyzePrescription() {
    const input =
      document.querySelector(
        "#prescriptionUpload"
      ) ||
      document.querySelector(
        "input[type='file'][accept*='image']"
      );

    const file = input?.files?.[0];

    if (!file) {
      showMessage(
        "Please upload a prescription image first.",
        "error"
      );
      return;
    }

    setLoadingState(true);

    /*
     * Front-end prototype:
     * Real OCR/AI processing should happen through
     * a secure backend/API.
     *
     * Never put private API keys in this file.
     */

    try {
      const result =
        await performOCR(file);

      currentPrescription = normalizeResult(
        result
      );

      savePrescription(
        currentPrescription
      );

      renderPrescription(
        currentPrescription
      );

      showMessage(
        "Prescription details extracted. Please verify them against the original prescription and medicine packaging.",
        "success"
      );
    } catch (error) {
      console.error(
        "Prescription analysis error:",
        error
      );

      showMessage(
        "The prescription could not be read reliably. Please verify it with a doctor or pharmacist.",
        "error"
      );
    } finally {
      setLoadingState(false);
    }
  }

  /* ---------------------------------------------------------
     OCR placeholder
     --------------------------------------------------------- */

  async function performOCR(file) {
    /*
     * This is intentionally a safe prototype.
     *
     * The browser does not independently make clinical
     * decisions. A production implementation should send
     * the image to a secure backend OCR service.
     */

    return {
      patientAge: "",
      patientName: "",
      medicines: [],
      notes:
        "OCR backend is not connected in this prototype."
    };
  }

  /* ---------------------------------------------------------
     Normalize extracted result
     --------------------------------------------------------- */

  function normalizeResult(data) {
    const result = {
      patientName:
        data?.patientName || "",

      patientAge:
        data?.patientAge || "",

      medicines: [],

      notes:
        data?.notes || "",

      analyzedAt:
        new Date().toISOString()
    };

    if (Array.isArray(data?.medicines)) {
      result.medicines =
        data.medicines.map(
          normalizeMedicine
        );
    }

    return result;
  }

  function normalizeMedicine(medicine) {
    return {
      name:
        medicine?.name || "",

      strength:
        medicine?.strength || "",

      form:
        medicine?.form || "",

      doseAsWritten:
        medicine?.doseAsWritten || "",

      frequencyAsWritten:
        medicine?.frequencyAsWritten || "",

      durationAsWritten:
        medicine?.durationAsWritten || "",

      manufacturingDate:
        medicine?.manufacturingDate || "",

      expiryDate:
        medicine?.expiryDate || "",

      batchNumber:
        medicine?.batchNumber || "",

      warnings:
        Array.isArray(medicine?.warnings)
          ? medicine.warnings
          : []
    };
  }

  /* ---------------------------------------------------------
     Render result
     --------------------------------------------------------- */

  function renderPrescription(data) {
    const container =
      document.querySelector(
        "#prescriptionResults"
      ) ||
      document.querySelector(
        "[data-prescription-results]"
      );

    if (!container) return;

    container.hidden = false;

    container.innerHTML = `
      <div class="prescription-summary">
        <h3>Prescription Summary</h3>

        <p>
          <strong>Patient:</strong>
          ${escapeHTML(
            data.patientName || "Not available"
          )}
        </p>

        <p>
          <strong>Age written on prescription:</strong>
          ${escapeHTML(
            data.patientAge || "Not available"
          )}
        </p>
      </div>

      <div class="medication-safety-note">
        <strong>Medication safety notice</strong>

        <p>
          PRANAV only organizes information visible on
          the prescription. It does not calculate an
          age-based dose, prescribe medicine, or change
          the doctor's instructions.
        </p>

        <p>
          Verify the medicine name, strength, dose,
          manufacturing date and expiry date against
          the original prescription and packaging.
        </p>
      </div>

      <div class="prescription-medicine-list">
        ${renderMedicines(data.medicines)}
      </div>
    `;
  }

  function renderMedicines(medicines) {
    if (!medicines.length) {
      return `
        <div class="prescription-empty">
          <h4>No medicine details were reliably extracted.</h4>

          <p>
            Please confirm the prescription directly
            with the prescribing doctor or pharmacist.
          </p>
        </div>
      `;
    }

    return medicines
      .map(
        (medicine, index) => `
          <article class="prescription-medicine-card">

            <div class="medicine-card-header">
              <span>
                Medicine ${index + 1}
              </span>
            </div>

            <h4>
              ${escapeHTML(
                medicine.name ||
                  "Medicine name unclear"
              )}
            </h4>

            <div class="medicine-info-grid">

              <div>
                <small>Strength</small>
                <strong>
                  ${escapeHTML(
                    medicine.strength ||
                      "Not clearly visible"
                  )}
                </strong>
              </div>

              <div>
                <small>Form</small>
                <strong>
                  ${escapeHTML(
                    medicine.form ||
                      "Not available"
                  )}
                </strong>
              </div>

              <div>
                <small>Dose as written</small>
                <strong>
                  ${escapeHTML(
                    medicine.doseAsWritten ||
                      "Not specified"
                  )}
                </strong>
              </div>

              <div>
                <small>Frequency as written</small>
                <strong>
                  ${escapeHTML(
                    medicine.frequencyAsWritten ||
                      "Not specified"
                  )}
                </strong>
              </div>

              <div>
                <small>Duration as written</small>
                <strong>
                  ${escapeHTML(
                    medicine.durationAsWritten ||
                      "Not specified"
                  )}
                </strong>
              </div>

              <div>
                <small>Batch number</small>
                <strong>
                  ${escapeHTML(
                    medicine.batchNumber ||
                      "Not available"
                  )}
                </strong>
              </div>

              <div>
                <small>Manufacturing date</small>
                <strong>
                  ${escapeHTML(
                    medicine.manufacturingDate ||
                      "Not available"
                  )}
                </strong>
              </div>

              <div>
                <small>Expiry date</small>
                <strong>
                  ${escapeHTML(
                    medicine.expiryDate ||
                      "Not available"
                  )}
                </strong>
              </div>

            </div>

            ${
              medicine.warnings?.length
                ? `
                  <div class="medicine-warnings">
                    <strong>Needs verification</strong>

                    <ul>
                      ${medicine.warnings
                        .map(
                          (warning) =>
                            `<li>${escapeHTML(
                              warning
                            )}</li>`
                        )
                        .join("")}
                    </ul>
                  </div>
                `
                : ""
            }

          </article>
        `
      )
      .join("");
  }

  /* ---------------------------------------------------------
     Reset
     --------------------------------------------------------- */

  function setupResetButton() {
    const button =
      document.querySelector(
        "#resetPrescriptionBtn"
      ) ||
      document.querySelector(
        "[data-reset-prescription]"
      );

    if (!button) return;

    button.addEventListener(
      "click",
      resetPrescription
    );
  }

  function resetPrescription() {
    currentPrescription = null;

    try {
      localStorage.removeItem(
        "pranavPrescription"
      );
    } catch (error) {
      console.warn(
        "Unable to clear saved prescription."
      );
    }

    const input =
      document.querySelector(
        "#prescriptionUpload"
      );

    if (input) {
      input.value = "";
    }

    const preview =
      document.querySelector(
        "#prescriptionPreview"
      ) ||
      document.querySelector(
        "[data-prescription-preview]"
      );

    if (preview) {
      if (preview.tagName === "IMG") {
        preview.removeAttribute("src");
        preview.hidden = true;
      } else {
        preview.innerHTML = "";
      }

      preview.classList.remove("visible");
    }

    const results =
      document.querySelector(
        "#prescriptionResults"
      ) ||
      document.querySelector(
        "[data-prescription-results]"
      );

    if (results) {
      results.hidden = true;
      results.innerHTML = "";
    }

    hideAnalyzeButton();
  }

  /* ---------------------------------------------------------
     Saved prescription
     --------------------------------------------------------- */

  function savePrescription(data) {
    try {
      localStorage.setItem(
        "pranavPrescription",
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn(
        "Unable to save prescription result."
      );
    }
  }

  function loadSavedPrescription() {
    try {
      const stored =
        localStorage.getItem(
          "pranavPrescription"
        );

      if (!stored) return;

      const data = JSON.parse(stored);

      if (!data || typeof data !== "object") {
        return;
      }

      currentPrescription = data;

      renderPrescription(data);
    } catch (error) {
      console.warn(
        "Unable to load saved prescription."
      );
    }
  }

  /* ---------------------------------------------------------
     Loading state
     --------------------------------------------------------- */

  function setLoadingState(isLoading) {
    const button =
      document.querySelector(
        "#analyzePrescriptionBtn"
      ) ||
      document.querySelector(
        "[data-analyze-prescription]"
      );

    if (!button) return;

    button.disabled = isLoading;

    if (isLoading) {
      button.dataset.originalText =
        button.textContent;

      button.textContent =
        "Analysing prescription...";
    } else {
      button.textContent =
        button.dataset.originalText ||
        "Analyse Prescription";
    }
  }

  function showAnalyzeButton() {
    const button =
      document.querySelector(
        "#analyzePrescriptionBtn"
      ) ||
      document.querySelector(
        "[data-analyze-prescription]"
      );

    if (button) {
      button.hidden = false;
    }
  }

  function hideAnalyzeButton() {
    const button =
      document.querySelector(
        "#analyzePrescriptionBtn"
      ) ||
      document.querySelector(
        "[data-analyze-prescription]"
      );

    if (button) {
      button.hidden = true;
    }
  }

  /* ---------------------------------------------------------
     Message
     --------------------------------------------------------- */

  function showMessage(message, type) {
    let box = document.querySelector(
      ".pranav-prescription-message"
    );

    if (!box) {
      box = document.createElement("div");

      box.className =
        "pranav-prescription-message";

      Object.assign(box.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "10000",
        width: "min(92%, 560px)",
        padding: "15px 20px",
        borderRadius: "15px",
        background: "#ffffff",
        color: "#222222",
        boxShadow:
          "0 14px 40px rgba(0,0,0,.16)",
        textAlign: "center",
        fontSize: "14px",
        lineHeight: "1.5"
      });

      document.body.appendChild(box);
    }

    box.textContent = message;

    box.style.border =
      type === "error"
        ? "1px solid #dc3545"
        : "1px solid #198754";

    setTimeout(() => {
      if (box) {
        box.remove();
      }
    }, 5000);
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

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavPrescription = {
    analyze: analyzePrescription,

    getCurrent: function () {
      return currentPrescription;
    },

    reset: resetPrescription,

    render: renderPrescription
  };
})();
