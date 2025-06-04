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
  const perfilDisponivelCheckbox = document.getElementById('perfil-disponivel');
  // Aguarda o carregamento do usuário e preferências antes de esconder o loading
  onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        const userRef = doc(db, "Usuario", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          // Dark mode
          if (userSnap.data().preferenciaDarkMode === true) {
            document.body.classList.add("dark-mode");
            checkbox.checked = true;
          } else {
            document.body.classList.remove("dark-mode");
            checkbox.checked = false;
          }
          // Perfil disponível
          if (perfilDisponivelCheckbox) {
            perfilDisponivelCheckbox.checked = !!userSnap.data().perfilDisponivel;
          }
        } else {
          document.body.classList.remove("dark-mode");
          checkbox.checked = false;
          if (perfilDisponivelCheckbox) perfilDisponivelCheckbox.checked = false;
        }
      } else {
        document.body.classList.remove("dark-mode");
        checkbox.checked = false;
        if (perfilDisponivelCheckbox) perfilDisponivelCheckbox.checked = false;
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

  if (perfilDisponivelCheckbox) {
    perfilDisponivelCheckbox.addEventListener('change', async function() {
      // Salva preferência de perfil disponível no Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'Usuario', user.uid);
          await setDoc(userRef, { perfilDisponivel: perfilDisponivelCheckbox.checked }, { merge: true });
        }
      } catch (e) {
        console.error('Erro ao salvar preferência de perfil disponível:', e);
      }
    });
  }

  document.getElementById("alterarSenha").addEventListener('click', function(){
    window.location.href = "../RecuperacaoSenha/recuperacao.html";
  })

 const btnExcluir = document.getElementById("excluirConta");

  // Função para excluir conta e dados do Firestore
  btnExcluir.addEventListener('click', async function() {
    
    // Substitui o confirm por um pop-up SweetAlert2
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6B00',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-border-radius',
      }
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      btnExcluir.disabled = true;
      btnExcluir.textContent = 'Excluindo...';
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado.');
        // Exclui dados do Firestore
        await deleteDoc(doc(db, 'Usuario', user.uid));
        // Exclui conta do Authentication
        await deleteUser(user);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Conta excluída com sucesso!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          iconColor: '#4CAF50',
          customClass: {
            popup: 'swal2-border-radius',
          },
        });
        setTimeout(() => { window.location.href = '../index.html'; }, 3000);
      } catch (e) {
        if (e.code === 'auth/requires-recent-login') {
          // Solicita reautenticação
          const email = auth.currentUser.email;
          const senha = prompt('Por segurança, digite sua senha novamente para excluir sua conta:');
          if (!senha) {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'info',
              title: 'Operação cancelada.',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              iconColor: '#f39c12',
              customClass: {
                popup: 'swal2-border-radius',
              },
            });
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
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Conta excluída com sucesso!',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              iconColor: '#4CAF50',
              customClass: {
                popup: 'swal2-border-radius',
              },
            });
            setTimeout(() => { window.location.href = '../index.html'; }, 3000);
          } catch (reauthErr) {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Erro ao reautenticar',
              text: reauthErr.message || reauthErr,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              iconColor: '#d33',
              customClass: {
                popup: 'swal2-border-radius',
              },
            });
            btnExcluir.disabled = false;
            btnExcluir.textContent = 'Excluir Conta';
          }
        } else {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Erro ao excluir conta',
            text: e.message || e,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            iconColor: '#d33',
            customClass: {
              popup: 'swal2-border-radius',
            },
          });
          btnExcluir.disabled = false;
          btnExcluir.textContent = 'Excluir Conta';
        }
      }
    });
    return;
  });

});