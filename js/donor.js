/* =========================================================
   PRANAV — Donor Network Controller
   File: js/donor.js
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initDonor);

  function initDonor() {
    setupDonorForm();
    setupAvailabilityControls();
    loadSavedDonorPreference();
  }

  /* ---------------------------------------------------------
     Donor registration
     --------------------------------------------------------- */

  function setupDonorForm() {
    const form =
      document.querySelector("#donorForm") ||
      document.querySelector("form[data-donor-form]");

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(form);

      const donor = {
        bloodGroup: getValue(formData, "bloodGroup"),
        city: getValue(formData, "city"),
        district: getValue(formData, "district"),
        availability: getValue(formData, "availability"),
        lastDonation: getValue(formData, "lastDonation"),
        contactPreference: getValue(
          formData,
          "contactPreference"
        ),
        consent: formData.get("consent") === "on",
        registeredAt: new Date().toISOString()
      };

      const validation = validateDonor(donor);

      if (!validation.valid) {
        showMessage(validation.message, "error");
        return;
      }

      saveDonorPreference(donor);

      showMessage(
        "Your donor availability preference has been saved. Final eligibility and suitability are determined by an authorised blood centre.",
        "success"
      );

      form.reset();

      loadSavedDonorPreference();
    });
  }

  /* ---------------------------------------------------------
     Validation
     --------------------------------------------------------- */

  function validateDonor(donor) {
    if (!donor.bloodGroup) {
      return {
        valid: false,
        message: "Please select your blood group."
      };
    }

    if (!donor.city && !donor.district) {
      return {
        valid: false,
        message: "Please enter your city or district."
      };
    }

    if (!donor.availability) {
      return {
        valid: false,
        message: "Please select your availability preference."
      };
    }

    if (!donor.consent) {
      return {
        valid: false,
        message:
          "Please confirm that you understand the donor privacy and verification information."
      };
    }

    return {
      valid: true,
      message: ""
    };
  }

  /* ---------------------------------------------------------
     Availability controls
     --------------------------------------------------------- */

  function setupAvailabilityControls() {
    const controls = document.querySelectorAll(
      "[data-donor-availability]"
    );

    controls.forEach((control) => {
      control.addEventListener("click", function () {
        const value =
          this.dataset.donorAvailability ||
          this.dataset.value ||
          this.value;

        if (!value) return;

        saveAvailability(value);

        controls.forEach((item) => {
          item.classList.remove("active");

          if (
            item.dataset.donorAvailability === value ||
            item.dataset.value === value ||
            item.value === value
          ) {
            item.classList.add("active");
          }
        });

        showMessage(
          "Availability preference updated.",
          "success"
        );
      });
    });
  }

  /* ---------------------------------------------------------
     Save availability preference
     --------------------------------------------------------- */

  function saveAvailability(value) {
    try {
      localStorage.setItem(
        "pranavDonorAvailability",
        String(value)
      );
    } catch (error) {
      console.warn(
        "Unable to save donor availability.",
        error
      );
    }
  }

  /* ---------------------------------------------------------
     Save donor preference
     --------------------------------------------------------- */

  function saveDonorPreference(donor) {
    try {
      /*
       * PRANAV stores only the user's local prototype
       * preference in this demo.
       *
       * It does not publicly expose donor identity,
       * medical eligibility or donation suitability.
       */

      localStorage.setItem(
        "pranavDonorPreference",
        JSON.stringify(donor)
      );

      localStorage.setItem(
        "pranavDonorAvailability",
        donor.availability
      );
    } catch (error) {
      console.warn(
        "Unable to save donor preference.",
        error
      );
    }
  }

  /* ---------------------------------------------------------
     Load saved preference
     --------------------------------------------------------- */

  function loadSavedDonorPreference() {
    let donor = null;

    try {
      const stored = localStorage.getItem(
        "pranavDonorPreference"
      );

      donor = stored ? JSON.parse(stored) : null;
    } catch (error) {
      donor = null;
    }

    if (!donor) return;

    setFieldValue(
      "#donorBloodGroup",
      donor.bloodGroup
    );

    setFieldValue(
      "[name='bloodGroup']",
      donor.bloodGroup
    );

    setFieldValue(
      "#donorCity",
      donor.city
    );

    setFieldValue(
      "[name='city']",
      donor.city
    );

    setFieldValue(
      "#donorDistrict",
      donor.district
    );

    setFieldValue(
      "[name='district']",
      donor.district
    );

    setFieldValue(
      "#availability",
      donor.availability
    );

    setFieldValue(
      "[name='availability']",
      donor.availability
    );
  }

  /* ---------------------------------------------------------
     Field helper
     --------------------------------------------------------- */

  function setFieldValue(selector, value) {
    const field = document.querySelector(selector);

    if (!field || !value) return;

    if (
      field.tagName === "INPUT" &&
      field.type === "radio"
    ) {
      const radio = document.querySelector(
        `${selector}[value="${CSS.escape(value)}"]`
      );

      if (radio) radio.checked = true;
      return;
    }

    field.value = value;
  }

  /* ---------------------------------------------------------
     FormData helper
     --------------------------------------------------------- */

  function getValue(formData, name) {
    const value = formData.get(name);

    return value ? String(value).trim() : "";
  }

  /* ---------------------------------------------------------
     Privacy helper
     --------------------------------------------------------- */

  function hideDonorIdentity(element) {
    if (!element) return;

    element.textContent =
      "Donor identity is private";
  }

  /* ---------------------------------------------------------
     Status message
     --------------------------------------------------------- */

  function showMessage(message, type) {
    let box = document.querySelector(
      ".pranav-donor-message"
    );

    if (!box) {
      box = document.createElement("div");
      box.className = "pranav-donor-message";

      Object.assign(box.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "10000",
        width: "min(92%, 520px)",
        padding: "15px 20px",
        borderRadius: "15px",
        background: "#ffffff",
        color: "#222222",
        boxShadow: "0 14px 40px rgba(0,0,0,.16)",
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
    }, 5000);
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */

  window.PranavDonor = {
    save: saveDonorPreference,

    get: function () {
      try {
        const value = localStorage.getItem(
          "pranavDonorPreference"
        );

        return value ? JSON.parse(value) : null;
      } catch (error) {
        return null;
      }
    },

    getAvailability: function () {
      try {
        return localStorage.getItem(
          "pranavDonorAvailability"
        );
      } catch (error) {
        return null;
      }
    },

    setAvailability: saveAvailability,

    protectIdentity: hideDonorIdentity
  };
})();
