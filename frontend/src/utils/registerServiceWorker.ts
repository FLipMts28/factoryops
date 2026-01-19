/**
 * ============================================
 * REGISTER SERVICE WORKER
 * ============================================
 * 
 * Registra o Service Worker para PWA.
 * Deve ser chamado no main.tsx após app iniciar.
 */

export const registerServiceWorker = async () => {
  // Verificar se browser suporta Service Workers
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️  Service Workers não suportados neste browser');
    return;
  }

  try {
    // Registrar service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registrado:', registration.scope);

    // Verificar atualizações a cada 1 hora
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Listener para quando houver nova versão disponível
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível!
            console.log('🔄 Nova versão disponível!');
            
            // OPCIONAL: Mostrar notificação ao user
            if (confirm('Nova versão disponível! Recarregar agora?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });

    // Recarregar quando service worker assumir controle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker:', error);
  }
};

/**
 * Limpar cache manualmente (útil para debugging)
 */
export const clearServiceWorkerCache = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  
  if (registration.active) {
    const messageChannel = new MessageChannel();
    
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };

      registration.active.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }
};
