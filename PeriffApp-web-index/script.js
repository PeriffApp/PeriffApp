import {
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  query,
  where,
  collection,
  db,
  getDocs,
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

// ------------------------------
// Carrega e renderiza prestadores
// ------------------------------
async function carregarPrestadores() {
  const prestadoresRef = collection(db, "Usuario");
  const q = query(prestadoresRef, where("Tipo", "==", "Prestador"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const dados = doc.data();
    renderizarCardPrestador(dados, doc.id);
  });
}

function renderizarCardPrestador(dados, uid) {
  const container = document.getElementById("listaPrestadores");

  const card = document.createElement("div");
  card.classList.add("card-prestador");

  card.innerHTML = `
      <div class="card-header">
        
        <div class="info-prestador">
          <h3 class="nome-prestador">${dados.Nome || "Nome não disponível"}</h3>
          <p class="email-prestador">${
            dados.Email || "Email não disponível"
          }</p>
        </div>
      </div>
      <div class="card-footer">
        <a href="perfilPrestador2/perfilPrestador.html?uid=${uid}" class="btn-ver-perfil">Ver Perfil</a>
      </div>
    `;

  container.appendChild(card);
}

// JavaScript para controle dos modais e formulários

document.addEventListener("DOMContentLoaded", async function () {
  // Exibe overlay de loading até carregar tudo
  showLoading();
  try {
    await carregarPrestadores();

    // Elementos do modal
    const modal = document.getElementById("loginModal");
    const btnOpenModal = document.querySelector(".cta-button");
    const spanClose = document.querySelector(".close-modal");
    const btnLogin = document.getElementById("btnLogin");
    const btnPerfil = document.getElementById("btnPerfil");
    const btnEntrar = document.getElementById("btnEntrar");

    // pegando usuario e senha
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");

    // Abrir modal quando clicar no botão Entrar
    btnOpenModal.addEventListener("click", function () {
      modal.style.display = "block";
      document.body.style.overflow = "hidden"; // Impede scroll da página
    });

    // Fechar modal quando clicar no X
    spanClose.addEventListener("click", function () {
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

    // Resetar formulários quando fechar modal
    function resetForms() {
      clientType.classList.remove("selected");
      providerType.classList.remove("selected");
      clientForm.style.display = "none";
      providerForm.style.display = "none";
    }

    // observador para verificar se o usuario está logado
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log("STATUS: Usuário logado com UID: " + uid);
        btnEntrar.style.display = "none"; // Esconde o botão de entrar se o usuario estiver logado
        btnPerfil.style.display = "block"; // Exibe o botão para ir pro perfil
      } else {
        console.log("STATUS: Usuário não logado");
        btnEntrar.style.display = "block";
        btnPerfil.style.display = "none";
      }
    });

    btnLogin.addEventListener("click", (e) => {
      e.preventDefault();

      // pega os valores dos inputs de email e senha
      const Email = email.value.trim();
      const Password = password.value;

      // realiza o login com o firebase autentication
      signInWithEmailAndPassword(auth, Email, Password)
        .then((userCredential) => {
          const user = userCredential.user;

          if (user.emailVerified) {
            alert("Login realizado com sucesso!");
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
  } finally {
    // Esconde overlay depois de tudo
    hideLoading();
  }
});
