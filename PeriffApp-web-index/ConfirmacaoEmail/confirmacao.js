import { auth, sendEmailVerification, signOut } from "../firebase.js";

// ------------------------------
// Funções de Loading
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
  // anima fade-out
  ov.style.transition = "opacity 0.3s ease";
  ov.style.opacity = "0";
  setTimeout(() => {
    ov.style.display = "none";
    // reset para próxima vez
    ov.style.transition = "";
    ov.style.opacity = "1";
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  // Esconde overlay inicialmente caso permaneça
  hideLoading();

  // ------------------------------
  // Variáveis Globais
  // ------------------------------
  let uid = null;
  let verifiquei = null;

  // Esconde passo 5 até envio
  const step5 = document.getElementById("step5");
  if (step5) step5.style.display = "none";

  // ------------------------------
  // Envio de Verificação
  // ------------------------------
  const enviarBtn = document.getElementById("enviar");
  if (enviarBtn) {
    enviarBtn.addEventListener("click", async () => {
      showLoading();
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("Usuário não autenticado");
          return;
        }
        uid = user.uid;
        console.log("STATUS: Usuário logado com UID: " + uid);

        // Envia e-mail de verificação
        await sendEmailVerification(user);
        alert("Verifique seu e-mail para ativar a conta.");
        verifiquei = user.emailVerified;

        // Avança etapas de UI
        document.getElementById("step2").style.display = "none";
        step5.style.display = "block";
      } catch (error) {
        console.error("Erro ao enviar e-mail de verificação:", error);
        alert(
          "Não foi possível enviar o e-mail de verificação. Tente novamente."
        );
      } finally {
        hideLoading();
      }
    });
  }

  // ------------------------------
  // Confirmação e Logout
  // ------------------------------
  const verifiqueiBtn = document.getElementById("verifiquei");
  if (verifiqueiBtn) {
    verifiqueiBtn.addEventListener("click", async () => {
      showLoading();
      try {
        await signOut(auth);
        window.location.replace("../index.html");
      } catch (error) {
        console.error("Erro ao sair:", error);
        alert("Não foi possível deslogar. Tente novamente.");
      } finally {
        hideLoading();
      }
    });
  }
});
