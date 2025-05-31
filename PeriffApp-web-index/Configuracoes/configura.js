import { auth, db, deleteDoc, doc } from "../firebase.js";
import { getAuth, deleteUser, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Alterna a classe dark-mode no body ao clicar no checkbox
document.addEventListener('DOMContentLoaded', function() {
  const checkbox = document.getElementById('dark-mode');
  // Mantém o estado ao recarregar a página
  if (localStorage.getItem('dark-mode') === 'true') {
      document.body.classList.add('dark-mode');
      checkbox.checked = true;
  }
  checkbox.addEventListener('change', function() {
      if (checkbox.checked) {
          document.body.classList.add('dark-mode');
          localStorage.setItem('dark-mode', 'true');
      } else {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('dark-mode', 'false');
      }
  });

  document.getElementById("alterarSenha").addEventListener('click', function(){
    window.location.href = "../RecuperacaoSenha/recuperacao.html";
  })

 const btnExcluir = document.getElementById("excluirConta");

  // Função para excluir conta e dados do Firestore
  btnExcluir.addEventListener('click', async function() {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita.')) return;
    btnExcluir.disabled = true;
    btnExcluir.textContent = 'Excluindo...';
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado.');
      // Exclui dados do Firestore
      await deleteDoc(doc(db, 'Usuario', user.uid));
      // Exclui conta do Authentication
      await deleteUser(user);
      alert('Conta excluída com sucesso!');
      window.location.href = '../index.html';
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        // Solicita reautenticação
        const email = auth.currentUser.email;
        const senha = prompt('Por segurança, digite sua senha novamente para excluir sua conta:');
        if (!senha) {
          alert('Operação cancelada.');
          btnExcluir.disabled = false;
          btnExcluir.textContent = 'Excluir Conta';
          return;
        }
        try {
          // Reautentica o usuário
          const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js');
          await signInWithEmailAndPassword(auth, email, senha);
          // Tenta excluir novamente
          await deleteUser(auth.currentUser);
          await deleteDoc(doc(db, 'Usuario', auth.currentUser.uid));
          alert('Conta excluída com sucesso!');
          window.location.href = '../index.html';
        } catch (reauthErr) {
          alert('Erro ao reautenticar: ' + (reauthErr.message || reauthErr));
          btnExcluir.disabled = false;
          btnExcluir.textContent = 'Excluir Conta';
        }
      } else {
        alert('Erro ao excluir conta: ' + (e.message || e));
        btnExcluir.disabled = false;
        btnExcluir.textContent = 'Excluir Conta';
      }
    }
  });

});