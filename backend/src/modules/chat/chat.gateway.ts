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
    console.log(`💬 Chat client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`💬 Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinMachineChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { machineId: string; userId: string },
  ) {
    client.join(`chat:${data.machineId}`);
    
    const history = await this.chatService.findByMachine(data.machineId);
    client.emit('chatHistory', history.reverse());
    
    console.log(`Client ${client.id} joined chat:${data.machineId}`);
  }

  @SubscribeMessage('leaveMachineChat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() machineId: string,
  ) {
    client.leave(`chat:${machineId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any) {
    const message = await this.chatService.create(data);
    this.server.to(`chat:${data.machineId}`).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('userTyping')
  handleUserTyping(@MessageBody() data: { machineId: string; userName: string }) {
    this.server.to(`chat:${data.machineId}`).emit('userTyping', data);
  }
}
