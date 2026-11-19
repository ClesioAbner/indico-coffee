// Desenha o menu a partir de assets/js/data/menu.js (window.MENU):
//   página inicial   separadores por categoria   [data-menu-tabs] + [data-menu-preview]
//   página do menu   todas as categorias          [data-menu-full] + [data-menu-nav]
(function (App) {
  "use strict";

  var $ = App.$;
  var $$ = App.$$;
  var data = window.MENU;
  var PREVIEW_LIMIT = 6;
  var numberFormat = new Intl.NumberFormat("pt-PT");

  // Cria um elemento com classe e texto; o texto entra por textContent, nunca como HTML
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function formatPrice(value) {
    return numberFormat.format(value) + " " + data.currency;
  }

  function renderItem(item) {
    var li = el("li", "menu-item");
    li.appendChild(el("span", "menu-item__name", item.name));
    li.appendChild(el("span", "menu-item__leader")).setAttribute("aria-hidden", "true");
    li.appendChild(el("span", "menu-item__price", formatPrice(item.price)));
    li.appendChild(el("span", "menu-item__desc", item.description));
    return li;
  }

  function renderList(items, single) {
    var ul = el("ul", "menu-list" + (single ? " menu-list--single" : ""));
    items.forEach(function (item) {
      ul.appendChild(renderItem(item));
    });
    return ul;
  }

  // Página inicial: separadores com as primeiras opções de cada categoria
  function initPreview() {
    var tabList = $("[data-menu-tabs]");
    var panel = $("[data-menu-preview]");
    if (!tabList || !panel) return;

    var ids = tabList.getAttribute("data-menu-tabs").split(",");
    var categories = data.categories.filter(function (c) {
      return ids.indexOf(c.id) > -1;
    });

    var buttons = categories.map(function (category, index) {
      var button = el("button", null, category.name);
      button.type = "button";
      button.id = "tab-" + category.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panel.id);
      button.addEventListener("click", function () {
        select(index, true);
      });
      tabList.appendChild(button);
      return button;
    });

    function select(index, animate) {
      var category = categories[index];
      buttons.forEach(function (b, i) {
        b.setAttribute("aria-selected", String(i === index));
        b.tabIndex = i === index ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", buttons[index].id);
      panel.replaceChildren(renderList(category.items.slice(0, PREVIEW_LIMIT)));
      if (animate && App.animated) {
        App.Motion.animate(
          $$(".menu-item", panel),
          { opacity: [0, 1], y: [14, 0] },
          { duration: 0.5, delay: App.Motion.stagger(0.04), ease: App.EASE }
        );
      }
    }

    // Setas esquerda/direita entre separadores (padrão ARIA tabs)
    tabList.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      var current = buttons.indexOf(document.activeElement);
      var next = (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      select(next, true);
    });

    select(0, false);
  }

  // Página do menu: todas as categorias e barra de navegação que acompanha o scroll
  function initFullMenu() {
    var container = $("[data-menu-full]");
    if (!container) return;
    var nav = $("[data-menu-nav]");

    data.categories.forEach(function (category) {
      var section = el("section", "menu-category");
      section.id = category.id;
      section.setAttribute("aria-labelledby", category.id + "-title");

      var head = el("header", "menu-category__head");
      var title = el("h2", "h2", category.name);
      title.id = category.id + "-title";
      head.appendChild(title);
      head.appendChild(el("p", "text", category.note));
      head.appendChild(el("span", "menu-category__count", category.items.length + " opções"));

      section.appendChild(head);
      section.appendChild(renderList(category.items, category.items.length < 5));
      container.appendChild(section);

      if (nav) {
        var link = el("a", null, category.name);
        link.href = "#" + category.id;
        nav.appendChild(link);
      }
    });

    if (nav && "IntersectionObserver" in window) {
      var links = $$("a", nav);
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (a) {
              var active = a.getAttribute("href") === "#" + entry.target.id;
              a.setAttribute("aria-current", String(active));
              if (active) a.scrollIntoView({ block: "nearest", inline: "nearest" });
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      $$(".menu-category", container).forEach(function (s) {
        observer.observe(s);
      });
    }

    // Abrir diretamente numa categoria (ex.: menu.html#frios)
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target)
        requestAnimationFrame(function () {
          target.scrollIntoView();
        });
    }
  }

  App.ready(function () {
    if (!data) return;
    initPreview();
    initFullMenu();
  });
})(window.App);
