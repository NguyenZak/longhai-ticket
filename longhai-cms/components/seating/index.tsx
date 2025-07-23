import React, { useState, useRef, useEffect, useCallback } from 'react';
import Toolbar from './Toolbar';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import SeatMapEditor from './SeatMapEditor';

type Shape =
  | { id: string; type: 'rectangle'; x: number; y: number; w: number; h: number; color: string }
  | { id: string; type: 'circle'; cx: number; cy: number; r: number; color: string }
  | { id: string; type: 'oval'; cx: number; cy: number; rx: number; ry: number; color: string }
  | { id: string; type: 'polygon'; points: { x: number; y: number }[]; color: string };

const initialSeats = [
  { id: 'A1', col: 2, row: 2, label: 'A1' },
  { id: 'A2', col: 3, row: 2, label: 'A2' },
  { id: 'B1', col: 2, row: 3, label: 'B1' },
];

const initialTexts: { id: string; x: number; y: number; content: string; color: string; rotation: number; fontSize: number; shapeId?: string }[] = [];
const initialShapes: Shape[] = [];

export default function SeatingEditorPage() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [seats, setSeats] = useState(initialSeats);
  const [activeTool, setActiveTool] = useState('select');
  const [selected, setSelected] = useState<any>(null);
  const [texts, setTexts] = useState<{ id: string; x: number; y: number; content: string; color: string; rotation: number; fontSize: number; shapeId?: string }[]>(initialTexts);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  // Add clipboard state
  const [clipboard, setClipboard] = useState<{ type: 'shape' | 'text'; data: any } | null>(null);
  // Add zoom state
  const [zoom, setZoom] = useState(1);
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.1));
  const handleZoomReset = () => setZoom(1);

  // Helper to snapshot current state
  const snapshot = () => ({
    shapes: [...shapes],
    texts: [...texts],
    seats: [...seats],
  });
  // Helper to restore state
  const restore = (snap: any) => {
    setShapes(snap.shapes);
    setTexts(snap.texts);
    setSeats(snap.seats);
  };
  // Push to undo stack on any change
  const pushUndo = () => setUndoStack(stack => [snapshot(), ...stack].slice(0, 100));
  // Undo/redo handlers
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    setRedoStack(stack => [snapshot(), ...stack].slice(0, 100));
    const prev = undoStack[0];
    setUndoStack(stack => stack.slice(1));
    restore(prev);
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    setUndoStack(stack => [snapshot(), ...stack].slice(0, 100));
    const next = redoStack[0];
    setRedoStack(stack => stack.slice(1));
    restore(next);
  };

  const handleSeatClick = (seat: any) => setSelected({ ...seat, type: 'seat' });
  const handleAddSeats = (newSeats: any[]) => { pushUndo(); setSeats(prev => ([...prev, ...newSeats])); };
  const handleAddText = (x: number, y: number) => { pushUndo(); const id = `text-${Date.now()}`; setTexts(prev => ([
      ...prev,
      {
        id,
        x,
        y,
        content: 'Text mới',
        color: '#1976d2',
        rotation: 0,
        fontSize: 16,
      },
    ])); setSelectedTextId(id); };

  const handleTextClick = (id: string) => {
    setSelectedTextId(id);
    setEditingText(null);
  };
  const handleTextEdit = (id: string) => {
    setEditingText(id);
    setSelectedTextId(id);
  };
  const handleTextChange = (id: string, content: string) => {
    if (content === '') {
      setTexts(prev => prev.filter(t => t.id !== id));
      return;
    }
    pushUndo();
    setTexts(prev => prev.map(t => t.id === id ? { ...t, content } : t));
  };
  const handleTextMoveStart = (id: string, x: number, y: number, mouseX: number, mouseY: number) => {
    setDraggingTextId(id);
    setDragOffset({ x: x - mouseX, y: y - mouseY });
  };
  const handleTextMove = (mouseX: number, mouseY: number) => {
    if (draggingTextId && dragOffset) {
      setTexts(prev => prev.map(t => t.id === draggingTextId ? {
        ...t,
        x: Math.round((mouseX + dragOffset.x) / 25) * 25,
        y: Math.round((mouseY + dragOffset.y) / 25) * 25,
      } : t));
    }
  };
  const handleTextMoveEnd = () => {
    setDraggingTextId(null);
    setDragOffset(null);
  };

  const handleTextAttrChange = (id: string, attr: Partial<{ content: string; color: string; rotation: number; fontSize: number; x: number; y: number }>) => { pushUndo(); setTexts(prev => prev.map(t => t.id === id ? { ...t, ...attr } : t)); };

  const handleAddShape = (shape: Shape) => { pushUndo(); setShapes(prev => [...prev, shape]); };

  // Update handleUpdateShape to support _delete
  const handleUpdateShape = (id: string, partial: any) => {
    if (partial && partial._delete) {
      handleDeleteShape(id);
      return;
    }
    pushUndo();
    setShapes(prev => prev.map(shape => shape.id === id ? { ...shape, ...partial } : shape));
  };

  // Helper: Add text to center of selected shape
  const handleAddTextToShape = () => {
    if (!selectedShapeId) return;
    const shape = shapes.find(s => s.id === selectedShapeId);
    if (!shape) return;
    let x = 0, y = 0;
    if (shape.type === 'rectangle') {
      x = shape.x + shape.w / 2;
      y = shape.y + shape.h / 2;
    } else if (shape.type === 'circle') {
      x = shape.cx;
      y = shape.cy;
    } else if (shape.type === 'oval') {
      x = shape.cx;
      y = shape.cy;
    } else if (shape.type === 'polygon' && shape.points.length > 0) {
      // centroid
      const pts = shape.points;
      const n = pts.length;
      x = pts.reduce((sum, p) => sum + p.x, 0) / n;
      y = pts.reduce((sum, p) => sum + p.y, 0) / n;
    }
    const id = `text-${Date.now()}`;
    setTexts(prev => ([
      ...prev,
      {
        id,
        x,
        y,
        content: 'Text mới',
        color: '#1976d2',
        rotation: 0,
        fontSize: 16,
      },
    ]));
    setSelectedTextId(id);
    setEditingText(id);
  };

  // 1. Add a helper to get the text attached to a shape
  const getShapeText = (shapeId: string) => texts.find(t => t.shapeId === shapeId);

  // 2. Add a handler to update or create text for a shape
  const handleShapeTextChange = (shapeId: string, content?: string, fontSize?: number, color?: string) => {
    setTexts(prev => {
      const shape = shapes.find(s => s.id === shapeId);
      if (!shape) return prev;
      let x = 0, y = 0;
      if (shape.type === 'rectangle') {
        x = shape.x + shape.w / 2;
        y = shape.y + shape.h / 2;
      } else if (shape.type === 'circle') {
        x = shape.cx;
        y = shape.cy;
      } else if (shape.type === 'oval') {
        x = shape.cx;
        y = shape.cy;
      } else if (shape.type === 'polygon' && shape.points.length > 0) {
        const pts = shape.points;
        const n = pts.length;
        x = pts.reduce((sum, p) => sum + p.x, 0) / n;
        y = pts.reduce((sum, p) => sum + p.y, 0) / n;
      }
      const existing = prev.find(t => t.shapeId === shapeId);
      if (existing) {
        return prev.map(t => t.shapeId === shapeId ? {
          ...t,
          ...(content !== undefined ? { content } : {}),
          ...(fontSize !== undefined ? { fontSize } : {}),
          ...(color !== undefined ? { color } : {}),
          x, y
        } : t);
      } else {
        return [
          ...prev,
          {
            id: `text-${Date.now()}`,
            shapeId,
            x,
            y,
            content: content || '',
            color: color || '#333333',
            rotation: 0,
            fontSize: fontSize || 16,
          },
        ];
      }
    });
  };

  // 3. When deleting a shape, also delete its text
  const handleDeleteShape = (shapeId: string) => { pushUndo(); setShapes(prev => prev.filter(s => s.id !== shapeId)); setTexts(prev => prev.filter(t => t.shapeId !== shapeId)); };

  // Cut handler
  const handleCut = () => {
    if (selectedShapeId) {
      const shape = shapes.find(s => s.id === selectedShapeId);
      if (shape) {
        setClipboard({ type: 'shape', data: JSON.parse(JSON.stringify(shape)) });
        handleDeleteShape(selectedShapeId);
        setSelectedShapeId(null);
      }
    } else if (selectedTextId) {
      const text = texts.find(t => t.id === selectedTextId);
      if (text) {
        setClipboard({ type: 'text', data: JSON.parse(JSON.stringify(text)) });
        setTexts(prev => prev.filter(t => t.id !== selectedTextId));
        setSelectedTextId(null);
      }
    }
  };
  // Copy handler
  const handleCopy = () => {
    if (selectedShapeId) {
      const shape = shapes.find(s => s.id === selectedShapeId);
      if (shape) setClipboard({ type: 'shape', data: JSON.parse(JSON.stringify(shape)) });
    } else if (selectedTextId) {
      const text = texts.find(t => t.id === selectedTextId);
      if (text) setClipboard({ type: 'text', data: JSON.parse(JSON.stringify(text)) });
    }
  };
  // Paste handler
  const handlePaste = () => {
    if (clipboard) {
      if (clipboard.type === 'shape') {
        const shape = { ...clipboard.data, id: `${clipboard.data.type}-${Date.now()}` };
        if (shape.type === 'rectangle') shape.x += 20, shape.y += 20;
        if (shape.type === 'circle' || shape.type === 'oval') shape.cx += 20, shape.cy += 20;
        if (shape.type === 'polygon') shape.points = shape.points.map((pt: any) => ({ x: pt.x + 20, y: pt.y + 20 }));
        handleAddShape(shape);
        setSelectedShapeId(shape.id);
      } else if (clipboard.type === 'text') {
        const text = { ...clipboard.data, id: `text-${Date.now()}`, x: clipboard.data.x + 20, y: clipboard.data.y + 20 };
        setTexts(prev => [...prev, text]);
        setSelectedTextId(text.id);
      }
    }
  };
  // Delete handler
  const handleDelete = () => {
    if (selectedShapeId) {
      handleDeleteShape(selectedShapeId);
      setSelectedShapeId(null);
    } else if (selectedTextId) {
      setTexts(prev => prev.filter(t => t.id !== selectedTextId));
      setSelectedTextId(null);
    }
  };

  const expandGrid = (step = 100) => {
    setWidth(w => w + step);
    setHeight(h => h + step);
  };
  const shrinkGrid = (step = 100) => {
    setWidth(w => Math.max(100, w - step));
    setHeight(h => Math.max(100, h - step));
  };

  const handleCenter = () => {
    setZoom(1);
    // Optionally: reset pan if you have pan state (not shown here)
    // If using useSvgPanZoom, you may need to expose a ref/callback to reset viewBox
  };
  const centerPanRef = useRef<() => void>();
  const setCenterPan = useCallback((fn: () => void) => { centerPanRef.current = fn; }, []);
  const handlePan = () => {
    if (centerPanRef.current) centerPanRef.current();
    setActiveTool('pan');
  };

  const mainRef = useRef<HTMLDivElement>(null);
  const handleFullscreen = () => {
    const el = mainRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (el) {
      if (el.requestFullscreen) el.requestFullscreen();
      // For Safari
      // @ts-ignore
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      // For IE11
      // @ts-ignore
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'f' || e.key === 'F') {
        handleFullscreen();
        e.preventDefault();
      }
      if (e.key === 'h' || e.key === 'H') {
        setActiveTool('pan');
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undoStack, redoStack]);

  return (
    <div ref={mainRef} className="flex flex-col h-screen w-screen bg-gray-100">
      <Toolbar
        activeTool={activeTool}
        onToolSelect={setActiveTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onDelete={handleDelete}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onCenter={handleCenter}
        onPan={handlePan}
        onFullscreen={handleFullscreen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft />
        <main className="flex-1 flex items-center justify-center bg-black overflow-auto">
            <SeatMapEditor
              seats={seats}
              canvasWidth={width}
              canvasHeight={height}
              onSeatClick={handleSeatClick}
              selected={selected}
              activeTool={activeTool}
              onAddSeats={handleAddSeats}
              texts={texts}
              onAddText={handleAddText}
              selectedTextId={selectedTextId}
              editingText={editingText}
              onTextClick={handleTextClick}
              onTextEdit={handleTextEdit}
              onTextChange={handleTextChange}
              onTextMoveStart={handleTextMoveStart}
              onTextMove={handleTextMove}
              onTextMoveEnd={handleTextMoveEnd}
              onTextAttrChange={handleTextAttrChange}
              shapes={shapes}
              onAddShape={handleAddShape}
              onUpdateShape={handleUpdateShape}
              selectedShapeId={selectedShapeId}
              setSelectedShapeId={setSelectedShapeId}
              setSelectedTextId={setSelectedTextId}
              zoom={zoom}
              onCenterPan={setCenterPan}
            />
         
        </main>
        <SidebarRight
          canvasWidth={width}
          canvasHeight={height}
          onChangeWidth={setWidth}
          onChangeHeight={setHeight}
          onExpandGrid={expandGrid}
          onShrinkGrid={shrinkGrid}
          selectedText={texts.find(t => t.id === selectedTextId) || null}
          onTextAttrChange={handleTextAttrChange}
          selectedShape={selectedShapeId ? shapes.find(s => s.id === selectedShapeId) || null : null}
          onUpdateShape={handleUpdateShape}
          getShapeText={getShapeText}
          onShapeTextChange={handleShapeTextChange}
          onDeleteShape={handleDeleteShape}
        />
      </div>
    </div>
  );
} 