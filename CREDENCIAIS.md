# 🔐 Credenciais de Acesso - FactoryOps

## Utilizadores de Teste

### 👨‍💼 Administrador
- **Username:** `admin`
- **Password:** `admin123`
- **Função:** ADMIN
- **Permissões:** Gestão completa do sistema, criar utilizadores

### 👷 Engenheiro
- **Username:** `eng.ribeiro`
- **Password:** `engineer123`
- **Nome:** Eng. Luís Ribeiro
- **Função:** ENGINEER
- **Permissões:** Criar utilizadores, acesso total aos dados

### 🔧 Operadores

#### Operador 1
- **Username:** `op.silva.t1`
- **Password:** `operator123`
- **Nome:** João Silva
- **Função:** OPERATOR
- **Turno:** T1

#### Operador 2
- **Username:** `op.costa.t1`
- **Password:** `operator123`
- **Nome:** Maria Costa
- **Função:** OPERATOR
- **Turno:** T1

### 🔨 Manutenção

#### Técnico 1
- **Username:** `mnt.sousa`
- **Password:** `maintenance123`
- **Nome:** Rui Sousa
- **Função:** MAINTENANCE

#### Técnico 2
- **Username:** `mnt.lopes`
- **Password:** `maintenance123`
- **Nome:** André Lopes
- **Função:** MAINTENANCE

---

## 📝 Notas de Segurança

⚠️ **IMPORTANTE:** Estas são credenciais de desenvolvimento/teste.

Em produção:
1. Mudar todas as passwords
2. Implementar hash de passwords (bcrypt)
3. Adicionar autenticação JWT no backend
4. Implementar refresh tokens
5. Adicionar limite de tentativas de login
6. Log de acessos e ações

---

## 🔑 Como Adicionar Novos Utilizadores

Os utilizadores podem ser adicionados por:
- **ADMIN:** Através do botão "Utilizadores" no navbar
- **ENGINEER:** Através do botão "Utilizadores" no navbar

### Processo:
1. Clicar em "Utilizadores" no navbar (canto superior direito)
2. Clicar em "Adicionar Utilizador"
3. Preencher dados: Nome, Username, Função
4. Salvar

**Nota:** No sistema mock atual, os utilizadores são salvos no localStorage. Para produção, implementar API no backend.

---

## 🚀 Acesso Rápido

**URL da Aplicação:** http://localhost:5173

Para testar rapidamente:
1. Abrir navegador
2. Acessar http://localhost:5173
3. Login com `admin` / `admin123`
4. Explorar todas as funcionalidades!

---

**Última atualização:** Janeiro 2025