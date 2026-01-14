import { useEffect } from 'react';
import { socketService } from '../services/socket';
import { useMachineStore } from '../store/machineStore';
import { useAnnotationStore } from '../store/annotationStore';
import { useChatStore } from '../store/chatStore';

export const useWebSocket = () => {
  const updateMachineStatus = useMachineStore((state) => state.updateMachineStatus);
  const { addAnnotation, updateAnnotation, removeAnnotation } = useAnnotationStore();
  const { addMessage, setMessages, addTypingUser, removeTypingUser } = useChatStore();

  useEffect(() => {
    // Machine status updates
    socketService.onMachineStatusChanged((machine) => {
      updateMachineStatus(machine.id, machine);
      console.log('Machine status updated:', machine);
    });

    // Annotation events
    socketService.onAnnotationCreated((annotation) => {
      addAnnotation(annotation);
    });

    socketService.onAnnotationUpdated((annotation) => {
      updateAnnotation(annotation.id, annotation);
    });

    socketService.onAnnotationDeleted((id) => {
      removeAnnotation(id);
    });

    // Chat events
    socketService.onChatHistory((messages) => {
      setMessages(messages);
    });

    socketService.onNewMessage((message) => {
      addMessage(message);
    });

    socketService.onUserTyping((data) => {
      addTypingUser(data.userName);
      setTimeout(() => {
        removeTypingUser(data.userName);
      }, 3000);
    });
  }, []);

  const connect = () => {
    socketService.connect();
  };

  const disconnect = () => {
    socketService.disconnect();
  };

  return { connect, disconnect };
};
