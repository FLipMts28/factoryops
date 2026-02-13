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

    console.log('🔌 WebSockets conectados');
    
    // Log de conexão do chat
    this.chatSocket?.on('connect', () => {
      console.log('✅ [Chat] Socket conectado!', this.chatSocket?.id);
    });
    
    this.chatSocket?.on('disconnect', () => {
      console.log('❌ [Chat] Socket desconectado!');
    });
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
    console.log('🚪 [Chat] Entrando na sala:', { machineId, userId });
    this.chatSocket?.emit('joinMachineChat', { machineId, userId });
  }

  leaveMachineChat(machineId: string) {
    console.log('🚪 [Chat] Saindo da sala:', machineId);
    this.chatSocket?.emit('leaveMachineChat', machineId);
  }

  onChatHistory(callback: (messages: any[]) => void) {
    this.chatSocket?.on('chatHistory', (messages) => {
      console.log('📜 [Chat] Histórico recebido:', messages.length, 'mensagens');
      callback(messages);
    });
  }

  onNewMessage(callback: (message: any) => void) {
    this.chatSocket?.on('newMessage', (message) => {
      console.log('💬 [Chat] Nova mensagem recebida:', message);
      callback(message);
    });
  }

  sendMessage(data: any) {
    console.log('📤 [Chat] Enviando mensagem:', data);
    this.chatSocket?.emit('sendMessage', data);
  }

  onUserTyping(callback: (data: any) => void) {
    this.chatSocket?.on('userTyping', (data) => {
      console.log('⌨️  [Chat] Utilizador a escrever:', data.userName);
      callback(data);
    });
  }

  emitUserTyping(machineId: string, userName: string) {
    this.chatSocket?.emit('userTyping', { machineId, userName });
  }
}

export const socketService = new SocketService();
