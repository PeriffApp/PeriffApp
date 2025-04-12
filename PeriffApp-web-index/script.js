
import { auth, db, collection, addDoc } from "./firebase.js"; 
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// JavaScript para controle dos modais e formul rios
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do modal
    const modal = document.getElementById('loginModal');
    const btnOpenModal = document.querySelector('.cta-button');
    const spanClose = document.querySelector('.close-modal');
    
    // Elementos de sele  o de tipo de usu rio
    const clientType = document.getElementById('clientType');
    const providerType = document.getElementById('providerType');
    
    // Formul rios
    const clientForm = document.getElementById('clientForm');
    const providerForm = document.getElementById('providerForm');
    
    // Campos de documento do prestador
    const docTypeRadios = document.querySelectorAll('input[name="docType"]');
    const cpfField = document.getElementById('cpfField');
    const cnpjField = document.getElementById('cnpjField');
    
    // Abrir modal quando clicar no bot o Entrar
    btnOpenModal.addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impede scroll da página
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
    
    // Selecionar tipo Cliente
    clientType.addEventListener('click', function() {
        clientType.classList.add('selected');
        providerType.classList.remove('selected');
        clientForm.style.display = 'block';
        providerForm.style.display = 'none';
    });
    
    // Selecionar tipo Prestador
    providerType.addEventListener('click', function() {
        providerType.classList.add('selected');
        clientType.classList.remove('selected');
        providerForm.style.display = 'block';
        clientForm.style.display = 'none';
    });
    
    // Alternar entre CPF e CNPJ
    docTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'cpf') {
                cpfField.style.display = 'block';
                cnpjField.style.display = 'none';
                document.getElementById('providerCPF').required = true;
                document.getElementById('providerCNPJ').required = false;
            } else {
                cpfField.style.display = 'none';
                cnpjField.style.display = 'block';
                document.getElementById('providerCPF').required = false;
                document.getElementById('providerCNPJ').required = true;
            }
        });
    });
    
    // Resetar formul rios quando fechar modal
    function resetForms() {
        clientType.classList.remove('selected');
        providerType.classList.remove('selected');
        clientForm.style.display = 'none';
        providerForm.style.display = 'none';
        
        // Resetar formul rio de cliente
        document.getElementById('clientRegisterForm').reset();
        
        // Resetar formulário de prestador
        document.getElementById('providerRegisterForm').reset();
        document.querySelector('input[name="docType"][value="cpf"]').checked = true;
        cpfField.style.display = 'block';
        cnpjField.style.display = 'none';
    }
    
    // Validação do formulário de cliente
    document.getElementById('clientRegisterForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Evita o recarregamento da página
        event.preventDefault();
        
        // Coleta os dados do formulário
        const email = document.getElementById('clientEmail').value;
        const nome = document.getElementById('clientName').value;
        const password = document.getElementById('clientPassword').value;
        const confirmPassword= document.getElementById('clientConfirmPassword').value;
        const telefone = document.getElementById('clientPhone').value;
        // const tipo = document.getElementById('clientType').value; // ainda não está implementado no HTML
        // const cpf = document.getElementById('clientCPF').value; // ainda não está implementado no HTML
        
        
        // Validação básica - verificar se senhas coincidem
        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        
        

    // criação do usuário no Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const uid = userCredential.user.uid;

            // definindo a coleção de usuários no Firestore
            const UsuarioCollection = collection(db, "Usuario");

            // adicionando documento no Firestore
            return addDoc(UsuarioCollection, {
                UID: uid, // ✅ salva o UID aqui dentro
                CPF: null, // CPF ainda não implementado no HTML
                Email: email,
                Nome: nome,
                Senha: password,
                Telefone: telefone,
                Tipo: null, // Tipo ainda não implementado no HTML  
            });
        })
        .then((docRef) => {
            console.log("Documento criado com ID:", docRef.id);
            alert("Cadastro de cliente realizado com sucesso!");
            modal.style.display = "none";
            document.body.style.overflow = "auto";
            resetForms();
        })
        .catch((error) => {
            console.error("Erro ao criar usuário ou documento:", error);
        });



        // Aqui você  pode adicionar a lógica para enviar o formulário
        alert('Cadastro de cliente realizado com sucesso!');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForms();

    });
    
    // Valida  o do formulário de prestador
    document.getElementById('providerRegisterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validação básica
        const password = document.getElementById('providerPassword').value;
        const confirmPassword = document.getElementById('providerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }
        
        if (!document.getElementById('providerTerms').checked) {
            alert('Você deve aceitar os Termos de Uso!');
            return;
        }
        
        // Aqui você  pode adicionar a lógica para enviar o formulário
        alert('Cadastro de profissional realizado com sucesso!');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetForms();
    });
});



