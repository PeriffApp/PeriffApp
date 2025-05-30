import { db, collection, getDocs, query, where } from "/firebase.js"; // Importando o Firebase

const cardsContainer = document.getElementById("cardsContainer");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const pesquisandoPor = document.querySelector(".pesq h3");

async function buscarPrestadoresFirestore(termo) {
  // Busca todos os prestadores
  const prestadoresRef = collection(db, "Usuario");
  const q = query(prestadoresRef, where("Tipo", "==", "Prestador"));
  const snap = await getDocs(q);

  // Filtro local por categoria, subCategoria OU nome (case-insensitive)
  const termoLower = termo.toLowerCase();
  const prestadores = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(p =>
      (p.Categoria && p.Categoria.toLowerCase() === termoLower) ||
      (p.subCategoria && p.subCategoria.toLowerCase() === termoLower) ||
      (p.Nome && p.Nome.toLowerCase().includes(termoLower))
    );
  return prestadores;
}

function renderCards(prestadoresList) {
  cardsContainer.innerHTML = "";
  noResults.style.display = prestadoresList.length ? "none" : "block";

  prestadoresList.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${p.foto || 'https://via.placeholder.com/300'}" alt="Foto de ${p.Nome || ''}" />
        <div class="name">${p.Nome || ''}</div>
        <div class="rating"><span class="star">⭐</span> ${p.avaliacao || '-'} (${p.totalAvaliacoes || 0} avaliações)</div>
        <div class="category">Categoria: ${p.Categoria || ''}${p.subCategoria ? ' / ' + p.subCategoria : ''}</div>
      `;
    cardsContainer.appendChild(card);
  });
}

async function pesquisar() {
  const termo = searchInput.value.trim();
  pesquisandoPor.textContent = termo || 'Todos';
  if (!termo) {
    renderCards([]);
    return;
  }
  const prestadores = await buscarPrestadoresFirestore(termo);
  renderCards(prestadores);
}

searchBtn.addEventListener("click", pesquisar);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") pesquisar();
});

// Ao carregar a página, verifica se veio termo de pesquisa na URL
const urlParams = new URLSearchParams(window.location.search);
const termoPesquisa = urlParams.get("pesquisa");
if (termoPesquisa) {
  searchInput.value = termoPesquisa;
  pesquisandoPor.textContent = termoPesquisa;
  pesquisar();
}

// Opcional: carregar todos ao abrir (ou deixar vazio)
pesquisandoPor.textContent = 'Todos';
renderCards([]);
