// Núcleo partilhado por todos os módulos, exposto em window.App.
// Ordem de carregamento: vendor/motion.min.js, core.js, data/*.js e depois os módulos.
(() => {
  "use strict";

  const root = document.documentElement;
  const Motion = window.Motion || null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animated = Boolean(Motion) && !reducedMotion;

  // Igual ao breakpoint de telemóvel no CSS (max-width: 809px)
  const mobileQuery = window.matchMedia("(max-width: 809px)");

  // Sem animações, o CSS mostra o conteúdo no estado final.
  // O copo que viaja só existe no computador: no telemóvel taparia o texto.
  if (!animated) root.classList.remove("js");
  const syncCup = () => root.classList.toggle("no-cup", !animated || mobileQuery.matches);
  mobileQuery.addEventListener("change", syncCup);
  syncCup();

  window.App = {
    Motion,
    reducedMotion,
    animated,
    mobileQuery,

    // Curva "ease out quint", usada em todas as entradas
    EASE: [0.22, 1, 0.36, 1],

    $: (selector, scope = document) => scope.querySelector(selector),
    $$: (selector, scope = document) => Array.from(scope.querySelectorAll(selector)),

    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    lerp: (from, to, t) => from + (to - from) * t,
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),

    isMobile: () => mobileQuery.matches,

    // Corre fn quando o DOM estiver pronto
    ready(fn) {
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
      else fn();
    },
  };
})();
