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

// -------------------------------------------------------------
// categoria.js - Script de exibição e navegação de categorias
// -------------------------------------------------------------
// Este arquivo gerencia a exibição das categorias, aplica preferências de tema,
// e redireciona o usuário para a tela de pesquisa ao clicar em uma categoria.
// -------------------------------------------------------------

// ------------------------------
// Funções de Loading (igual index.js)
// ------------------------------
/**
 * Exibe o overlay de loading na tela.
 */
function showLoading() {
  const ov = document.getElementById("loading-overlay");
  if (ov) {
    ov.style.opacity = "1";
    ov.style.display = "flex";
  }
}

/**
 * Esconde o overlay de loading da tela com animação de opacidade.
 */
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

/**
 * Adiciona evento de clique nas categorias para redirecionar para a tela de pesquisa,
 * passando o nome da categoria selecionada como parâmetro na URL.
 */
function ativarClickCategorias() {
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", function () {
      const categoria = card.querySelector("h4")?.innerText?.trim();
      if (categoria) {
        window.location.href = `../Pesquisa/TelaPesquisa.html?pesquisa=${encodeURIComponent(categoria)}`;
      }
    });
  });
}

// Exibe o loading ao iniciar a página
showLoading();

// Buscar preferencia de tema e exibir/ocultar botão de perfil
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
      // Busca a preferência de modo escuro do usuário logado
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
  // Só esconde o loading após aplicar o tema e o DOM estar pronto
  if (document.readyState === "complete" || document.readyState === "interactive") {
    hideLoading();
  } else {
    window.addEventListener("DOMContentLoaded", hideLoading);
  }
});

// Ativa os cliques nas categorias após carregar a página
ativarClickCategorias();
