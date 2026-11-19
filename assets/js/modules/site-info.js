// Aplica os dados de data/site.js (window.SITE) à página:
//   data-site="phone"         texto do elemento
//   data-site-href="phone"    href (telefone, mapa, WhatsApp, Instagram, Facebook, TikTok)
//   data-site-src="map"       src do iframe do mapa
//   data-site-if="instagram"  remove o elemento quando esse dado não existe
"use strict";

(({ $$, ready }) => {
  const site = window.SITE;
  if (!site) return;

  const encode = encodeURIComponent;
  const place = site.address ? `${site.address}, ${site.city}` : site.mapsQuery;

  // Cada valor a null significa "dado em falta"
  const text = {
    name: site.name,
    phone: site.phone ? site.phone.replace(/ /g, " ") : null, // o número nunca se parte
    address: site.address,
    city: site.city,
    hours: site.hours,
    payment: site.payment,
    instagram: site.instagram ? `@${site.instagram}` : null,
  };

  const href = {
    phone: site.phone ? `tel:${site.phone.replace(/\s+/g, "")}` : null,
    maps: `https://www.google.com/maps/dir/?api=1&destination=${encode(place)}`,
    whatsapp: site.whatsapp ? `https://wa.me/${encode(site.whatsapp)}` : null,
    facebook: site.facebook || null,
    instagram: site.instagram ? `https://www.instagram.com/${encode(site.instagram)}/` : null,
    tiktok: site.tiktok ? `https://www.tiktok.com/@${encode(site.tiktok)}` : null,
  };

  const src = {
    map: `https://www.google.com/maps?q=${encode(place)}&z=15&output=embed`,
  };

  // Para cada elemento com o atributo, procura o valor na tabela e aplica-o
  function bind(attribute, values, apply) {
    $$(`[${attribute}]`).forEach((node) => {
      const value = values[node.getAttribute(attribute)];
      if (value) apply(node, value);
    });
  }

  ready(() => {
    $$("[data-site-if]").forEach((node) => {
      const key = node.getAttribute("data-site-if");
      if (!text[key] && !href[key]) node.remove();
    });

    bind("data-site", text, (node, value) => (node.textContent = value));
    bind("data-site-href", href, (node, value) => node.setAttribute("href", value));
    bind("data-site-src", src, (node, value) => node.setAttribute("src", value));
  });
})(window.App);
