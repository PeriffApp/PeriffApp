import {
  auth,
  sendEmailVerification,
  onAuthStateChanged,
  signOut
} from "../firebase.js";

// Variáveis Globais
let uid = null;
let verifiquei = null;

// Controle dos modais
document.getElementById("step5").style.display = "none"; 




document.getElementById("enviar").addEventListener('click', function() {
    // Observador de autenticação
    onAuthStateChanged(auth, async (user) => {
        if (user) {
          uid = user;
          console.log("STATUS: Usuário logado com UID: " + uid);
          // Envia e-mail de verificação
          sendEmailVerification(user)
            .then(() => {
              alert("Verifique seu e-mail para ativar a conta.");
            })
            .catch((error) => {
              console.error("Erro ao enviar e-mail de verificação:", error);
              return
            });

            verifiquei = user.emailVerified;

        } else {
            // USUÁRIO NÃO LOGADO
            console.log("STATUS: Usuário não logado");
        }
    });

    document.getElementById("step2").style.display = "none";
    document.getElementById("step5").style.display = "block";


})

document.getElementById("verifiquei").addEventListener('click', function() {

    signOut(auth)
      .then(() => {
        // Logout bem‑sucedido
        window.location.replace("../index.html");
      })
      .catch((error) => {
        console.error("Erro ao sair:", error);
        alert("Não foi possível deslogar. Tente novamente.");
      });

})



 