import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnnotationsService } from './annotations.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/annotations',
})
export class AnnotationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private annotationsService: AnnotationsService) {}

  @SubscribeMessage('joinMachine')
  handleJoinMachine(
    @ConnectedSocket() client: Socket,
    @MessageBody() machineId: string,
  ) {
    client.join(`machine:${machineId}`);
    console.log(`Client ${client.id} joined machine:${machineId}`);
  }

  @SubscribeMessage('leaveMachine')
  handleLeaveMachine(
    @ConnectedSocket() client: Socket,
    @MessageBody() machineId: string,
  ) {
    client.leave(`machine:${machineId}`);
  }

  @SubscribeMessage('createAnnotation')
  async handleCreateAnnotation(@MessageBody() data: any) {
    const annotation = await this.annotationsService.create(data);
    this.server.to(`machine:${data.machineId}`).emit('annotationCreated', annotation);
    return annotation;
  }

  @SubscribeMessage('updateAnnotation')
  async handleUpdateAnnotation(@MessageBody() data: any) {
    const annotation = await this.annotationsService.update(data.id, data);
    this.server.to(`machine:${data.machineId}`).emit('annotationUpdated', annotation);
    return annotation;
  }

  @SubscribeMessage('deleteAnnotation')
  async handleDeleteAnnotation(@MessageBody() data: any) {
    await this.annotationsService.remove(data.id);
    this.server.to(`machine:${data.machineId}`).emit('annotationDeleted', data.id);
  }
}
