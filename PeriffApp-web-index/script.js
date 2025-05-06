
import { auth, db, collection, addDoc } from "./firebase.js"; 
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
//import { cpf } from "../PeriffApp-web-index/node_modules/cpf-cnpj-validator/dist/cpf-cnpj-validator.es.js";


// Função para validação de CPF
function validarCPF(cpf) {
   
    // Remove caracteres não-numéricos (pontos, traços, etc.)
    cpf = cpf.replace(/\D/g, '');
  
    // Verifica se o CPF possui 11 dígitos
    if (cpf.length !== 11) return false;
  
    // Elimina CPFs formados por números repetidos (ex.: 00000000000, 11111111111, etc.)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Bloqueia CPFs conhecidos como de exemplo
    if (cpf === "12345678909") return false;
  
    // Validação do primeiro dígito verificador:
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
  
    // Validação do segundo dígito verificador:
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
  
    // Se passou por todas as validações, o CPF é válido
    return true;

  }

// JavaScript para controle dos modais e formulários
document.addEventListener('DOMContentLoaded', function() {

        // Elementos do modal
    const modal = document.getElementById('loginModal');
    const btnOpenModal = document.querySelector('.cta-button');
    const spanClose = document.querySelector('.close-modal');
    
    // Elementos de sele��o de tipo de usu�rio
    const clientType = document.getElementById('clientType');
    const providerType = document.getElementById('providerType');
    
    // Formul�rios
    const clientForm = document.getElementById('clientForm');
    const providerForm = document.getElementById('providerForm');
    
    // Campos de documento do prestador
    const docTypeRadios = document.querySelectorAll('input[name="docType"]');
    const cpfField = document.getElementById('cpfField');
    const cnpjField = document.getElementById('cnpjField');
    
    // Abrir modal quando clicar no bot�o Entrar
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
    
    // Resetar formul�rios quando fechar modal
    function resetForms() {
        clientType.classList.remove('selected');
        providerType.classList.remove('selected');
        clientForm.style.display = 'none';
        providerForm.style.display = 'none';
        
        // Resetar formul�rio de cliente
        document.getElementById('clientRegisterForm').reset();
        
        // Resetar formul�rio de prestador
        document.getElementById('providerRegisterForm').reset();
        document.querySelector('input[name="docType"][value="cpf"]').checked = true;
        cpfField.style.display = 'block';
        cnpjField.style.display = 'none';
    }
        
        // Validação do formulário de cliente
        document.getElementById('clientRegisterForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Coleta os dados do formulário
            const cpf = document.getElementById('clientCPF').value;
            const email = document.getElementById('clientEmail').value;
            const nome = document.getElementById('clientName').value;
            const password = document.getElementById('clientPassword').value;
            const confirmPassword = document.getElementById('clientConfirmPassword').value;
            const telefone = document.getElementById('clientPhone').value;
            // const tipo = document.getElementById('clientType').value; // ainda não está implementado no HTML
                               
            // Validação básica - verificar se senhas coincidem
            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }
            
            // Chama a função de validação de CPF
            if (validarCPF(cpf) === false) {
                alert("CPF inválido!");
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
                    UID: uid, // ✅ salva o UID do usuário
                    CPF: cpf, 
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
                // Erro de usuario já existente
                if (error.code === 'auth/email-already-in-use') {
                    alert('Este e-mail já está em uso.');
                    return;
                // Erro de senha menor que 6 caracteres    
                } else if (error.code === 'auth/password-does-not-meet-requirements') {
                    alert('A senha deve ter pelo menos 6 caracteres.');
                    return;
                }else {
                    // Outros erros
                    console.error("Erro ao criar o usuário:", error);
                    alert('Erro ao criar o usuário. Tente novamente mais tarde.');
                    return;
                }
            });

        });
        

        // Valida  o do formulário de prestador
        document.getElementById('providerRegisterForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Coleta os dados do formulário
            const tipoDoc = document.querySelector('input[name="docType"]:checked').value;
            const email = document.getElementById('providerEmail').value;
            const nome = document.getElementById('providerName').value;
            const password = document.getElementById('providerPassword').value;
            const confirmPassword= document.getElementById('providerConfirmPassword').value;
            const telefone = document.getElementById('providerPhone').value;
            let cnpj = null; // inicializa como null para evitar erro de escopo
            let cpf = null; // inicializa como null para evitar erro de escopo
            
            // Verifica qual tipo de documento foi selecionado
            if (tipoDoc === 'cpf') {
                 cpf = document.getElementById('providerCPF').value;
            } else {
                 cnpj = document.getElementById('providerCNPJ').value;
            }
            
            // Verificar se senhas coincidem
            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }

            // Chama a função de validação de CPF
            if (validarCPF(cpf) === false) {
                alert("CPF inválido!");
                return;
            } 
            
            if (!document.getElementById('providerTerms').checked) {
                alert('Você deve aceitar os Termos de Uso!');
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
                    UID: uid, // ✅ salva o UID do usuário
                    CPF: cpf,
                    CNPJ: cnpj, 
                    Email: email,
                    Nome: nome,
                    Senha: password,
                    Telefone: telefone,
                    Tipo: null, // Tipo ainda não implementado no HTML  
                });
            })
            .then((docRef) => {

                // O documento foi criado com sucesso
                console.log("Documento criado com ID:", docRef.id);
                alert("Cadastro de cliente realizado com sucesso!");
                modal.style.display = "none";
                document.body.style.overflow = "auto";
                resetForms();

            })
            .catch((error) => {

                // Erro de usuario já existente
                if (error.code === 'auth/email-already-in-use') {
                    alert('Este e-mail já está em uso.');
                    return;
                // Erro de senha menor que 6 caracteres    
                } else if (error.code === 'auth/password-does-not-meet-requirements') {
                    alert('A senha deve ter pelo menos 6 caracteres.');
                    return;
                } else {
                    // Outros erros
                    console.error("Erro ao criar o usuário:", error);
                    alert('Erro ao criar o usuário. Tente novamente mais tarde.');
                    return;
                }

            });
            
        });
});





