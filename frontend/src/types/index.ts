/**
 * ============================================
 * TYPES - Definições TypeScript do Projeto
 * ============================================
 * 
 * Este é um dos ficheiros MAIS IMPORTANTES do projeto!
 * Define TODAS as estruturas de dados usadas em frontend e backend.
 * 
 * POR QUE ESTE FICHEIRO É TÃO IMPORTANTE?
 * 
 * 1. CONTRATO DE DADOS:
 *    Define exatamente como dados são estruturados
 *    Frontend e backend devem seguir estas definições
 * 
 * 2. TYPE SAFETY:
 *    TypeScript verifica em compile-time
 *    Previne erros de tipos (string vs number, etc)
 *    Autocomplete no IDE
 * 
 * 3. DOCUMENTAÇÃO:
 *    Serve como documentação viva
 *    Mostra quais campos existem
 *    Quais são opcionais (?)
 *    Tipos de cada campo
 * 
 * 4. SINGLE SOURCE OF TRUTH:
 *    Um único lugar define estrutura
 *    Mudanças propagam automaticamente
 *    Evita inconsistências
 * 
 * O QUE SÃO TYPES vs INTERFACES?
 * 
 * ENUM:
 * Conjunto fixo de valores possíveis
 * Usado quando campo só pode ter certos valores
 * 
 * INTERFACE:
 * Define estrutura de um objeto
 * Quais campos tem
 * Tipo de cada campo
 * Se é opcional ou obrigatório
 * 
 * EXEMPLO PRÁTICO:
 * 
 * SEM TYPES:
 * const machine = {
 *   id: "123",
 *   name: "Injetora",
 *   status: "normal"  // ❌ Typo! Devia ser "NORMAL"
 * }
 * // Nenhum erro! Código compila mas quebra em runtime
 * 
 * COM TYPES:
 * const machine: Machine = {
 *   id: "123",
 *   name: "Injetora",
 *   status: "normal"  // ❌ ERRO DE COMPILAÇÃO!
 * }
 * // TypeScript: "normal" is not assignable to type MachineStatus
 * // Você corrige ANTES de executar!
 */

// ============================================
// ENUMS - Conjuntos de Valores Permitidos
// ============================================

/**
 * ENUM MachineStatus
 * 
 * Define os 4 estados possíveis de uma máquina.
 * Cada máquina tem EXATAMENTE um destes estados.
 * 
 * VALORES:
 * 
 * NORMAL:
 * - Máquina funcionando perfeitamente
 * - Cor: Verde 🟢
 * - Produção normal
 * - Sem alertas
 * 
 * WARNING:
 * - Máquina com problema menor
 * - Cor: Amarelo 🟡
 * - Pode continuar produzindo mas precisa atenção
 * - Exemplos: Temperatura elevada, vibração anormal
 * 
 * FAILURE:
 * - Máquina parada por falha
 * - Cor: Vermelho 🔴
 * - Produção interrompida
 * - Requer intervenção urgente
 * - Exemplos: Motor queimado, falta de matéria-prima
 * 
 * MAINTENANCE:
 * - Máquina em manutenção preventiva
 * - Cor: Azul 🔵
 * - Parada planejada
 * - Normal, não é problema
 * - Exemplos: Limpeza, calibração, troca de peças
 * 
 * POR QUE ENUM?
 * 
 * SEM ENUM (string literal):
 * status: "NORMAL" | "WARNING" | "FAILURE" | "MAINTENANCE"
 * - Precisa escrever string toda vez
 * - Risco de typos
 * - Sem autocomplete bom
 * 
 * COM ENUM:
 * status: MachineStatus.NORMAL
 * - Autocomplete perfeito
 * - Impossível errar nome
 * - Refatorar é fácil (rename all)
 * 
 * COMO USAR:
 * const machine: Machine = {
 *   ...,
 *   status: MachineStatus.NORMAL
 * }
 * 
 * if (machine.status === MachineStatus.WARNING) {
 *   alert('Atenção!')
 * }
 */
export enum MachineStatus {
  NORMAL = 'NORMAL',           // Verde - OK
  WARNING = 'WARNING',         // Amarelo - Atenção
  FAILURE = 'FAILURE',         // Vermelho - Parada
  MAINTENANCE = 'MAINTENANCE', // Azul - Manutenção
}

/**
 * ENUM AnnotationType
 * 
 * Define os 5 tipos de anotações gráficas possíveis.
 * User pode desenhar estas formas sobre esquemas técnicos.
 * 
 * VALORES:
 * 
 * LINE:
 * - Linha reta simples
 * - 2 pontos: início (x1,y1) e fim (x2,y2)
 * - Usa cor e espessura personalizáveis
 * - Exemplo: Indicar conexão entre componentes
 * 
 * ARROW:
 * - Linha com seta na ponta
 * - Igual a LINE mas com triângulo no final
 * - Útil para: Indicar fluxo, direção, sentido
 * - Exemplo: Mostrar sentido de rotação, fluxo de material
 * 
 * RECTANGLE:
 * - Retângulo
 * - Definido por: canto superior esquerdo (x,y) + largura + altura
 * - Pode ser filled ou apenas contorno
 * - Exemplo: Destacar área de problema
 * 
 * CIRCLE:
 * - Círculo
 * - Definido por: centro (cx,cy) + raio
 * - Pode ser filled ou apenas contorno
 * - Exemplo: Destacar componente específico
 * 
 * TEXT:
 * - Caixa de texto
 * - Permite escrever anotações textuais
 * - Definido por: posição (x,y) + texto + tamanho fonte
 * - Exemplo: "Verificar rolamento", "Trocar óleo"
 * 
 * RENDERIZAÇÃO:
 * Cada tipo usa métodos diferentes do Canvas API:
 * - LINE: ctx.moveTo() + ctx.lineTo()
 * - ARROW: LINE + desenho de triângulo
 * - RECTANGLE: ctx.strokeRect() ou ctx.fillRect()
 * - CIRCLE: ctx.arc()
 * - TEXT: ctx.fillText()
 */
export enum AnnotationType {
  LINE = 'LINE',           // Linha reta
  RECTANGLE = 'RECTANGLE', // Retângulo
  TEXT = 'TEXT',           // Texto
  CIRCLE = 'CIRCLE',       // Círculo
  ARROW = 'ARROW',         // Seta
}

/**
 * ENUM UserRole
 * 
 * Define os 4 níveis de permissão de utilizadores.
 * Hierarquia crescente: OPERATOR < MAINTENANCE < ENGINEER < ADMIN
 * 
 * VALORES E PERMISSÕES:
 * 
 * OPERATOR (Operador):
 * - Nível mais baixo
 * - Pode: Ver máquinas, ver chat, ver anotações
 * - NÃO pode: Criar anotações, mudar status, criar máquinas
 * - Exemplo: Operário da linha de produção
 * 
 * MAINTENANCE (Manutenção):
 * - Herda permissões de OPERATOR
 * - Pode: Criar anotações, participar em chat
 * - NÃO pode: Criar/apagar máquinas, gerir utilizadores
 * - Exemplo: Técnico de manutenção
 * 
 * ENGINEER (Engenheiro):
 * - Herda permissões de MAINTENANCE
 * - Pode: Criar/editar/apagar máquinas, gerir utilizadores
 * - NÃO pode: Apagar utilizadores ADMIN
 * - Exemplo: Engenheiro de produção, supervisor
 * 
 * ADMIN (Administrador):
 * - Permissões completas
 * - Pode: TUDO
 * - Exemplo: Gestor da fábrica, IT admin
 * 
 * IMPLEMENTAÇÃO DE PERMISSÕES:
 * 
 * ```typescript
 * const canCreateMachine = (user: User): boolean => {
 *   return user.role === UserRole.ENGINEER || user.role === UserRole.ADMIN
 * }
 * 
 * const canCreateAnnotation = (user: User): boolean => {
 *   return user.role !== UserRole.OPERATOR
 * }
 * 
 * const canDeleteUser = (user: User, targetUser: User): boolean => {
 *   if (user.role !== UserRole.ADMIN) return false
 *   if (targetUser.role === UserRole.ADMIN && targetUser.id !== user.id) return false
 *   return true
 * }
 * ```
 * 
 * FRONTEND:
 * Componentes verificam role e mostram/escondem elementos:
 * ```tsx
 * {(user.role === UserRole.ENGINEER || user.role === UserRole.ADMIN) && (
 *   <button onClick={handleAddMachine}>Adicionar Máquina</button>
 * )}
 * ```
 * 
 * BACKEND:
 * Guards verificam role antes de executar ação:
 * ```typescript
 * @UseGuards(RolesGuard)
 * @Roles(UserRole.ENGINEER, UserRole.ADMIN)
 * @Post('machines')
 * createMachine() { ... }
 * ```
 */
export enum UserRole {
  OPERATOR = 'OPERATOR',         // Nível 1 - Apenas visualizar
  MAINTENANCE = 'MAINTENANCE',   // Nível 2 - + Criar anotações
  ENGINEER = 'ENGINEER',         // Nível 3 - + CRUD máquinas/users
  ADMIN = 'ADMIN',               // Nível 4 - Tudo
}

/**
 * ENUM EventType
 * 
 * Define tipos de eventos que são logados no sistema.
 * Usado para auditoria e histórico.
 * 
 * VALORES:
 * 
 * MACHINE_STATUS_CHANGE:
 * - Máquina mudou de estado
 * - Exemplo: NORMAL → WARNING
 * - Log: "Máquina Injetora 3 mudou para WARNING"
 * 
 * ANNOTATION_CREATED:
 * - Nova anotação criada
 * - Log: "João Silva criou anotação LINE em Injetora 3"
 * 
 * ANNOTATION_UPDATED:
 * - Anotação editada (movida, redimensionada, etc)
 * - Log: "Maria Costa editou anotação cm5xyz..."
 * 
 * ANNOTATION_DELETED:
 * - Anotação apagada
 * - Log: "Pedro Santos apagou anotação cm5abc..."
 * 
 * MESSAGE_SENT:
 * - Mensagem enviada no chat
 * - Log: "João Silva enviou mensagem em Injetora 3"
 * 
 * USER_CONNECTED:
 * - Utilizador conectou via WebSocket
 * - Log: "Maria Costa conectou"
 * 
 * USER_DISCONNECTED:
 * - Utilizador desconectou
 * - Log: "Pedro Santos desconectou"
 * 
 * TABELA EventLog (Prisma):
 * ```prisma
 * model EventLog {
 *   id          String    @id @default(uuid())
 *   eventType   EventType
 *   description String
 *   metadata    Json?     // Dados extra
 *   machineId   String?
 *   userId      String?
 *   createdAt   DateTime  @default(now())
 * }
 * ```
 * 
 * CONSULTAS ÚTEIS:
 * - Histórico de uma máquina
 * - Ações de um utilizador
 * - Auditoria de mudanças
 * - Debugging de problemas
 */
export enum EventType {
  MACHINE_STATUS_CHANGE = 'MACHINE_STATUS_CHANGE',
  ANNOTATION_CREATED = 'ANNOTATION_CREATED',
  ANNOTATION_UPDATED = 'ANNOTATION_UPDATED',
  ANNOTATION_DELETED = 'ANNOTATION_DELETED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  USER_CONNECTED = 'USER_CONNECTED',
  USER_DISCONNECTED = 'USER_DISCONNECTED',
}

// ============================================
// INTERFACES - Estruturas de Objetos
// ============================================

/**
 * INTERFACE User
 * 
 * Define estrutura de um utilizador do sistema.
 * 
 * CAMPOS:
 * 
 * id: string
 * - UUID único do utilizador
 * - Gerado automaticamente pelo backend (Prisma @default(uuid()))
 * - Exemplo: "cm5abc123xyz..."
 * - Imutável (nunca muda)
 * - Usado como Foreign Key em outras tabelas
 * 
 * username: string
 * - Nome de login do utilizador
 * - ÚNICO no sistema (não pode haver duplicados)
 * - Formato recomendado: "role.nome.turno"
 * - Exemplos: "op.silva.t1", "mnt.sousa", "eng.ribeiro", "admin"
 * - Usado para autenticação (login)
 * - Case-sensitive
 * 
 * name: string
 * - Nome completo do utilizador (nome real)
 * - Exibido no UI (chat, anotações, etc)
 * - Exemplos: "João Silva", "Maria Costa", "Administrador"
 * - Pode ter espaços e acentos
 * - Não precisa ser único
 * 
 * role: string
 * - Nível de permissão
 * - Valores possíveis: Ver UserRole enum
 * - Tipo é 'string' (não UserRole) para flexibilidade
 * - Backend valida se é valor válido
 * - Determina o que user pode fazer
 * 
 * RELAÇÕES NA BD:
 * - Um User pode ter muitas Annotations (1:N)
 * - Um User pode ter muitas ChatMessages (1:N)
 * - Um User pode ter muitos EventLogs (1:N)
 * 
 * EXEMPLO DE OBJETO:
 * {
 *   id: "cm5abc123xyz...",
 *   username: "eng.ribeiro",
 *   name: "Eng. Luís Ribeiro",
 *   role: "ENGINEER"
 * }
 * 
 * PASSWORD:
 * NOTA: Interface não inclui password!
 * Password existe na BD mas NUNCA é enviada ao frontend.
 * Backend remove antes de enviar:
 * 
 * ```typescript
 * const user = await prisma.user.findUnique({ where: { id } })
 * const { password, ...userWithoutPassword } = user
 * return userWithoutPassword
 * ```
 */
export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

/**
 * INTERFACE ProductionLine
 * 
 * Define estrutura de uma linha de produção.
 * Linha agrupa múltiplas máquinas relacionadas.
 * 
 * CAMPOS:
 * 
 * id: string
 * - UUID único da linha
 * - Exemplo: "cm5line1..."
 * 
 * name: string
 * - Nome da linha
 * - Exemplos: "Linha de Montagem 1", "Injeção Plástica A"
 * - Exibido no dashboard
 * 
 * description?: string
 * - Descrição opcional (? = pode ser undefined)
 * - Texto livre explicando a linha
 * - Exemplo: "Linha principal de montagem de componentes eletrônicos"
 * - Se não fornecido, será undefined
 * 
 * isActive: boolean
 * - Se linha está ativa
 * - true: Em operação
 * - false: Desativada (ex: fim de semana, férias)
 * - Linhas inativas podem ser filtradas no UI
 * 
 * machines: Machine[]
 * - Array de máquinas desta linha
 * - Relação 1:N (uma linha tem muitas máquinas)
 * - Populado via JOIN no backend:
 *   ```typescript
 *   prisma.productionLine.findMany({
 *     include: { machines: true }
 *   })
 *   ```
 * - Se não incluído, será array vazio []
 * 
 * EXEMPLO:
 * {
 *   id: "cm5line1...",
 *   name: "Linha de Montagem 1",
 *   description: "Linha principal com 25 máquinas",
 *   isActive: true,
 *   machines: [
 *     { id: "cm5m1...", name: "Injetora 1", ... },
 *     { id: "cm5m2...", name: "Injetora 2", ... },
 *     ...25 máquinas
 *   ]
 * }
 * 
 * UI:
 * Dashboard renderiza ProductionLineCard para cada linha
 * Cada card mostra nome + descrição + lista de máquinas
 */
export interface ProductionLine {
  id: string;
  name: string;
  description?: string;    // Opcional
  isActive: boolean;
  machines: Machine[];
}

/**
 * INTERFACE Machine
 * 
 * Define estrutura de uma máquina industrial.
 * Este é o objeto central da aplicação!
 * 
 * CAMPOS:
 * 
 * id: string
 * - UUID único da máquina
 * - Exemplo: "cm5abc123..."
 * - PK (Primary Key) na BD
 * 
 * name: string
 * - Nome da máquina
 * - Exemplos: "Injetora 3", "Torno CNC 5", "Esteira Transportadora B"
 * - Exibido prominentemente no UI
 * 
 * code: string
 * - Código alfanumérico único
 * - UNIQUE constraint na BD
 * - Formato comum: "TIPO-NUMERO"
 * - Exemplos: "INJ-003", "TORNO-005", "EST-B"
 * - Usado para identificação rápida
 * - Mais fácil de lembrar que UUID
 * 
 * status: MachineStatus
 * - Estado atual da máquina
 * - Ver enum MachineStatus acima
 * - Valores: NORMAL, WARNING, FAILURE, MAINTENANCE
 * - Define cor do badge no UI
 * - CRÍTICO para monitoramento
 * 
 * schemaImageUrl?: string
 * - URL da imagem do esquema técnico (opcional)
 * - Exemplo: "/schemas/injector-3.png"
 * - Imagem de fundo para AnnotationCanvas
 * - Se não fornecido, canvas mostra fundo branco
 * 
 * productionLineId: string
 * - FK (Foreign Key) para ProductionLine
 * - Toda máquina pertence a uma linha
 * - NOT NULL (obrigatório)
 * - Usado para filtrar/agrupar máquinas
 * 
 * productionLine?: ProductionLine
 * - Objeto ProductionLine completo (opcional)
 * - Populado via JOIN:
 *   ```typescript
 *   prisma.machine.findMany({
 *     include: { productionLine: true }
 *   })
 *   ```
 * - Se incluído, evita buscar separadamente
 * 
 * annotations?: Annotation[]
 * - Array de anotações desta máquina (opcional)
 * - Relação 1:N (uma máquina tem muitas anotações)
 * - Populado via JOIN quando necessário
 * - Se não incluído, será undefined
 * 
 * CAMPOS NÃO INCLUÍDOS (existem na BD mas não nesta interface):
 * - createdAt: Data de criação
 * - updatedAt: Data última modificação
 * - Estes campos estão na BD mas não são enviados ao frontend sempre
 * 
 * EXEMPLO COMPLETO:
 * {
 *   id: "cm5abc123...",
 *   name: "Injetora 3",
 *   code: "INJ-003",
 *   status: MachineStatus.WARNING,
 *   schemaImageUrl: "/schemas/injector-layout.png",
 *   productionLineId: "cm5line1...",
 *   productionLine: {
 *     id: "cm5line1...",
 *     name: "Linha de Injeção A",
 *     ...
 *   },
 *   annotations: [
 *     { id: "cm5ann1...", type: "LINE", ... },
 *     { id: "cm5ann2...", type: "CIRCLE", ... }
 *   ]
 * }
 * 
 * QUERIES TÍPICAS:
 * 
 * // Todas as máquinas com linhas
 * const machines = await prisma.machine.findMany({
 *   include: { productionLine: true }
 * })
 * 
 * // Máquinas de uma linha específica
 * const machines = await prisma.machine.findMany({
 *   where: { productionLineId: lineId }
 * })
 * 
 * // Máquina com anotações
 * const machine = await prisma.machine.findUnique({
 *   where: { id },
 *   include: { annotations: { include: { user: true } } }
 * })
 */
export interface Machine {
  id: string;
  name: string;
  code: string;
  status: MachineStatus;
  schemaImageUrl?: string;        // Opcional
  productionLineId: string;
  productionLine?: ProductionLine; // Opcional (via include)
  annotations?: Annotation[];      // Opcional (via include)
}

/**
 * INTERFACE Annotation
 * 
 * Define estrutura de uma anotação gráfica.
 * Anotações são formas desenhadas sobre esquemas técnicos.
 * 
 * CAMPOS:
 * 
 * id: string
 * - UUID único da anotação
 * 
 * type: AnnotationType
 * - Tipo de forma geométrica
 * - Ver enum AnnotationType acima
 * - Valores: LINE, ARROW, RECTANGLE, CIRCLE, TEXT
 * - Determina como renderizar no canvas
 * 
 * content: { ... }
 * - Objeto com propriedades da forma
 * - Estrutura VARIA por tipo!
 * - TypeScript permite any aqui, validação em runtime
 * 
 * ESTRUTURA DE CONTENT POR TIPO:
 * 
 * LINE e ARROW:
 * {
 *   x: number         // Não usado (compatibilidade)
 *   y: number         // Não usado
 *   points?: [x1, y1, x2, y2]  // Coordenadas
 *   color?: string    // Hex color (ex: "#FF0000")
 *   strokeWidth?: number  // Espessura 1-5
 * }
 * Ou alternativamente:
 * {
 *   x1: number, y1: number,   // Ponto inicial
 *   x2: number, y2: number,   // Ponto final
 *   color: string,
 *   strokeWidth: number
 * }
 * 
 * RECTANGLE:
 * {
 *   x: number,        // Canto superior esquerdo X
 *   y: number,        // Canto superior esquerdo Y
 *   width: number,    // Largura
 *   height: number,   // Altura
 *   color: string,
 *   strokeWidth: number
 * }
 * 
 * CIRCLE:
 * {
 *   x: number,        // Centro X (ou cx)
 *   y: number,        // Centro Y (ou cy)
 *   width: number,    // Raio (ou radius)
 *   color: string,
 *   strokeWidth: number
 * }
 * 
 * TEXT:
 * {
 *   x: number,        // Posição X
 *   y: number,        // Posição Y
 *   text: string,     // Conteúdo do texto
 *   color: string,
 *   fontSize?: number // Tamanho da fonte (default: 16)
 * }
 * 
 * machineId: string
 * - FK para Machine
 * - Toda anotação pertence a uma máquina
 * - Usado para filtrar anotações por máquina
 * 
 * userId: string
 * - FK para User (quem criou)
 * - Identifica autor da anotação
 * - Usado para permissões (user só apaga suas próprias)
 * 
 * user?: User
 * - Objeto User completo (opcional)
 * - Populado via JOIN para mostrar nome do autor
 * - Exemplo: Tooltip "Criado por João Silva"
 * 
 * createdAt: string
 * - Data/hora de criação (ISO 8601)
 * - Exemplo: "2026-01-15T10:30:00.000Z"
 * - Usado para ordenar (mais recentes primeiro)
 * 
 * updatedAt: string
 * - Data/hora última modificação
 * - Atualiza quando user move/edita anotação
 * 
 * EXEMPLO COMPLETO (LINE):
 * {
 *   id: "cm5ann123...",
 *   type: "LINE",
 *   content: {
 *     points: [100, 50, 200, 150],
 *     color: "#FF0000",
 *     strokeWidth: 2
 *   },
 *   machineId: "cm5mac123...",
 *   userId: "cm5user123...",
 *   user: {
 *     id: "cm5user123...",
 *     name: "João Silva",
 *     username: "eng.silva",
 *     role: "ENGINEER"
 *   },
 *   createdAt: "2026-01-15T10:30:00.000Z",
 *   updatedAt: "2026-01-15T10:30:00.000Z"
 * }
 * 
 * RENDERIZAÇÃO NO CANVAS:
 * 
 * ```typescript
 * const renderAnnotation = (ctx: CanvasRenderingContext2D, ann: Annotation) => {
 *   ctx.strokeStyle = ann.content.color || '#000000'
 *   ctx.lineWidth = ann.content.strokeWidth || 2
 *   
 *   switch(ann.type) {
 *     case 'LINE':
 *       const [x1, y1, x2, y2] = ann.content.points!
 *       ctx.beginPath()
 *       ctx.moveTo(x1, y1)
 *       ctx.lineTo(x2, y2)
 *       ctx.stroke()
 *       break
 *     
 *     case 'RECTANGLE':
 *       ctx.strokeRect(
 *         ann.content.x, 
 *         ann.content.y, 
 *         ann.content.width!, 
 *         ann.content.height!
 *       )
 *       break
 *     
 *     case 'CIRCLE':
 *       ctx.beginPath()
 *       ctx.arc(
 *         ann.content.x, 
 *         ann.content.y, 
 *         ann.content.width!, 
 *         0, 
 *         2 * Math.PI
 *       )
 *       ctx.stroke()
 *       break
 *     
 *     case 'TEXT':
 *       ctx.fillStyle = ann.content.color || '#000000'
 *       ctx.font = `${ann.content.fontSize || 16}px Arial`
 *       ctx.fillText(ann.content.text!, ann.content.x, ann.content.y)
 *       break
 *   }
 * }
 * ```
 */
export interface Annotation {
  id: string;
  type: AnnotationType;
  content: {
    x: number;
    y: number;
    width?: number;      // Opcional
    height?: number;     // Opcional
    points?: number[];   // Opcional (para LINE/ARROW)
    text?: string;       // Opcional (para TEXT)
    color?: string;      // Opcional
    strokeWidth?: number; // Opcional
  };
  machineId: string;
  userId: string;
  user?: User;           // Opcional (via include)
  createdAt: string;
  updatedAt: string;
}

/**
 * INTERFACE ChatMessage
 * 
 * Define estrutura de uma mensagem de chat.
 * Cada máquina tem seu próprio chat.
 * 
 * CAMPOS:
 * 
 * id: string
 * - UUID único da mensagem
 * 
 * content: string
 * - Texto da mensagem
 * - Exemplos: "Máquina OK", "Verificar rolamento"
 * - Pode incluir quebras de linha (\n)
 * - Tamanho máximo: ~1000 caracteres (validado no backend)
 * 
 * machineId: string
 * - FK para Machine
 * - Define a qual máquina pertence
 * - Usado para filtrar mensagens por máquina
 * - WebSocket usa para salas: `machine:${machineId}`
 * 
 * userId: string
 * - FK para User (autor)
 * - Quem enviou a mensagem
 * - Usado para mostrar nome + avatar
 * 
 * userName?: string
 * - Nome do autor (denormalized - opcional)
 * - Cache do user.name para performance
 * - Se não fornecido, buscar de user.name
 * - Evita JOIN sempre que listar mensagens
 * 
 * user?: User
 * - Objeto User completo (opcional)
 * - Populado via JOIN quando necessário
 * - Inclui role para mostrar badge
 * 
 * createdAt: string
 * - Data/hora de envio (ISO 8601)
 * - Usado para ordenar (cronológico)
 * - Exibido como: "14:35" ou "Ontem 10:20"
 * 
 * EXEMPLO:
 * {
 *   id: "cm5msg123...",
 *   content: "Máquina voltou ao normal após ajuste",
 *   machineId: "cm5mac123...",
 *   userId: "cm5user123...",
 *   userName: "João Silva",
 *   user: {
 *     id: "cm5user123...",
 *     name: "João Silva",
 *     username: "op.silva.t1",
 *     role: "OPERATOR"
 *   },
 *   createdAt: "2026-01-15T14:35:22.000Z"
 * }
 * 
 * RENDERIZAÇÃO NO CHAT:
 * 
 * ```tsx
 * function MessageBubble({ message }: { message: ChatMessage }) {
 *   const { currentUser } = useUserStore()
 *   const isMine = message.userId === currentUser.id
 *   
 *   return (
 *     <div className={`message ${isMine ? 'mine' : 'other'}`}>
 *       {!isMine && <span className="author">{message.userName}</span>}
 *       <div className="content">{message.content}</div>
 *       <span className="time">{formatTime(message.createdAt)}</span>
 *     </div>
 *   )
 * }
 * ```
 * 
 * WEBSOCKET FLOW:
 * 
 * 1. User envia:
 *    socket.emit('sendMessage', { 
 *      content: "Olá", 
 *      machineId, 
 *      userId 
 *    })
 * 
 * 2. Backend recebe:
 *    - Valida dados
 *    - Salva na BD: prisma.chatMessage.create(...)
 *    - Gera ID e timestamp
 *    - Broadcast para sala:
 *      server.to(`machine:${machineId}`).emit('newMessage', savedMessage)
 * 
 * 3. Todos os clientes recebem:
 *    - chatStore.addMessage(message)
 *    - UI atualiza instantaneamente
 * 
 * FORMATAÇÃO DE TIMESTAMP:
 * 
 * ```typescript
 * const formatTime = (isoString: string): string => {
 *   const date = new Date(isoString)
 *   const now = new Date()
 *   
 *   // Hoje: Mostrar apenas hora
 *   if (isSameDay(date, now)) {
 *     return date.toLocaleTimeString('pt-PT', { 
 *       hour: '2-digit', 
 *       minute: '2-digit' 
 *     })
 *     // "14:35"
 *   }
 *   
 *   // Ontem: "Ontem 14:35"
 *   if (isYesterday(date, now)) {
 *     return `Ontem ${date.toLocaleTimeString('pt-PT', ...)}`
 *   }
 *   
 *   // Mais antigo: "15/01/2026 14:35"
 *   return date.toLocaleString('pt-PT', {
 *     day: '2-digit',
 *     month: '2-digit',
 *     year: 'numeric',
 *     hour: '2-digit',
 *     minute: '2-digit'
 *   })
 * }
 * ```
 */
export interface ChatMessage {
  id: string;
  content: string;
  machineId: string;
  userId: string;
  userName?: string;     // Opcional (cache)
  user?: User;           // Opcional (via include)
  createdAt: string;
}

/**
 * ============================================
 * COMO ESTAS INTERFACES SÃO USADAS
 * ============================================
 * 
 * NO FRONTEND:
 * 
 * 1. Stores (Zustand):
 *    ```typescript
 *    interface MachineStore {
 *      machines: Machine[]  // ← Usa interface Machine
 *      selectedMachine: Machine | null
 *    }
 *    ```
 * 
 * 2. Componentes React:
 *    ```typescript
 *    interface Props {
 *      machine: Machine  // ← Type checking de props
 *    }
 *    
 *    function MachineCard({ machine }: Props) {
 *      // TypeScript sabe que machine.name existe
 *      // Autocomplete funciona
 *      return <div>{machine.name}</div>
 *    }
 *    ```
 * 
 * 3. API Calls:
 *    ```typescript
 *    const fetchMachines = async (): Promise<Machine[]> => {
 *      const response = await axios.get<Machine[]>('/machines')
 *      return response.data  // Type-safe!
 *    }
 *    ```
 * 
 * NO BACKEND:
 * 
 * 1. DTOs (Data Transfer Objects):
 *    ```typescript
 *    export class CreateMachineDto {
 *      @IsString()
 *      name: string
 *      
 *      @IsEnum(MachineStatus)
 *      status: MachineStatus  // ← Usa enum
 *    }
 *    ```
 * 
 * 2. Prisma Schema:
 *    ```prisma
 *    model Machine {
 *      id        String        @id @default(uuid())
 *      name      String
 *      code      String        @unique
 *      status    MachineStatus @default(NORMAL)
 *      ...
 *    }
 *    
 *    enum MachineStatus {
 *      NORMAL
 *      WARNING
 *      FAILURE
 *      MAINTENANCE
 *    }
 *    ```
 * 
 * 3. Controllers:
 *    ```typescript
 *    @Get()
 *    async findAll(): Promise<Machine[]> {
 *      return this.machinesService.findAll()
 *      // Return type é Machine[] - type-safe!
 *    }
 *    ```
 */

/**
 * ============================================
 * OPCIONAL (?) vs OBRIGATÓRIO
 * ============================================
 * 
 * CAMPO OPCIONAL (com ?):
 * ```typescript
 * schemaImageUrl?: string
 * ```
 * - Pode ser: string OU undefined
 * - Não precisa fornecer ao criar objeto
 * - Acesso: machine.schemaImageUrl (pode ser undefined!)
 * - Verificação: if (machine.schemaImageUrl) { ... }
 * 
 * CAMPO OBRIGATÓRIO (sem ?):
 * ```typescript
 * name: string
 * ```
 * - DEVE ser: string (nunca undefined)
 * - Obrigatório ao criar objeto
 * - Acesso: machine.name (sempre existe)
 * - Sem verificação necessária
 * 
 * ERRO SE FALTAR CAMPO OBRIGATÓRIO:
 * ```typescript
 * const machine: Machine = {
 *   id: "123",
 *   code: "ABC"
 *   // ❌ ERRO: Property 'name' is missing
 * }
 * ```
 * 
 * OK SE FALTAR CAMPO OPCIONAL:
 * ```typescript
 * const machine: Machine = {
 *   id: "123",
 *   name: "Test",
 *   code: "ABC",
 *   status: MachineStatus.NORMAL,
 *   productionLineId: "456"
 *   // ✅ OK - schemaImageUrl é opcional
 * }
 * ```
 */
