 import { auth, signOut, onAuthStateChanged, getDocs, db, collection, doc, getDoc } from "../firebase.js" 







 // Dados iniciais
 let profileData = {
    name: "Marcos Souza",
    profession: "Eletricista Residencial",
    location: "Ribeira, Salvador - BA",
    about: "não informado",
    services: [
        {
            title: "Instalação de Chuveiro",
            description: "Instalação segura com materiais de qualidade.",
            price: "R$ 120–200",
            details: ["Garantia de 3 meses", "Materiais inclusos", "Teste de segurança"]
        },
        {
            title: "Quadro de Luz",
            description: "Instalação e manutenção de quadros de distribuição.",
            price: "R$ 250–400",
            details: ["Diagnóstico gratuito", "Componentes de qualidade", "Garantia de 6 meses"]
        },
        {
            title: "Troca de Tomadas",
            description: "Substituição segura de tomadas e interruptores.",
            price: "R$ 80–150",
            details: ["Padrão INMETRO", "Vários modelos", "Teste de funcionamento"]
        }
    ],
    portfolio: []
};

// Logout 
const btnLogout = document.getElementById('logoutButton');
btnLogout.addEventListener('click', e => {
    e.preventDefault();

    signOut(auth)
    .then(() => {
      // Logout bem‑sucedido
      alert("Você saiu da sua conta.");
      window.location.replace("../index.html");
    })
    .catch((error) => {
      console.error("Erro ao sair:", error);
      alert("Não foi possível deslogar. Tente novamente.");
    });

})



// observador para verificar se o usuario está logado
onAuthStateChanged(auth, async (user) => {
        if (user) {      
            const uid = user.uid;
            console.log("STATUS: Usuário logado com UID: " + uid);
            // Acesse o documento do próprio usuário
            const userDocRef = doc(db, "Usuario", uid); 
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                // Carrega dados e atualiza o DOM
                const data = docSnap.data();
                updateProfileInfo(data);
            } else {
            console.log("Documento não encontrado para UID:", uid);
            }
           
        } else {
            console.log("STATUS: Usuário não logado"); 
        }
});



// Variáveis para controle de edição
let currentEditField = null;
let currentEditType = null;


// Atualiza as informações do perfil
function updateProfileInfo(data) {

    document.getElementById('profileName').textContent = data.Nome;
    document.getElementById('profileProfession').textContent = profileData.profession;
    document.getElementById('profileLocation').textContent = profileData.location;
    document.getElementById('aboutText').textContent = profileData.about;
}


// Renderiza os serviços    
function renderServices() {
    const container = document.getElementById('servicesContainer');
    container.innerHTML = '';
    
    profileData.services.forEach((service, index) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.onclick = function() {
            openServiceModal(service.title, service.description, service.price, service.details);
        };
        card.innerHTML = `
            <h3 class="service-title">${service.title}</h3>
            <p class="service-description">${service.description}</p>
            <p class="service-price">${service.price}</p>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  renderServices();
});

//--------------------------------------------------------------------------------




// Pegando os elementos
const gerarAvatar = document.getElementById('gerarAvatar');
const removerFt = document.getElementById('removerFt');
const profileAction = document.getElementById('profileAction');
const portifolioAdd = document.getElementById('portifolioAdd');
const portifolioInput = document.getElementById('portifolioInput');
const fileInput = document.getElementById('fileInput'); 


// ao clicar, dispara uma função.
profileAction.addEventListener('click', () => fileInput.click());
portifolioAdd.addEventListener('click', () => portifolioInput.click())


//chama diretamente a função 
fileInput.addEventListener('change', handleFileSelect);
portifolioInput.addEventListener('change', addPortfolioImage);

// Função para gerar avatar aleatório
gerarAvatar.addEventListener('click', function() {

    const avatars = [
        'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&facialHairColor=Black&clotheType=ShirtCrewNeck&clotheColor=Gray01&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light',
        'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
        'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortRound&accessoriesType=Blank&hairColor=Auburn&facialHairType=BeardMedium&facialHairColor=Brown&clotheType=Hoodie&clotheColor=Gray01&eyeType=Happy&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light'
    ];
    
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    document.getElementById('profilePic').src = randomAvatar;
    
    showToast('Avatar gerado com sucesso!');
});

// Função para remover foto
removerFt.addEventListener('click', function() {
    document.getElementById('profilePic').src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    showToast('Foto removida');
})

// Função para lidar com seleção de arquivo
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                document.getElementById('profilePic').src = e.target.result;
                showToast('Foto atualizada');
            }
            
            reader.readAsDataURL(file);
        } else {
            showToast('Por favor, selecione uma imagem');
        }
    }
}

// 1) Função para adicionar imagem ao portfólio
function addPortfolioImage(event) {
  const file = event.target.files[0];
  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const portfolioGrid = document.querySelector('.portfolio-grid');
      const newImage = document.createElement('div');
      newImage.className = 'portfolio-item';
      newImage.innerHTML = `
        <img src="${e.target.result}" alt="Trabalho realizado">
        <div class="delete-photo">
          <i class="material-icons">close</i>
        </div>
      `;

      // 1.1) Abre modal ao clicar na imagem
      newImage.querySelector('img').addEventListener('click', () => {
        openImageModal(e.target.result);
      });

      // 1.2) Anexa o listener de remoção
      newImage.querySelector('.delete-photo')
              .addEventListener('click', removePortfolioImage);

      // 1.3) Insere antes do botão de "add-photo"
      const addBtn = document.getElementById('portifolioAdd');
      portfolioGrid.insertBefore(newImage, addBtn);

      // 1.4) Guarda no array de dados
      profileData.portfolio.push(e.target.result);

      showToast('Foto adicionada ao portfólio');
    };
    
    reader.readAsDataURL(file);
    // limpa o input para permitir o mesmo arquivo de novo
    event.target.value = '';
  }
}

// 2) Função para remover imagem do portfólio
function removePortfolioImage(event) {
  event.stopPropagation();

  // 2.1) Localiza o <div class="portfolio-item"> pai
  const item = event.currentTarget.closest('.portfolio-item');
  if (!item) return;

  // 2.2) Gera lista só dos items reais (exclui o botão de add)
  const portfolioGrid = document.querySelector('.portfolio-grid');
  const items = Array.from(
    portfolioGrid.querySelectorAll('.portfolio-item:not(.add-photo)')
  );

  // 2.3) Descobre o índice deste item no array
  const index = items.indexOf(item);
  if (index === -1) return;

  // 2.4) Remove do DOM e do array de dados
  portfolioGrid.removeChild(item);
  profileData.portfolio.splice(index, 1);

  showToast('Foto removida do portfólio');
}

// 3) Gatilho para abrir file picker
fileInput.addEventListener('change', addPortfolioImage);


// Função para abrir modal de edição genérico
function openEditModal(field, label, type, currentValue) {
    currentEditField = field;
    currentEditType = type;

    document.getElementById('editModalTitle').textContent = `Editar ${label}`;
    document.getElementById('editModalLabel').textContent = label;
    document.getElementById('editModalInput').type = type;
    document.getElementById('editModalInput').value = currentValue;

    document.getElementById('editModal').style.display = 'flex';
}

// Eventos de clique nos botões de edição
document.getElementById('editNameBtn').addEventListener('click', () => {
    openEditModal('name', 'Nome', 'text', document.getElementById('profileName').textContent);
});

document.getElementById('editProfessionBtn').addEventListener('click', () => {
    openEditModal('profession', 'Profissão', 'text', document.getElementById('profileProfession').textContent);
});

document.getElementById('editLocationBtn').addEventListener('click', () => {
    openEditModal('location', 'Localização', 'text', document.getElementById('profileLocation').textContent);
});


// Função para salvar edição
const saveEdit = document.getElementById('saveEdit');
saveEdit.addEventListener('click', function(){
    const newValue = document.getElementById('editModalInput').value;
    
    if (currentEditField && newValue) {
        profileData[currentEditField] = newValue;
        updateProfileInfo();
        showToast('Alterações salvas');
        closeModal();
    }
})

// Função para abrir modal de edição do sobre
const editAbout = document.getElementById('editAbout');
editAbout.addEventListener('click', function(){
    document.getElementById('aboutTextInput').value = profileData.about;
    document.getElementById('editAboutModal').style.display = 'flex';
})

// Função para salvar texto sobre
const saveAbout = document.getElementById('saveAbout'); 
saveAbout.addEventListener('click', function() {
    const newAbout = document.getElementById('aboutTextInput').value; 
    if (newAbout) {
        profileData.about = newAbout;
        updateProfileInfo();
        showToast('Descrição atualizada');
        closeModal();
    }
})



// Função para abrir modal de adicionar serviço
const openAddServiceModal = document.getElementById('openAddServiceModal'); 
openAddServiceModal.addEventListener('click', function(){
    document.getElementById('serviceTitleInput').value = '';
    document.getElementById('serviceDescriptionInput').value = '';
    document.getElementById('servicePriceInput').value = '';
    document.getElementById('serviceDetailsInput').value = '';
    document.getElementById('addServiceModal').style.display = 'flex';
})

// Função para adicionar novo serviço
const addNewService = document.getElementById('addNewService');
addNewService.addEventListener('click', function(e){
      e.preventDefault(); 
    const title = document.getElementById('serviceTitleInput').value.trim();
    const description = document.getElementById('serviceDescriptionInput').value.trim();
    const price = document.getElementById('servicePriceInput').value.trim();
    const detailsText = document.getElementById('serviceDetailsInput').value.trim();
    
    if (title && description && price) {
        const details = detailsText.split('\n').filter(item => item.trim() !== '');
        
        profileData.services.push({
            title,
            description,
            price,
            details
        });

        renderServices();
        showToast('Serviço adicionado');
        closeModal();
    } else {
        showToast('Preencha todos os campos obrigatórios');
    }
})

// Função para abrir modal de serviço
function openServiceModal(title, description, price, details) {
    document.getElementById('modalServiceTitle').textContent = title;
    document.getElementById('modalServiceDescription').textContent = description;
    document.getElementById('modalServicePrice').textContent = price;
    
    const detailsList = document.getElementById('modalServiceDetailsList');
    detailsList.innerHTML = '';
    
    details.forEach(detail => {
        const li = document.createElement('li');
        li.textContent = detail;
        detailsList.appendChild(li);
    });
    
    document.getElementById('serviceModal').style.display = 'flex';
}

// Função para fechar modal
const modalClose = document.getElementById('closeModal'); 
const cancelModal = document.getElementById('cancelModal');
const closeEditAbout = document.getElementById('closeEditAbout');
const cancelEditAbout = document.getElementById('cancelEditAbout');
const closeService = document.getElementById('closeService');
const cancelService = document.getElementById('cancelService');
const closeModalService = document.getElementById('closeModalService');

cancelModal.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
closeEditAbout.addEventListener('click', closeModal);
cancelEditAbout.addEventListener('click', closeModal);
closeService.addEventListener('click', closeModal);
cancelService.addEventListener('click', closeModal);
closeModalService.addEventListener('click', closeModal)


function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Função para abrir modal de imagem
function openImageModal(imageSrc) {
    document.getElementById('modalImage').src = imageSrc;
    document.getElementById('imageModal').style.display = 'flex';
}

// Função para fechar modal de imagem
const closeImageModal = document.getElementById('closeImagemModal');
closeImageModal.addEventListener('click', function(){
    document.getElementById('imageModal').style.display = 'none';
})

// Função para contatar o prestador
function contactProvider() {
    showToast('Abrindo chat com Marcos Souza...');
    // Aqui iria a lógica para abrir o chat
}

// Função para mostrar toast (feedback)
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#333';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '1000';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Adiciona estilo para a animação do toast
const style = document.createElement('style');
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






