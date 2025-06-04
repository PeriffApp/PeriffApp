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

// Redireciona para pesquisa ao clicar em uma categoria
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

showLoading();

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
  // Só esconde o loading após aplicar o tema e o DOM estar pronto
  if (document.readyState === "complete" || document.readyState === "interactive") {
    hideLoading();
  } else {
    window.addEventListener("DOMContentLoaded", hideLoading);
  }
});

ativarClickCategorias();
