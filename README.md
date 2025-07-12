# PeriffApp

Plataforma web para conectar prestadores de serviços de comunidades periféricas a clientes, promovendo inclusão digital e geração de renda local.

---

## Descrição

O **PeriffApp** é uma aplicação web responsiva desenvolvida com **HTML**, **CSS** e **JavaScript**, utilizando **Firebase** para autenticação e banco de dados (**Firestore**). O objetivo é facilitar o encontro entre clientes e prestadores de serviços de comunidades periféricas, promovendo oportunidades e valorizando o empreendedorismo local.

---

## 🚀 Funcionalidades

- **Cadastro de Usuário**
  - Formulários para cadastro de **Clientes** e **Prestadores de Serviços**.
  - Validação de campos e integração com **Firebase Authentication**.

- **Login e Autenticação**
  - Tela de login conectada ao Firebase.
  - Proteção de rotas para usuários autenticados.

- **Perfis Personalizados**
  - Perfil do Cliente: visualização de dados e histórico de serviços.
  - Perfil do Prestador: foto, descrição, amostras de trabalho e contatos.

- **Pesquisa e Categorias**
  - Página de categorias de serviços (beleza, consertos, aulas, etc).
  - Busca dinâmica por nome, local ou categoria.

- **Navegação e Ajuda**
  - Menu fixo para navegação.
  - Página de ajuda com orientações e contato.

- **Recuperação de Senha**
  - Fluxo via e-mail integrado ao Firebase.

- **Pop-ups e Modais**
  - Componentes para confirmações e feedback ao usuário.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript (ES6)**
- **Firebase** (Authentication e Firestore)
- **Design Responsivo** (Mobile-First)

---

## 📁 Estrutura do Projeto

```
PeriffApp/
│
├── PeriffApp-web-index/        # Versão principal do app
│   ├── Cadastro/               # Cadastro de usuários
│   ├── Categorias/             # Listagem de categorias
│   ├── Pesquisa/               # Tela de pesquisa
│   ├── perfilPrestador2/       # Perfil do prestador
│   ├── RecuperacaoSenha/       # Recuperação de senha
│   ├── pop-up/                 # Componentes de pop-up
│   ├── imagens/                # Imagens do projeto
│   ├── ...                     # Outros módulos e arquivos
│
├── public/                     # Versão pública/alternativa (se aplicável)
│   └── ...
├── firebase.json               # Configuração do Firebase
├── package.json                # Dependências e scripts
├── README.md                   # Este arquivo
└── LICENSE                     # Licença
```

---

## ▶️ Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   ```
2. **Acesse a pasta principal:**
   ```bash
   cd PeriffApp/PeriffApp-web-index
   ```
3. **Configure o Firebase:**
   - Crie um projeto no [Firebase](https://firebase.google.com/).
   - Copie as credenciais do Firebase para o arquivo `firebase.js`.
4. **Abra o arquivo `index.html` em seu navegador.**
   - Não é necessário servidor backend.

---

## 👥 Equipe

- **Leonardo Pinho** — Back-end (responsável pela integração com Firebase, lógica de autenticação e banco de dados)
- **Tárcio Caetano** — Front-end (responsável pelo desenvolvimento das interfaces e experiência do usuário)
- **Brisa Nzinga** — Documentação (responsável pela organização e clareza das informações do projeto)
- **Leonardo Neves** — Testes (responsável por validar funcionalidades e garantir a qualidade do sistema)

---

## 📦 Sobre a pasta `public`

A pasta `public` está sendo utilizada para realizar o deploy do projeto no Firebase Hosting. **Atualmente, todas as atualizações e correções estão sendo feitas apenas nesta pasta.**

Se você for desenvolvedor do projeto, por favor, concentre suas contribuições e sugestões de melhoria na pasta `public`.

---

## 🤝 Contribua com ideias e sugestões!

Se você faz parte da equipe de desenvolvimento, sua participação é fundamental! Envie sugestões, reporte problemas ou proponha melhorias para que possamos evoluir juntos o PeriffApp.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais informações.

---

> *Desenvolvido com 🧡 para valorizar os empreendedores periféricos e fortalecer a economia local.*
