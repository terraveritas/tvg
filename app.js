(function () {
  const modal = document.querySelector("[data-modal]");
  const openModalBtns = document.querySelectorAll("[data-open-lot-modal]");
  const closeModalBtns = document.querySelectorAll("[data-close-modal]");
  const continueBtn = document.querySelector("[data-lot-continue]");
  const lotInterest = document.getElementById("lotInterest");
  const lotVolume = document.getElementById("lotVolume");

  const form = document.getElementById("contactForm");
  const toast = document.getElementById("toast");

  const mobileNav = document.querySelector("[data-mobile-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const year = document.getElementById("year");

  // Footer year
  if (year) year.textContent = new Date().getFullYear();

  // Mobile nav toggle
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close mobile nav after clicking a link
    mobileNav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // focus first field
    setTimeout(() => lotInterest?.focus(), 0);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Open
  openModalBtns.forEach(btn => btn.addEventListener("click", openModal));

  // Close (X, Cancel, backdrop)
  closeModalBtns.forEach(btn => btn.addEventListener("click", closeModal));

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) {
      closeModal();
    }
  });

  // Continue: prefill form + jump
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      const interest = lotInterest?.value || "Both";
      const vol = (lotVolume?.value || "").trim();

      const interestField = form?.querySelector('select[name="interest"]');
      const volumeField = form?.querySelector('input[name="volume"]');
      const messageField = form?.querySelector('textarea[name="message"]');

      if (interestField) interestField.value = interest;
      if (volumeField) volumeField.value = vol;

      if (messageField) {
        const lines = [
          "Requesting current lot sheet.",
          `- Interest: ${interest}`,
          vol ? `- Volume: ${vol}` : "- Volume:",
          "- Target specs (moisture, screen, defects, etc.):",
          "- Delivery window:"
        ];
        messageField.value = lines.join("\n");
      }

      closeModal();
      document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => form?.querySelector('input[name="name"]')?.focus(), 350);
    });
  }

  // Talk to sourcing (ensure modal not blocking)
  document.querySelectorAll("[data-talk-sourcing]").forEach(el => {
    el.addEventListener("click", () => closeModal());
  });

  function showToast(msg) {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = msg;
    setTimeout(() => {
      toast.hidden = true;
      toast.textContent = "";
    }, 2800);
  }

  // Contact form UX (mailto fallback)
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const company = (data.get("company") || "").toString().trim();
      const interest = (data.get("interest") || "").toString().trim();
      const volume = (data.get("volume") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        showToast("Please fill Name, Email, and Message.");
        return;
      }

      const subject = encodeURIComponent(`Terra Veritas — ${interest} lot inquiry${company ? " (" + company + ")" : ""}`);
      const body = encodeURIComponent(
        [
          `Name: ${name}`,
          company ? `Company: ${company}` : `Company:`,
          `Email: ${email}`,
          `Interest: ${interest}`,
          volume ? `Volume: ${volume}` : `Volume:`,
          "",
          message
        ].join("\n")
      );

      // TODO: replace with a hosted endpoint later.
      const to = "info@terraveritascoffee.com";
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

      showToast("Opening email draft…");
    });
  }
})();
