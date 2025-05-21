// Importando o Firebase
import { auth, db, collection, addDoc, setDoc, doc } from "../firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Função para validação de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  if (cpf === "12345678909") return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Resetar formulários quando fechar modal
function resetForms() {
  clientType.classList.remove('selected');
  providerType.classList.remove('selected');
  clientForm.style.display = 'none';
  providerForm.style.display = 'none';
  document.getElementById('clientRegisterForm').reset();
  document.getElementById('providerRegisterForm').reset();
  document.querySelector('input[name="docType"][value="cpf"]').checked = true;
  cpfField.style.display = 'block';
  cnpjField.style.display = 'none';
}



document.addEventListener('DOMContentLoaded', function() {
  const clientType = document.getElementById('clientType');
  const providerType = document.getElementById('providerType');
  const clientForm = document.getElementById('clientForm');
  const providerForm = document.getElementById('providerForm');
  const docTypeRadios = document.querySelectorAll('input[name="docType"]');
  const cpfField = document.getElementById('cpfField');
  const cnpjField = document.getElementById('cnpjField');
  let tipo = null;
  

  clientType.addEventListener('click', () => {
    clientType.classList.add('selected');
    providerType.classList.remove('selected');
    clientForm.style.display = 'block';
    providerForm.style.display = 'none';
    tipo = "Cliente"
    
  });

  providerType.addEventListener('click', () => {
    providerType.classList.add('selected');
    clientType.classList.remove('selected');
    providerForm.style.display = 'block';
    clientForm.style.display = 'none';
    tipo = "Prestador"
  });

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

  // Validação do formulário de cliente
  document.getElementById('clientRegisterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cpf = document.getElementById('clientCPF').value;
    const email = document.getElementById('clientEmail').value;
    const nome = document.getElementById('clientName').value;
    const password = document.getElementById('clientPassword').value;
    const confirmPassword = document.getElementById('clientConfirmPassword').value;
    const telefone = document.getElementById('clientPhone').value;

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    if (!validarCPF(cpf)) {
      alert('CPF inválido!');
      return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const uid = userCredential.user.uid;
        
        


        // Usa setDoc e propaga o UID para o próximo then
        return setDoc(doc(db, 'Usuario', uid), {
          UID: uid,
          CPF: cpf,
          Email: email,
          Nome: nome,
          Senha: password,
          Telefone: telefone,
          Tipo: 'Cliente'
        }).then(() => uid);
      })
      .then(uid => {
        console.log('Documento criado com ID:', uid);
        alert('Cadastro de cliente realizado com sucesso!');
        window.location.replace('../index.html');
        resetForms();
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          alert('Este e-mail já está em uso.');
        } else if (error.code === 'auth/password-does-not-meet-requirements') {
          alert('A senha deve ter pelo menos 6 caracteres.');
        } else {
          console.error('Erro ao criar o usuário:', error);
          alert('Erro ao criar o usuário. Tente novamente mais tarde.');
        }
      });
  });

  // Validação do formulário de prestador
  document.getElementById('providerRegisterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const tipoDoc = document.querySelector('input[name="docType"]:checked').value;
    const email = document.getElementById('providerEmail').value;
    const nome = document.getElementById('providerName').value;
    const password = document.getElementById('providerPassword').value;
    const confirmPassword = document.getElementById('providerConfirmPassword').value;
    const telefone = document.getElementById('providerPhone').value;
  
    let cnpj = null;
    let cpf = null;
    if (tipoDoc === 'cpf') {
      cpf = document.getElementById('providerCPF').value;
    } else {
      cnpj = document.getElementById('providerCNPJ').value;
    }
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    if (!validarCPF(cpf)) {
      alert('CPF inválido!');
      return;
    }
    if (!document.getElementById('providerTerms').checked) {
      alert('Você deve aceitar os Termos de Uso!');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const uid = userCredential.user.uid;
        // Usa setDoc e propaga o UID para o próximo then
        return setDoc(doc(db, 'Usuario', uid), {
          UID: uid,
          CPF: cpf,
          CNPJ: cnpj,
          Email: email,
          Nome: nome,
          Senha: password,
          Telefone: telefone,
          Tipo: 'Prestador'
        }).then(() => uid);
      })
      .then(uid => {
        console.log('Documento criado com ID:', uid);
        alert('Cadastro de cliente realizado com sucesso!');
        window.location.replace('../index.html');
        resetForms();
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          alert('Este e-mail já está em uso.');
        } else if (error.code === 'auth/password-does-not-meet-requirements') {
          alert('A senha deve ter pelo menos 6 caracteres.');
        } else {
          console.error('Erro ao criar o usuário:', error);
          alert('Erro ao criar o usuário. Tente novamente mais tarde.');
        }
      });
  });
});
