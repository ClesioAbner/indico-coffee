// Cabeçalho, menu do telemóvel e ano no rodapé.
(function (App) {
  "use strict";

  var $ = App.$;
  var $$ = App.$$;

  // Sombra no cabeçalho quando a página deixa o topo
  function initHeaderShadow() {
    var header = $(".site-header");
    if (!header) return;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // Menu do telemóvel: abre e fecha no botão, fecha com Esc ou ao escolher um link
  function initMobileNav() {
    var toggle = $(".nav-toggle");
    if (!toggle) return;
    var body = document.body;

    function setOpen(open) {
      body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");

      if (open && App.animated) {
        App.Motion.animate(
          $$(".mobile-nav nav a"),
          { opacity: [0, 1], y: [40, 0] },
          { duration: 0.6, delay: App.Motion.stagger(0.06, { startDelay: 0.1 }), ease: App.EASE }
        );
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!body.classList.contains("nav-open"));
    });

    $$(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && body.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function initYear() {
    $$("[data-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  App.ready(function () {
    initHeaderShadow();
    initMobileNav();
    initYear();
  });
})(window.App);
