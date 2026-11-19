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
//   data-cup-mobile          "x y altura graus" na foto usada no telemóvel (<picture>)
//
// O movimento usa molas do Motion (springValue, o equivalente ao useSpring do Framer Motion).
(function (App) {
  "use strict";

  var $ = App.$;
  var $$ = App.$$;
  var clamp = App.clamp;
  var lerp = App.lerp;

  // Geometria do SVG do copo: viewBox 240x340, parte visível da tampa à base = 301
  var CUP_W = 240;
  var CUP_H = 340;
  var CUP_VISIBLE_H = 301;

  var LABEL_STEP = 260; // distância entre carimbos no rótulo que roda
  var HOLD = 0.12; // fração de cada troço em que o copo fica parado no slot
  var MOBILE = window.matchMedia("(max-width: 809px)");
  var PROPS = ["cx", "cy", "h", "rot", "sx"];

  function init() {
    var cup = $(".cup");
    var heroPhoto = $("[data-cup-photo][data-cup-start]");
    if (!cup || !heroPhoto) return;

    if (!App.animated) {
      document.documentElement.classList.add("no-cup");
      return;
    }

    var M = App.Motion;
    var label = $(".cup__label", cup);
    var veil = $(".hero__veil");
    var grip = $(".signature__grip");
    var gripFrame = grip ? grip.parentElement : null;

    // Pontos do percurso, pela ordem do documento, até ao destino final
    var stops = $$(".cup-slot, [data-cup-photo]");
    var endIndex = stops.findIndex(function (node) {
      return node.hasAttribute("data-cup-end");
    });
    if (endIndex > -1) stops = stops.slice(0, endIndex + 1);
    stops = stops.filter(function (node) {
      return node !== heroPhoto;
    });

    // Lê a posição do copo de uma foto, usando a variante do telemóvel quando existe
    function photoGeometry(img) {
      var mobile = img.getAttribute("data-cup-mobile");
      if (mobile && MOBILE.matches) {
        var parts = mobile.split(/\s+/).map(Number);
        return { x: parts[0], y: parts[1], h: parts[2], rot: parts[3] || 0, sx: 1 };
      }
      return {
        x: +img.dataset.cupX,
        y: +img.dataset.cupY,
        h: +img.dataset.cupH,
        rot: +img.dataset.cupRot || 0,
        sx: +img.dataset.cupSx || 1,
      };
    }

    // Converte a posição do copo numa foto com object-fit: cover para coordenadas do ecrã
    function photoStop(img) {
      var geometry = photoGeometry(img);
      var rect = img.getBoundingClientRect();
      var naturalW = img.naturalWidth || +img.getAttribute("width");
      var naturalH = img.naturalHeight || +img.getAttribute("height");
      var scale = Math.max(rect.width / naturalW, rect.height / naturalH);
      var position = getComputedStyle(img).objectPosition.split(" ");
      var offsetX = rect.left + (rect.width - naturalW * scale) * (parseFloat(position[0]) / 100);
      var offsetY = rect.top + (rect.height - naturalH * scale) * (parseFloat(position[1] || "50%") / 100);

      return {
        cx: offsetX + geometry.x * scale,
        cy: offsetY + geometry.y * scale,
        h: geometry.h * scale * (CUP_H / CUP_VISIBLE_H),
        rot: geometry.rot,
        sx: geometry.sx,
      };
    }

    function slotStop(node) {
      if (node.hasAttribute("data-cup-photo")) return photoStop(node);
      var rect = node.getBoundingClientRect();
      return {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
        h: rect.height,
        rot: +node.dataset.cupRot || 0,
        sx: 1,
      };
    }

    // Estado alvo do copo para a posição de scroll atual
    function target() {
      var y = window.scrollY;
      var viewportH = window.innerHeight;

      var points = [photoStop(heroPhoto)];
      stops.forEach(function (node) {
        if (node.offsetWidth > 0) points.push(slotStop(node));
      });

      // Scroll em que cada ponto fica centrado no ecrã; o banner é sempre o 0
      var anchors = points.map(function (point, index) {
        return index === 0 ? 0 : point.cy + y - viewportH / 2;
      });
      for (var k = 1; k < anchors.length; k++) {
        anchors[k] = Math.max(anchors[k], anchors[k - 1] + 1);
      }
      var last = anchors.length - 1;
      var endY = anchors[last];

      var from = points[0];
      var to = points[0];
      var progress = 0;
      var locked = true;

      if (y >= endY) {
        from = to = points[last];
      } else if (y > 0) {
        var i = 0;
        while (i < last && y >= anchors[i + 1]) i++;
        from = points[i];
        to = points[i + 1];
        var t = (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
        progress = App.easeInOutCubic(clamp((t - HOLD) / (1 - 2 * HOLD), 0, 1));
        locked = false;
      }

      // Arco do voo proporcional à distância entre pousos, com um ligeiro rodopio
      var flight = Math.sin(progress * Math.PI);
      var distance = Math.hypot(to.cx - from.cx, to.cy - from.cy);
      var lift = Math.min(80, distance * 0.12);
      var turns = Math.max(1, Math.round((endY * 0.3) / LABEL_STEP));

      return {
        y: y,
        endY: endY,
        locked: locked,
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

    // Uma mola por propriedade, como o useSpring do Framer Motion
    var springConfig = MOBILE.matches
      ? { stiffness: 220, damping: 28, mass: 0.6 }
      : { stiffness: 190, damping: 26, mass: 0.7 };
    var goal = {};
    var spring = {};
    PROPS.forEach(function (key) {
      goal[key] = M.motionValue(0);
      spring[key] = M.springValue(goal[key], springConfig);
    });

    // Na mão final, a foto da mão a segurar o copo substitui o copo animado
    var grabbed = M.motionValue(0);
    var isGrabbed = false;
    grabbed.on("change", function (value) {
      if (grip) grip.style.opacity = value;
    });

    function grab() {
      isGrabbed = true;
      M.animate(grabbed, 1, { type: "spring", stiffness: 260, damping: 30 });
      if (gripFrame) {
        M.animate(gripFrame, { y: [0, 10, 0], scale: [1, 0.992, 1] }, { duration: 0.6, ease: App.EASE });
      }
    }

    function release() {
      isGrabbed = false;
      M.animate(grabbed, 0, { type: "spring", stiffness: 300, damping: 32 });
    }

    function render(state) {
      var h = spring.h.get();
      var w = (h * CUP_W) / CUP_H;
      var x = spring.cx.get() - w / 2;
      var y = spring.cy.get() - h / 2;

      cup.style.width = w + "px";
      cup.style.height = h + "px";
      cup.style.transform =
        "translate3d(" + x + "px," + y + "px,0) rotate(" + spring.rot.get() + "deg) scaleX(" + spring.sx.get() + ")";
      cup.style.opacity = state.opacity * (1 - grabbed.get());
      if (label) label.setAttribute("transform", "translate(" + -state.label + " 0)");
      if (veil) veil.style.opacity = state.veil;
    }

    var started = false;

    function frame() {
      var state = target();

      PROPS.forEach(function (key) {
        goal[key].set(state[key]);
        // Preso a uma mão, segue a foto sem atraso para encaixar na perfeição
        if (!started || state.locked) spring[key].jump(state[key]);
      });
      started = true;

      if (grip) {
        if (!isGrabbed && state.y >= state.endY - 2) grab();
        else if (isGrabbed && state.y < state.endY - 40) release();
      }

      render(state);
      requestAnimationFrame(frame);
    }

    if (heroPhoto.complete) {
      requestAnimationFrame(frame);
    } else {
      heroPhoto.addEventListener(
        "load",
        function () {
          requestAnimationFrame(frame);
        },
        { once: true }
      );
    }
  }

  App.ready(init);
})(window.App);
