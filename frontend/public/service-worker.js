/**
 * ============================================
 * SERVICE WORKER - FactoryOps PWA
 * ============================================
 * 
 * Service Worker para Progressive Web App.
 * Permite:
 * - Cache de recursos estáticos
 * - Funcionamento offline
 * - Instalação como app desktop/mobile
 * - Notificações push (futuro)
 * 
 * CACHE STRATEGY: Network First, falling back to Cache
 * - Tenta buscar da rede primeiro
 * - Se offline, usa cache
 * - Mantém app funcionando sem internet
 */

const CACHE_NAME = 'factoryops-v1';
const RUNTIME_CACHE = 'factoryops-runtime-v1';

// Recursos para pré-cachear (cache imediato na instalação)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ==========================================
// EVENTO: INSTALL
// ==========================================
/**
 * Disparado quando Service Worker é instalado pela primeira vez.
 * 
 * FLUXO:
 * 1. User visita site pela primeira vez
 * 2. Browser baixa e instala service worker
 * 3. Evento 'install' dispara
 * 4. Pré-cachear recursos críticos
 * 5. skipWaiting() ativa imediatamente (não espera fechar abas)
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pré-cacheando recursos');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[Service Worker] Instalado com sucesso');
        return self.skipWaiting(); // Ativar imediatamente
      })
  );
});

// ==========================================
// EVENTO: ACTIVATE
// ==========================================
/**
 * Disparado quando Service Worker é ativado.
 * 
 * FLUXO:
 * 1. Service Worker instalado
 * 2. Todas as abas antigas fechadas (ou skipWaiting chamado)
 * 3. Evento 'activate' dispara
 * 4. Limpar caches antigos
 * 5. Tomar controle de todas as abas
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Apagar caches antigos (de versões anteriores)
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Apagando cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Ativado');
        return self.clients.claim(); // Tomar controle de todas as abas
      })
  );
});

// ==========================================
// EVENTO: FETCH
// ==========================================
/**
 * Intercepta TODAS as requisições da aplicação.
 * 
 * ESTRATÉGIA: Network First with Cache Fallback
 * 
 * 1. Tentar buscar da rede
 * 2. Se sucesso: Retornar resposta + Adicionar ao cache
 * 3. Se falhar (offline): Buscar do cache
 * 4. Se não tiver cache: Erro
 * 
 * VANTAGENS:
 * - Sempre tenta dados frescos (network first)
 * - Funciona offline com dados cacheados
 * - Cache dinâmico (runtime cache)
 */
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-HTTP (chrome-extension://, etc)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Ignorar requisições para API externa (sempre tentar rede)
  if (event.request.url.includes('/api/') || event.request.url.includes('localhost:3001')) {
    return; // Deixar passar direto, sem cache
  }

  event.respondWith(
    // ESTRATÉGIA: Network First
    fetch(event.request)
      .then((response) => {
        // SUCESSO: Rede respondeu
        
        // Não cachear se não for sucesso (4xx, 5xx)
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clonar resposta (pode ser lida apenas 1 vez)
        const responseToCache = response.clone();

        // Adicionar ao runtime cache
        caches.open(RUNTIME_CACHE)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // FALHOU: Offline ou erro de rede
        console.log('[Service Worker] Fetch failed, usando cache:', event.request.url);
        
        // Tentar buscar do cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Se for navegação (HTML), retornar página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }

            // Nenhum cache disponível
            return new Response('Offline - Recurso não disponível', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// ==========================================
// EVENTO: MESSAGE
// ==========================================
/**
 * Permite comunicação bidirecional entre app e service worker.
 * 
 * COMANDOS SUPORTADOS:
 * - skipWaiting: Ativar nova versão imediatamente
 * - clearCache: Limpar cache manualmente
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensagem recebida:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('[Service Worker] Cache limpo');
      event.ports[0].postMessage({ success: true });
    });
  }
});

// ==========================================
// NOTIFICAÇÕES PUSH (Futuro)
// ==========================================
/**
 * Preparado para notificações push no futuro.
 * Exemplo: Alertas de máquinas em FAILURE
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recebido');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FactoryOps';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificação clicada');
  
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
