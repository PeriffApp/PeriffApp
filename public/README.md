# PeriffApp

*Plataforma Web para Conectar Prestadores de Serviços de Comunidades Periféricas com Clientes*

---

## Descrição

O **PeriffApp** é uma aplicação web responsiva desenvolvida com **HTML**, **CSS** e **JavaScript**, integrada ao **Firebase** (**Authentication** e **Firestore**). Nosso objetivo é conectar prestadores de serviços de comunidades periféricas a clientes que buscam diversos tipos de serviços (*beleza, reformas, aulas particulares*, entre outros). Por meio de cadastros, perfis, pesquisa por categorias e recuperação de senha, usuários conseguem criar e gerenciar suas contas de forma **simples** e **segura**.

---

## 🚀 Principais Funcionalidades

* **Cadastro de Usuário**

  * Formulários dedicados para cadastro de **Clientes** e **Prestadores de Serviços** (`Cadastro/`).
  * Validação de campos e integração com **Firebase Authentication**.

* **Login e Autenticação**

  * Tela de **Login** (`Login/`) conectada ao Firebase.
  * Proteção de rotas: só permite acesso autenticado.

* **Perfis Personalizados**

  * **Perfil do Cliente** (`PerfilCliente/`): visualização de dados, histórico de serviços.
  * **Perfil do Prestador** (`PerfilPrestador/` e `perfilPrestador2/`): foto, descrição, amostras e contatos.

* **Pesquisa e Categorias**

  * Página de **Categorias** (`Categorias/`): listagem de áreas (beleza, consertos, aulas, etc.).
  * Tela de **Pesquisa** (`Pesquisa/`): busca dinâmica por nome, local ou categoria.

* **Navegação e Ajuda**

  * Menu fixo para acesso rápido às páginas principais.
  * Página de **Ajuda** com orientações e contato.

* **Recuperação de Senha**

  * Fluxo via e-mail, integrado ao **Firebase** (`RecuperacaoSenha/`).

* **Pop-ups e Modais**

  * Componentes de **Pop-up** para confirmações (`pop-up/`).

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 | CSS3 | JavaScript (ES6)**
* **Firebase**

  * Authentication
  * Cloud Firestore
* **Design Responsivo** (*Mobile-First*)

---

## 📬 Contato e Suporte

Em caso de dúvidas ou sugestões, abra uma **issue** ou entre em contato com os mantenedores:

* **Leonardo Pinho**
* **Brisa Nzinga**
* **Leonardo Neves**
* **Tárcio Caetano**
* **Max Rebouças**

---

## 🤝 Contribuições

1. Faça um **Fork**.

2. Crie uma **branch**:

   ```bash
   git checkout -b minha-nova-feature
   ```

3. Faça **commit**:

   ```bash
   git commit -m "feat: minha nova feature"
   ```

4. Envie para o fork:

   ```bash
   git push origin minha-nova-feature
   ```

5. Abra um **Pull Request**.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais informações.



### Badges

```markdown
![MIT License](https://img.shields.io/badge/license-MIT-green)
```

---

> *Desenvolvido com 💜 para valorizar os empreendedores periféricos e fortalecer a economia local.*