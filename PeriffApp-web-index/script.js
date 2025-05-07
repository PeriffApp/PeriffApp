import { auth } from "./firebase.js"; // Importando o Firebase



// JavaScript para controle dos modais e formulários
document.addEventListener('DOMContentLoaded', function() {

    // Elementos do modal
    const modal = document.getElementById('loginModal');
    const btnOpenModal = document.querySelector('.cta-button');
    const spanClose = document.querySelector('.close-modal');
    
    // Elementos de seleçãoo de tipo de usuário
    const clientType = document.getElementById('clientType');
    const providerType = document.getElementById('providerType');
    
    // Formulários
    const clientForm = document.getElementById('clientForm');
    const providerForm = document.getElementById('providerForm');
    
    // Campos de documento do prestador
    const docTypeRadios = document.querySelectorAll('input[name="docType"]');
    const cpfField = document.getElementById('cpfField');
    const cnpjField = document.getElementById('cnpjField');
    
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
    
    // Resetar formulários quando fechar modal
    function resetForms() {
        clientType.classList.remove('selected');
        providerType.classList.remove('selected');
        clientForm.style.display = 'none';
        providerForm.style.display = 'none';
        
        // Resetar formulário de cliente
        document.getElementById('clientRegisterForm').reset();
        
        // Resetar formul�rio de prestador
        document.getElementById('providerRegisterForm').reset();
        document.querySelector('input[name="docType"][value="cpf"]').checked = true;
        cpfField.style.display = 'block';
        cnpjField.style.display = 'none';
    }
        
        
});





