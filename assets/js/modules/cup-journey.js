// Copo que viaja com o scroll.
//
// Começa na mão da foto do banner ([data-cup-start]), pousa em cada .cup-slot e termina
// na mão da secção "A bebida da casa" ([data-cup-end]), onde a foto troca para a mão a
// segurar o copo. Ao subir, faz o caminho inverso até encaixar outra vez no banner.
//
// Fotos com copo ([data-cup-photo]) indicam a posição do copo em píxeis da imagem:
//   data-cup-x, data-cup-y   centro do copo
//   data-cup-h               altura visível do copo
//   data-cup-rot             inclinação em graus
//   data-cup-sx              alargamento horizontal, para coincidir com o copo da foto
//
// Só no computador. No telemóvel o core.js põe a classe .no-cup e o copo fica nas fotos.
// O movimento usa molas do Motion (springValue). O ciclo de animação só corre enquanto
// há scroll, mudanças de tamanho ou molas em movimento; com a página parada, não gasta CPU.
"use strict";

(({ $, $$, Motion: M, animated, clamp, lerp, easeInOutCubic, isMobile, EASE, ready }) => {
  // Geometria do SVG do copo: viewBox 240x340, parte visível da tampa à base = 301
  const CUP_W = 240;
  const CUP_H = 340;
  const CUP_VISIBLE_H = 301;

  const LABEL_STEP = 260; // distância entre carimbos no rótulo que roda
  const HOLD = 0.12; // fração de cada troço em que o copo fica parado no pouso
  const INTRO_MS = 2000; // duração do zoom de entrada do banner, que mexe na foto
  const IDLE_MS = 400; // tempo sem scroll antes de o ciclo poder parar
  const SETTLED = 0.05; // diferença abaixo da qual uma mola conta como parada
  const PROPS = ["cx", "cy", "h", "rot", "sx"];

  // Lê a posição do copo numa foto, a partir dos atributos data-cup-*
  function readPhotoGeometry(img) {
    const { cupX, cupY, cupH, cupRot, cupSx } = img.dataset;
    return { x: +cupX, y: +cupY, h: +cupH, rot: +cupRot || 0, sx: +cupSx || 1 };
  }

  // Converte a posição do copo numa foto com object-fit: cover em coordenadas do ecrã
  function measurePhoto(img) {
    const geometry = readPhotoGeometry(img);
    const rect = img.getBoundingClientRect();
    const naturalW = img.naturalWidth || +img.getAttribute("width");
    const naturalH = img.naturalHeight || +img.getAttribute("height");
    const scale = Math.max(rect.width / naturalW, rect.height / naturalH);
    const [posX, posY = "50%"] = getComputedStyle(img).objectPosition.split(" ");
    const offsetX = rect.left + (rect.width - naturalW * scale) * (parseFloat(posX) / 100);
    const offsetY = rect.top + (rect.height - naturalH * scale) * (parseFloat(posY) / 100);

    return {
      cx: offsetX + geometry.x * scale,
      cy: offsetY + geometry.y * scale,
      h: geometry.h * scale * (CUP_H / CUP_VISIBLE_H),
      rot: geometry.rot,
      sx: geometry.sx,
    };
  }

  // Um .cup-slot é um retângulo vazio onde o copo pousa centrado
  function measureStop(node) {
    if (node.hasAttribute("data-cup-photo")) return measurePhoto(node);
    const rect = node.getBoundingClientRect();
    return {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      h: rect.height,
      rot: +node.dataset.cupRot || 0,
      sx: 1,
    };
  }

  // Pousos pela ordem do documento, do banner até à mão final
  function collectStops(heroPhoto) {
    const all = $$(".cup-slot, [data-cup-photo]");
    const endIndex = all.findIndex((node) => node.hasAttribute("data-cup-end"));
    const route = endIndex > -1 ? all.slice(0, endIndex + 1) : all;
    return route.filter((node) => node !== heroPhoto);
  }

  // Estado do copo para a posição de scroll atual
  function computeState(heroPhoto, stops) {
    const y = window.scrollY;
    const viewportH = window.innerHeight;

    // Pousos escondidos (display: none no telemóvel) ficam de fora
    const points = [measurePhoto(heroPhoto), ...stops.filter((n) => n.offsetWidth > 0).map(measureStop)];

    // Scroll em que cada pouso fica centrado no ecrã; o banner é sempre o 0
    const anchors = points.map((point, index) => (index === 0 ? 0 : point.cy + y - viewportH / 2));
    for (let k = 1; k < anchors.length; k++) anchors[k] = Math.max(anchors[k], anchors[k - 1] + 1);

    const last = anchors.length - 1;
    const endY = anchors[last];

    let from = points[0];
    let to = points[0];
    let progress = 0;
    let locked = true; // preso a uma mão: segue a foto sem atraso de mola

    if (y >= endY) {
      from = to = points[last];
    } else if (y > 0) {
      let i = 0;
      while (i < last && y >= anchors[i + 1]) i++;
      from = points[i];
      to = points[i + 1];
      const t = (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
      progress = easeInOutCubic(clamp((t - HOLD) / (1 - 2 * HOLD), 0, 1));
      locked = false;
    }

    // Arco do voo proporcional à distância entre pousos, com um ligeiro rodopio
    const flight = Math.sin(progress * Math.PI);
    const distance = Math.hypot(to.cx - from.cx, to.cy - from.cy);
    const lift = Math.min(80, distance * 0.12);
    const turns = Math.max(1, Math.round((endY * 0.3) / LABEL_STEP));

    return {
      y,
      endY,
      locked,
      cx: lerp(from.cx, to.cx, progress),
      cy: lerp(from.cy, to.cy, progress) - flight * lift,
      h: lerp(from.h, to.h, progress) * (1 + flight * 0.06),
      rot: lerp(from.rot, to.rot, progress) + flight * (to.cx >= from.cx ? 12 : -12),
      sx: lerp(from.sx, to.sx, progress),
      // Número inteiro de voltas entre as duas mãos, para o carimbo chegar de frente a ambas
      label: y >= endY ? 0 : ((y * turns * LABEL_STEP) / endY) % LABEL_STEP,
      // No topo vê-se o copo da foto; o copo animado aparece assim que se faz scroll
      opacity: clamp(y / 70, 0, 1),
      veil: clamp((y - 20) / 220, 0, 1),
    };
  }

  function init() {
    const cup = $(".cup");
    const heroPhoto = $("[data-cup-photo][data-cup-start]");
    if (!cup || !heroPhoto || !animated) return;

    const label = $(".cup__label", cup);
    const veil = $(".hero__veil");
    const grip = $(".signature__grip");
    const gripFrame = grip ? grip.parentElement : null;
    const stops = collectStops(heroPhoto);

    // Uma mola por propriedade: goal é o alvo, spring segue-o com inércia
    const springConfig = { stiffness: 190, damping: 26, mass: 0.7 };
    const goal = {};
    const spring = {};
    PROPS.forEach((key) => {
      goal[key] = M.motionValue(0);
      spring[key] = M.springValue(goal[key], springConfig);
    });

    // Na mão final, a foto da mão a segurar o copo substitui o copo animado
    const grabbed = M.motionValue(0);
    let isGrabbed = false;
    if (grip) grabbed.on("change", (value) => (grip.style.opacity = value));

    function grab() {
      isGrabbed = true;
      M.animate(grabbed, 1, { type: "spring", stiffness: 260, damping: 30 });
      if (gripFrame) M.animate(gripFrame, { y: [0, 10, 0], scale: [1, 0.992, 1] }, { duration: 0.6, ease: EASE });
    }

    function release() {
      isGrabbed = false;
      M.animate(grabbed, 0, { type: "spring", stiffness: 300, damping: 32 });
    }

    function render(state) {
      const h = spring.h.get();
      const w = (h * CUP_W) / CUP_H;
      const x = spring.cx.get() - w / 2;
      const y = spring.cy.get() - h / 2;

      cup.style.width = `${w}px`;
      cup.style.height = `${h}px`;
      cup.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${spring.rot.get()}deg) scaleX(${spring.sx.get()})`;
      cup.style.opacity = state.opacity * (1 - grabbed.get());
      if (label) label.setAttribute("transform", `translate(${-state.label} 0)`);
      if (veil) veil.style.opacity = state.veil;
    }

    const isSettled = () =>
      PROPS.every((key) => Math.abs(spring[key].get() - goal[key].get()) < SETTLED) && [0, 1].includes(grabbed.get());

    // Ciclo de animação: corre enquanto houver movimento e para sozinho depois
    let running = false;
    let started = false;
    let busyUntil = performance.now() + INTRO_MS;

    function frame(now) {
      if (isMobile()) {
        running = false;
        return;
      }
      const state = computeState(heroPhoto, stops);

      PROPS.forEach((key) => {
        goal[key].set(state[key]);
        if (!started || state.locked) spring[key].jump(state[key]);
      });
      started = true;

      if (grip) {
        if (!isGrabbed && state.y >= state.endY - 2) grab();
        else if (isGrabbed && state.y < state.endY - 40) release();
      }

      render(state);

      if (now < busyUntil || !isSettled()) requestAnimationFrame(frame);
      else running = false;
    }

    function wake() {
      if (isMobile()) return;
      busyUntil = Math.max(busyUntil, performance.now() + IDLE_MS);
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    // Imagens a carregar ou fontes a mudar a altura da página também mexem nos pousos
    new ResizeObserver(wake).observe(document.body);

    if (heroPhoto.complete) wake();
    else heroPhoto.addEventListener("load", wake, { once: true });
  }

  ready(init);
})(window.App);
