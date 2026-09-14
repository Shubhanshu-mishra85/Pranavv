/* =========================================================
   PRANAV — Global Application Controller
   Connecting People. Supporting Care.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- DOM Ready ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    initializeNavigation();
    initializeMobileMenu();
    initializeActiveNavigation();
    initializeYear();
    initializeButtons();
    initializeGlobalAccessibility();
  });

  /* ---------- Navigation ---------- */

  function initializeNavigation() {
    const navLinks = document.querySelectorAll("[data-nav-link]");

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileMenu();
      });
    });
  }

  /* ---------- Mobile Menu ---------- */

  function initializeMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".mobile-menu");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");

      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      nav.setAttribute("aria-hidden", String(!isOpen));
    });

    document.addEventListener("click", function (event) {
      if (
        nav.classList.contains("open") &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMobileMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });
  }

  function closeMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".mobile-menu");

    if (!toggle || !nav) return;

    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    nav.setAttribute("aria-hidden", "true");
  }

  /* ---------- Active Navigation ---------- */

  function initializeActiveNavigation() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    const links = document.querySelectorAll(
      "a[href], [data-page-link]"
    );

    links.forEach(function (link) {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("http")) {
        return;
      }

      const linkPage = href.split("/").pop().split("?")[0];

      if (
        linkPage === currentPage ||
        (currentPage === "" && linkPage === "index.html")
      ) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- Footer Year ---------- */

  function initializeYear() {
    const yearElements = document.querySelectorAll("[data-year]");
    const year = new Date().getFullYear();

    yearElements.forEach(function (element) {
      element.textContent = year;
    });
  }

  /* ---------- Common Buttons ---------- */

  function initializeButtons() {
    document.querySelectorAll("[data-toast]").forEach(function (button) {
      button.addEventListener("click", function () {
        const message =
          button.getAttribute("data-toast") ||
          "Action completed.";

        showToast(message);
      });
    });

    document.querySelectorAll("[data-copy]").forEach(function (button) {
      button.addEventListener("click", function () {
        const value = button.getAttribute("data-copy");

        if (value) {
          copyToClipboard(value);
        }
      });
    });
  }

  /* ---------- Toast ---------- */

  function showToast(message, type) {
    type = type || "info";

    let container = document.querySelector(".toast-container");

    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";

      Object.assign(container.style, {
        position: "fixed",
        right: "18px",
        bottom: "18px",
        zIndex: "10001",
        display: "grid",
        gap: "9px",
        maxWidth: "min(380px, calc(100vw - 36px))"
      });

      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";

    const icon =
      type === "success"
        ? "✓"
        : type === "error"
        ? "!"
        : "i";

    toast.innerHTML =
      '<span style="' +
      "display:inline-grid;" +
      "place-items:center;" +
      "width:24px;" +
      "height:24px;" +
      "border-radius:50%;" +
      "background:rgba(255,255,255,.65);" +
      "font-weight:800;" +
      '">' +
      escapeHTML(icon) +
      "</span>" +
      '<span style="flex:1;">' +
      escapeHTML(message) +
      "</span>";

    Object.assign(toast.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 14px",
      border: "1px solid rgba(25,55,65,.1)",
      borderRadius: "14px",
      background: "rgba(255,255,255,.95)",
      color: "#26343f",
      boxShadow: "0 18px 45px rgba(30,65,70,.16)",
      fontSize: ".78rem",
      fontWeight: "700"
    });

    if (type === "success") {
      toast.style.borderLeft = "4px solid #22a77a";
    }

    if (type === "error") {
      toast.style.borderLeft = "4px solid #d92d45";
    }

    container.appendChild(toast);

    window.setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "opacity .25s ease, transform .25s ease";

      window.setTimeout(function () {
        toast.remove();

        if (!container.children.length) {
          container.remove();
        }
      }, 300);
    }, 3800);
  }

  /* ---------- Clipboard ---------- */

  async function copyToClipboard(value) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        document.execCommand("copy");
        textarea.remove();
      }

      showToast("Copied successfully.", "success");
    } catch (error) {
      showToast("Unable to copy this text.", "error");
    }
  }

  /* ---------- Local Storage Helpers ---------- */

  function saveData(key, value) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.warn("PRANAV storage error:", error);
      return false;
    }
  }

  function getData(key, fallback) {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.warn("PRANAV storage read error:", error);
      return fallback;
    }
  }

  function removeData(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("PRANAV storage remove error:", error);
    }
  }

  /* ---------- Request ID ---------- */

  function generateRequestId() {
    const year = new Date().getFullYear();

    const random =
      Math.floor(100000 + Math.random() * 900000);

    return "PR-" + year + "-" + random;
  }

  /* ---------- HTML Safety ---------- */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ---------- Global Accessibility ---------- */

  function initializeGlobalAccessibility() {
    const html = document.documentElement;

    html.classList.add("js");

    const noScript = document.querySelector(".no-js");

    if (noScript) {
      noScript.classList.remove("no-js");
    }

    document.querySelectorAll("button").forEach(function (button) {
      if (
        !button.getAttribute("aria-label") &&
        !button.textContent.trim()
      ) {
        button.setAttribute(
          "aria-label",
          "PRANAV action"
        );
      }
    });
  }

  /* ---------- Public API ---------- */

  window.PRANAV = {
    showToast: showToast,
    copyToClipboard: copyToClipboard,
    saveData: saveData,
    getData: getData,
    removeData: removeData,
    generateRequestId: generateRequestId,
    escapeHTML: escapeHTML,
    closeMobileMenu: closeMobileMenu
  };

})();
