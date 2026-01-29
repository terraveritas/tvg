(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    });
  });

  const navToggle = $("[data-nav-toggle]");
  const mobileMenu = $("[data-mobilemenu]");
  if (navToggle && mobileMenu) {
    const closeMenu = () => {
      navToggle.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (mobileMenu.hidden) return;
      if (!mobileMenu.contains(event.target) && !navToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  const modal = $("#lotModal");
  const openButtons = $$('[data-open-lot-modal]');
  const closeButtons = $$('[data-close-lot-modal]');
  const lotContinue = $("#lotContinue");
  const lotInterest = $("#lotInterest");
  const lotVolume = $("#lotVolume");

  const contactForm = $("#contactForm");
  const contactInterest = $("#interest");
  const contactVolume = $("#volume");
  const contactMessage = $("#message");

  const openModal = (presetInterest) => {
    if (!modal) return;
    if (presetInterest && lotInterest) lotInterest.value = presetInterest;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => lotInterest && lotInterest.focus(), 0);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.interest));
  });
  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  if (lotContinue) {
    lotContinue.addEventListener("click", () => {
      const interest = lotInterest ? lotInterest.value : "Both";
      const volume = lotVolume && lotVolume.value ? String(lotVolume.value) : "";

      if (contactInterest) contactInterest.value = interest;
      if (contactVolume && volume) contactVolume.value = volume;

      if (contactMessage) {
        const lines = [
          "Requesting current lot sheet.",
          `- Interest: ${interest}`,
          volume ? `- Volume: ${volume}` : "- Volume: (add)",
          "- Target specs (moisture, screen, defects, etc.):",
          "- Delivery window:",
          "- Destination / receiving city:"
        ];
        contactMessage.value = lines.join("\n");
      }

      closeModal();
      const contact = $("#contact");
      if (contact) contact.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      setTimeout(() => {
        const nameField = $("#name");
        if (nameField) nameField.focus();
      }, 320);
    });
  }

  const revealEls = $$('[data-reveal]');
  if (revealEls.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  if (contactForm) {
    const statusEl = contactForm.querySelector("[data-form-status]");
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const honeypot = contactForm.querySelector('input[name="companySite"]');

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const endpoint = contactForm.dataset.sheetEndpoint || "";
      if (!endpoint || endpoint.includes("REPLACE_ME")) {
        if (statusEl) {
          statusEl.dataset.state = "error";
          statusEl.textContent = "Form is not connected yet. Replace the Google Apps Script URL to enable submissions.";
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      if (statusEl) {
        statusEl.dataset.state = "";
        statusEl.textContent = "Sending your request...";
      }

      const formData = new FormData(contactForm);
      if (honeypot && honeypot.value.trim()) {
        if (statusEl) {
          statusEl.dataset.state = "success";
          statusEl.textContent = "Thanks! We will reply with a lot sheet shortly.";
        }
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send request";
        }
        return;
      }

      formData.append("page", window.location.href);
      formData.append("submittedAt", new Date().toISOString());

      try {
        await fetch(endpoint, {
          method: "POST",
          body: formData,
          mode: "no-cors"
        });

        if (statusEl) {
          statusEl.dataset.state = "success";
          statusEl.textContent = "Thanks! We will reply with a lot sheet shortly.";
        }
        contactForm.reset();
      } catch (error) {
        if (statusEl) {
          statusEl.dataset.state = "error";
          statusEl.textContent = "Something went wrong. Please email info@terraveritascoffee.com.";
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send request";
        }
      }
    });
  }
})();
