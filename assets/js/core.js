// Núcleo partilhado por todos os módulos (window.App).
// Carregar depois de vendor/motion.min.js e antes dos módulos.
(function (window, document) {
  "use strict";

  var root = document.documentElement;
  var Motion = window.Motion || null;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sem Motion, ou com movimento reduzido, o conteúdo aparece sem estados iniciais animados
  if (!Motion || prefersReducedMotion) root.classList.remove("js");
  if (!Motion) root.classList.add("no-cup");

  window.App = {
    Motion: Motion,
    reducedMotion: prefersReducedMotion,
    animated: !!Motion && !prefersReducedMotion,

    // Curva "ease out quint", a mesma usada pelo Framer
    EASE: [0.22, 1, 0.36, 1],

    $: function (selector, scope) {
      return (scope || document).querySelector(selector);
    },

    $$: function (selector, scope) {
      return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    },

    clamp: function (value, min, max) {
      return Math.min(max, Math.max(min, value));
    },

    lerp: function (from, to, t) {
      return from + (to - from) * t;
    },

    easeInOutCubic: function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    // Executa quando o DOM estiver pronto (os scripts são carregados com defer)
    ready: function (fn) {
      if (document.readyState !== "loading") fn();
      else document.addEventListener("DOMContentLoaded", fn);
    },
  };
})(window, document);
