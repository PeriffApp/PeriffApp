// Importa funções de autenticação do Firebase
import { auth, sendEmailVerification, signOut } from "../firebase.js";

/**
 * Exibe o overlay de loading na tela.
 * Procura pelo elemento com id "loading-overlay" e altera seu estilo para visível.
 */
function showLoading() {
  const ov = document.getElementById("loading-overlay");
  if (ov) {
    ov.style.opacity = "1";
    ov.style.display = "flex";
  }
}

/**
 * Esconde o overlay de loading da tela.
 * Aplica uma transição de opacidade e, após 300ms, oculta o elemento.
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

// Executa quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  // Esconde overlay de loading caso esteja visível
  hideLoading();

  // Variáveis globais para armazenar UID do usuário e status de verificação
  let uid = null;
  let verifiquei = null;

  // Esconde o passo 5 da interface até que o e-mail seja enviado
  const step5 = document.getElementById("step5");
  if (step5) step5.style.display = "none";

  /**
   * Envio de e-mail de verificação
   * Ao clicar no botão "enviar", envia um e-mail de verificação para o usuário autenticado.
   * Após o envio, exibe uma mensagem e avança para o passo 5 da interface.
   */
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
        verifiquei = user.emailVerified;

        // Atualiza interface: esconde passo 2 e mostra passo 5
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

  /**
   * Confirmação de verificação e logout
   * Ao clicar no botão "verifiquei", faz logout do usuário e redireciona para a página inicial.
   */
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
