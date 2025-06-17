// Importa módulos do Firebase necessários para autenticação e acesso ao banco de dados
import {db, auth, onAuthStateChanged, doc, getDoc,  } from "../firebase.js";
// Importa função para envio de e-mail de redefinição de senha
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Ao detectar mudança de autenticação, busca a preferência de tema do usuário logado
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Referência ao documento do usuário no Firestore
      const userRef = doc(db, "Usuario", user.uid);
      const userSnap = await getDoc(userRef);
      // Aplica o tema escuro se a preferência estiver ativada
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

// Exibe mensagem de sucesso após envio do e-mail de redefinição
function mostrarSucesso() {
  document.getElementById("step1").style.display = "none";
  const step5 = document.getElementById("step5");
  step5.style.display = "block";
  step5.querySelector("h2").innerText = "E-mail enviado!";
  step5.querySelector("p").innerText =
    "Enviamos um link de redefinição de senha para seu e-mail. Verifique sua caixa de entrada.";
}

// Valida se o e-mail informado está em um formato válido
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

// Traduz códigos de erro do Firebase para mensagens amigáveis
function traduzirErro(code) {
  if (code === "auth/user-not-found") return "E-mail não cadastrado.";
  if (code === "auth/invalid-email") return "E-mail inválido.";
  return "Tente novamente mais tarde.";
}

// Redireciona o usuário para a tela de login
window.redirectToLogin = function () {
  window.location.href = "../index.html";
};

// Adiciona listener ao formulário de recuperação de senha após o carregamento da página
document.addEventListener('DOMContentLoaded', function() {
  const recoveryForm = document.getElementById("recoveryForm");
  if (recoveryForm) {
    // Intercepta o envio do formulário para processar a recuperação de senha
    recoveryForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("userIdentity").value.trim();
      // Valida o e-mail antes de enviar
      if (!email || !validarEmail(email)) {
        alert("Por favor, informe um e-mail válido para recuperação.");
        return;
      }
      // Envia o e-mail de redefinição de senha usando o Firebase
      sendPasswordResetEmail(auth, email)
        .then(() => {
          mostrarSucesso();
        })
        .catch((error) => {
          alert(
            "Erro ao enviar e-mail de redefinição: " + traduzirErro(error.code)
          );
        });
    });
  }

});






