// Dados do café: fonte única para nome, contactos e informação prática.
// O módulo modules/site-info.js aplica estes valores em toda a página.
// Um campo a null esconde o que depende dele (sem Instagram, não há botões do Instagram).
window.SITE = {
  name: "Índico Coffee",
  phone: "+258 84 959 6865",

  // A confirmar: com a morada preenchida, o mapa e o botão "Como chegar" passam a usá-la
  address: null, // ex.: "Av. Julius Nyerere, 123"
  city: "Maputo, Moçambique",
  mapsQuery: "Maputo, Moçambique",

  // Redes sociais: um campo a null esconde o ícone correspondente
  whatsapp: "258849596865", // formato internacional, sem + nem espaços
  facebook: null, // ex.: "https://www.facebook.com/indicocoffee"
  instagram: null, // ex.: "indicocoffee" (sem @)
  tiktok: null, // ex.: "indicocoffee" (sem @)

  hours: null, // ex.: "Todos os dias, 07:00 às 19:00"
  payment: null, // ex.: "Cartão e M-Pesa"
};
