// Carrossel do telemóvel.
// O CSS faz as grelhas com [data-carousel] deslizar (scroll-snap); aqui acrescentam-se os
// pontos de navegação, alinhados à esquerda, sincronizados com a posição do scroll.
(function (App) {
  "use strict";

  var MOBILE = window.matchMedia("(max-width: 809px)");

  function setup(track) {
    var slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;

    var dots = document.createElement("div");
    dots.className = "carousel-dots";
    dots.setAttribute("role", "group");
    dots.setAttribute("aria-label", track.getAttribute("data-carousel") || "Navegação do carrossel");

    // Posição de scroll que alinha um cartão com o início da faixa
    function slideOffset(slide) {
      return slide.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);
    }

    var buttons = slides.map(function (slide, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "carousel-dots__dot";
      button.setAttribute("aria-label", "Mostrar " + (index + 1) + " de " + slides.length);
      button.addEventListener("click", function () {
        track.scrollTo({ left: slideOffset(slide), behavior: App.reducedMotion ? "auto" : "smooth" });
      });
      dots.appendChild(button);
      return button;
    });

    track.insertAdjacentElement("afterend", dots);

    function update() {
      var active = 0;
      var closest = Infinity;

      slides.forEach(function (slide, index) {
        var distance = Math.abs(slideOffset(slide) - track.scrollLeft);
        if (distance < closest) {
          closest = distance;
          active = index;
        }
      });

      buttons.forEach(function (button, index) {
        button.setAttribute("aria-current", String(index === active));
      });
    }

    // Um cálculo por frame, no máximo
    var pending = false;
    track.addEventListener(
      "scroll",
      function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          update();
        });
      },
      { passive: true }
    );

    MOBILE.addEventListener("change", update);
    update();
  }

  App.ready(function () {
    App.$$("[data-carousel]").forEach(setup);
  });
})(window.App);
