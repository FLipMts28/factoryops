import { useEffect, useRef } from 'react';
import Konva from 'konva';

export const useCanvas = () => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const initCanvas = (containerId: string, width: number, height: number) => {
    stageRef.current = new Konva.Stage({
      container: containerId,
      width,
      height,
    });

    layerRef.current = new Konva.Layer();
    stageRef.current.add(layerRef.current);

    return { stage: stageRef.current, layer: layerRef.current };
  };

  const clearCanvas = () => {
    if (layerRef.current) {
      layerRef.current.destroyChildren();
      layerRef.current.draw();
    }
  };

  const destroy = () => {
    if (stageRef.current) {
      stageRef.current.destroy();
    }
  };

  return { initCanvas, clearCanvas, destroy, stageRef, layerRef };
};