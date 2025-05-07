import { auth, signInWithEmailAndPassword } from "./firebase.js"; // Importando o Firebase




// JavaScript para controle dos modais e formulários
document.addEventListener('DOMContentLoaded', function() {

    // Elementos do modal
    const modal = document.getElementById('loginModal');
    const btnOpenModal = document.querySelector('.cta-button');
    const spanClose = document.querySelector('.close-modal');
    const btnLogin = document.getElementById('btnLogin');

    // pegando usuario e senha 
    const email = document.getElementById('loginEmail')
    const password = document.getElementById('loginPassword')
    
    
    // Abrir modal quando clicar no botão Entrar
    btnOpenModal.addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impede scroll da p�gina
    });
    
    // Fechar modal quando clicar no X
    spanClose.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForms();
    });
    
    // Fechar modal quando clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetForms();
        }
    });
       
    // Resetar formulários quando fechar modal
    function resetForms() {
        clientType.classList.remove('selected');
        providerType.classList.remove('selected');
        clientForm.style.display = 'none';
        providerForm.style.display = 'none';
        
    }

    btnLogin.addEventListener('click', e => {
        e.preventDefault();

        const Email = email.value.trim();
        const Password = password.value;

       
        signInWithEmailAndPassword(auth, Email, Password)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          // ...
          console.log("LOGADO!");
        })
        .catch((error) => {
          console.log("ERRO: ", error.message);
        });
        
        
    })
    
        
        
});





