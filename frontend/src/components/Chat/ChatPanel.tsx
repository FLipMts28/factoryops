import { useEffect, useRef } from 'react';
import { socketService } from '../../services/socket';
import { useChatStore } from '../../store/chatStore';
import { useUserStore } from '../../store/userStore';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';


interface ChatPanelProps {
  machineId: string;
}

export const ChatPanel = ({ machineId }: ChatPanelProps) => {
  const { messages, clearMessages, addMessage, setMessages, clearUnread } = useChatStore();
  const { currentUser } = useUserStore();

  // Verificar se a máquina é temporária
  const isTempMachine = machineId.startsWith('new-');

  useEffect(() => {
    if (!currentUser || isTempMachine) return;
    
    console.log('💬 Entrando no chat da máquina:', machineId);
    
    // Carregar histórico de mensagens do backend
    const loadHistory = async () => {
      try {
        const response = await fetch(`http://localhost:3001/chat/machine/${machineId}`);
        if (response.ok) {
          const messages = await response.json();
          console.log('📜 Histórico carregado:', messages.length, 'mensagens');
          setMessages(messages);
        }
      } catch (error) {
        console.warn('⚠️  Erro ao carregar histórico:', error);
      }
    };
    
    loadHistory();
    
    // Limpar contador de não lidas
    clearUnread(machineId);
    
    // Entrar no chat via WebSocket
    socketService.joinMachineChat(machineId, currentUser.id);

    // Não precisamos de listener local - o useWebSocket já registra onNewMessage globalmente

    return () => {
      console.log('💬 Saindo do chat da máquina:', machineId);
      socketService.leaveMachineChat(machineId);
      clearMessages();
    };
  }, [machineId, currentUser, isTempMachine]);

  const handleSendMessage = (content: string) => {
    if (!currentUser) return;
    
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    console.log('📤 Enviando mensagem:', { tempId, content, machineId, userId: currentUser.id });
    
    // Adicionar localmente IMEDIATAMENTE com ID temporário
    const tempMessage: any = {
      id: tempId,
      content,
      machineId,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    
    addMessage(tempMessage);
    
    // Enviar via WebSocket
    socketService.sendMessage({
      content,
      machineId,
      userId: currentUser.id,
    });
  };

  const handleTyping = () => {
    if (!currentUser) return;
    socketService.emitUserTyping(machineId, currentUser.name);
  };

  // Aviso para máquinas temporárias
  if (isTempMachine) {
    return (
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-8 text-center border-2 border-blue-400 dark:border-blue-600">
        <div className="flex flex-col items-center space-y-4">
          <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div>
        
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              Chat Não Disponível
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Este equipamento foi adicionado localmente e ainda não foi salvo no servidor.
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              O chat estará disponível após o equipamento ser sincronizado com o backend.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-500">Por favor, selecione um utilizador para enviar mensagens</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
        <h3 className="text-lg font-semibold text-white">Chat Operacional</h3>
        <p className="text-sm text-green-100">Comunicação em tempo real • {currentUser.name}</p>
      </div>

      <MessageList messages={messages} currentUserId={currentUser.id} />
      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
    
  );
};
