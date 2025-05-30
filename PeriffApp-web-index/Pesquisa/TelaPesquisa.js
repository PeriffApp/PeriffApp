const prestadores = [
  {
    nome: "João Silva",
    foto: "https://via.placeholder.com/300",
    avaliacao: 4.8,
    totalAvaliacoes: 150,
    categoria: "Tecnologia",
  },
  {
    nome: "Maria Oliveira",
    foto: "https://via.placeholder.com/300",
    avaliacao: 4.5,
    totalAvaliacoes: 98,
    categoria: "Beleza",
  },
  {
    nome: "Carlos Souza",
    foto: "https://via.placeholder.com/300",
    avaliacao: 4.9,
    totalAvaliacoes: 200,
    categoria: "Tecnologia",
  },
  {
    nome: "Ana Costa",
    foto: "https://via.placeholder.com/300",
    avaliacao: 4.7,
    totalAvaliacoes: 112,
    categoria: "Saúde",
  },
  {
    nome: "Pedro Lima",
    foto: "https://via.placeholder.com/300",
    avaliacao: 4.6,
    totalAvaliacoes: 85,
    categoria: "Tecnologia",
  },
  {
    nome: "Juliana Rocha",
    foto: "https://via.placeholder.com/300",
    avaliacao: 4.9,
    totalAvaliacoes: 143,
    categoria: "Design",
  },
  {
    nome: "Fernando Reis",
    foto: "https://via.placeholder.com/300",
    avaliacao: 4.4,
    totalAvaliacoes: 77,
    categoria: "Construção",
  },
  {
    nome: "Isabela Martins",
    foto: "https://via.placeholder.com/300",
    avaliacao: 5.0,
    totalAvaliacoes: 192,
    categoria: "Tecnologia",
  },
];

const cardsContainer = document.getElementById("cardsContainer");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");

function filterCards() {
  const query = searchInput.value.toLowerCase();
  const filteredPrestadores = prestadores.filter(
    (p) =>
      p.nome.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query)
  );

  renderCards(filteredPrestadores);
}

function renderCards(prestadoresList) {
  cardsContainer.innerHTML = "";
  noResults.style.display = prestadoresList.length ? "none" : "block";

  prestadoresList.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${p.foto}" alt="Foto de ${p.nome}" />
        <div class="name">${p.nome}</div>
        <div class="rating"><span class="star">⭐</span> ${p.avaliacao} (${p.totalAvaliacoes} avaliações)</div>
        <div class="category">Categoria: ${p.categoria}</div>
      `;
    cardsContainer.appendChild(card);
  });
}

// Inicializa com todos os prestadores
renderCards(prestadores);
