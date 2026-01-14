# FactoryOps - Plataforma Colaborativa

## Instalação Rápida

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Acesso
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Prisma Studio: `npx prisma studio` (http://localhost:5555)

## Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm

## Configuração
1. Editar `backend/.env` com credenciais do PostgreSQL
2. Criar database: `createdb factoryops`
3. Seguir comandos acima

14012026

# FactoryOps - Atualizações Implementadas ✅

## 📋 Resumo das Alterações

Foram implementadas 3 funcionalidades principais:

### 1. ✅ Sistema de Login/Autenticação
### 2. ✅ Exportação de Relatórios em PDF
### 3. ✅ Correção do Filtro de Datas

---

## 🔐 1. Sistema de Login

### Ficheiros Criados/Modificados:

#### **Novo: `frontend/src/components/Auth/Login.tsx`**
- Componente de login com design moderno
- Validação de credenciais
- Mensagens de erro personalizadas
- Integração com o sistema de autenticação

#### **Modificado: `frontend/src/store/userStore.ts`**
- Adicionadas funções `login()` e `logout()`
- Sistema de autenticação com localStorage
- Verificação de credenciais (mock)

#### **Modificado: `frontend/src/App.tsx`**
- Renderização condicional baseada em autenticação
- Exibe tela de login se não autenticado
- Carrega aplicação principal após login

#### **Modificado: `frontend/src/components/Layout/UserSelector.tsx`**
- Adicionado botão "Terminar Sessão"
- Confirmação antes de fazer logout
- Design adaptado ao tema dark/light

### Credenciais de Teste:

| Utilizador | Password | Função |
|-----------|----------|--------|
| `admin` | `admin123` | ADMIN |
| `eng.ribeiro` | `engineer123` | ENGINEER |
| `op.silva.t1` | `operator123` | OPERATOR |
| `mnt.sousa` | `maintenance123` | MAINTENANCE |
| `op.costa.t1` | `operator123` | OPERATOR |
| `mnt.lopes` | `maintenance123` | MAINTENANCE |

### Como Funciona:

1. Ao abrir a aplicação, o utilizador vê o ecrã de login
2. Insere username e password
3. Após login bem-sucedido, é redirecionado para o dashboard
4. Pode fazer logout clicando no avatar → "Terminar Sessão"
5. A sessão é mantida no localStorage (auto-login na próxima visita)

---

## 📊 2. Exportação de Relatórios em PDF

### Ficheiros Criados/Modificados:

#### **Novo: `frontend/src/utils/reportExport.ts`**
- Função `generatePDFReport()` que cria relatórios HTML
- Design profissional para impressão/PDF
- Inclui todas as métricas principais:
  - OEE, Disponibilidade, Desempenho, Qualidade
  - MTBF, MTTR
  - ROI Estimado
  - Estado das máquinas
  - Top 20 máquinas por OEE
  - Período de análise

#### **Modificado: `frontend/src/components/Analytics/AnalyticsDashboard.tsx`**
- Função `handleExportReport()` atualizada
- Coleta todos os dados do dashboard
- Chama função de exportação

#### **Modificado: `frontend/src/components/Analytics/FilterPanel.tsx`**
- Botão "Exportar Relatório" já estava presente
- Texto do botão corrigido para permanecer branco

### Como Usar:

1. No painel de análise, selecione os filtros desejados (linha, período)
2. Clique no botão "Exportar Relatório"
3. Uma nova janela abre com o relatório formatado
4. Use Ctrl+P (ou Cmd+P no Mac) para imprimir
5. Na janela de impressão, escolha "Salvar como PDF"
6. O relatório inclui:
   - Cabeçalho com logo e título
   - Informações do período
   - KPIs principais em cards coloridos
   - Estado das máquinas
   - Tabela detalhada das top 20 máquinas
   - Rodapé com data de geração

---

## 📅 3. Correção do Filtro de Datas

### Ficheiro Modificado:

#### **`frontend/src/components/Analytics/FilterPanel.tsx`**

### Problemas Corrigidos:

1. **Bug: Modificação do mesmo objeto Date**
   - Antes: Usava `now.setDate()` múltiplas vezes no mesmo objeto
   - Agora: Cria novos objetos Date para cada caso

2. **Funcionalidade "Hoje" e "Ontem"**
   - Hoje: Das 00:00 até agora
   - Ontem: Das 00:00 às 23:59 de ontem
   - 7 dias: Últimos 7 dias completos
   - 30 dias: Últimos 30 dias completos

### Opções de Filtro:

- **Hoje**: Apenas o dia atual
- **Ontem**: Apenas o dia anterior
- **Últimos 7 dias**: Última semana
- **Últimos 30 dias**: Último mês
- **Personalizado**: (pode ser implementado futuramente)

---

## 📁 Estrutura de Ficheiros

```
frontend/src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx                    [NOVO]
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.tsx       [MODIFICADO]
│   │   └── FilterPanel.tsx              [MODIFICADO]
│   └── Layout/
│       └── UserSelector.tsx             [MODIFICADO]
├── store/
│   └── userStore.ts                     [MODIFICADO]
├── utils/
│   └── reportExport.ts                  [NOVO]
└── App.tsx                              [MODIFICADO]
```

---

## 🚀 Como Instalar

### 1. Substitua os ficheiros no seu projeto:

```bash
# Na pasta do projeto FactoryOps
cd frontend/src

# Copie os ficheiros modificados
cp /caminho/outputs/Login.tsx components/Auth/
cp /caminho/outputs/userStore.ts store/
cp /caminho/outputs/App.tsx .
cp /caminho/outputs/reportExport.ts utils/
cp /caminho/outputs/FilterPanel.tsx components/Analytics/
cp /caminho/outputs/AnalyticsDashboard.tsx components/Analytics/
cp /caminho/outputs/UserSelector.tsx components/Layout/
```

### 2. Certifique-se que as dependências estão instaladas:

```bash
cd frontend
npm install
```

### 3. Execute o projeto:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Acesse a aplicação:

```
http://localhost:5173
```

---

## ✨ Funcionalidades Adicionais

### Segurança
- Senhas são validadas no frontend (mock)
- Em produção, implementar validação no backend com bcrypt
- Tokens JWT podem ser adicionados futuramente

### UX/UI
- Design responsivo e moderno
- Transições suaves
- Feedback visual para todas as ações
- Tema dark/light mantido

### Performance
- Sessão mantida em localStorage
- Auto-login se sessão válida
- Exportação de relatório otimizada

---

## 🔧 Melhorias Futuras Sugeridas

1. **Backend de Autenticação**
   - Implementar API de login no backend NestJS
   - Usar bcrypt para hash de senhas
   - JWT tokens para autenticação

2. **Permissões por Função**
   - ADMIN: Acesso total
   - ENGINEER: Criar utilizadores + ver tudo
   - MAINTENANCE: Ver e atualizar máquinas
   - OPERATOR: Apenas visualização

3. **Exportação Avançada**
   - Exportar para Excel (.xlsx)
   - Gráficos incluídos no PDF
   - Agendamento de relatórios

4. **Filtros Personalizados**
   - Seleção de datas específicas
   - Filtro por múltiplas linhas
   - Filtro por estado das máquinas

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique se todos os ficheiros foram copiados
2. Confirme que não há erros no console do navegador
3. Verifique se o backend está rodando
4. Limpe o cache do navegador (Ctrl+Shift+R)

---

## ✅ Checklist de Implementação

- [ ] Copiar todos os ficheiros modificados
- [ ] Executar `npm install` no frontend
- [ ] Testar login com credenciais fornecidas
- [ ] Testar logout
- [ ] Testar exportação de relatório
- [ ] Testar todos os filtros de data
- [ ] Verificar tema dark/light funcionando
- [ ] Testar em diferentes navegadores

---

**Versão:** 1.2  
**Data:** Janeiro 2025  
**Desenvolvido por:** Claude (Anthropic)

---

🎉 **Todas as funcionalidades foram implementadas com sucesso!**