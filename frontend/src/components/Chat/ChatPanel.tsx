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
  const { messages, clearMessages } = useChatStore();
  const { currentUser } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    
    socketService.joinMachineChat(machineId, currentUser.id);

    return () => {
      socketService.leaveMachineChat(machineId);
      clearMessages();
    };
  }, [machineId, currentUser]);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!currentUser) return;
    
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

      <div ref={messagesEndRef} />

      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};
