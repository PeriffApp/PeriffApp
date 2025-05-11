 // Dados iniciais
 let profileData = {
    name: "Marcos Souza",
    profession: "Eletricista Residencial",
    location: "Ribeira, Salvador - BA",
    about: "não informado",
    specialties: ["Instalações elétricas", "Troca de lâmpadas", "Quadros de distribuição"],
    certifications: ["NR-10", "Eletricista Predial"],
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

// Variáveis para controle de edição
let currentEditField = null;
let currentEditType = null;

// Inicializa a página
document.addEventListener('DOMContentLoaded', function() {
    updateProfileInfo();
    renderSpecialties();
    renderCertifications();
    renderServices();
});

// Atualiza as informações do perfil
function updateProfileInfo() {
    document.getElementById('profileName').textContent = profileData.name;
    document.getElementById('profileProfession').textContent = profileData.profession;
    document.getElementById('profileLocation').textContent = profileData.location;
    document.getElementById('aboutText').textContent = profileData.about;
}

// Renderiza as especialidades
function renderSpecialties() {
    const container = document.getElementById('specialtiesContainer');
    container.innerHTML = '';
    
    profileData.specialties.forEach(specialty => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${specialty}
            <span class="tag-remove material-icons" onclick="removeSpecialty('${specialty}')">close</span>
        `;
        container.appendChild(tag);
    });
}

// Renderiza as certificações
function renderCertifications() {
    const container = document.getElementById('certificationsContainer');
    container.innerHTML = '';
    
    profileData.certifications.forEach(certification => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${certification}
            <span class="tag-remove material-icons" onclick="removeCertification('${certification}')">close</span>
        `;
        container.appendChild(tag);
    });
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

// Função para gerar avatar aleatório
function generateAvatar() {
    const avatars = [
        'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&facialHairColor=Black&clotheType=ShirtCrewNeck&clotheColor=Gray01&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light',
        'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
        'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortRound&accessoriesType=Blank&hairColor=Auburn&facialHairType=BeardMedium&facialHairColor=Brown&clotheType=Hoodie&clotheColor=Gray01&eyeType=Happy&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light'
    ];
    
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    document.getElementById('profilePic').src = randomAvatar;
    
    showToast('Avatar gerado com sucesso!');
}

// Função para remover foto
function removePhoto() {
    document.getElementById('profilePic').src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    showToast('Foto removida');
}

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

// Função para adicionar imagem ao portfólio
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
                <div class="delete-photo" onclick="removePortfolioImage(event, this.parentNode)">
                    <i class="material-icons">close</i>
                </div>
            `;
            newImage.onclick = function() {
                openImageModal(e.target.result);
            };
            
            // Insere antes do botão de adicionar
            portfolioGrid.insertBefore(newImage, portfolioGrid.children[portfolioGrid.children.length - 2]);
            
            // Adiciona ao array de portfolio
            profileData.portfolio.push(e.target.result);
            
            showToast('Foto adicionada ao portfólio');
        }
        
        reader.readAsDataURL(file);
    }
}

// Função para remover imagem do portfólio
function removePortfolioImage(event, element) {
    event.stopPropagation();
    const portfolioGrid = document.querySelector('.portfolio-grid');
    portfolioGrid.removeChild(element);
    
    // Remove do array de portfolio (precisaríamos de um ID melhor na implementação real)
    const index = Array.from(portfolioGrid.children).indexOf(element) - 1;
    if (index >= 0) {
        profileData.portfolio.splice(index, 1);
    }
    
    showToast('Foto removida do portfólio');
}

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

// Função para salvar edição
function saveEdit() {
    const newValue = document.getElementById('editModalInput').value;
    
    if (currentEditField && newValue) {
        profileData[currentEditField] = newValue;
        updateProfileInfo();
        showToast('Alterações salvas');
        closeModal();
    }
}

// Função para abrir modal de edição do sobre
function openEditAboutModal() {
    document.getElementById('aboutTextInput').value = profileData.about;
    document.getElementById('editAboutModal').style.display = 'flex';
}

// Função para salvar texto sobre
function saveAboutText() {
    const newAbout = document.getElementById('aboutTextInput').value;
    
    if (newAbout) {
        profileData.about = newAbout;
        updateProfileInfo();
        showToast('Descrição atualizada');
        closeModal();
    }
}

// Função para adicionar especialidade
function addSpecialty() {
    const input = document.getElementById('newSpecialty');
    const specialty = input.value.trim();
    
    if (specialty && !profileData.specialties.includes(specialty)) {
        profileData.specialties.push(specialty);
        renderSpecialties();
        input.value = '';
        showToast('Especialidade adicionada');
    }
}

// Função para remover especialidade
function removeSpecialty(specialty) {
    profileData.specialties = profileData.specialties.filter(item => item !== specialty);
    renderSpecialties();
    showToast('Especialidade removida');
}

// Função para adicionar certificação
function addCertification() {
    const input = document.getElementById('newCertification');
    const certification = input.value.trim();
    
    if (certification && !profileData.certifications.includes(certification)) {
        profileData.certifications.push(certification);
        renderCertifications();
        input.value = '';
        showToast('Certificação adicionada');
    }
}

// Função para remover certificação
function removeCertification(certification) {
    profileData.certifications = profileData.certifications.filter(item => item !== certification);
    renderCertifications();
    showToast('Certificação removida');
}

// Função para abrir modal de adicionar serviço
function openAddServiceModal() {
    document.getElementById('serviceTitleInput').value = '';
    document.getElementById('serviceDescriptionInput').value = '';
    document.getElementById('servicePriceInput').value = '';
    document.getElementById('serviceDetailsInput').value = '';
    document.getElementById('addServiceModal').style.display = 'flex';
}

// Função para adicionar novo serviço
function addNewService() {
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
}

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
function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

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

