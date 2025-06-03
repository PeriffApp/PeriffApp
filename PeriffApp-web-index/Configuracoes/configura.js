import { auth, db, deleteDoc, doc, setDoc, getDoc } from "../firebase.js";
import { getAuth, deleteUser, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// ------------------------------
// Funções de Loading
// ------------------------------
function showLoading() {
  const ov = document.getElementById("loading-overlay");
  if (ov) ov.style.display = "flex";
}
function hideLoading() {
  const ov = document.getElementById("loading-overlay");
  if (!ov) return;
  ov.style.transition = "opacity 0.3s ease";
  ov.style.opacity = "0";
  setTimeout(() => ov.remove(), 300);
}

// Alterna a classe dark-mode no body ao clicar no checkbox
document.addEventListener('DOMContentLoaded', async function() {
  // Garante que o overlay de loading exista
  let ov = document.getElementById("loading-overlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "loading-overlay";
    ov.innerHTML = '<div class="spinner"></div>';
    ov.style.position = 'fixed';
    ov.style.top = 0;
    ov.style.left = 0;
    ov.style.width = '100vw';
    ov.style.height = '100vh';
    ov.style.background = 'rgba(255,255,255,0.8)';
    ov.style.display = 'flex';
    ov.style.alignItems = 'center';
    ov.style.justifyContent = 'center';
    ov.style.zIndex = 9999;
    document.body.appendChild(ov);
  } else {
    showLoading();
  }

  const checkbox = document.getElementById('dark-mode');
  // Aguarda o carregamento do usuário e preferências antes de esconder o loading
  onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        const userRef = doc(db, "Usuario", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().preferenciaDarkMode === true) {
          document.body.classList.add("dark-mode");
          checkbox.checked = true;
        } else {
          document.body.classList.remove("dark-mode");
          checkbox.checked = false;
        }
      } else {
        document.body.classList.remove("dark-mode");
        checkbox.checked = false;
      }
    } catch (e) {
      console.error("Erro ao buscar preferência de modo dark:", e);
    } finally {
      // Só esconde o loading depois de tudo pronto
      hideLoading();
    }
  });
  checkbox.addEventListener('change', async function() {
      if (checkbox.checked) {
          document.body.classList.add('dark-mode');
      } else {
          document.body.classList.remove('dark-mode');
      }
      // Salva preferência no Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'Usuario', user.uid);
          await setDoc(userRef, { preferenciaDarkMode: checkbox.checked }, { merge: true });
        }
      } catch (e) {
        console.error('Erro ao salvar preferência de modo dark:', e);
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