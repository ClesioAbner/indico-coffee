// Cabeçalho, menu do telemóvel e ano no rodapé.
"use strict";

(({ $, $$, Motion, animated, EASE, ready }) => {
  // Sombra no cabeçalho quando a página sai do topo
  function initHeaderShadow() {
    const header = $(".site-header");
    if (!header) return;

    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // Menu do telemóvel: abre e fecha no botão, fecha com Esc ou ao escolher um link
  function initMobileNav() {
    const toggle = $(".nav-toggle");
    if (!toggle) return;

    const body = document.body;
    const isOpen = () => body.classList.contains("nav-open");

    function setOpen(open) {
      body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");

      if (open && animated) {
        Motion.animate(
          $$(".mobile-nav nav a"),
          { opacity: [0, 1], y: [40, 0] },
          { duration: 0.6, delay: Motion.stagger(0.06, { startDelay: 0.1 }), ease: EASE }
        );
      }
    }

    toggle.addEventListener("click", () => setOpen(!isOpen()));
    $$(".mobile-nav a").forEach((link) => link.addEventListener("click", () => setOpen(false)));

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !isOpen()) return;
      setOpen(false);
      toggle.focus();
    });
  }

  function initYear() {
    const year = String(new Date().getFullYear());
    $$("[data-year]").forEach((node) => (node.textContent = year));
  }

  ready(() => {
    initHeaderShadow();
    initMobileNav();
    initYear();
  });
})(window.App);
