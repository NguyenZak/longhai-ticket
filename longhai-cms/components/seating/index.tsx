import React, { useState, useRef, useEffect, useCallback } from 'react';
import Toolbar from './Toolbar';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import SeatMapEditor from './SeatMapEditor';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'svg2pdf.js';

type Shape =
  | { id: string; type: 'rectangle'; x: number; y: number; w: number; h: number; color: string }
  | { id: string; type: 'circle'; cx: number; cy: number; r: number; color: string }
  | { id: string; type: 'oval'; cx: number; cy: number; rx: number; ry: number; color: string }
  | { id: string; type: 'polygon'; points: { x: number; y: number }[]; color: string };

type Seat = { id: string; x: number; y: number; label: string };
type SeatGroup = {
  id: string;
  type: 'seat-group';
  seats: Seat[];
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
};

const initialSeats: Seat[] = [];

const initialTexts: { id: string; x: number; y: number; content: string; color: string; rotation: number; fontSize: number; shapeId?: string }[] = [];
const initialShapes: Shape[] = [];

export default function SeatingEditorPage() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [seats, setSeats] = useState(initialSeats);
  const [activeTool, setActiveTool] = useState('select');
  const [selected, setSelected] = useState<{ type: 'seat' | 'group' | 'shape' | 'text'; id: string } | null>(null);
  const [texts, setTexts] = useState<{ id: string; x: number; y: number; content: string; color: string; rotation: number; fontSize: number; shapeId?: string }[]>(initialTexts);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  // Define clipboard type
  const [clipboard, setClipboard] = useState<{ seats?: Seat[]; groups?: SeatGroup[] } | null>(null);
  // Add zoom state
  const [zoom, setZoom] = useState(1);
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.1));
  const handleZoomReset = () => setZoom(1);
  const [gridEnabled, setGridEnabled] = useState(true);
  const handleGridToggle = () => setGridEnabled(g => !g);
  const [seatGroups, setSeatGroups] = useState<SeatGroup[]>([]);

  // Accept selectedSeatIds and selectedGroupIds from SeatMapEditor (multi-select)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // Helper to snapshot current state
  const snapshot = () => ({
    shapes: [...shapes],
    texts: [...texts],
    seats: [...seats],
    seatGroups: [...seatGroups],
  });
  // Helper to restore state
  const restore = (snap: any) => {
    setShapes(snap.shapes);
    setTexts(snap.texts);
    setSeats(snap.seats);
    setSeatGroups(snap.seatGroups);
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

  const handleSeatClick = (seat: Seat) => setSelected({ type: 'seat', id: seat.id });
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

  // Update cut/copy/paste/delete handlers
  const handleCut = () => {
    if (selectedSeatIds.length > 0 || selectedGroupIds.length > 0) {
      pushUndo();
      const cutSeats: Seat[] = seats.filter((s: Seat) => selectedSeatIds.includes(s.id));
      const cutGroups: SeatGroup[] = seatGroups.filter((g: SeatGroup) => selectedGroupIds.includes(g.id));
      setClipboard({ seats: cutSeats, groups: cutGroups });
      setSeats(seats.filter((s: Seat) => !selectedSeatIds.includes(s.id)));
      setSeatGroups(seatGroups.filter((g: SeatGroup) => !selectedGroupIds.includes(g.id)));
      setSelectedSeatIds([]);
      setSelectedGroupIds([]);
      return;
    }
    if (!selected) return;
    if (selected.type === 'seat') {
      const seat = seats.find((s: Seat) => s.id === selected.id);
      if (seat) {
        setClipboard({ seats: [seat] });
        setSeats(seats.filter((s: Seat) => s.id !== selected.id));
        setSelected(null);
      }
      return;
    }
    if (selected.type === 'group') {
      const group = seatGroups.find((g: SeatGroup) => g.id === selected.id);
      if (group) {
        setClipboard({ groups: [group] });
        setSeatGroups(seatGroups.filter((g: SeatGroup) => g.id !== selected.id));
        setSelected(null);
      }
      return;
    }
    // For shape/text: skip clipboard for now or implement separately if needed
  };
  const handleCopy = () => {
    if (selectedSeatIds.length > 0 || selectedGroupIds.length > 0) {
      const copySeats: Seat[] = seats.filter((s: Seat) => selectedSeatIds.includes(s.id));
      const copyGroups: SeatGroup[] = seatGroups.filter((g: SeatGroup) => selectedGroupIds.includes(g.id));
      setClipboard({ seats: copySeats, groups: copyGroups });
      return;
    }
    if (!selected) return;
    if (selected.type === 'seat') {
      const seat = seats.find((s: Seat) => s.id === selected.id);
      if (seat) setClipboard({ seats: [seat] });
      return;
    }
    if (selected.type === 'group') {
      const group = seatGroups.find((g: SeatGroup) => g.id === selected.id);
      if (group) setClipboard({ groups: [group] });
      return;
    }
    // For shape/text: skip clipboard for now or implement separately if needed
  };
  const handlePaste = () => {
    if (clipboard && (clipboard.seats?.length || clipboard.groups?.length)) {
      pushUndo();
      const offset = 30;
      const newSeats: Seat[] = (clipboard.seats || []).map((s: Seat) => ({ ...s, id: `seat-${Date.now()}-${Math.random()}`, x: s.x + offset, y: s.y + offset }));
      const newGroups: SeatGroup[] = (clipboard.groups || []).map((g: SeatGroup) => ({
        ...g,
        id: `group-${Date.now()}-${Math.random()}`,
        seats: g.seats.map((s: Seat) => ({ ...s, id: `seat-${Date.now()}-${Math.random()}`, x: s.x + offset, y: s.y + offset })),
        x: g.x + offset,
        y: g.y + offset,
      }));
      setSeats([...seats, ...newSeats]);
      setSeatGroups([...seatGroups, ...newGroups]);
      setSelectedSeatIds(newSeats.map((s: Seat) => s.id));
      setSelectedGroupIds(newGroups.map((g: SeatGroup) => g.id));
      return;
    }
    // For shape/text: skip clipboard for now or implement separately if needed
  };
  const handleDelete = () => {
    if (selectedSeatIds.length > 0 || selectedGroupIds.length > 0) {
      pushUndo();
      setSeats(seats.filter((s: Seat) => !selectedSeatIds.includes(s.id)));
      setSeatGroups(seatGroups.filter((g: SeatGroup) => !selectedGroupIds.includes(g.id)));
      setSelectedSeatIds([]);
      setSelectedGroupIds([]);
      return;
    }
    if (!selected) return;
    pushUndo();
    if (selected.type === 'seat') {
      setSeats(seats.filter((s: Seat) => s.id !== selected.id));
      setSelected(null);
      return;
    }
    if (selected.type === 'group') {
      setSeatGroups(seatGroups.filter((g: SeatGroup) => g.id !== selected.id));
      setSelected(null);
      return;
    }
    // For shape/text: skip for now or implement separately if needed
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

  const renderExportSVG = () => {
    // Build SVG string for only seats, shapes, texts
    const seatCircles = seats.map(seat =>
      `<g><circle r="10" cx="${seat.x}" cy="${seat.y}" fill="#1976d2" />
        <text x="${seat.x}" y="${seat.y}" text-anchor="middle" alignment-baseline="central" font-size="8" fill="#fff">${seat.label}</text>
      </g>`
    ).join('');
    const shapeSvgs = shapes.map(shape => {
      if (shape.type === 'rectangle') {
        const fill = (shape as any).fillColor || shape.color || '#ddd';
        const stroke = (shape as any).borderColor || shape.color || '#1976d2';
        return `<rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
      } else if (shape.type === 'circle') {
        const fill = (shape as any).fillColor || shape.color || 'none';
        const stroke = (shape as any).borderColor || shape.color || '#43a047';
        return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
      } else if (shape.type === 'oval') {
        const fill = (shape as any).fillColor || shape.color || 'none';
        const stroke = (shape as any).borderColor || shape.color || '#fbc02d';
        return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
      } else if (shape.type === 'polygon') {
        const fill = (shape as any).fillColor || shape.color || 'none';
        const stroke = (shape as any).borderColor || shape.color || '#d32f2f';
        return `<polygon points="${shape.points.map(pt => `${pt.x},${pt.y}`).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
      }
      return '';
    }).join('');
    const textSvgs = texts.filter(t => !t.shapeId).map(text => {
      const width = (text.content.length * text.fontSize * 0.6) || 40;
      const height = text.fontSize * 1.2;
      return `<text x="${text.x}" y="${text.y}" text-anchor="middle" font-size="${text.fontSize}" fill="${text.color}" font-weight="bold">${text.content}</text>`;
    }).join('');
    // SVG wrapper
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <g>${seatCircles}${shapeSvgs}${textSvgs}</g>
    </svg>`;
  };

  const handleExportPdf = async () => {
    const svgString = renderExportSVG();
    const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [width, height] });
    // Create a DOM element from SVG string
    const svgEl = new window.DOMParser().parseFromString(svgString, 'image/svg+xml').documentElement;
    // @ts-ignore
    await doc.svg(svgEl, { x: 0, y: 0, width, height });
    doc.save('seating-plan-vector.pdf');
  };

  const handleExportSvg = () => {
    const svgString = renderExportSVG();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'seating-plan.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSeatGroup = (seats: Seat[]) => {
    if (seats.length === 0) return;
    // Không group by row nữa, mỗi seats là một group
    const xs = seats.map(s => s.x);
    const ys = seats.map(s => s.y);
    const minX = Math.min(...xs) - 10;
    const maxX = Math.max(...xs) + 10;
    const minY = Math.min(...ys) - 10;
    const maxY = Math.max(...ys) + 10;
    const groupId = `group-${Date.now()}-${Math.random()}`;
    setSeatGroups(prev => [
      ...prev,
      {
        id: groupId,
        type: 'seat-group',
        seats,
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
      },
    ]);
    setSelected({ type: 'group', id: groupId });
  };

  const handleUpdateSeatGroup = (groupId: string, dx: number, dy: number) => {
    setSeatGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      // Snap dx, dy to grid (25px)
      const dX = Math.round(dx / 25) * 25;
      const dY = Math.round(dy / 25) * 25;
      const newX = g.x + dX;
      const newY = g.y + dY;
      return {
        ...g,
        x: newX,
        y: newY,
        seats: g.seats.map(s => ({
          ...s,
          x: s.x + dX,
          y: s.y + dY,
        })),
      };
    }));
  };

  const handleUpdateSeatGroupRotation = (groupId: string, angle: number) => {
    setSeatGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, rotation: angle } : g
    ));
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
      if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
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
      // Cut
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        handleCut();
        e.preventDefault();
        return;
      }
      // Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        handleCopy();
        e.preventDefault();
        return;
      }
      // Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        handlePaste();
        e.preventDefault();
        return;
      }
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete();
        e.preventDefault();
        return;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undoStack, redoStack, selected, clipboard, seats, seatGroups, shapes, texts, selectedSeatIds, selectedGroupIds]);

  // Add selectedSeat and selectedGroupId for SeatMapEditor
  const selectedSeat = selected?.type === 'seat' ? seats.find(s => s.id === selected.id) : null;
  const selectedGroupId = selected?.type === 'group' ? selected.id : null;

  // Implement handleGroupClick
  const handleGroupClick = (groupId: string) => setSelected({ type: 'group', id: groupId });

  // Update toolbar button enable/disable logic
  const canCut = selectedSeatIds.length > 0 || selectedGroupIds.length > 0 || selected;
  const canCopy = canCut;
  const canDelete = canCut;
  const canPaste = clipboard && (clipboard.seats?.length || clipboard.groups?.length);

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
        onExportPdf={handleExportPdf}
        onExportSvg={handleExportSvg}
        onGridToggle={handleGridToggle}
        gridEnabled={gridEnabled}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft />
        <main className="flex-1 flex items-center justify-center bg-black overflow-auto">
            <SeatMapEditor
              seats={seats}
              canvasWidth={width}
              canvasHeight={height}
              onSeatClick={handleSeatClick}
              selected={selectedSeat}
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
              gridEnabled={gridEnabled}
              seatGroups={seatGroups}
              onAddSeatGroup={handleAddSeatGroup}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={id => setSelected(id ? { type: 'group', id } : null)}
              onUpdateSeatGroup={handleUpdateSeatGroup}
              onUpdateSeatGroupRotation={handleUpdateSeatGroupRotation}
              onSelectSeats={setSelectedSeatIds}
              onSelectGroups={setSelectedGroupIds}
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