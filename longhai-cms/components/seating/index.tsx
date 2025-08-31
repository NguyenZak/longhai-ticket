import React, { useState, useRef, useEffect, useCallback } from 'react';
import Toolbar from './Toolbar';
import SeatingEditor from './SeatingEditor';
import PropertiesPanel from './PropertiesPanel';
import StatusBar from './StatusBar';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { useSeatingRedux } from './hooks/useSeatingRedux';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFileOperations } from './hooks/useFileOperations';
import { useClipboardOperations } from './hooks/useClipboardOperations';
import { SelectionItem, ToolType, Shape, Seat, Row, TextElement } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'svg2pdf.js';
import './seating-editor.css';


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

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  rotation?: number;
}

const initialSeats: Seat[] = [];

const initialTexts: { id: string; x: number; y: number; content: string; color: string; rotation: number; fontSize: number; shapeId?: string }[] = [];
const initialShapes: Shape[] = [];

export default function SeatingEditorPage() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [seats, setSeats] = useState(initialSeats);
  const [rows, setRows] = useState<Row[]>([]);

  const [activeTool, setActiveTool] = useState<'select' | 'row' | 'rows' | 'zone' | 'pan' | 'text' | 'rectangle' | 'circle' | 'oval' | 'polygon'>('select');
  const [selected, setSelected] = useState<{ type: 'seat' | 'group' | 'shape' | 'text'; id: string } | null>(null);
  const [texts, setTexts] = useState<TextElement[]>(initialTexts);
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
  const [showHelp, setShowHelp] = useState(false);
  const [showRowSettings, setShowRowSettings] = useState(false);

  // Add unified multi-selection system like pretix
  const [selectionItems, setSelectionItems] = useState<SelectionItem[]>([]);
  const [selectionBoundary, setSelectionBoundary] = useState<BoundingBox | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string>('');
  const [rotateOrigin, setRotateOrigin] = useState<{x: number, y: number} | null>(null);

  // Helper functions for unified selection system
  const calculateBoundingBox = (items: SelectionItem[]): BoundingBox | null => {
    if (items.length === 0) return null;

    const allBounds: {x: number, y: number, width: number, height: number, rotation?: number}[] = [];

    items.forEach(item => {
      if (item.type === 'seat') {
        const seat = seats.find(s => s.id === item.id);
        if (seat) {
          allBounds.push({x: seat.x - 10, y: seat.y - 10, width: 20, height: 20});
        }
      } else if (item.type === 'row') {
        const row = rows.find(r => r.id === item.id);
        if (row) {
          allBounds.push({x: row.x, y: row.y, width: row.width, height: row.height});
        }
      } else if (item.type === 'shape') {
        const shape = shapes.find(s => s.id === item.id);
        if (shape) {
          if (shape.type === 'rectangle') {
            allBounds.push({x: shape.x || 0, y: shape.y || 0, width: shape.w || 0, height: shape.h || 0, rotation: shape.rotation});
          } else if (shape.type === 'circle') {
            allBounds.push({x: (shape.cx || 0) - (shape.r || 0), y: (shape.cy || 0) - (shape.r || 0), width: (shape.r || 0) * 2, height: (shape.r || 0) * 2, rotation: shape.rotation});
          } else if (shape.type === 'oval') {
            allBounds.push({x: (shape.cx || 0) - (shape.rx || 0), y: (shape.cy || 0) - (shape.ry || 0), width: (shape.rx || 0) * 2, height: (shape.ry || 0) * 2, rotation: shape.rotation});
          } else if (shape.type === 'polygon' && shape.points && shape.points.length > 0) {
            const xs = shape.points.map(p => p.x);
            const ys = shape.points.map(p => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            allBounds.push({x: minX, y: minY, width: maxX - minX, height: maxY - minY, rotation: shape.rotation});
          }
        }
      } else if (item.type === 'text') {
        const text = texts.find(t => t.id === item.id);
        if (text) {
                  const width = (text.content.length * (text.fontSize || 16) * 0.6) || 40;
        const height = (text.fontSize || 16) * 1.2;
          allBounds.push({x: text.x - width/2, y: text.y - height/2, width, height, rotation: text.rotation});
        }
      }
    });

    if (allBounds.length === 0) return null;

    const minX = Math.min(...allBounds.map(b => b.x));
    const minY = Math.min(...allBounds.map(b => b.y));
    const maxX = Math.max(...allBounds.map(b => b.x + b.width));
    const maxY = Math.max(...allBounds.map(b => b.y + b.height));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      rotation: allBounds.length === 1 ? allBounds[0].rotation : 0
    };
  };

  const updateSelectionBoundary = useCallback(() => {
    const boundary = calculateBoundingBox(selectionItems);
    setSelectionBoundary(boundary);
  }, [selectionItems, seats, shapes, texts, seatGroups, rows]);

  // Update boundary when selection changes
  useEffect(() => {
    updateSelectionBoundary();
  }, [updateSelectionBoundary]);

  const addToSelection = (item: SelectionItem) => {
    setSelectionItems(prev => [...prev, item]);
  };

  const removeFromSelection = (itemId: string, itemType: string) => {
    setSelectionItems(prev => prev.filter(item => !(item.id === itemId && item.type === itemType)));
  };

  const clearSelection = () => {
    setSelectionItems([]);
    setSelectionBoundary(null);
  };

  const selectItem = (item: SelectionItem, multiSelect: boolean = false) => {
    if (multiSelect) {
      const existing = selectionItems.find(i => i.id === item.id && i.type === item.type);
      if (existing) {
        removeFromSelection(item.id, item.type);
      } else {
        addToSelection(item);
      }
    } else {
      setSelectionItems([item]);
    }
    setSelectionBoundary(calculateBoundingBox([item]));
  };

  // Selection operation handlers
  const handleSelectionResizeStart = (corner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    // TODO: Implement resize logic
  };

  const handleSelectionRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    if (selectionBoundary) {
      setRotateOrigin({ x: selectionBoundary.cx, y: selectionBoundary.cy });
    }
    // TODO: Implement rotation logic
  };

  const handleSelectionMoveStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement move logic for all selected items
  };

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

  const handleSeatClick = (seat: Seat) => {
    setSelected({ type: 'seat', id: seat.id });
    selectItem({ id: seat.id, type: 'seat' }, false);
  };
  const handleAddSeats = (newSeats: any[]) => { 
    pushUndo(); 
    setSeats(prev => ([...prev, ...newSeats])); 
  };
  const handleAddText = (x: number, y: number) => { 
    pushUndo(); 
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
    selectItem({ id, type: 'text' }, false);
  };

  const handleTextClick = (id: string) => {
    setSelectedTextId(id);
    setEditingText(null);
    selectItem({ id, type: 'text' }, false);
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

  const handleTextAttrChange = (id: string, attr: Partial<{ content: string; color: string; rotation: number; fontSize: number; x: number; y: number }>) => { 
    pushUndo(); 
    setTexts(prev => prev.map(t => t.id === id ? { ...t, ...attr } : t)); 
  };

  const handleAddShape = (shape: Shape) => { 
    pushUndo(); 
    setShapes(prev => [...prev, shape]); 
    selectItem({ id: shape.id, type: 'shape' }, false);
  };

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
      x = (shape.x || 0) + (shape.w || 0) / 2;
      y = (shape.y || 0) + (shape.h || 0) / 2;
    } else if (shape.type === 'circle') {
      x = shape.cx || 0;
      y = shape.cy || 0;
    } else if (shape.type === 'oval') {
      x = shape.cx || 0;
      y = shape.cy || 0;
    } else if (shape.type === 'polygon' && shape.points && shape.points.length > 0) {
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
        x = (shape.x || 0) + (shape.w || 0) / 2;
        y = (shape.y || 0) + (shape.h || 0) / 2;
      } else if (shape.type === 'circle') {
        x = shape.cx || 0;
        y = shape.cy || 0;
      } else if (shape.type === 'oval') {
        x = shape.cx || 0;
        y = shape.cy || 0;
      } else if (shape.type === 'polygon' && shape.points && shape.points.length > 0) {
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
  const handleDeleteShape = (shapeId: string) => { 
    pushUndo(); 
    setShapes(prev => prev.filter(s => s.id !== shapeId)); 
    setTexts(prev => prev.filter(t => t.shapeId !== shapeId)); 
  };

  // Update shape selection handler
  const handleShapeSelect = (shapeId: string | null) => {
    if (shapeId) {
      setSelectedShapeId(shapeId);
      selectItem({ id: shapeId, type: 'shape' }, false);
    } else {
      setSelectedShapeId(null);
    }
  };

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
    const oldWidth = width;
    const oldHeight = height;
    setWidth(w => w + step);
    setHeight(h => h + step);
    
    // Adjust viewBox to keep grid centered when expanding
    setTimeout(() => {
      if (centerPanRef.current) {
        centerPanRef.current();
      }
    }, 0);
  };
  const shrinkGrid = (step = 100) => {
    const oldWidth = width;
    const oldHeight = height;
    setWidth(w => Math.max(100, w - step));
    setHeight(h => Math.max(100, h - step));
    
    // Adjust viewBox to keep grid centered when shrinking
    setTimeout(() => {
      if (centerPanRef.current) {
        centerPanRef.current();
      }
    }, 0);
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
      } else if (shape.type === 'polygon' && shape.points) {
        const fill = (shape as any).fillColor || shape.color || 'none';
        const stroke = (shape as any).borderColor || shape.color || '#d32f2f';
        return `<polygon points="${shape.points.map(pt => `${pt.x},${pt.y}`).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
      }
      return '';
    }).join('');
    const textSvgs = texts.filter(t => !t.shapeId).map(text => {
      const fontSize = text.fontSize || 16;
      const width = (text.content.length * fontSize * 0.6) || 40;
      const height = fontSize * 1.2;
      return `<text x="${text.x}" y="${text.y}" text-anchor="middle" font-size="${fontSize}" fill="${text.color || '#333'}" font-weight="bold">${text.content}</text>`;
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
      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
        e.preventDefault();
        return;
      }
      // A for select all (like pretix)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        // TODO: Implement select all
        e.preventDefault();
        return;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undoStack, redoStack, selected, clipboard, seats, seatGroups, shapes, texts, selectedSeatIds, selectedGroupIds, selectionItems]);

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

  // Handle seating editor events
  const handleSeatingSelectionChange = (selectedSeats: string[], selectedZones: string[]) => {
    setSelectedSeatIds(selectedSeats);
    // TODO: Handle selectedZones
  };

  // Handle row selection
  const handleRowClick = (row: Row) => {
    selectItem({ id: row.id, type: 'row' }, false);
  };

  const handleSeatingSeatClick = (seat: any) => {
    handleSeatClick(seat);
  };

  // Wrapper function to handle tool selection from toolbar
  const handleToolSelect = (tool: string) => {
    setActiveTool(tool as 'select' | 'row' | 'zone' | 'pan' | 'text' | 'rectangle' | 'circle' | 'oval' | 'polygon');
  };

  // File operations
  const { saveToFile, openFromFile, exportToPdf, exportToSvg, validateSeatingPlan } = useFileOperations({
    state: {
      seats,
      rows,
      zones: [],
      shapes,
      texts,
      activeTool,
      zoom,
      gridEnabled,
      drawing: { isDrawing: false, startPoint: null, currentPoint: null, previewItems: [], spacing: 25, angle: 0 },
      selection: { isSelecting: false, startPoint: null, currentPoint: null, selectedItems: [], boundary: null },
      transform: { isRotating: false, isResizing: false, isMoving: false, rotateOrigin: null, resizeCorner: '', moveOffset: null },
      clipboard: null,
      undoStack: [],
      redoStack: []
    },
    onStateChange: (newState: any) => {
      if (newState.seats) setSeats(newState.seats);
      if (newState.shapes) setShapes(newState.shapes);
      if (newState.texts) setTexts(newState.texts);
    }
  });

  // File operation handlers
  const handleSave = () => {
    saveToFile();
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        openFromFile(file);
      }
    };
    input.click();
  };

  const handleValidate = () => {
    validateSeatingPlan();
  };

  // Row operations
  const handleAddSeat = (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    // Find seats in this row
    const rowSeats = seats.filter(seat => seat.rowId === rowId);
    const nextSeatNumber = rowSeats.length + 1;
    
    // Calculate position for new seat
    const spacing = row.spacing || 25;
    const newX = row.x + (nextSeatNumber - 1) * spacing;
    const newY = row.y;

    const newSeat: Seat = {
      id: `seat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: newX,
      y: newY,
      label: `Seat ${nextSeatNumber}`,
      rowId: rowId,
      status: 'available',
      price: 0,
      category: '',
      color: '#ffffff',
      borderColor: '#000000'
    };

    setSeats(prev => [...prev, newSeat]);
  };

  const handleAlignOnCircleByRadius = (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    const rowSeats = seats.filter(seat => seat.rowId === rowId);
    if (rowSeats.length === 0) return;

    // Calculate center point of the row
    const centerX = row.x + (rowSeats.length - 1) * (row.spacing || 25) / 2;
    const centerY = row.y;
    const radius = 100; // Default radius

    // Align seats in a circle
    const updatedSeats = rowSeats.map((seat, index) => {
      const angle = (index * 2 * Math.PI) / rowSeats.length;
      const newX = centerX + radius * Math.cos(angle);
      const newY = centerY + radius * Math.sin(angle);
      
      return {
        ...seat,
        x: newX,
        y: newY
      };
    });

    setSeats(prev => prev.map(seat => {
      const updatedSeat = updatedSeats.find(s => s.id === seat.id);
      return updatedSeat || seat;
    }));
  };

  const handleAlignOnCircleByCenter = (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    const rowSeats = seats.filter(seat => seat.rowId === rowId);
    if (rowSeats.length === 0) return;

    // Use the first seat as center
    const centerSeat = rowSeats[0];
    const centerX = centerSeat.x;
    const centerY = centerSeat.y;
    const radius = 80; // Default radius

    // Align remaining seats in a circle around the center seat
    const updatedSeats = rowSeats.slice(1).map((seat, index) => {
      const angle = (index * 2 * Math.PI) / (rowSeats.length - 1);
      const newX = centerX + radius * Math.cos(angle);
      const newY = centerY + radius * Math.sin(angle);
      
      return {
        ...seat,
        x: newX,
        y: newY
      };
    });

    setSeats(prev => prev.map(seat => {
      const updatedSeat = updatedSeats.find(s => s.id === seat.id);
      return updatedSeat || seat;
    }));
  };



  // Clipboard operations
  const { copyToClipboard, cutToClipboard, pasteFromClipboard, deleteSelected, hasClipboardData } = useClipboardOperations({
    selectedItems: selectionItems,
    seats,
    shapes,
    texts,
    onUpdateSeats: setSeats,
    onUpdateShapes: setShapes,
    onUpdateTexts: setTexts,
    onClearSelection: clearSelection
  });

  const handleDeleteSelected = useCallback(() => {
    const seatIdSet = new Set<string>(selectedSeatIds);
    selectionItems.filter(i => i.type === 'seat').forEach(i => seatIdSet.add(i.id));
    const shapeIdSet = new Set<string>(selectionItems.filter(i => i.type === 'shape').map(i => i.id));
    const textIdSet = new Set<string>(selectionItems.filter(i => i.type === 'text').map(i => i.id));

    if (seatIdSet.size === 0 && shapeIdSet.size === 0 && textIdSet.size === 0) return;

    setSeats(prev => prev.filter(s => !seatIdSet.has(s.id)));
    setShapes(prev => prev.filter(sh => !shapeIdSet.has(sh.id)));
    setTexts(prev => prev.filter(tx => !textIdSet.has(tx.id)));
    setSelectedSeatIds([]);
    setSelectionItems([]);
  }, [selectedSeatIds, selectionItems]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    activeTool,
    onToolChange: handleToolSelect,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCut: cutToClipboard,
    onCopy: copyToClipboard,
    onPaste: pasteFromClipboard,
    onDelete: handleDeleteSelected,
    onSelectAll: () => {
      // TODO: Implement select all
      console.log('Select all');
    },
    onClearSelection: () => {
      clearSelection();
    },
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset,
    onGridToggle: handleGridToggle,
    onFullscreen: handleFullscreen,
    onPan: handlePan,
    onCenter: handleCenter,
    onExportPdf: exportToPdf,
    onExportSvg: exportToSvg
  });

  

  return (
    <div ref={mainRef} className="flex flex-col h-screen w-screen bg-gray-100">
      {/* Toolbar at the top */}
      <div className="flex-shrink-0">
        <Toolbar
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCut={cutToClipboard}
          onCopy={copyToClipboard}
          onPaste={pasteFromClipboard}
          onDelete={handleDeleteSelected}
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
          onHelp={() => setShowHelp(true)}
          onSave={handleSave}
          onOpen={handleOpen}
          onValidate={handleValidate}
        />
      </div>
      
      {/* Main seating editor */}
      <div className="flex-1 flex">
        {/* Canvas area */}
        <div className="flex-1 relative">
          <SeatingEditor
            width={width}
            height={height}
            zoom={zoom}
            onZoomChange={setZoom}
            gridEnabled={gridEnabled}
            onSeatClick={handleSeatingSeatClick}
            selectedSeats={selectedSeatIds}
            onSelectionChange={handleSeatingSelectionChange}
            activeTool={activeTool}
            onToolChange={handleToolSelect}
          />
          
          {/* Render rows overlay */}
          {rows.map((row) => (
            <div
              key={row.id}
              className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20 cursor-pointer hover:bg-opacity-30 transition-all"
              style={{
                left: row.x,
                top: row.y,
                width: row.width,
                height: row.height,
                zIndex: 10
              }}
              onClick={() => handleRowClick(row)}
              title={`Row ${row.label || row.id}`}
            />
          ))}
        </div>
        
        {/* Right side panels */}
        <div className="w-[640px] flex flex-col border-l border-gray-200">
          <PropertiesPanel
            selectedItems={selectionItems}
            seats={seats}
            rows={rows}
            zones={[]}
            shapes={shapes}
            texts={texts}
            onUpdateSeat={(seatId, updates) => {
              setSeats(prev => prev.map(seat => 
                seat.id === seatId ? { ...seat, ...updates } : seat
              ));
            }}
            onUpdateRow={(rowId, updates) => {
              setRows(prev => prev.map(row => 
                row.id === rowId ? { ...row, ...updates } : row
              ));
            }}
            onUpdateShape={(shapeId, updates) => {
              setShapes(prev => prev.map(shape => 
                shape.id === shapeId ? { ...shape, ...updates } : shape
              ));
            }}
            onUpdateText={(textId, updates) => {
              setTexts(prev => prev.map(text => 
                text.id === textId ? { ...text, ...updates } : text
              ));
            }}
            onAddSeat={handleAddSeat}
            onAlignOnCircleByRadius={handleAlignOnCircleByRadius}
            onAlignOnCircleByCenter={handleAlignOnCircleByCenter}
          />
          {/* SavedPlans moved to global sidebar */}
        </div>
      </div>
      
      {/* Status Bar */}
      <StatusBar
        selectedCount={selectionItems.length}
        totalSeats={seats.length}
        zoom={zoom}
        gridEnabled={gridEnabled}
        activeTool={activeTool}
        statusMessage={selectionItems.length > 0 ? `${selectionItems.length} items selected` : undefined}
      />
      
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
      

    </div>
  );
} 