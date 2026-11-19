// Animações de entrada com o Motion:
//   [data-reveal]          aparece a subir, com um pequeno atraso entre irmãos
//   .h1/.h2/.h-cta .line   cada linha do título sobe por trás de uma máscara
//   [data-script]          o texto manuscrito "escreve-se" da esquerda para a direita
//   [data-parallax]        a imagem desloca-se mais devagar do que o scroll
"use strict";

(({ $, $$, Motion: M, animated, EASE, ready }) => {
  if (!animated) return;

  const MAX_STAGGER_STEPS = 6; // listas longas não ficam lentas a aparecer

  // Anima node uma única vez, quando entra no ecrã
  function onEnter(node, animate, amount) {
    M.inView(node, animate, { amount });
  }

  function animateIntro() {
    const header = $(".site-header");
    if (header) M.animate(header, { y: [-90, 0], opacity: [0, 1] }, { duration: 0.9, delay: 0.1, ease: EASE });

    const heroImage = $(".hero__media img");
    if (heroImage) M.animate(heroImage, { scale: [1.08, 1] }, { duration: 1.8, ease: EASE });
  }

  function animateTitles() {
    $$(".h1, .h2, .h-cta").forEach((title) => {
      const lines = $$(".line > span", title);
      if (!lines.length) return;

      onEnter(
        title,
        () => M.animate(lines, { y: ["105%", "0%"] }, { duration: 1, delay: M.stagger(0.09), ease: EASE }),
        0.3
      );
    });
  }

  function animateHandwriting() {
    $$("[data-script]").forEach((node) => {
      onEnter(
        node,
        () =>
          M.animate(
            node,
            { opacity: [0, 1], clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
            { duration: 1.2, delay: 0.45, ease: [0.65, 0, 0.35, 1] }
          ),
        0.5
      );
    });
  }

  function animateReveals() {
    $$("[data-reveal]").forEach((node) => {
      const siblings = $$(":scope > [data-reveal]", node.parentElement);
      const step = Math.min(Math.max(0, siblings.indexOf(node)), MAX_STAGGER_STEPS);

      onEnter(
        node,
        () => M.animate(node, { opacity: [0, 1], y: [36, 0] }, { duration: 0.9, delay: step * 0.08, ease: EASE }),
        0.15
      );
    });
  }

  function animateParallax() {
    $$("[data-parallax]").forEach((node) => {
      M.scroll(M.animate(node, { y: [-70, 70] }, { ease: "linear" }), {
        target: node.parentElement,
        offset: ["start end", "end start"],
      });
    });
  }

  ready(() => {
    animateIntro();
    animateTitles();
    animateHandwriting();
    animateReveals();
    animateParallax();
  });
})(window.App);
