import { io, Socket } from 'socket.io-client';

const SOCKET_BASE_URL = 'http://localhost:3001';

class SocketService {
  private machinesSocket: Socket | null = null;
  private annotationsSocket: Socket | null = null;
  private chatSocket: Socket | null = null;

  connect() {
    this.machinesSocket = io(`${SOCKET_BASE_URL}/machines`);
    this.annotationsSocket = io(`${SOCKET_BASE_URL}/annotations`);
    this.chatSocket = io(`${SOCKET_BASE_URL}/chat`);

    console.log('🔌 WebSockets connected');
  }

  disconnect() {
    this.machinesSocket?.disconnect();
    this.annotationsSocket?.disconnect();
    this.chatSocket?.disconnect();
  }

  // Machines
  onMachineStatusChanged(callback: (machine: any) => void) {
    this.machinesSocket?.on('machineStatusChanged', callback);
  }

  // Annotations
  joinMachine(machineId: string) {
    this.annotationsSocket?.emit('joinMachine', machineId);
  }

  leaveMachine(machineId: string) {
    this.annotationsSocket?.emit('leaveMachine', machineId);
  }

  onAnnotationCreated(callback: (annotation: any) => void) {
    this.annotationsSocket?.on('annotationCreated', callback);
  }

  onAnnotationUpdated(callback: (annotation: any) => void) {
    this.annotationsSocket?.on('annotationUpdated', callback);
  }

  onAnnotationDeleted(callback: (id: string) => void) {
    this.annotationsSocket?.on('annotationDeleted', callback);
  }

  createAnnotation(data: any) {
    this.annotationsSocket?.emit('createAnnotation', data);
  }

  updateAnnotation(data: any) {
    this.annotationsSocket?.emit('updateAnnotation', data);
  }

  deleteAnnotation(data: any) {
    this.annotationsSocket?.emit('deleteAnnotation', data);
  }

  // Chat
  joinMachineChat(machineId: string, userId: string) {
    this.chatSocket?.emit('joinMachineChat', { machineId, userId });
  }

  leaveMachineChat(machineId: string) {
    this.chatSocket?.emit('leaveMachineChat', machineId);
  }

  onChatHistory(callback: (messages: any[]) => void) {
    this.chatSocket?.on('chatHistory', callback);
  }

  onNewMessage(callback: (message: any) => void) {
    this.chatSocket?.on('newMessage', callback);
  }

  sendMessage(data: any) {
    this.chatSocket?.emit('sendMessage', data);
  }

  onUserTyping(callback: (data: any) => void) {
    this.chatSocket?.on('userTyping', callback);
  }

  emitUserTyping(machineId: string, userName: string) {
    this.chatSocket?.emit('userTyping', { machineId, userName });
  }
}

export const socketService = new SocketService();
