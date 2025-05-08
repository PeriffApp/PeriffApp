import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "./firebase.js"; // Importando o Firebase


// JavaScript para controle dos modais e formulários
document.addEventListener('DOMContentLoaded', function() {

    

    // Elementos do modal
    const modal = document.getElementById('loginModal');
    const btnOpenModal = document.querySelector('.cta-button');
    const btnLogout = document.getElementById('logoutButton');
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

    // observador para verificar se o usuario está logado
    onAuthStateChanged(auth, (user) => {
        if (user) {
                      
            const uid = user.uid;
            console.log("STATUS: Usuário logado com UID: " + uid);
            btnOpenModal.style.display = 'none'; // Esconde o botão de login
            btnLogout.style.display = 'block'; // Mostra o botão de logout

        } else {
            console.log("STATUS: Usuário não logado");
        }
    });

    btnLogin.addEventListener('click', e => {
        e.preventDefault();

        // pega os valores dos inputs de email e senha
        const Email = email.value.trim();
        const Password = password.value;

        // realiza o login com o firebase autentication
        signInWithEmailAndPassword(auth, Email, Password)
        .then((userCredential) => {
          
          // pega o usuario logado  
          const user = userCredential.user;

          alert("Login realizado com sucesso!")

          // redirecionar para a pagina perfilPrestador.html
          window.location.replace("./PerfilPrestador/perfilPrestador.html");
          

        })
        .catch((error) => {
          alert("Erro ao realizar login!")

        });
    })

    btnLogout.addEventListener('click', e => {
        e.preventDefault();

        signOut(auth)
        .then(() => {
          // Logout bem‑sucedido
          alert("Você saiu da sua conta.");
          // Redireciona de volta para a página de login
          btnLogout.style.display = 'none';
          btnOpenModal.style.display = 'block';
        })
        .catch((error) => {
          console.error("Erro ao sair:", error);
          alert("Não foi possível deslogar. Tente novamente.");
        });



    })


    
        
        
});





