import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Text, Circle } from 'react-konva';
import { Machine, AnnotationType } from '../../types';
import { Toolbar } from './Toolbar';
import { socketService } from '../../services/socket';
import { useAnnotationStore } from '../../store/annotationStore';
import { useUserStore } from '../../store/userStore';
import { useOfflineStore } from '../../store/offlineStore';
import { v4 as uuidv4 } from 'uuid';

interface AnnotationCanvasProps {
  machine: Machine;
}

export const AnnotationCanvas = ({ machine }: AnnotationCanvasProps) => {
  const [tool, setTool] = useState<AnnotationType>(AnnotationType.LINE);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<any>(null);
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  const { annotations, fetchAnnotations, saveAnnotationOffline } = useAnnotationStore();
  const { currentUser } = useUserStore();
  const { isOnline } = useOfflineStore();
  const stageRef = useRef<any>(null);

  // Verificar se a máquina é temporária (não existe no backend)
  const isTempMachine = machine.id.startsWith('new-');

  useEffect(() => {
    // Não buscar anotações para máquinas temporárias
    if (!isTempMachine) {
      console.log('🎨 Carregando anotações para máquina:', machine.id);
      fetchAnnotations(machine.id);
      socketService.joinMachine(machine.id);
    }

    return () => {
      if (!isTempMachine) {
        console.log('🎨 Saindo do canvas da máquina:', machine.id);
        socketService.leaveMachine(machine.id);
      }
    };
  }, [machine.id, isTempMachine]);

  const handleMouseDown = (e: any) => {
    if (!tool) return;
    
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    
    const newShape = {
      id: `temp-${Date.now()}`,
      type: tool,
      x: pos.x,
      y: pos.y,
      color,
      strokeWidth,
    };

    setCurrentShape(newShape);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !currentShape) return;

    const pos = e.target.getStage().getPointerPosition();
    const updatedShape = { ...currentShape };

    if (tool === AnnotationType.LINE) {
      updatedShape.points = [currentShape.x, currentShape.y, pos.x, pos.y];
    } else if (tool === AnnotationType.RECTANGLE) {
      updatedShape.width = pos.x - currentShape.x;
      updatedShape.height = pos.y - currentShape.y;
    } else if (tool === AnnotationType.CIRCLE) {
      const radius = Math.sqrt(
        Math.pow(pos.x - currentShape.x, 2) + Math.pow(pos.y - currentShape.y, 2)
      );
      updatedShape.radius = radius;
    }

    setCurrentShape(updatedShape);
  };

  const handleMouseUp = async () => {
    if (!isDrawing || !currentShape || !currentUser) return;

    setIsDrawing(false);

    const now = new Date();
    const annotation = {
      id: uuidv4(),
      type: tool,
      content: currentShape,
      machineId: machine.id,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    console.log('🎨 Criando anotação:', annotation);

    // Adicionar localmente IMEDIATAMENTE (optimistic update)
    useAnnotationStore.getState().addAnnotation(annotation as any);

    if (isOnline) {
      socketService.createAnnotation(annotation);
    } else {
      await saveAnnotationOffline(annotation);
    }

    setCurrentShape(null);
  };

  const handleAddText = () => {
    if (!currentUser) return;
    
    const text = prompt('Digite o texto da anotação:');
    if (!text) return;

    const now = new Date();
    const annotation = {
      id: uuidv4(),
      type: AnnotationType.TEXT,
      content: {
        x: 100,
        y: 100,
        text,
        color,
        fontSize: 16,
      },
      machineId: machine.id,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    console.log('🎨 Criando anotação de texto:', annotation);

    // Adicionar localmente IMEDIATAMENTE
    useAnnotationStore.getState().addAnnotation(annotation as any);

    if (isOnline) {
      socketService.createAnnotation(annotation);
    } else {
      saveAnnotationOffline(annotation);
    }
  };

  const handleClearMyAnnotations = async () => {
    if (!currentUser) return;

    const myAnnotations = annotations.filter(a => a.userId === currentUser.id);
    
    if (myAnnotations.length === 0) {
      alert('Você não tem anotações para limpar.');
      return;
    }

    const confirm = window.confirm(
      `Tem certeza que deseja limpar ${myAnnotations.length} anotação(ões) sua(s)?`
    );

    if (!confirm) return;

    console.log('🗑️ Limpando minhas anotações:', myAnnotations.length);

    // Deletar cada anotação
    for (const annotation of myAnnotations) {
      if (isOnline) {
        socketService.deleteAnnotation({ id: annotation.id, machineId: machine.id });
      }
      // Remover localmente
      useAnnotationStore.getState().removeAnnotation(annotation.id);
    }
  };

  const handleClearAllAnnotations = async () => {
    if (!currentUser) return;

    if (annotations.length === 0) {
      alert('Não há anotações para limpar.');
      return;
    }

    const confirm = window.confirm(
      `⚠️ ATENÇÃO: Isso irá limpar TODAS as ${annotations.length} anotações deste equipamento!\n\nTem certeza absoluta?`
    );

    if (!confirm) return;

    console.log('🗑️ Limpando todas as anotações:', annotations.length);

    // Deletar cada anotação
    for (const annotation of annotations) {
      if (isOnline) {
        socketService.deleteAnnotation({ id: annotation.id, machineId: machine.id });
      }
      // Remover localmente
      useAnnotationStore.getState().removeAnnotation(annotation.id);
    }
  };

  // Aviso para máquinas temporárias
  if (isTempMachine) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg shadow-lg p-8 text-center border-2 border-yellow-400 dark:border-yellow-600">
        <div className="flex flex-col items-center space-y-4">
          <svg className="w-16 h-16 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
              Equipamento Temporário
            </h3>
            <p className="text-yellow-800 dark:text-yellow-200 mb-4">
              Este equipamento foi adicionado localmente e ainda não foi salvo no servidor.
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              As anotações e o chat estarão disponíveis após o equipamento ser sincronizado com o backend.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-500">Por favor, selecione um utilizador para criar anotações</p>
      </div>
    );
  }

  const renderShape = (annotation: any) => {
    const content = typeof annotation.content === 'string' 
      ? JSON.parse(annotation.content) 
      : annotation.content;

    switch (annotation.type) {
      case AnnotationType.LINE:
        return (
          <Line
            key={annotation.id}
            points={content.points || [content.x, content.y, content.x + 100, content.y + 100]}
            stroke={content.color}
            strokeWidth={content.strokeWidth || 2}
          />
        );
      case AnnotationType.RECTANGLE:
        return (
          <Rect
            key={annotation.id}
            x={content.x}
            y={content.y}
            width={content.width || 100}
            height={content.height || 100}
            stroke={content.color}
            strokeWidth={content.strokeWidth || 2}
          />
        );
      case AnnotationType.CIRCLE:
        return (
          <Circle
            key={annotation.id}
            x={content.x}
            y={content.y}
            radius={content.radius || 50}
            stroke={content.color}
            strokeWidth={content.strokeWidth || 2}
          />
        );
      case AnnotationType.TEXT:
        return (
          <Text
            key={annotation.id}
            x={content.x}
            y={content.y}
            text={content.text}
            fontSize={content.fontSize || 16}
            fill={content.color}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <Toolbar
        selectedTool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onAddText={handleAddText}
      />

      {/* Botões de Limpar */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleClearMyAnnotations}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          title="Limpar apenas as minhas anotações"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Limpar Minhas Anotações</span>
        </button>

        <button
          onClick={handleClearAllAnnotations}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          title="Limpar todas as anotações (requer confirmação)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Limpar Todas</span>
        </button>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
        <Stage
          ref={stageRef}
          width={1000}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {/* Existing annotations */}
            {annotations.map(renderShape)}

            {/* Current drawing */}
            {currentShape && renderShape({ id: 'current', type: tool, content: currentShape })}
          </Layer>
        </Stage>
      </div>

      <div className="text-sm text-gray-600">
        Total de anotações: {annotations.length}
      </div>
    </div>
  );
};