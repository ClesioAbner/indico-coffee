// Carrossel do telemóvel.
// O CSS faz deslizar as grelhas com [data-carousel] (scroll-snap). Este módulo junta-lhes
// pontos de navegação, alinhados à esquerda e sincronizados com o scroll.
// O valor de data-carousel é o nome do carrossel para leitores de ecrã.
"use strict";

(({ $$, reducedMotion, mobileQuery, ready }) => {
  // Junta os pontos a uma faixa com dois ou mais cartões
  function createCarousel(track) {
    const slides = Array.from(track.children);
    if (slides.length < 2) return;

    const dots = document.createElement("div");
    dots.className = "carousel-dots";
    dots.setAttribute("role", "group");
    dots.setAttribute("aria-label", track.getAttribute("data-carousel") || "Navegação do carrossel");

    // Posição de scroll que alinha o cartão com o início da faixa
    const offsetOf = (slide) => slide.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);

    const buttons = slides.map((slide, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "carousel-dots__dot";
      button.setAttribute("aria-label", `Mostrar ${index + 1} de ${slides.length}`);
      button.addEventListener("click", () => {
        track.scrollTo({ left: offsetOf(slide), behavior: reducedMotion ? "auto" : "smooth" });
      });
      dots.appendChild(button);
      return button;
    });

    track.insertAdjacentElement("afterend", dots);

    // Marca o ponto do cartão mais próximo da posição atual
    function updateActiveDot() {
      const distances = slides.map((slide) => Math.abs(offsetOf(slide) - track.scrollLeft));
      const active = distances.indexOf(Math.min(...distances));
      buttons.forEach((button, index) => button.setAttribute("aria-current", String(index === active)));
    }

    track.addEventListener("scroll", throttleToFrame(updateActiveDot), { passive: true });
    mobileQuery.addEventListener("change", updateActiveDot);
    updateActiveDot();
  }

  // Limita fn a uma execução por frame
  function throttleToFrame(fn) {
    let pending = false;
    return () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        fn();
      });
    };
  }

  ready(() => $$("[data-carousel]").forEach(createCarousel));
})(window.App);
