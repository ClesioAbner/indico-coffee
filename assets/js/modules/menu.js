// Desenha o menu a partir de data/menu.js (window.MENU):
//   página inicial   separadores por categoria   [data-menu-tabs="cafes,frios"] + [data-menu-preview]
//   menu.html        todas as categorias          [data-menu-full] + [data-menu-nav]
"use strict";

(({ $, $$, Motion, animated, EASE, ready }) => {
  const menu = window.MENU;
  const PREVIEW_LIMIT = 6; // produtos por categoria na página inicial
  const SINGLE_COLUMN_BELOW = 5; // categorias pequenas ficam numa só coluna
  const numberFormat = new Intl.NumberFormat("pt-PT");

  // Cria um elemento; o texto entra por textContent, nunca como HTML
  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const formatPrice = (value) => `${numberFormat.format(value)} ${menu.currency}`;

  function renderItem(item) {
    const li = createElement("li", "menu-item");
    const leader = createElement("span", "menu-item__leader");
    leader.setAttribute("aria-hidden", "true");

    li.append(
      createElement("span", "menu-item__name", item.name),
      leader,
      createElement("span", "menu-item__price", formatPrice(item.price)),
      createElement("span", "menu-item__desc", item.description)
    );
    return li;
  }

  function renderList(items, singleColumn = false) {
    const ul = createElement("ul", singleColumn ? "menu-list menu-list--single" : "menu-list");
    ul.append(...items.map(renderItem));
    return ul;
  }

  // Página inicial: separadores com os primeiros produtos de cada categoria
  function initPreview() {
    const tabList = $("[data-menu-tabs]");
    const panel = $("[data-menu-preview]");
    if (!tabList || !panel) return;

    const ids = tabList.getAttribute("data-menu-tabs").split(",");
    const categories = menu.categories.filter((category) => ids.includes(category.id));

    const tabs = categories.map((category, index) => {
      const tab = createElement("button", null, category.name);
      tab.type = "button";
      tab.id = `tab-${category.id}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panel.id);
      tab.addEventListener("click", () => selectTab(index, true));
      tabList.appendChild(tab);
      return tab;
    });

    function selectTab(index, animate) {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", tabs[index].id);
      panel.replaceChildren(renderList(categories[index].items.slice(0, PREVIEW_LIMIT)));

      if (animate && animated) {
        Motion.animate(
          $$(".menu-item", panel),
          { opacity: [0, 1], y: [14, 0] },
          { duration: 0.5, delay: Motion.stagger(0.04), ease: EASE }
        );
      }
    }

    // Setas esquerda e direita mudam de separador (padrão ARIA tabs)
    tabList.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      const current = tabs.indexOf(document.activeElement);
      const next = (current + step + tabs.length) % tabs.length;
      tabs[next].focus();
      selectTab(next, true);
    });

    selectTab(0, false);
  }

  function renderCategory(category) {
    const section = createElement("section", "menu-category");
    section.id = category.id;
    section.setAttribute("aria-labelledby", `${category.id}-title`);

    const title = createElement("h2", "h2", category.name);
    title.id = `${category.id}-title`;

    const head = createElement("header", "menu-category__head");
    head.append(
      title,
      createElement("p", "text", category.note),
      createElement("span", "menu-category__count", `${category.items.length} opções`)
    );

    section.append(head, renderList(category.items, category.items.length < SINGLE_COLUMN_BELOW));
    return section;
  }

  // Destaca na barra de navegação a categoria que está no centro do ecrã
  function highlightCurrentCategory(nav, sections) {
    if (!("IntersectionObserver" in window)) return;
    const links = $$("a", nav);

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry) => {
            links.forEach((link) => {
              const active = link.getAttribute("href") === `#${entry.target.id}`;
              link.setAttribute("aria-current", String(active));
              if (active) link.scrollIntoView({ block: "nearest", inline: "nearest" });
            });
          });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }

  // menu.html: todas as categorias e barra de navegação que acompanha o scroll
  function initFullMenu() {
    const container = $("[data-menu-full]");
    if (!container) return;
    const nav = $("[data-menu-nav]");

    const sections = menu.categories.map(renderCategory);
    container.append(...sections);

    if (nav) {
      menu.categories.forEach((category) => {
        const link = createElement("a", null, category.name);
        link.href = `#${category.id}`;
        nav.appendChild(link);
      });
      highlightCurrentCategory(nav, sections);
    }

    // As secções só existem agora, por isso o salto para menu.html#frios faz-se aqui
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }

  ready(() => {
    if (!menu) return;
    initPreview();
    initFullMenu();
  });
})(window.App);
