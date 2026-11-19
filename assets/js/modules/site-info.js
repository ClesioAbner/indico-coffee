// Aplica os dados de assets/js/data/site.js (window.SITE) à página:
//   data-site="phone"          texto
//   data-site-href="phone"     href (telefone, mapa, WhatsApp, Instagram, Facebook, TikTok)
//   data-site-src="map"        src do iframe do mapa
//   data-site-if="instagram"   remove o elemento quando o campo está vazio
(function (App) {
  "use strict";

  var site = window.SITE;
  if (!site) return;

  var encode = encodeURIComponent;
  var place = site.address ? site.address + ", " + site.city : site.mapsQuery;

  var text = {
    name: site.name,
    // Espaços inquebráveis para o número nunca se partir a meio
    phone: site.phone ? site.phone.replace(/ /g, "\u00a0") : null,
    address: site.address,
    city: site.city,
    hours: site.hours,
    payment: site.payment,
    instagram: site.instagram ? "@" + site.instagram : null,
  };

  var href = {
    phone: site.phone ? "tel:" + site.phone.replace(/\s+/g, "") : null,
    maps: "https://www.google.com/maps/dir/?api=1&destination=" + encode(place),
    whatsapp: site.whatsapp ? "https://wa.me/" + encode(site.whatsapp) : null,
    facebook: site.facebook || null,
    instagram: site.instagram ? "https://www.instagram.com/" + encode(site.instagram) + "/" : null,
    tiktok: site.tiktok ? "https://www.tiktok.com/@" + encode(site.tiktok) : null,
  };

  var src = {
    map: "https://www.google.com/maps?q=" + encode(place) + "&z=15&output=embed",
  };

  App.ready(function () {
    App.$$("[data-site-if]").forEach(function (node) {
      var key = node.getAttribute("data-site-if");
      if (!text[key] && !href[key]) node.remove();
    });

    App.$$("[data-site]").forEach(function (node) {
      var value = text[node.getAttribute("data-site")];
      if (value) node.textContent = value;
    });

    App.$$("[data-site-href]").forEach(function (node) {
      var value = href[node.getAttribute("data-site-href")];
      if (value) node.setAttribute("href", value);
    });

    App.$$("[data-site-src]").forEach(function (node) {
      var value = src[node.getAttribute("data-site-src")];
      if (value) node.setAttribute("src", value);
    });
  });
})(window.App);
