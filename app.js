(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const topbar = $("[data-topbar]");

  const scrollToHash = (hash) => {
    if (!hash || hash.length < 2) return;
    const target = $(hash);
    if (!target) return;
    const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - topbarHeight - 20;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  };

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = $(href);
      if (!target) return;
      event.preventDefault();
      scrollToHash(href);
    });
  });

  if (topbar) {
    const syncTopbar = () => {
      topbar.dataset.scrolled = window.scrollY > 10 ? "true" : "false";
    };

    syncTopbar();
    document.addEventListener("scroll", syncTopbar, { passive: true });
  }

  const navToggle = $("[data-nav-toggle]");
  const mobileMenu = $("[data-mobilemenu]");
  const submissionFlash = $("#submissionFlash");
  const flashCloseButtons = $$("[data-close-flash]");

  let flashTimer = 0;

  const closeFlash = () => {
    if (!submissionFlash) return;
    submissionFlash.classList.add("hidden");
    if (flashTimer) {
      window.clearTimeout(flashTimer);
      flashTimer = 0;
    }
  };

  const showFlash = () => {
    if (!submissionFlash) return;
    submissionFlash.classList.remove("hidden");
    if (flashTimer) window.clearTimeout(flashTimer);
    flashTimer = window.setTimeout(closeFlash, prefersReducedMotion ? 3200 : 4200);
  };

  flashCloseButtons.forEach((button) => button.addEventListener("click", closeFlash));

  const url = new URL(window.location.href);
  if (url.searchParams.get("submitted") === "1") {
    showFlash();
    url.searchParams.delete("submitted");
    const cleanUrl = `${url.pathname}${url.search ? url.search : ""}${url.hash ? url.hash : ""}`;
    window.history.replaceState({}, "", cleanUrl || "/");
  }

  if (navToggle && mobileMenu) {
    const closeMenu = () => {
      navToggle.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
      document.body.classList.remove("menu-open");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
      document.body.classList.toggle("menu-open", !isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("click", (event) => {
      if (mobileMenu.hidden) return;
      if (!mobileMenu.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
    });
  }

  const modal = $("#lotModal");
  const openButtons = $$("[data-open-lot-modal]");
  const closeButtons = $$("[data-close-lot-modal]");
  const lotInterest = $("#lotInterest");
  const lotVolume = $("#lotVolume");
  const lotContinue = $("#lotContinue");

  const contactForm = $("#contactForm");
  const contactInterest = $("#interest");
  const contactVolume = $("#volume");
  const contactMessage = $("#message");
  const entryPoint = $("#entryPoint");
  const sourcePage = $("#sourcePage");

  if (sourcePage) sourcePage.value = window.location.href;

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

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.interest));
  });

  closeButtons.forEach((button) => button.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) closeModal();
  });

  if (lotContinue) {
    lotContinue.addEventListener("click", () => {
      const interest = lotInterest ? lotInterest.value : "Both";
      const volume = lotVolume && lotVolume.value ? lotVolume.value.trim() : "";

      if (contactInterest) contactInterest.value = interest;
      if (contactVolume && volume) contactVolume.value = volume;

      if (entryPoint && contactForm) {
        entryPoint.value = contactForm.dataset.entryPointModal || "Lot sheet modal";
      }

      if (contactMessage) {
        contactMessage.value = [
          "Requesting current lots.",
          `- Interest: ${interest}`,
          volume ? `- Volume: ${volume}` : "- Volume: (add)",
          "- Target specs:",
          "- Delivery window:",
          "- Destination:"
        ].join("\n");
      }

      closeModal();
      scrollToHash("#contact");

      setTimeout(() => {
        const nameField = $("#name");
        if (nameField) nameField.focus();
      }, prefersReducedMotion ? 0 : 360);
    });
  }

  const revealElements = $$("[data-reveal]");
  if (revealElements.length) {
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.18 }
      );

      revealElements.forEach((element) => observer.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    }
  }

  if (contactForm) {
    const statusEl = contactForm.querySelector("[data-form-status]");
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const endpoint = contactForm.dataset.sheetEndpoint || contactForm.getAttribute("action") || "";
    const honeypot = contactForm.querySelector('input[name="companySite"]');
    const defaultEntryPoint = contactForm.dataset.entryPointDefault || "Contact section";
    const defaultSubmitLabel = submitBtn ? submitBtn.textContent : "Send request";

    if (entryPoint && !entryPoint.value) entryPoint.value = defaultEntryPoint;

    const successUrl = `${window.location.pathname || "index.html"}?submitted=1`;

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (sourcePage) sourcePage.value = window.location.href;
      if (entryPoint && !entryPoint.value) entryPoint.value = defaultEntryPoint;

      if (!endpoint) {
        if (statusEl) {
          statusEl.dataset.state = "error";
          statusEl.textContent = "The form is not connected right now. Please email info@terraveritascoffee.com.";
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      if (statusEl) {
        statusEl.dataset.state = "info";
        statusEl.textContent = "Sending your request...";
      }

      const formData = new FormData(contactForm);

      if (honeypot && honeypot.value.trim()) {
        window.location.href = successUrl;
        return;
      }

      try {
        await fetch(endpoint, {
          method: "POST",
          body: formData,
          mode: "no-cors"
        });

        if (statusEl) {
          statusEl.dataset.state = "success";
          statusEl.textContent = "Thanks. Your request is on its way.";
        }

        contactForm.reset();
        if (entryPoint) entryPoint.value = defaultEntryPoint;
        if (sourcePage) sourcePage.value = window.location.href;
        window.location.href = successUrl;
      } catch (error) {
        if (statusEl) {
          statusEl.dataset.state = "error";
          statusEl.textContent = "Something went wrong. Please email info@terraveritascoffee.com.";
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultSubmitLabel;
        }
      }
    });
  }
})();
