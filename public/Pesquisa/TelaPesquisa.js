import {
  db,
  collection,
  getDocs,
  query,
  where,
  onAuthStateChanged,
  doc,
  getDoc,
  auth
} from "../firebase.js";


// Buscar preferencia de tema
onAuthStateChanged(auth, async (user) => {
  const meuPerfilBtn = document.getElementById("meuPerfilBtn");
  if (meuPerfilBtn) {
    if (user) {
      meuPerfilBtn.style.display = "block";
    } else {
      meuPerfilBtn.style.display = "none";
    }
  }
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

// Função para calcular distância de Levenshtein (fuzzy search)
function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // remoção
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Busca prestadores com filtro fuzzy
async function buscarPrestadoresFirestore(termo) {
  const prestadoresRef = collection(db, "Usuario");
  const q = query(prestadoresRef, where("Tipo", "==", "Prestador"));
  const snap = await getDocs(q);
  const termoLower = termo.toLowerCase();
  const prestadores = snap.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        avaliacao: data.mediaAvaliacao || '-',
        totalAvaliacoes: typeof data.totalAvaliacoes === 'number' ? data.totalAvaliacoes : '-'
      };
    });
  // Filtro exato/parcial
  let filtrados = prestadores.filter(p =>
    (p.Categoria && p.Categoria.toLowerCase().includes(termoLower)) ||
    (p.subCategoria && p.subCategoria.toLowerCase().includes(termoLower)) ||
    (p.Nome && p.Nome.toLowerCase().includes(termoLower))
  );
  // Se não achou nada, faz fuzzy
  if (filtrados.length === 0 && termoLower.length > 2) {
    filtrados = prestadores.filter(p => {
      const campos = [p.Categoria, p.subCategoria, p.Nome].filter(Boolean).map(x => x.toLowerCase());
      return campos.some(campo => levenshtein(campo, termoLower) <= 2 || campo.includes(termoLower));
    });
  }
  return filtrados;
}

function renderCards(prestadoresList, loggedUid) {
  cardsContainer.innerHTML = "";
  noResults.style.display = prestadoresList.length ? "none" : "block";

  prestadoresList.forEach((p) => {
    if (loggedUid && p.id === loggedUid) return; // Não renderiza o card do usuário logado
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${p.foto || '../imagens/perfilusuario2.jpg'}" alt="Foto de ${p.Nome || ''}" />
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
