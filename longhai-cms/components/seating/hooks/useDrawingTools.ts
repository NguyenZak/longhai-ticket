import { useCallback, useState } from 'react';
import { Shape, ToolType } from '../types';

interface UseDrawingToolsProps {
  activeTool: ToolType;
  onAddShape?: (shape: Shape) => void;
  onUpdateShape?: (shapeId: string, updates: Partial<Shape>) => void;
}

export function useDrawingTools({ activeTool, onAddShape, onUpdateShape }: UseDrawingToolsProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Start drawing
  const startDrawing = useCallback((point: { x: number; y: number }) => {
    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'oval' || activeTool === 'polygon') {
      setIsDrawing(true);
      setDrawStart(point);
      setDrawCurrent(point);
    }
  }, [activeTool]);

  // Update drawing
  const updateDrawing = useCallback((point: { x: number; y: number }) => {
    if (isDrawing && drawStart) {
      setDrawCurrent(point);
    }
  }, [isDrawing, drawStart]);

  // Finish drawing
  const finishDrawing = useCallback(() => {
    if (!isDrawing || !drawStart || !drawCurrent) return;

    const shape: Shape = {
      id: `shape-${Date.now()}`,
      type: activeTool as 'rectangle' | 'circle' | 'oval' | 'polygon',
      color: '#3B82F6'
    };

    if (activeTool === 'rectangle') {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const w = Math.abs(drawCurrent.x - drawStart.x);
      const h = Math.abs(drawCurrent.y - drawStart.y);
      
      Object.assign(shape, { x, y, w, h });
    } else if (activeTool === 'circle') {
      const cx = (drawStart.x + drawCurrent.x) / 2;
      const cy = (drawStart.y + drawCurrent.y) / 2;
      const r = Math.sqrt(
        Math.pow(drawCurrent.x - drawStart.x, 2) + 
        Math.pow(drawCurrent.y - drawStart.y, 2)
      ) / 2;
      
      Object.assign(shape, { cx, cy, r });
    } else if (activeTool === 'oval') {
      const cx = (drawStart.x + drawCurrent.x) / 2;
      const cy = (drawStart.y + drawCurrent.y) / 2;
      const rx = Math.abs(drawCurrent.x - drawStart.x) / 2;
      const ry = Math.abs(drawCurrent.y - drawStart.y) / 2;
      
      Object.assign(shape, { cx, cy, rx, ry });
    } else if (activeTool === 'polygon') {
      // For polygon, we'll create a simple triangle for now
      const cx = (drawStart.x + drawCurrent.x) / 2;
      const cy = (drawStart.y + drawCurrent.y) / 2;
      const size = Math.sqrt(
        Math.pow(drawCurrent.x - drawStart.x, 2) + 
        Math.pow(drawCurrent.y - drawStart.y, 2)
      ) / 2;
      
      const points = [
        { x: cx, y: cy - size },
        { x: cx - size * 0.866, y: cy + size * 0.5 },
        { x: cx + size * 0.866, y: cy + size * 0.5 }
      ];
      
      Object.assign(shape, { points });
    }

    onAddShape?.(shape);
    
    // Reset drawing state
    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  }, [isDrawing, drawStart, drawCurrent, activeTool, onAddShape]);

  // Cancel drawing
  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  }, []);

  // Get drawing preview
  const getDrawingPreview = useCallback(() => {
    if (!isDrawing || !drawStart || !drawCurrent) return null;

    const shape: Shape = {
      id: 'preview',
      type: activeTool as 'rectangle' | 'circle' | 'oval' | 'polygon',
      color: '#3B82F6'
    };

    if (activeTool === 'rectangle') {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const w = Math.abs(drawCurrent.x - drawStart.x);
      const h = Math.abs(drawCurrent.y - drawStart.y);
      
      Object.assign(shape, { x, y, w, h });
    } else if (activeTool === 'circle') {
      const cx = (drawStart.x + drawCurrent.x) / 2;
      const cy = (drawStart.y + drawCurrent.y) / 2;
      const r = Math.sqrt(
        Math.pow(drawCurrent.x - drawStart.x, 2) + 
        Math.pow(drawCurrent.y - drawStart.y, 2)
      ) / 2;
      
      Object.assign(shape, { cx, cy, r });
    } else if (activeTool === 'oval') {
      const cx = (drawStart.x + drawCurrent.x) / 2;
      const cy = (drawStart.y + drawCurrent.y) / 2;
      const rx = Math.abs(drawCurrent.x - drawStart.x) / 2;
      const ry = Math.abs(drawCurrent.y - drawStart.y) / 2;
      
      Object.assign(shape, { cx, cy, rx, ry });
    } else if (activeTool === 'polygon') {
      const cx = (drawStart.x + drawCurrent.x) / 2;
      const cy = (drawStart.y + drawCurrent.y) / 2;
      const size = Math.sqrt(
        Math.pow(drawCurrent.x - drawStart.x, 2) + 
        Math.pow(drawCurrent.y - drawStart.y, 2)
      ) / 2;
      
      const points = [
        { x: cx, y: cy - size },
        { x: cx - size * 0.866, y: cy + size * 0.5 },
        { x: cx + size * 0.866, y: cy + size * 0.5 }
      ];
      
      Object.assign(shape, { points });
    }

    return shape;
  }, [isDrawing, drawStart, drawCurrent, activeTool]);

  return {
    isDrawing,
    drawStart,
    drawCurrent,
    startDrawing,
    updateDrawing,
    finishDrawing,
    cancelDrawing,
    getDrawingPreview
  };
} 