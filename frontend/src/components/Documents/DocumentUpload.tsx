import { useState, useRef, DragEvent } from 'react';
import { Machine } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface DocumentUploadProps {
  machine: Machine;
}

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

export const DocumentUpload = ({ machine }: DocumentUploadProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  // Verificar se a máquina é temporária
  const isTempMachine = machine.id.startsWith('new-');

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Simular upload (em produção, fazer upload para servidor)
    for (const file of files) {
      // Criar documento
      const newDoc: Document = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        // Em produção, fazer upload real e guardar URL
        url: URL.createObjectURL(file),
      };

      setDocuments(prev => [...prev, newDoc]);

      // TODO: Fazer upload real para o backend
      // await uploadDocument(machine.id, file);
    }

    setIsUploading(false);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (docId: string) => {
    const confirm = window.confirm('Tem certeza que deseja remover este documento?');
    if (!confirm) return;

    setDocuments(prev => prev.filter(doc => doc.id !== docId));

    // TODO: Deletar do backend
    // await deleteDocument(machine.id, docId);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
        </svg>
      );
    }
    if (type.includes('image')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1zm1 2v10h10V5H5z"/>
        </svg>
      );
    }
    if (type.includes('word') || type.includes('document')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2h8l4 4v10a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/>
        </svg>
      );
    }
    if (type.includes('excel') || type.includes('spreadsheet')) {
      return (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2h8l4 4v10a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/>
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 2h8l4 4v10a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z"/>
      </svg>
    );
  };

  // Aviso para máquinas temporárias
  if (isTempMachine) {
    return (
      <div className={`rounded-lg shadow-lg p-8 text-center border-2 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-600'
          : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400'
      }`}>
        <div className="flex flex-col items-center space-y-4">
          <svg className={`w-16 h-16 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div>
            <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-purple-900'}`}>
              Upload Não Disponível
            </h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-purple-200' : 'text-purple-800'}`}>
              Este equipamento foi adicionado localmente e ainda não foi salvo no servidor.
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
              O upload de documentos estará disponível após o equipamento ser sincronizado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-lg p-6 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Documentos do Equipamento
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Manuais, esquemas, certificados e outros documentos técnicos
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              A carregar documentos...
            </p>
          </div>
        ) : (
          <>
            <svg className={`mx-auto h-12 w-12 mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className={`text-base mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Arraste ficheiros para aqui ou clique para selecionar
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              PDF, Word, Excel, Imagens (máx. 10MB por ficheiro)
            </p>
          </>
        )}
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="mt-6">
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Documentos ({documents.length})
          </h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {doc.name}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleString('pt-PT')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {doc.url && (
                    <a
                      href={doc.url}
                      download={doc.name}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-600 text-gray-300'
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      title="Download"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remover"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};