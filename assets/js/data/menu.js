// Produtos e preços: fonte única para a página inicial e para menu.html.
//   categories[].id        identificador, usado no URL (menu.html#frios)
//   categories[].name      nome da categoria
//   categories[].note      frase curta por baixo do nome
//   categories[].items[]   { name, description, price }, com o preço em meticais
// Preços indicativos: confirmar antes de publicar.
window.MENU = {
  currency: "MT",
  categories: [
    {
      id: "cafes",
      name: "Cafés",
      note: "Tirados no momento.",
      items: [
        { name: "Bica", description: "Espresso curto · Intenso", price: 80 },
        { name: "Bica Dupla", description: "Dois shots · Encorpado", price: 120 },
        { name: "Pingo", description: "Espresso · Um toque de leite", price: 100 },
        { name: "Americano", description: "Espresso · Água quente", price: 110 },
        { name: "Galão", description: "Espresso · Leite · Copo alto", price: 150 },
        { name: "Cappuccino", description: "Espresso · Leite · Espuma", price: 150 },
        { name: "Latte", description: "Espresso · Leite vaporizado", price: 170 },
        { name: "Flat White", description: "Shot duplo · Leite sedoso", price: 170 },
        { name: "Mocha", description: "Espresso · Chocolate · Leite", price: 190 },
      ],
    },
    {
      id: "especiais",
      name: "Especiais",
      note: "As receitas da casa.",
      items: [
        {
          name: "Dirty Chai",
          description: "Chai especiado · Shot de espresso · Leite",
          price: 220,
        },
        { name: "Chai Latte", description: "Chai especiado · Leite cremoso", price: 190 },
        { name: "Chocolate Quente", description: "Cremoso · Intenso", price: 180 },
        { name: "Chá", description: "Seleção de chás", price: 90 },
      ],
    },
    {
      id: "frios",
      name: "Frios",
      note: "Para os dias de calor.",
      items: [
        { name: "Frappuccino de Café", description: "Café · Leite · Gelo", price: 250 },
        { name: "Frappuccino de Caramelo", description: "Café · Caramelo · Natas", price: 270 },
        { name: "Frappuccino de Chocolate", description: "Chocolate · Leite · Gelo", price: 270 },
        { name: "Iced Latte", description: "Espresso · Leite · Gelo", price: 200 },
        { name: "Iced Dirty Chai", description: "Chai · Espresso · Leite · Gelo", price: 240 },
      ],
    },
    {
      id: "pequeno-almoco",
      name: "Pequeno-almoço",
      note: "Para começar bem o dia.",
      items: [
        { name: "French Avo", description: "Abacate · Pão tostado · Ovo", price: 380 },
        { name: "Ovos Mexidos", description: "Ovos · Torrada · Manteiga", price: 300 },
        { name: "Granola", description: "Iogurte · Granola · Fruta da época", price: 280 },
        { name: "Croissant Misto", description: "Fiambre · Queijo", price: 250 },
      ],
    },
    {
      id: "tostas",
      name: "Tostas & Saladas",
      note: "Feitas na hora.",
      items: [
        { name: "Tosta Mista", description: "Fiambre · Queijo", price: 250 },
        { name: "Tosta de Frango", description: "Frango · Queijo · Molho da casa", price: 320 },
        { name: "Tosta Vegetariana", description: "Legumes grelhados · Queijo", price: 290 },
        { name: "Salada da Casa", description: "Folhas · Legumes frescos · Vinagrete", price: 380 },
      ],
    },
    {
      id: "doces",
      name: "Doces",
      note: "Para acompanhar o café.",
      items: [
        { name: "Croissant", description: "Folhado · Manteiga", price: 120 },
        { name: "Pastel de Nata", description: "Massa folhada · Creme", price: 80 },
        {
          name: "Rolo de Canela",
          description: "Canela · Açúcar mascavado · Cobertura",
          price: 150,
        },
        { name: "Cookie de Chocolate", description: "Chocolate negro · Flor de sal", price: 120 },
        { name: "Bolo do Dia", description: "Pergunte ao balcão", price: 160 },
      ],
    },
  ],
};
