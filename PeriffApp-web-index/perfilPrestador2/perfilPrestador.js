// ------------------------------
// Imports
// ------------------------------
// Importa funções e objetos do módulo firebase.js para autenticação e operações no Firestore
import {
  auth,
  signOut,
  onAuthStateChanged,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  db,
  collection,
  doc,
} from "../firebase.js";

// ------------------------------
// Variáveis Globais
// ------------------------------
// currentUserUID: Armazena o UID do usuário atualmente autenticado
// Endereco: Objeto para armazenar dados de endereço do usuário
// profileData: Objeto global para armazenar serviços, portfólio e avaliações do perfil
let currentUserUID = null;
let Endereco = {
  estado: "",
  cidade: "",
  bairro: "",
  rua: "",
  numero: "",
  cep: "",
};

let profileData = { services: [], portfolio: [], reviews: [] };


// ------------------------------
// Funções de Loading
// ------------------------------
// Exibe o overlay de loading
function showLoading() {
  const ov = document.getElementById("loading-overlay");
  if (ov) ov.style.display = "flex";
}

// Esconde o overlay de loading
function hideLoading() {
  const ov = document.getElementById("loading-overlay");
  if (!ov) return;
  ov.style.transition = "opacity 0.3s ease";
  ov.style.opacity = "0";
  setTimeout(() => ov.remove(), 300);
}

// ------------------------------
// Firestore CRUD Functions
// ------------------------------
// Funções para manipulação de dados no Firestore: Sobre, Endereço, Serviços, Avaliações
// SOBRE
// Atualiza o campo 'Sobre' do usuário no Firestore
async function updateAboutDB(uid, newAbout) {
  const userRef = doc(db, "Usuario", uid);
  try {
    // merge=true para não sobrescrever outros campos
    await setDoc(userRef, { Sobre: newAbout }, { merge: true });
    showToast("Texto “Sobre” salvo com sucesso");
  } catch (err) {
    console.error("Erro ao salvar Sobre:", err);
    alert("Falha ao salvar o Sobre. Tente novamente.");
  }
}

// ENDEREÇO
// Adiciona ou atualiza o endereço do usuário no Firestore
async function addEnderecoDB(uid) {
  const enderecoRef = doc(db, "Usuario", uid, "Endereco", uid);
  await setDoc(enderecoRef, { ...Endereco });
  showToast("Endereço salvo com sucesso");
}

// SERVIÇOS
// Adiciona um novo serviço ao Firestore
async function addServiceDB(uid, service) {
  const col = collection(db, "Usuario", uid, "Servicos");
  const ref = await addDoc(col, service);
  showToast("Serviço adicionado com sucesso");
  return ref.id;
}
// Carrega todos os serviços do usuário do Firestore
async function loadServicesDB(uid) {
  const snap = await getDocs(collection(db, "Usuario", uid, "Servicos"));
  const services = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  profileData.services = services; // ← atualiza o array global
  return services;
}
// Remove um serviço do Firestore
async function deleteServiceDB(uid, serviceId) {
  await deleteDoc(doc(db, "Usuario", uid, "Servicos", serviceId));
  showToast("Serviço removido");
}
// Atualiza um serviço existente no Firestore
async function updateServiceDB(uid, serviceId, updated) {
  await updateDoc(doc(db, "Usuario", uid, "Servicos", serviceId), updated);
  showToast("Serviço atualizado");
}

// Renderiza os cards de serviços na tela
function renderServices() {
  const container = document.getElementById("servicesContainer");
  container.innerHTML = "";

  profileData.services.forEach((service) => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.innerHTML = `
      <h3 class="service-title">${service.title}</h3>
      <p class="service-description">${service.description}</p>
      <p class="service-price">${service.price}</p>
      <button id="lixeirinha" class="delete-service-btn" data-id="${service.id}">
        <i class="material-icons">delete</i>
      </button>
    `;

    container.appendChild(card);

    // 1. Detecta uid na URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("uid")) {
      // 2. Esconde todos os botões de delete
      container
        .querySelectorAll(".delete-service-btn")
        .forEach((btn) => (btn.style.display = "none"));
    } else {
      // Se não tiver uid na URL, conecta os listeners
      container.querySelectorAll(".delete-service-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const serviceId = e.currentTarget.dataset.id;
          deleteService(serviceId);
        });
      });
    }
  });
}

// Remove um serviço do usuário autenticado
async function deleteService(serviceId) {
  const user = auth.currentUser;
  if (!user) {
    alert("Usuário não autenticado.");
    return;
  }

  const serviceRef = doc(db, "Usuario", user.uid, "Servicos", serviceId);

  try {
    await deleteDoc(serviceRef);
    console.log("Serviço excluído com sucesso!");
    await loadServicesDB(user.uid); // Recarrega os serviços atualizados
    renderServices();
    showToast("Card excluido com Sucesso!");
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    alert("Erro ao excluir o serviço.");
  }
}

// AVALIAÇÕES
// Adiciona uma avaliação ao Firestore
async function addReviewDB(uidPrestador, review) {
  const col = collection(db, "Usuario", uidPrestador, "Avaliacoes");
  const ref = await addDoc(col, {
    name: review.name,
    text: review.text,
    rating: review.rating,
    date: review.date,           // Timestamp ou string "dd/mm/yyyy"
  });
  showToast("Avaliação enviada com sucesso");
  return ref.id;
}

// Carrega avaliações do Firestore e ordena por data
async function loadReviewsDB(uidPrestador) {
  const snap = await getDocs(collection(db, "Usuario", uidPrestador, "Avaliacoes"));
  const reviews = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    // opcional: ordenar por data desc
    .sort((a, b) => {
      // se for Timestamp: b.date.toMillis() - a.date.toMillis()
      const da = parseDateBR(a.date), db_ = parseDateBR(b.date);
      return db_ - da;
    });
  profileData.reviews = reviews;
  return reviews;
}

// Utilitário para converter datas no formato BR para timestamp
function parseDateBR(str) {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d).getTime();
}

// Renderiza avaliações na tela
function renderReviews() {
  const container = document.getElementById("reviewsList");
  container.innerHTML = "";
  profileData.reviews.forEach((r) => {
    const div = document.createElement("div");
    div.className = "review";
    div.innerHTML = `
      <div class="review-header">
        <span class="reviewer">${r.name}</span>
        <span class="stars">${
          "★".repeat(r.rating) + "☆".repeat(5 - r.rating)
        }</span>
      </div>
      <p class="review-text">${r.text}</p>
      <p class="review-date">${r.date}</p>
    `;
    container.appendChild(div);
  });
  updateHeaderRating();
}

// Atualiza a média de estrelas e quantidade de avaliações no header
function updateHeaderRating() {
  const reviews = profileData.reviews;
  const ratingContainer = document.querySelector(".profile-info .rating");
  if (!ratingContainer) return;
  if (!reviews || reviews.length === 0) {
    ratingContainer.innerHTML = `<span class="stars">☆☆☆☆☆</span> <span class="rating-text">Sem avaliações</span>`;
    return;
  }
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const avg = sum / total;
  const fullStars = Math.floor(avg);
  const halfStar = avg - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  let stars = "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
  // Se quiser usar só estrelas cheias/vazias, com arredondamento:
  // let stars = "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));
  ratingContainer.innerHTML = `<span class="stars">${stars}</span> <span class="rating-text"> ${avg.toFixed(1)} (${total} avaliação${total > 1 ? 's' : ''}) </span>`;
}


// Destaca estrelas selecionadas na avaliação
function highlightStars(count) {
  document
    .querySelectorAll("#starRating span")
    .forEach((s) => s.classList.toggle("selected", s.dataset.value <= count));
}

// ------------------------------
// Autenticação e Perfil
// ------------------------------
// Logout: faz signOut do usuário e redireciona para a página inicial
const btnLogout = document.getElementById("logoutButton");
btnLogout.addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth)
    .then(() => {
      alert("Você saiu da sua conta.");
      window.location.replace("../index.html");
    })
    .catch((error) => {
      console.error("Erro ao sair:", error);
      alert("Não foi possível deslogar. Tente novamente.");
    });
});

// Observador de autenticação: carrega dados do perfil e atualiza UI conforme o status do usuário
onAuthStateChanged(auth, async (user) => {
  showLoading();
  try {
    if (user) {
      const uidFromUrl = getUidFromUrl();
      const uid = uidFromUrl || user.uid;
      currentUserUID = uid;
      console.log("STATUS: Usuário logado com UID: " + uid);
      console.log(user.emailVerified);

      // referências dos docs
      const userDocRef = doc(db, "Usuario", uid);
      const enderecoDocRef = doc(db, "Usuario", uid, "Endereco", uid);

      // Carrega dados e serviços/avaliações em paralelo
      const [userSnap, endSnap] = await Promise.all([
        getDoc(userDocRef),
        getDoc(enderecoDocRef),
        await loadServicesDB(uid),
        await loadReviewsDB(uid),
        renderReviews()
      ]);

      // Atualiza UI
      if (userSnap.exists()) {
        const data = userSnap.data();
        const endereco = endSnap.exists() ? endSnap.data() : null;
        updateProfileInfo(data, endereco);
      }
      renderServices();

      if (uidFromUrl !== null) {
        document.getElementById("editAbout").style.display = "none";
        document.getElementById("editEndereco").style.display = "none";
        document.getElementById("openAddServiceModal").style.display = "none";
        document.getElementById("portifolioAdd").style.display = "none";
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("contatarButton").style.display = "block";
        
      } else {
        document.getElementById("contatarButton").style.display = "none";
        document.getElementById("openAddReview").style.display = "none";
      }
    } else {
      console.log("STATUS: Usuário não logado");
      document.getElementById("editAbout").style.display = "none";
      document.getElementById("editEndereco").style.display = "none";
      document.getElementById("openAddServiceModal").style.display = "none";
      document.getElementById("portifolioAdd").style.display = "none";
      document.getElementById("openAddReview").style.display = "none";
      document.getElementById("logoutButton").style.display = "none";
      document.getElementById("contatarButton").style.display = "none";
      const uidFromUrl = getUidFromUrl();
      const uid = uidFromUrl;
      currentUserUID = uid;

      const userDocRef = doc(db, "Usuario", uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const enderecoDocRef = doc(db, "Usuario", uid, "Endereco", uid);
        const endSnap = await getDoc(enderecoDocRef);
        const endereco = endSnap.exists() ? endSnap.data() : null;
        updateProfileInfo(data, endereco);
      } else {
        console.log("Documento não encontrado para UID:", uid);
      }

      await loadServicesDB(currentUserUID);
      renderServices();
    }
  } catch (err) {
    console.error("Erro no preload:", err);
  } finally {
    hideLoading();
  }
});

// Atualiza as informações do perfil na UI
function updateProfileInfo(data, endereco) {
  document.getElementById("profileName").textContent = data.Nome;
  // Corrige erro caso endereco seja null
  document.getElementById("estado").textContent = endereco && endereco.estado ? endereco.estado : "";
  document.getElementById("cidade").textContent = endereco && endereco.cidade ? endereco.cidade : "";
  document.getElementById("bairro").textContent = endereco && endereco.bairro ? endereco.bairro : "";
  document.getElementById("rua").textContent = endereco && endereco.rua ? endereco.rua : "";
  document.getElementById("cep").textContent = endereco && endereco.cep ? endereco.cep : "";
  document.getElementById("complemento").textContent = endereco && endereco.numero ? endereco.numero : "";
  document.getElementById("aboutText").textContent = data.Sobre;
}

// ------------------------------
// Feedback: Toast
// ------------------------------
// Exibe uma mensagem temporária na tela
function showToast(message) {
  const toast = document.createElement("div");
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = "#333";
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "20px";
  toast.style.zIndex = "1000";
  toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  toast.style.animation = "fadeIn 0.3s, fadeOut 0.3s 2.7s";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}

// Adiciona animações CSS para o toast
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
`;
document.head.appendChild(style);

// Recupera o UID da URL, se existir
function getUidFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("uid");
}

// --------------------------
// Função genérica: fechar modais
// --------------------------
function closeModal() {
  document
    .querySelectorAll(".modal")
    .forEach((modal) => (modal.style.display = "none"));
}

// -------------------------------------------------------------------------
// Interações de UI
// -------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {

/*  
  // Foto de perfil
  const fileInput = document.getElementById("fileInput");
  const profileAction = document.getElementById("profileAction");
  profileAction.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", handleFileSelect);
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("profilePic").src = e.target.result;
        showToast("Foto atualizada");
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Por favor, selecione uma imagem");
    }
  }
*/

  // Botões "Ver tudo": mostra alerta ao clicar
  document.querySelectorAll(".view-more").forEach((button) => {
    button.addEventListener("click", function () {
      const sectionTitle =
        this.closest(".profile-section").querySelector("h2").textContent;
      alert(`Mostrando todo o ${sectionTitle.toLowerCase()}`);
    });
  });

  // Links de configurações: mostra alerta ao clicar
  document.querySelectorAll(".footer-links a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      alert(`Abrindo ${this.textContent.trim()}...`);
    });
  });

  // --------------------------
  // Modal "Sobre"
  // --------------------------
  const closeEditAbout = document.getElementById("closeEditAbout");
  const cancelEditAbout = document.getElementById("cancelEditAbout");
  [closeEditAbout, cancelEditAbout].forEach((el) =>
    el.addEventListener("click", closeModal)
  );

  document.getElementById("editAbout").addEventListener("click",() => (
    document.getElementById("editAboutModal").style.display = "flex")
  );

  document.getElementById("saveAbout").addEventListener("click", async function () {
    const newAbout = document.getElementById("aboutTextInput").value;
    if (newAbout) {
      if (!newAbout) return alert("Digite algo antes de salvar.");
      if (!currentUserUID) return alert("Usuário não autenticado.");

      // 1) envia pro Firestore
      await updateAboutDB(currentUserUID, newAbout);
      document.getElementById("aboutText").innerHTML = newAbout;
      closeModal();
      showToast("Texto atualizado com sucesso!");
    }
  });

  // --------------------------
  // Produtos e Serviços
  // --------------------------
  document.getElementById("openAddServiceModal").addEventListener("click", () => {
      [
        "serviceTitleInput",
        "serviceDescriptionInput",
        "servicePriceInput",
        "serviceDetailsInput",
      ].forEach((id) => (document.getElementById(id).value = ""));
      document.getElementById("addServiceModal").style.display = "flex";
  });

  // 2) Transforme o callback em async e chame addServiceDB:
  document.getElementById("addNewService").addEventListener("click", async (e) => {
      e.preventDefault();

      // 2.1) Lê valores do formulário
      const title = document.getElementById("serviceTitleInput").value.trim();
      const description = document.getElementById("serviceDescriptionInput").value.trim();
      const price = document.getElementById("servicePriceInput").value.trim();
      const details = document.getElementById("serviceDetailsInput").value.trim().split("\n")
      .filter((l) => l.trim());

      // 2.2) Valida campos obrigatórios
      if (!(title && description && price)) {
        return alert("Preencha todos os campos obrigatórios");
      }

      // 2.3) Monta o objeto de serviço
      const service = { title, description, price, details };

      // 2.4) Salva no Firestore e captura o ID
      try {
        const newId = await addServiceDB(currentUserUID, service);

        // 2.5) Atualiza o array local com o ID vindo do Firestore
        profileData.services.push({ id: newId, ...service });

        // 2.6) Re-renderiza a lista de serviços
        renderServices();
        closeModal();
      } catch (err) {
        console.error(err);
        alert("Não foi possível salvar o serviço. Tente novamente.");
      }
    });

  // RESOLVER!!!!!!! ----------------------------------------------------
  // Abre modal de detalhes do serviço
  function openServiceModal(title, description, price, details) {
    document.getElementById("modalServiceTitle").textContent = title;
    document.getElementById("modalServiceDescription").textContent =
      description;
    document.getElementById("modalServicePrice").textContent = price;
    const list = document.getElementById("modalServiceDetailsList");
    list.innerHTML = "";
    details.forEach((d) => {
      const li = document.createElement("li");
      li.textContent = d;
      list.appendChild(li);
    });
    document.getElementById("serviceModal").style.display = "flex";
  }

  // Fecha modais de serviço/produto
  document.getElementById("closeService").addEventListener("click", (e) => {
    closeModal();
  });
  document.getElementById("cancelService").addEventListener("click", (e) => {
    closeModal();
  });
  document.getElementById("closeModalService").addEventListener("click", (e) => {
      closeModal();
    });

  // --------------------------
  // Portfólio de Imagens
  // --------------------------
  const portifolioAdd = document.getElementById("portifolioAdd");
  const portifolioInput = document.getElementById("portifolioInput");
  const portfolioGrid = document.querySelector(".portfolio-grid");
  const closeImageModal = document.getElementById("closeImagemModal");

  portifolioAdd.addEventListener("click", () => portifolioInput.click());
  portifolioInput.addEventListener("change", addPortfolioImage);
  function addPortfolioImage(event) {
    const file = event.target.files[0];
    if (!file || !file.type.match("image.*")) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const newItem = document.createElement("div");
      newItem.className = "portfolio-item";
      newItem.innerHTML = `
                <img src="${e.target.result}" alt="Trabalho realizado">
                <div class="delete-photo"><i class="material-icons">close</i></div>
            `;
      newItem
        .querySelector("img")
        .addEventListener("click", () => openImageModal(e.target.result));
      newItem
        .querySelector(".delete-photo")
        .addEventListener("click", removePortfolioImage);
      portfolioGrid.insertBefore(newItem, portifolioAdd);
      event.target.value = "";
      showToast("Foto adicionada ao portfólio");
    };
    reader.readAsDataURL(file);
  }
  function removePortfolioImage(event) {
    event.stopPropagation();
    const item = event.currentTarget.closest(".portfolio-item");
    if (item) portfolioGrid.removeChild(item);
    showToast("Foto removida do portfólio");
  }
  function openImageModal(src) {
    document.getElementById("modalImage").src = src;
    document.getElementById("imageModal").style.display = "flex";
  }
  closeImageModal.addEventListener("click", () => {
    document.getElementById("imageModal").style.display = "none";
  });

  // --------------------------
  // Modal: Editar Endereço
  // --------------------------
  document.getElementById("editEndereco").addEventListener("click", () => {
    document.getElementById("editEnderecoModal").style.display = "flex";
  });
  document.getElementById("closeEditEndereco").addEventListener("click", closeModal);
  document.getElementById("cancelEditEndereco").addEventListener("click", closeModal);
 
  document.getElementById("saveEditEndereco").addEventListener("click", () => {
    const e = document.getElementById("estadoInput").value.trim();
    const c = document.getElementById("cidadeInput").value.trim();
    const b = document.getElementById("bairroInput").value.trim();
    const r = document.getElementById("ruaInput").value.trim();
    const n = document.getElementById("numeroInput").value.trim();
    const z = document.getElementById("cepInput").value.trim();
    if (!e || !c || !b || !r || !n || !z) {
      alert("Preencha todos os campos antes de salvar.");
      return;
    }
    Endereco.estado = e;
    Endereco.cidade = c;
    Endereco.bairro = b;
    Endereco.rua = r;
    Endereco.numero = n;
    Endereco.cep = z;

    if (currentUserUID) {
      addEnderecoDB(currentUserUID);
    } else {
      alert("Usuário não autenticado.");
    }

    closeModal();
  });

  // --------------------------
  // Modal: Avaliações
  // --------------------------
  const addReviewModal = document.getElementById("addReviewModal");
  const closeAddReview = document.getElementById("closeAddReview");
  const cancelAddReview = document.getElementById("cancelAddReview");
  const submitReviewBtn = document.getElementById("submitReview");
  let selectedStars = 0;

  document.getElementById("openAddReview").addEventListener("click", () => (
    addReviewModal.style.display = "flex")
  );

  [closeAddReview, cancelAddReview].forEach((el) =>
    el.addEventListener("click", () => (addReviewModal.style.display = "none"))
  );
  document.querySelectorAll("#starRating span").forEach((span) => {
    span.addEventListener("mouseover", () =>
      highlightStars(span.dataset.value)
    );
    span.addEventListener("click", () => (selectedStars = span.dataset.value));
  });
  addReviewModal.addEventListener("mouseout", () =>
    highlightStars(selectedStars)
  );

submitReviewBtn.addEventListener("click", async () => {
  const name =
    document.getElementById("reviewerName").value.trim() || "Anônimo";
  const text = document.getElementById("reviewText").value.trim();
  if (!text || selectedStars === 0) {
    return alert("Preencha a descrição e selecione uma nota.");
  }
  const newReview = {
    name,
    text,
    rating: Number(selectedStars),
    date: new Date().toLocaleDateString("pt-BR"),
  };

  try {
    // 1) salva no Firestore
    await addReviewDB(currentUserUID, newReview);

    // 2) atualiza array local e re-renderiza
    profileData.reviews.unshift(newReview);
    renderReviews();

    // 3) limpa e fecha modal
    document.getElementById("reviewerName").value = "";
    document.getElementById("reviewText").value = "";
    selectedStars = 0;
    highlightStars(0);
    addReviewModal.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Falha ao enviar avaliação. Tente novamente.");
  }
});


});
