/**
 * ============================================
 * INSTALL PWA - Botão de Instalação
 * ============================================
 * 
 * Componente que mostra botão "Instalar App" quando PWA é instalável.
 * Usa beforeinstallprompt event do browser.
 * 
 * FUNCIONALIDADE:
 * - Detecta se app é instalável
 * - Mostra botão de instalação
 * - Captura evento e instala quando user clica
 * - Esconde botão após instalação
 * 
 * ONDE USAR:
 * - Navbar (sempre visível)
 * - Banner no topo (primeira visita)
 * - Settings page
 */

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listener para beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      console.log('📱 PWA instalável detectado');
      
      // Prevenir mini-infobar automático do Chrome
      e.preventDefault();
      
      // Salvar evento para usar depois
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listener para quando app é instalado
    const handleAppInstalled = () => {
      console.log('✅ PWA instalado com sucesso');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar prompt de instalação nativo
    deferredPrompt.prompt();

    // Esperar escolha do user
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalação`);

    // Limpar prompt (só pode ser usado 1 vez)
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Não mostrar se já instalado ou não instalável
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md"
      title="Instalar FactoryOps como aplicação desktop"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
          clipRule="evenodd" 
        />
      </svg>
      <span className="font-medium">Instalar App</span>
    </button>
  );
};

/**
 * ============================================
 * COMO USAR
 * ============================================
 * 
 * OPÇÃO 1: No Navbar
 * ```tsx
 * import { InstallPWA } from './InstallPWA'
 * 
 * function Navbar() {
 *   return (
 *     <nav>
 *       <div>Logo</div>
 *       <InstallPWA />
 *       <UserMenu />
 *     </nav>
 *   )
 * }
 * ```
 * 
 * OPÇÃO 2: Banner no topo
 * ```tsx
 * function App() {
 *   return (
 *     <>
 *       <div className="bg-blue-50 border-b border-blue-200 p-3">
 *         <div className="container mx-auto flex items-center justify-between">
 *           <p>Instale o FactoryOps para acesso rápido!</p>
 *           <InstallPWA />
 *         </div>
 *       </div>
 *       <MainContent />
 *     </>
 *   )
 * }
 * ```
 */
