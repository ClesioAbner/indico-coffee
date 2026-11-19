// Animações de entrada com Motion (o Framer Motion sem React):
//   [data-reveal]             aparece a subir, escalonado entre elementos irmãos
//   .h1/.h2/.h-cta .line      cada linha do título sobe por trás de uma máscara
//   [data-script]             o texto manuscrito "escreve-se"
//   [data-parallax]           parallax ligado ao scroll
(function (App) {
  "use strict";

  if (!App.animated) return;

  var M = App.Motion;
  var $ = App.$;
  var $$ = App.$$;
  var EASE = App.EASE;

  function intro() {
    var header = $(".site-header");
    if (header) M.animate(header, { y: [-90, 0], opacity: [0, 1] }, { duration: 0.9, delay: 0.1, ease: EASE });

    var heroImage = $(".hero__media img");
    if (heroImage) M.animate(heroImage, { scale: [1.08, 1] }, { duration: 1.8, ease: EASE });
  }

  function titleLines() {
    $$(".h1, .h2, .h-cta").forEach(function (title) {
      var lines = $$(".line > span", title);
      if (!lines.length) return;

      M.inView(
        title,
        function () {
          M.animate(lines, { y: ["105%", "0%"] }, { duration: 1, delay: M.stagger(0.09), ease: EASE });
        },
        { amount: 0.3 }
      );
    });
  }

  function handwriting() {
    $$("[data-script]").forEach(function (node) {
      M.inView(
        node,
        function () {
          M.animate(
            node,
            { opacity: [0, 1], clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
            { duration: 1.2, delay: 0.45, ease: [0.65, 0, 0.35, 1] }
          );
        },
        { amount: 0.5 }
      );
    });
  }

  function reveals() {
    $$("[data-reveal]").forEach(function (node) {
      // Atraso crescente entre irmãos, limitado para listas longas não ficarem lentas
      var siblings = $$(":scope > [data-reveal]", node.parentElement);
      var order = Math.min(Math.max(0, siblings.indexOf(node)), 6);

      M.inView(
        node,
        function () {
          M.animate(node, { opacity: [0, 1], y: [36, 0] }, { duration: 0.9, delay: order * 0.08, ease: EASE });
        },
        { amount: 0.15 }
      );
    });
  }

  function parallax() {
    $$("[data-parallax]").forEach(function (node) {
      M.scroll(M.animate(node, { y: [-70, 70] }, { ease: "linear" }), {
        target: node.parentElement,
        offset: ["start end", "end start"],
      });
    });
  }

  App.ready(function () {
    intro();
    titleLines();
    handwriting();
    reveals();
    parallax();
  });
})(window.App);
