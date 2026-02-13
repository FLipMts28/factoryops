"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
    }
    handleConnection(client) {
        console.log(`💬 [WebSocket] Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`💬 [WebSocket] Cliente desconectado: ${client.id}`);
    }
    async handleJoinChat(client, data) {
        const room = `chat:${data.machineId}`;
        client.join(room);
        let roomSize = 0;
        try {
            const adapter = this.server?.sockets?.adapter;
            if (adapter && adapter.rooms) {
                roomSize = adapter.rooms.get(room)?.size || 0;
            }
        }
        catch (error) {
            console.warn('⚠️  Erro ao verificar tamanho da sala:', error.message);
        }
        console.log(`✅ [Chat] Cliente ${client.id} entrou na sala ${room}`);
        console.log(`👥 [Chat] Total de clientes na sala: ${roomSize}`);
        const history = await this.chatService.findByMachine(data.machineId);
        client.emit('chatHistory', history.reverse());
        console.log(`📜 [Chat] Histórico enviado para ${client.id}: ${history.length} mensagens`);
    }
    handleLeaveChat(client, machineId) {
        const room = `chat:${machineId}`;
        client.leave(room);
        console.log(`👋 [Chat] Cliente ${client.id} saiu da sala ${room}`);
    }
    async handleSendMessage(data) {
        const room = `chat:${data.machineId}`;
        console.log('📨 [Chat] Mensagem recebida:', {
            machineId: data.machineId,
            userId: data.userId,
            content: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
        });
        const message = await this.chatService.create(data);
        console.log('💾 [Chat] Mensagem salva no banco:', message.id);
        let roomSize = 0;
        try {
            const adapter = this.server?.sockets?.adapter;
            if (adapter && adapter.rooms) {
                roomSize = adapter.rooms.get(room)?.size || 0;
            }
        }
        catch (error) {
            console.warn('⚠️  Erro ao verificar tamanho da sala:', error.message);
            roomSize = -1;
        }
        console.log(`📤 [Chat] Broadcasting para sala "${room}" com ${roomSize === -1 ? '?' : roomSize} cliente(s)`);
        this.server.to(room).emit('newMessage', message);
        console.log('✅ [Chat] Broadcast enviado com sucesso!');
        console.log('---');
        return message;
    }
    handleUserTyping(data) {
        const room = `chat:${data.machineId}`;
        console.log(`⌨️  [Chat] ${data.userName} está a escrever na sala ${room}`);
        this.server.to(room).emit('userTyping', data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinMachineChat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveMachineChat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('userTyping'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleUserTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map