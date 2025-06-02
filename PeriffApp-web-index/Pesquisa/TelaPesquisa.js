import {
  db,
  collection,
  getDocs,
  query,
  where,
  onAuthStateChanged,
  doc,
  getDoc
} from "../firebase.js";
import { auth } from "../firebase.js";

// Buscar preferencia de tema
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = doc(db, "Usuario", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().preferenciaDarkMode === true) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    } catch (e) {
      console.error("Erro ao buscar preferência de modo dark:", e);
    }
  }
});

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
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        avaliacao: data.mediaAvaliacao || '-',
        totalAvaliacoes: typeof data.totalAvaliacoes === 'number' ? data.totalAvaliacoes : '-' // Mostra '-' se não existir
      };
    })
    .filter(p =>
      (p.Categoria && p.Categoria.toLowerCase() === termoLower) ||
      (p.subCategoria && p.subCategoria.toLowerCase() === termoLower) ||
      (p.Nome && p.Nome.toLowerCase().includes(termoLower))
    );
  return prestadores;
}

function renderCards(prestadoresList, loggedUid) {
  cardsContainer.innerHTML = "";
  noResults.style.display = prestadoresList.length ? "none" : "block";

  prestadoresList.forEach((p) => {
    if (loggedUid && p.id === loggedUid) return; // Não renderiza o card do usuário logado
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${p.foto || '../imagens/perfilUsuario2.jpg'}" alt="Foto de ${p.Nome || ''}" />
        <div class="name">${p.Nome || ''}</div>
        <div class="rating"><span class="star">⭐</span> ${p.avaliacao} (${p.totalAvaliacoes} avaliações)</div>
        <div class="category">Categoria: ${p.Categoria || ''}${p.subCategoria ? ' / ' + p.subCategoria : ''}</div>
      `;
    card.addEventListener('click', () => {
      window.location.href = `../perfilPrestador2/perfilPrestador.html?uid=${p.id}`;
    });
    cardsContainer.appendChild(card);
  });
}

// ------------------------------
// Funções de Loading (igual index.js)
// ------------------------------
function showLoading() {
  const ov = document.getElementById("loading-overlay");
  if (ov) {
    ov.style.opacity = "1";
    ov.style.display = "flex";
  }
}

function hideLoading() {
  const ov = document.getElementById("loading-overlay");
  if (!ov) return;
  ov.style.transition = "opacity 0.3s ease";
  ov.style.opacity = "0";
  setTimeout(() => {
    ov.style.display = "none";
    ov.style.transition = "";
    ov.style.opacity = "1";
  }, 300);
}

async function pesquisar() {
  const termo = searchInput.value.trim();
  pesquisandoPor.textContent = termo || 'Todos';
  showLoading();
  if (!termo) {
    renderCards([], auth.currentUser ? auth.currentUser.uid : null);
    hideLoading();
    return;
  }
  const prestadores = await buscarPrestadoresFirestore(termo);
  renderCards(prestadores, auth.currentUser ? auth.currentUser.uid : null);
  hideLoading();
}

searchBtn.addEventListener("click", pesquisar);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") pesquisar();
});

// Exibe o loading assim que a página começa a carregar
showLoading();

document.addEventListener("DOMContentLoaded", async () => {
  // Ajuste para carregar todos ao abrir (ou deixar vazio)
  const urlParams = new URLSearchParams(window.location.search);
  const termoPesquisa = urlParams.get("pesquisa");
  if (termoPesquisa) {
    searchInput.value = termoPesquisa;
    pesquisandoPor.textContent = termoPesquisa;
    showLoading();
    await pesquisar();
  } else {
    pesquisandoPor.textContent = "Todos";
    showLoading();
    const prestadores = await buscarPrestadoresFirestore("");
    renderCards(prestadores, auth.currentUser ? auth.currentUser.uid : null);
    hideLoading();
  }
});

// Ao carregar a página, verifica se veio termo de pesquisa na URL
const urlParams = new URLSearchParams(window.location.search);
const termoPesquisa = urlParams.get("pesquisa");
if (termoPesquisa) {
  searchInput.value = termoPesquisa;
  pesquisandoPor.textContent = termoPesquisa;
  showLoading();
  pesquisar();
}
