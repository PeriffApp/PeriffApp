import { auth } from '../firebase.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
  const recoveryForm = document.getElementById("recoveryForm");
  if (recoveryForm) {
    recoveryForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("userIdentity").value.trim();
      if (!email || !validarEmail(email)) {
        alert("Por favor, informe um e-mail válido para recuperação.");
        return;
      }
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

  // Para ativar o modo Dark!
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
});

function mostrarSucesso() {
  document.getElementById('step1').style.display = 'none';
  const step5 = document.getElementById('step5');
  step5.style.display = 'block';
  step5.querySelector('h2').innerText = 'E-mail enviado!';
  step5.querySelector('p').innerText = 'Enviamos um link de redefinição de senha para seu e-mail. Verifique sua caixa de entrada.';
}

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

function traduzirErro(code) {
  if (code === 'auth/user-not-found') return 'E-mail não cadastrado.';
  if (code === 'auth/invalid-email') return 'E-mail inválido.';
  return 'Tente novamente mais tarde.';
}

window.redirectToLogin = function() {
  window.location.href = '../index.html';
};


