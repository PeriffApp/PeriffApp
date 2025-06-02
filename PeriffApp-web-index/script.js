import {
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  query,
  where,
  collection,
  db,
  getDocs,
  doc,
  getDoc
} from "./firebase.js"; // Importando o Firebase


// ------------------------------
// Funções de Loading
// ------------------------------
function showLoading() {
  const ov = document.getElementById("loading-overlay");
  if (ov) ov.style.display = "flex";
}
function hideLoading() {
  const ov = document.getElementById("loading-overlay");
  if (!ov) return;
  ov.style.transition = "opacity 0.3s ease";
  ov.style.opacity = "0";
  setTimeout(() => ov.remove(), 300);
}

// observador para verificar se o usuario está logado
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    console.log("STATUS: Usuário logado com UID: " + uid);
    document.getElementById("btnEntrar").style.display = "none"; // Esconde o botão de entrar se o usuario estiver logado
    document.getElementById("btnPerfil").style.display = "block"; // Exibe o botão para ir pro perfil
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
  } else {
    console.log("STATUS: Usuário não logado");
    document.getElementById("btnEntrar").style.display = "block";
    document.getElementById("btnPerfil").style.display = "none";
  }
  await carregarPrestadores(); // Chama aqui, após saber o usuário logado
});

// ------------------------------
// Carrega e renderiza prestadores
// ------------------------------
async function carregarPrestadores() {
  const user = auth.currentUser;
  let loggedUid = null;
  if (user) loggedUid = user.uid;

  const prestadoresRef = collection(db, "Usuario");
  const q = query(prestadoresRef, where("Tipo", "==", "Prestador"));
  const querySnapshot = await getDocs(q);

  const prestadores = [];
  querySnapshot.forEach((doc) => {
    if (doc.id === loggedUid) return; // Não renderiza o card do usuário logado
    const dados = doc.data();
    prestadores.push({
      id: doc.id,
      ...dados,
      avaliacao: dados.mediaAvaliacao || '-',
      totalAvaliacoes: typeof dados.totalAvaliacoes === 'number' ? dados.totalAvaliacoes : '-'
    });
  });
  renderCards(prestadores);
}

// Função para renderizar cards no mesmo formato da tela de pesquisa
function renderCards(prestadoresList) {
  const cardsContainer = document.getElementById("listaPrestadores");
  if (!cardsContainer) return;
  cardsContainer.innerHTML = "";
  if (!prestadoresList.length) {
    cardsContainer.innerHTML = '<div style="text-align:center; color:#999; width:100%">Nenhum prestador encontrado.</div>';
    return;
  }
  prestadoresList.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${p.foto || 'imagens/perfilusuario2.jpg'}" alt="Foto de ${p.Nome || ''}" />
        <div class="name">${p.Nome || ''}</div>
        <div class="rating"><span class="star">⭐</span> ${p.avaliacao || '-'} (${p.totalAvaliacoes || '-'} avaliações)</div>
        <div class="category">Categoria: ${p.Categoria || ''}${p.subCategoria ? ' / ' + p.subCategoria : ''}</div>
        
      `;
    card.addEventListener('click', () => {
      window.location.href = `perfilPrestador2/perfilPrestador.html?uid=${p.id}`;
    });
    cardsContainer.appendChild(card);
  });
}

// Redireciona para pesquisa ao clicar em uma categoria
function ativarClickCategorias() {
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", function () {
      const categoria = card.querySelector("h4")?.innerText?.trim();
      if (categoria) {
        window.location.href = `Pesquisa/TelaPesquisa.html?pesquisa=${encodeURIComponent(categoria)}`;
      }
    });
  });
}

// ------------------------------
// Reseta o formulário de login
// ------------------------------
function resetForms() {
  clientType.classList.remove("selected");
  providerType.classList.remove("selected");
  clientForm.style.display = "none";
  providerForm.style.display = "none";
}

// JavaScript para controle dos modais e formulários
document.addEventListener("DOMContentLoaded", async function () {
  // Exibe overlay de loading até carregar tudo
  showLoading();
  try {
    // await carregarPrestadores(); // REMOVIDO DAQUI

    // Elementos do modal
    const modal = document.getElementById("loginModal");

    // pegando usuario e senha
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");

    // Abrir modal quando clicar no botão Entrar
    document.querySelector(".cta-button").addEventListener("click", function () {
      modal.style.display = "block";
      document.body.style.overflow = "hidden"; // Impede scroll da página
    });

    // Fechar modal quando clicar no X
    document.querySelector(".close-modal").addEventListener("click", function () {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      resetForms();
    });

    // Fechar modal quando clicar fora dele
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        resetForms();
      }
    });

    document.getElementById("btnLogin").addEventListener("click", (e) => {
      e.preventDefault();

      // pega os valores dos inputs de email e senha
      const Email = email.value.trim();
      const Password = password.value;

      // realiza o login com o firebase autentication
      signInWithEmailAndPassword(auth, Email, Password)
        .then((userCredential) => {
          const user = userCredential.user;

          if (user.emailVerified) {
            window.location.replace("./index.html");
          } else {
            alert("Por favor, verifique seu e-mail antes de fazer login.");
            auth.signOut();
          }
        })
        .catch((error) => {
          alert("Erro ao realizar login!");
        });
    });

    // Script para redirecionar para a tela de pesquisa
    const indexSearchInput = document.getElementById("indexSearchInput");
    const indexSearchBtn = document.getElementById("indexSearchBtn");

    if (indexSearchBtn && indexSearchInput) {
      indexSearchBtn.addEventListener("click", () => {
        const termo = indexSearchInput.value.trim();
        if (termo) {
          window.location.href = `Pesquisa/TelaPesquisa.html?pesquisa=${encodeURIComponent(termo)}`;
        } else {
          window.location.href = "Pesquisa/TelaPesquisa.html";
        }
      });
      indexSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const termo = indexSearchInput.value.trim();
          if (termo) {
            window.location.href = `Pesquisa/TelaPesquisa.html?pesquisa=${encodeURIComponent(termo)}`;
          } else {
            window.location.href = "Pesquisa/TelaPesquisa.html";
          }
        }
      });
    }
    ativarClickCategorias();
  } finally {
    // Esconde overlay depois de tudo
    hideLoading();
  }
  


});



