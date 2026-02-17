# Real Clube Senhorense - Sistema de Gestão

[![Firebase](https://img.shields.io/badge/Firebase-10.12.5-orange?logo=firebase)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

Aplicação web moderna para gestão completa do Real Clube Senhorense, desenvolvida com React, Firebase e Tailwind CSS.

## 📋 Sobre o Projeto

Sistema de gestão desportiva que permite ao Real Clube Senhorense gerir de forma eficiente todos os aspectos operacionais do clube, incluindo atletas, treinos, presenças, equipamentos, quotas e comunicações internas.

## ✨ Funcionalidades

### Gestão de Atletas
- Cadastro completo de atletas com perfis detalhados
- Upload e gestão de documentos
- Sistema de observações e notas
- Visualização de histórico e estatísticas

### Gestão de Treinos
- Planeamento de treinos por escalão
- Visualização de treinos do dia no dashboard
- Controlo de presenças em tempo real
- Relatórios de assiduidade

### Gestão de Escalões
- Organização de atletas por categorias etárias
- Atribuição de treinadores
- Gestão de horários

### Captações
- Registo de novos talentos
- Acompanhamento do processo de recrutamento
- Histórico de avaliações

### Gestão Administrativa
- Controlo de quotas e pagamentos
- Gestão de equipamentos desportivos
- Sistema de comunicados internos
- Administração de utilizadores e permissões

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + PostCSS
- **Backend**: Firebase (Firestore, Authentication, Storage, Hosting)
- **Icons**: Lucide React + React Icons
- **Dates**: date-fns
- **CSV Processing**: PapaParse
- **Utilities**: clsx, tailwind-merge

## 📦 Instalação

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Conta Firebase configurada

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/diogomanuel10/real-clube-senhorense.git
cd real-clube-senhorense
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o ficheiro `.env` com as suas credenciais do Firebase:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

4. **Configure o Firebase**

No console do Firebase:
- Ative a Autenticação (Email/Password)
- Crie um banco de dados Firestore
- Configure as regras de segurança
- Ative o Storage para upload de ficheiros

5. **Execute em modo de desenvolvimento**
```bash
npm run dev
```

Acesse `http://localhost:5173`

## 🏗️ Build e Deploy

### Build para produção
```bash
npm run build
```

### Deploy no Firebase Hosting
```bash
npm run firebase:deploy
```

Ou manualmente:
```bash
npm run build
firebase deploy
```

## 📁 Estrutura do Projeto

```
real-clube-senhorense/
├── src/
│   ├── assets/          # Imagens e recursos estáticos
│   ├── components/      # Componentes React reutilizáveis
│   │   ├── dashboard/
│   │   ├── equipamentos/
│   │   ├── quotas/
│   │   ├── treinos/
│   │   └── comunicados/
│   ├── constants/       # Constantes da aplicação
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Páginas da aplicação
│   │   ├── Dashboard.jsx
│   │   ├── Atletas.jsx
│   │   ├── AtletaPerfil.jsx
│   │   ├── Escaloes.jsx
│   │   ├── Treinos.jsx
│   │   ├── Presencas.jsx
│   │   ├── Captacoes.jsx
│   │   ├── Quotas.jsx
│   │   ├── Equipamentos.jsx
│   │   ├── Comunicados.jsx
│   │   ├── AdminUsers.jsx
│   │   └── Login.jsx
│   ├── services/       # Lógica de integração com Firebase
│   ├── styles/         # Estilos globais
│   ├── utils/          # Funções utilitárias
│   ├── App.jsx         # Componente principal
│   └── main.jsx        # Entry point
├── public/             # Ficheiros públicos
├── .env.example        # Template de variáveis de ambiente
├── .gitignore
├── firebase.json       # Configuração do Firebase
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 👥 Sistema de Permissões

A aplicação possui um sistema de roles:

- **Admin**: Acesso completo a todas as funcionalidades
- **Viewer**: Acesso apenas para visualização

## 🔒 Segurança

- Autenticação via Firebase Authentication
- Regras de segurança no Firestore
- Variáveis de ambiente para credenciais sensíveis
- Validação de permissões por role

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Cria build de produção
npm run preview          # Preview do build de produção
npm run firebase:deploy  # Build + deploy no Firebase
```

## 📝 Convenções de Código

- Componentes React em PascalCase
- Ficheiros de componentes com extensão `.jsx`
- Hooks personalizados com prefixo `use`
- Comentários em português
- Commits semânticos (feat, fix, docs, style, refactor, test, chore)

## 🤝 Contribuir

1. Faça fork do projeto
2. Crie uma branch para a feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit as mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para uso exclusivo do Real Clube Senhorense.

## 👨‍💻 Autor

**Diogo Gonçalves**
- GitHub: [@diogomanuel10](https://github.com/diogomanuel10)
- Email: dio_mang11@hotmail.com

## 🙏 Agradecimentos

Ao Real Clube Senhorense pela oportunidade de desenvolver este sistema.

---

**Real Clube Senhorense** - Sistema de Gestão Desportiva © 2026
