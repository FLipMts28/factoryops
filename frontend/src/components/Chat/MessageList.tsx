// frontend/src/components/Chat/MessageList.tsx
import { ChatMessage } from '../../types';
import { useChatStore } from '../../store/chatStore';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const { typingUsers } = useChatStore();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Nenhuma mensagem ainda. Seja o primeiro a escrever!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.userId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isCurrentUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {!isCurrentUser && (
                  <div className="text-xs font-semibold mb-1 opacity-75">
                    {message.user?.name || 'Utilizador'}
                  </div>
                )}
                <div className="text-sm">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600">
            <span className="italic">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} a escrever...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
