(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scroll
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // Close mobile menu after click
      const mm = $('[data-mobilemenu]');
      if (mm && !mm.hidden) mm.hidden = true;
    });
  });

  // Mobile menu toggle
  const navToggle = $('[data-nav-toggle]');
  const mobileMenu = $('[data-mobilemenu]');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      mobileMenu.hidden = !mobileMenu.hidden;
    });
  }

  // Modal controls
  const modal = $('[data-modal]');
  const openButtons = $$('[data-open-lotsheet]');
  const closeButtons = $$('[data-modal-close]');

  const lsInterest = $('[data-ls-interest]');
  const lsVolume = $('[data-ls-volume]');
  const lsContinue = $('[data-ls-continue]');

  const contactForm = $("#contact-form");
  const contactInterest = contactForm ? $('select[name="interest"]', contactForm) : null;
  const contactMessage = contactForm ? $('textarea[name="message"]', contactForm) : null;

  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // Focus first field for accessibility
    setTimeout(() => lsInterest && lsInterest.focus(), 0);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openButtons.forEach(btn => btn.addEventListener("click", openModal));
  closeButtons.forEach(btn => btn.addEventListener("click", closeModal));

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });

  // Continue -> Prefill + jump to contact
  if (lsContinue) {
    lsContinue.addEventListener("click", () => {
      const interest = lsInterest ? lsInterest.value : "Both";
      const vol = lsVolume && lsVolume.value ? String(lsVolume.value) : "";

      if (contactInterest) contactInterest.value = interest;

      if (contactMessage) {
        const lines = [
          "Requesting current lot sheet.",
          `- Interest: ${interest}`,
          vol ? `- Volume: ${vol}` : "- Volume: (add)",
          "- Target specs (moisture, screen, defects, etc.):",
          "- Delivery window:",
          "- Destination / receiving city:"
        ];
        contactMessage.value = lines.join("\n");
      }

      closeModal();
      const contact = $("#contact");
      if (contact) contact.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const name = contactForm ? $('input[name="name"]', contactForm) : null;
        if (name) name.focus();
      }, 350);
    });
  }

  // Contact form: mailto fallback draft
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(contactForm);
      const name = (data.get("name") || "").toString().trim();
      const company = (data.get("company") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const interest = (data.get("interest") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();

      const subject = `Terra Veritas — Lot Request (${interest})`;
      const body = [
        `Name: ${name}`,
        company ? `Company: ${company}` : `Company: (not provided)`,
        `Email: ${email}`,
        `Interest: ${interest}`,
        "",
        message || "(no message)"
      ].join("\n");

      // Replace with your inbox later
      const to = "info@terraveritascoffee.com";

      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;

      const hint = document.querySelector("[data-form-hint]");
      if (hint) hint.textContent = "Opening your email client with a prefilled draft…";
    });
  }
})();
