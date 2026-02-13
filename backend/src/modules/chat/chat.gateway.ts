import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`💬 [WebSocket] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`💬 [WebSocket] Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('joinMachineChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { machineId: string; userId: string },
  ) {
    const room = `chat:${data.machineId}`;
    client.join(room);
    
    // Verificar tamanho da sala com segurança
    let roomSize = 0;
    try {
      const adapter = this.server?.sockets?.adapter;
      if (adapter && adapter.rooms) {
        roomSize = adapter.rooms.get(room)?.size || 0;
      }
    } catch (error) {
      console.warn('⚠️  Erro ao verificar tamanho da sala:', error.message);
    }
    
    console.log(`✅ [Chat] Cliente ${client.id} entrou na sala ${room}`);
    console.log(`👥 [Chat] Total de clientes na sala: ${roomSize}`);
    
    const history = await this.chatService.findByMachine(data.machineId);
    client.emit('chatHistory', history.reverse());
    
    console.log(`📜 [Chat] Histórico enviado para ${client.id}: ${history.length} mensagens`);
  }

  @SubscribeMessage('leaveMachineChat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() machineId: string,
  ) {
    const room = `chat:${machineId}`;
    client.leave(room);
    console.log(`👋 [Chat] Cliente ${client.id} saiu da sala ${room}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any) {
    const room = `chat:${data.machineId}`;
    
    console.log('📨 [Chat] Mensagem recebida:', {
      machineId: data.machineId,
      userId: data.userId,
      content: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
    });
    
    // Salvar no banco
    const message = await this.chatService.create(data);
    console.log('💾 [Chat] Mensagem salva no banco:', message.id);
    
    // Verificar quantos clientes na sala com segurança
    let roomSize = 0;
    try {
      const adapter = this.server?.sockets?.adapter;
      if (adapter && adapter.rooms) {
        roomSize = adapter.rooms.get(room)?.size || 0;
      }
    } catch (error) {
      console.warn('⚠️  Erro ao verificar tamanho da sala:', error.message);
      roomSize = -1; // Indica erro
    }
    
    console.log(`📤 [Chat] Broadcasting para sala "${room}" com ${roomSize === -1 ? '?' : roomSize} cliente(s)`);
    
    // Broadcast para todos na sala
    this.server.to(room).emit('newMessage', message);
    
    console.log('✅ [Chat] Broadcast enviado com sucesso!');
    console.log('---');
    
    return message;
  }

  @SubscribeMessage('userTyping')
  handleUserTyping(@MessageBody() data: { machineId: string; userName: string }) {
    const room = `chat:${data.machineId}`;
    console.log(`⌨️  [Chat] ${data.userName} está a escrever na sala ${room}`);
    this.server.to(room).emit('userTyping', data);
  }
}
