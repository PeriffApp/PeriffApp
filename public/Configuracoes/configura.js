import { auth, db, deleteDoc, doc, setDoc, getDoc } from "../firebase.js";
import { getAuth, deleteUser, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// ------------------------------
// Funções de Loading
// ------------------------------
/**
 * Exibe o overlay de loading na tela.
 */
function showLoading() {
  const ov = document.getElementById("loading-overlay");
  if (ov) ov.style.display = "flex";
}
/**
 * Esconde o overlay de loading da tela com animação de opacidade.
 */
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
          // Dados pessoais
          const dados = userSnap.data();
          document.getElementById('user-nome').textContent = dados.nome || dados.Nome || 'Não informado';
          document.getElementById('user-telefone').textContent = dados.telefone || dados.Telefone || 'Não informado';
          // Dark mode
          if (dados.preferenciaDarkMode === true) {
            document.body.classList.add("dark-mode");
            checkbox.checked = true;
          } else {
            document.body.classList.remove("dark-mode");
            checkbox.checked = false;
          }
          // Perfil disponível
          if (perfilDisponivelCheckbox) {
            perfilDisponivelCheckbox.checked = !!dados.perfilDisponivel;
          }
        } else {
          document.getElementById('user-nome').textContent = 'Não informado';
          document.getElementById('user-telefone').textContent = 'Não informado';
          document.body.classList.remove("dark-mode");
          checkbox.checked = false;
          if (perfilDisponivelCheckbox) perfilDisponivelCheckbox.checked = false;
        }
      } else {
        document.getElementById('user-nome').textContent = 'Não informado';
        document.getElementById('user-telefone').textContent = 'Não informado';
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
  /**
   * Listener para alternar o modo escuro e salvar a preferência no Firestore.
   */
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
    /**
     * Listener para alternar a disponibilidade do perfil e salvar no Firestore.
     */
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

  /**
   * Redireciona para a tela de recuperação de senha ao clicar no botão.
   */
  document.getElementById("alterarSenha").addEventListener('click', function(){
    window.location.href = "../RecuperacaoSenha/recuperacao.html";
  })

 const btnExcluir = document.getElementById("excluirConta");

  // Função para excluir conta e dados do Firestore
  /**
   * Listener para exclusão de conta do usuário.
   * Exibe pop-up de confirmação, exclui dados do Firestore e a conta do Firebase Auth.
   * Caso necessário, solicita reautenticação.
   */
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

  // Modal de edição de dados pessoais
  const modal = document.getElementById('modal-editar');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalInput = document.getElementById('modal-input');
  const modalCancelar = document.getElementById('modal-cancelar');
  const modalSalvar = document.getElementById('modal-salvar');
  let campoAtual = null;

  /**
   * Adiciona listeners aos botões de edição de nome e telefone.
   * Abre o modal de edição com o valor atual preenchido.
   */
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', function() {
      campoAtual = btn.getAttribute('data-campo');
      let valorAtual = '';
      if (campoAtual === 'nome') valorAtual = document.getElementById('user-nome').textContent;
      if (campoAtual === 'telefone') valorAtual = document.getElementById('user-telefone').textContent;
      modalInput.value = valorAtual !== 'Não informado' ? valorAtual : '';
      modalTitulo.textContent = 'Editar ' + (campoAtual.charAt(0).toUpperCase() + campoAtual.slice(1));
      modal.style.display = 'flex';
      modalInput.type = 'text';
      setTimeout(() => modalInput.focus(), 100);
    });
  });

  /**
   * Fecha o modal ao clicar no botão cancelar.
   */
  modalCancelar.addEventListener('click', function() {
    modal.style.display = 'none';
    campoAtual = null;
  });

  /**
   * Salva a alteração de nome ou telefone no Firestore ao clicar em salvar.
   */
  modalSalvar.addEventListener('click', async function() {
    if (!campoAtual) return;
    const novoValor = modalInput.value.trim();
    if (!novoValor) {
      Swal.fire({ icon: 'warning', title: 'Campo obrigatório', text: 'Preencha o campo para continuar.' });
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado.');
      const userRef = doc(db, 'Usuario', user.uid);
      const updateObj = {};
      updateObj[campoAtual] = novoValor;
      // Atualiza também a versão com inicial maiúscula, se existir
      if (campoAtual === 'nome') updateObj['Nome'] = novoValor;
      if (campoAtual === 'telefone') updateObj['Telefone'] = novoValor;
      await setDoc(userRef, updateObj, { merge: true });
      if (campoAtual === 'nome') document.getElementById('user-nome').textContent = novoValor;
      if (campoAtual === 'telefone') document.getElementById('user-telefone').textContent = novoValor;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Alterado com sucesso!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        iconColor: '#4CAF50',
        customClass: {
          popup: 'swal2-border-radius',
        },
      });
      modal.style.display = 'none';
      campoAtual = null;
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro ao atualizar', text: e.message || e });
    }
  });

  /**
   * Fecha o modal ao clicar fora dele.
   */
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      campoAtual = null;
    }
  });

});