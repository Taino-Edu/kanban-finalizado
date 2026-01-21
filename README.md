# 📋 Kanban Board Fullstack - Desafio Técnico

![Badge Angular](https://img.shields.io/badge/Frontend-Angular-dd0031?style=for-the-badge&logo=angular)
![Badge NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs)
![Badge TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)

> Uma aplicação web interativa para gerenciamento de tarefas (Kanban), desenvolvida com foco em arquitetura limpa, escalabilidade e boas práticas de desenvolvimento.

---

## 🖼️ Preview do Projeto

![Dashboard do Kanban](./assets/preview.png)

*Interface responsiva permitindo a visualização e movimentação de tarefas entre colunas.*

---

## 🚀 Sobre o Projeto

Este projeto foi desenvolvido como parte de um desafio técnico para demonstrar competências em desenvolvimento **Fullstack**. O objetivo foi criar um quadro Kanban onde o usuário pode criar, editar, excluir e mover tarefas entre colunas ("A Fazer", "Em Progresso", "Concluído").

### ✨ Funcionalidades Principais
- **CRUD Completo:** Criação, Leitura, Atualização e Exclusão de tarefas.
- **Drag & Drop:** Interface intuitiva para arrastar tarefas entre colunas.
- **Persistência de Dados:** API robusta em NestJS para salvar o estado das tarefas.
- **Validação de Dados:** Utilização de DTOs e Pipes no Backend.
- **Interface Responsiva:** Layout adaptável desenvolvido com Angular.

---

## 🛠️ Tecnologias Utilizadas

### Frontend (Client)
- **Angular 16+**: Estrutura baseada em componentes.
- **Angular CDK (Drag and Drop)**: Para a funcionalidade de arrastar cards.
- **RxJS**: Gerenciamento de estado reativo.
- **CSS3/SCSS**: Estilização modular.

### Backend (Server)
- **NestJS**: Framework progressivo para Node.js.
- **TypeScript**: Tipagem estática para maior segurança.
- **In-Memory/Database**: Armazenamento e persistência dos cards.

---

## 📦 Como Rodar o Projeto

Siga os passos abaixo para executar a aplicação em seu ambiente local.

### Pré-requisitos
Certifique-se de ter o **Node.js** e o **Git** instalados em sua máquina.

### 1. Clonar o repositório
```bash
git clone [https://github.com/Taino-Edu/kanban-finalizado.git](https://github.com/Taino-Edu/kanban-finalizado.git)
cd kanban-finalizado
2. Configurar e Rodar o Backend (API)
Abra um terminal, navegue até a pasta do servidor e instale as dependências:

Bash

cd backend
npm install
Inicie o servidor:

Bash

npm run start:dev
O backend estará rodando em: http://localhost:3000

3. Configurar e Rodar o Frontend (Interface)
Abra um novo terminal, navegue até a pasta do cliente e instale as dependências:

Bash

cd frontend
npm install
Inicie a aplicação Angular:

Bash

ng serve
Acesse a aplicação no navegador em: http://localhost:4200

🧩 Estrutura e Arquitetura
O projeto segue uma arquitetura modular para facilitar a manutenção e testes.

Backend: Organizado em Modules, Controllers e Services (Padrão NestJS), garantindo injeção de dependência e separação de responsabilidades.

Frontend: Componentes isolados para o Quadro (Board) e Cartões (Card), facilitando o reuso de código.

🎥 Vídeo de Apresentação
Confira uma breve demonstração do sistema funcionando e uma explicação sobre as decisões técnicas tomadas:

▶️ Clique aqui para assistir ao vídeo de apresentação
https://www.loom.com/share/81375f4716474f1b9480f4cc9210b698

👨‍💻 Autor
Desenvolvido por Eduardo Taino
