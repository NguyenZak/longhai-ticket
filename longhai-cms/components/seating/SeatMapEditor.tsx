import React, { useRef, useState, useEffect } from 'react';
import { useSvgPanZoom } from './useSvgPanZoom';

interface EditorText {
  id: string;
  x: number;
  y: number;
  content: string;
  fontSize?: number;
  color?: string;
  rotation?: number;
  shapeId?: string;
}

interface Seat {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface SeatGroup {
  id: string;
  type: 'seat-group';
  seats: { id: string; x: number; y: number; label: string }[];
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

interface SeatMapEditorProps {
  canvasWidth?: number;
  canvasHeight?: number;
  rows?: number[];
  zoneX?: number;
  padding?: number;
  seats?: Seat[];
  onSeatClick?: (seat: Seat) => void;
  selected?: Seat | null;
  activeTool?: string;
  onAddSeats?: (seats: Seat[]) => void;
  texts?: EditorText[];
  onAddText?: (x: number, y: number) => void;
  editingText?: string | null;
  onTextClick?: (id: string) => void;
  onTextEdit?: (id: string) => void;
  onTextChange?: (id: string, content: string) => void;
  onTextMoveStart?: (id: string, x: number, y: number, mouseX: number, mouseY: number) => void;
  onTextMove?: (mouseX: number, mouseY: number) => void;
  onTextMoveEnd?: () => void;
  onTextAttrChange?: (id: string, attr: Partial<{ content: string; color: string; rotation: number; fontSize: number }>) => void;
  shapes?: Array<
    | { id: string; type: 'rectangle'; x: number; y: number; w: number; h: number; color: string; rotation?: number; fillColor?: string; borderColor?: string; borderWidth?: number }
    | { id: string; type: 'circle'; cx: number; cy: number; r: number; color: string; rotation?: number; fillColor?: string; borderColor?: string; borderWidth?: number }
    | { id: string; type: 'oval'; cx: number; cy: number; rx: number; ry: number; color: string; rotation?: number; fillColor?: string; borderColor?: string; borderWidth?: number }
    | { id: string; type: 'polygon'; points: { x: number; y: number }[]; color: string; rotation?: number; fillColor?: string; borderColor?: string; borderWidth?: number }
  >;
  onAddShape?: (shape: any) => void;
  onUpdateShape?: (id: string, partial: any) => void;
  selectedShapeId?: string | null;
  setSelectedShapeId?: (id: string | null) => void;
  selectedTextId?: string | null;
  setSelectedTextId?: (id: string | null) => void;
  zoom?: number;
  onCenterPan?: (fn: () => void) => void; // Parent provides a setter for center pan
  gridEnabled?: boolean;
  seatGroups?: SeatGroup[];
  onAddSeatGroup?: (seats: Seat[]) => void;
  selectedGroupId?: string | null;
  setSelectedGroupId?: (id: string | null) => void;
  onUpdateSeatGroup?: (groupId: string, dx: number, dy: number) => void;
  onUpdateSeatGroupRotation?: (groupId: string, angle: number) => void;
  onSelectSeats?: (seatIds: string[]) => void;
  onSelectGroups?: (groupIds: string[]) => void;
}

const GRID_SPACING = 25;

type DragOffsetShape =
  | { x: number; y: number }
  | { points: { x: number; y: number }[]; offset: { x: number; y: number } };

type ResizeShapeStart =
  | ({ mouseX: number; mouseY: number; w: number; h: number; r?: number; rx?: number; ry?: number; shapeType: string; origShape: any })
  | null;

export default function SeatMapEditor({
  canvasWidth,
  canvasHeight,
  rows = [],
  zoneX = 0,
  padding = 0,
  seats = [],
  onSeatClick,
  selected,
  activeTool,
  onAddSeats,
  texts = [],
  onAddText,
  selectedTextId,
  editingText,
  onTextClick,
  onTextEdit,
  onTextChange,
  onTextMoveStart,
  onTextMove,
  onTextMoveEnd,
  onTextAttrChange,
  shapes = [],
  onAddShape,
  onUpdateShape,
  selectedShapeId,
  setSelectedShapeId,
  setSelectedTextId,
  zoom = 1,
  onCenterPan,
  gridEnabled = true,
  seatGroups = [],
  onAddSeatGroup,
  selectedGroupId,
  setSelectedGroupId,
  onUpdateSeatGroup,
  onUpdateSeatGroupRotation,
  onSelectSeats,
  onSelectGroups,
}: SeatMapEditorProps) {
  const gridWidth = typeof canvasWidth === 'number' ? canvasWidth : 800;
  const gridHeight = typeof canvasHeight === 'number' ? canvasHeight : 800;
  const svgWidth = gridWidth + 2 * padding;
  const svgHeight = gridHeight + 2 * padding;

  // Store initialViewBox for reset
  const initialViewBox = { x: 0, y: 0, w: gridWidth, h: gridHeight };
  const { viewBox, setViewBox, onMouseDown: panDown, onMouseMove: panMove, onMouseUp: panUp, onWheelNative } = useSvgPanZoom(initialViewBox);

  // Expose center pan to parent
  useEffect(() => {
    if (!onCenterPan) return;
    onCenterPan(() => setViewBox(initialViewBox));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setViewBox, gridWidth, gridHeight]);
  // Replace scale calculation for SVG transform
  const scale = (1000 / viewBox.w) * zoom;
  const translate = {
    x: padding - viewBox.x * scale,
    y: padding - viewBox.y * scale,
  };

  // State cho vẽ row multi-step
  const [rowDrawing, setRowDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<{ x: number; y: number } | null>(null);

  // State cho vẽ rectangle
  const [rectDrawing, setRectDrawing] = useState(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [rectCurrent, setRectCurrent] = useState<{ x: number; y: number } | null>(null);

  // State cho vẽ circle
  const [circleDrawing, setCircleDrawing] = useState(false);
  const [circleStart, setCircleStart] = useState<{ x: number; y: number } | null>(null);
  const [circleCurrent, setCircleCurrent] = useState<{ x: number; y: number } | null>(null);

  // State cho vẽ oval
  const [ovalDrawing, setOvalDrawing] = useState(false);
  const [ovalStart, setOvalStart] = useState<{ x: number; y: number } | null>(null);
  const [ovalCurrent, setOvalCurrent] = useState<{ x: number; y: number } | null>(null);

  // State cho vẽ polygon
  const [polyDrawing, setPolyDrawing] = useState(false);
  const [polyPoints, setPolyPoints] = useState<{ x: number; y: number }[]>([]);

  // Add multi-selection state
  const [selecting, setSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState<{ x: number; y: number } | null>(null);
  const [selectCurrent, setSelectCurrent] = useState<{ x: number; y: number } | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  function handleSvgMouseDown(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (e.target === e.currentTarget) {
      if (typeof setSelectedShapeId === 'function') setSelectedShapeId(null);
      if (typeof setSelectedTextId === 'function') setSelectedTextId(null);
      return;
    }
    if (activeTool === 'row') {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      if (!rowDrawing) {
        setDrawingStart({ x: snapX, y: snapY });
        setDrawingCurrent({ x: snapX, y: snapY });
        setRowDrawing(true);
      } else if (drawingStart) {
        const startX = drawingStart.x;
        const startY = drawingStart.y;
        const endX = snapX;
        const endY = snapY;
        const dx = endX - startX;
        const dy = endY - startY;
        const len = Math.sqrt(dx * dx + dy * dy);
        const seatSpacing = GRID_SPACING;
        const count = Math.ceil(len / seatSpacing);
        const seats: Seat[] = [];
        if (dx === 0) {
          const sign = Math.sign(dy);
          for (let i = 0; i < count; ++i) {
            const x = startX;
            const y = startY + seatSpacing * i * sign;
            const label = `R${i + 1}`;
            seats.push({
              id: `row-${Date.now()}-${i}`,
              x,
              y,
              label,
            });
          }
        } else {
          const angle = Math.atan(dy / dx);
          const sign = Math.sign(dx);
          for (let i = 0; i < count; ++i) {
            const x = startX + seatSpacing * i * sign * Math.cos(angle);
            const y = startY + seatSpacing * i * sign * Math.sin(angle);
            const label = `R${i + 1}`;
            seats.push({
              id: `row-${Date.now()}-${i}`,
              x,
              y,
              label,
            });
          }
        }
        if (onAddSeatGroup) onAddSeatGroup(seats);
        setRowDrawing(false);
        setDrawingStart(null);
        setDrawingCurrent(null);
      }
      return;
    }
    if (activeTool === 'rows') {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      if (!rowsDrawing) {
        setRowsStart({ x: snapX, y: snapY });
        setRowsCurrent({ x: snapX, y: snapY });
        setRowsDrawing(true);
      } else if (rowsStart) {
        setRowsCurrent({ x: snapX, y: snapY });
        // Sinh ghế
        const x0 = Math.min(rowsStart.x, snapX);
        const y0 = Math.min(rowsStart.y, snapY);
        const x1 = Math.max(rowsStart.x, snapX);
        const y1 = Math.max(rowsStart.y, snapY);
        const cols = Math.round((x1 - x0) / GRID_SPACING) + 1;
        const rowsCount = Math.round((y1 - y0) / GRID_SPACING) + 1;
        for (let r = 0; r < rowsCount; ++r) {
          const rowSeats: Seat[] = [];
          for (let c = 0; c < cols; ++c) {
            const row = Math.round((y0 + r * GRID_SPACING) / GRID_SPACING);
            const col = Math.round((x0 + c * GRID_SPACING) / GRID_SPACING);
            const label = String.fromCharCode(65 + row) + (col + 1);
            rowSeats.push({
              id: `rows-${Date.now()}-${r}-${c}`,
              x: x0 + c * GRID_SPACING,
              y: y0 + r * GRID_SPACING,
              label,
            });
          }
          if (onAddSeatGroup) onAddSeatGroup(rowSeats);
        }
        setRowsDrawing(false);
        setRowsStart(null);
        setRowsCurrent(null);
      }
      return;
    }
    if (activeTool === 'seat') {
      const pt = getSvgPoint(e);
      // Snap vào grid
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      // Sinh label/id tự động (S1, S2, ...)
      const label = `S${seats.length + 1}`;
      const seat = {
        id: `seat-${Date.now()}`,
        x: snapX,
        y: snapY,
        label,
      };
      if (onAddSeats) onAddSeats([seat]);
      return;
    }
    if (activeTool === 'text') {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      if (onAddText) onAddText(snapX, snapY);
      return;
    }
    if (activeTool === 'rectangle') {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      setRectStart({ x: snapX, y: snapY });
      setRectCurrent({ x: snapX, y: snapY });
      setRectDrawing(true);
      return;
    }
    if (activeTool === 'circle') {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      setCircleStart({ x: snapX, y: snapY });
      setCircleCurrent({ x: snapX, y: snapY });
      setCircleDrawing(true);
      return;
    }
    if (activeTool === 'oval') {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      setOvalStart({ x: snapX, y: snapY });
      setOvalCurrent({ x: snapX, y: snapY });
      setOvalDrawing(true);
      return;
    }
    if (activeTool === 'polygon') {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      if (!polyDrawing) {
        setPolyDrawing(true);
        setPolyPoints([{ x: snapX, y: snapY }]);
      } else {
        setPolyPoints((prev: { x: number; y: number }[]) => [...prev, { x: snapX, y: snapY }]);
      }
      return;
    }
    // In SVG mouse down, if select tool and not clicking on seat/group, start selection
    if (activeTool === 'select' && e.target === e.currentTarget) {
      const pt = getSvgPoint(e);
      setSelecting(true);
      setSelectStart(pt);
      setSelectCurrent(pt);
      setSelectedSeatIds([]);
      setSelectedGroupIds([]);
      return;
    }
    // Chỉ cho phép pan khi giữ Cmd/Ctrl
    if (e.ctrlKey || e.metaKey) {
      panDown(e);
    }
  }
  function handleSvgMouseMove(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (activeTool === 'row' && rowDrawing && drawingStart) {
      let pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      let x = snapX, y = snapY;
      // Chỉ snap thẳng hàng khi giữ shift
      if (e.shiftKey) {
        const dx = Math.abs(snapX - drawingStart.x);
        const dy = Math.abs(snapY - drawingStart.y);
        if (dx > dy) {
          y = drawingStart.y; // Hàng ngang
        } else {
          x = drawingStart.x; // Cột dọc
        }
      }
      setDrawingCurrent({ x, y });
      return;
    }
    if (activeTool === 'rows' && rowsDrawing && rowsStart) {
      let pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      setRowsCurrent({ x: snapX, y: snapY });
      return;
    }
    if (activeTool === 'rectangle' && rectDrawing && rectStart) {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      setRectCurrent({ x: snapX, y: snapY });
      return;
    }
    if (activeTool === 'circle' && circleDrawing && circleStart) {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      setCircleCurrent({ x: snapX, y: snapY });
      return;
    }
    if (activeTool === 'oval' && ovalDrawing && ovalStart) {
      const pt = getSvgPoint(e);
      const snapX = Math.round(pt.x / GRID_SPACING) * GRID_SPACING;
      const snapY = Math.round(pt.y / GRID_SPACING) * GRID_SPACING;
      setOvalCurrent({ x: snapX, y: snapY });
      return;
    }
    if (activeTool === 'polygon' && polyDrawing && polyPoints.length > 0) {
      // Preview cạnh cuối cùng theo chuột
      // Không cần set state, chỉ render preview
      return;
    }
    if (activeTool === 'select' && selecting && selectStart) {
      const pt = getSvgPoint(e);
      setSelectCurrent(pt);
      return;
    }
    // Chỉ cho phép pan khi giữ Cmd/Ctrl
    if (e.ctrlKey || e.metaKey) {
      panMove(e);
    }
  }
  function handleSvgMouseUp(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (activeTool === 'select' && selecting && selectStart && selectCurrent) {
      // Calculate selection rectangle
      const x0 = Math.min(selectStart.x, selectCurrent.x);
      const y0 = Math.min(selectStart.y, selectCurrent.y);
      const x1 = Math.max(selectStart.x, selectCurrent.x);
      const y1 = Math.max(selectStart.y, selectCurrent.y);
      // Select seats
      const seatIds = seats.filter(s => s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1).map(s => s.id);
      // Select groups (if any seat in group is in rect)
      const groupIds = seatGroups.filter(g => g.seats.some(s => s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1)).map(g => g.id);
      setSelectedSeatIds(seatIds);
      setSelectedGroupIds(groupIds);
      setSelecting(false);
      setSelectStart(null);
      setSelectCurrent(null);
      return;
    }
    // (Intentionally left empty for row/rows drawing)
  }
  function handleSvgDoubleClick(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (activeTool === 'polygon' && polyDrawing && polyPoints.length >= 3) {
      if (onAddShape) {
        onAddShape({ id: `poly-${Date.now()}`, type: 'polygon', points: polyPoints, color: '#d32f2f' });
      }
      setPolyDrawing(false);
      setPolyPoints([]);
      return;
    }
    // Chỉ cho phép pan khi giữ Cmd/Ctrl
    if (e.ctrlKey || e.metaKey) {
      panUp();
    }
  }
  function handleSvgKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
    // Polygon finish
    if (activeTool === 'polygon' && polyDrawing && polyPoints.length >= 3 && (e.key === 'Enter' || e.key === 'Escape')) {
      if (onAddShape) {
        onAddShape({ id: `poly-${Date.now()}`, type: 'polygon', points: polyPoints, color: '#d32f2f' });
      }
      setPolyDrawing(false);
      setPolyPoints([]);
      return;
    }
    // Clipboard shortcuts
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const ctrl = isMac ? e.metaKey : e.ctrlKey;
    // Cut
    if (ctrl && e.key.toLowerCase() === 'x') {
      if (selectedShapeId) {
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (shape) {
          setClipboard({ type: 'shape', data: JSON.parse(JSON.stringify(shape)) });
          if (onUpdateShape) onUpdateShape(selectedShapeId, { _delete: true });
          if (setSelectedShapeId) setSelectedShapeId(null);
        }
      } else if (selectedTextId) {
        const text = texts.find(t => t.id === selectedTextId);
        if (text) {
          setClipboard({ type: 'text', data: JSON.parse(JSON.stringify(text)) });
          if (onTextEdit) onTextEdit('');
          if (onTextChange) onTextChange(text.id, ''); // Mark as deleted
          if (setSelectedTextId) setSelectedTextId(null);
        }
      }
      e.preventDefault();
      return;
    }
    // Copy
    if (ctrl && e.key.toLowerCase() === 'c') {
      if (selectedShapeId) {
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (shape) setClipboard({ type: 'shape', data: JSON.parse(JSON.stringify(shape)) });
      } else if (selectedTextId) {
        const text = texts.find(t => t.id === selectedTextId);
        if (text) setClipboard({ type: 'text', data: JSON.parse(JSON.stringify(text)) });
      }
      e.preventDefault();
      return;
    }
    // Paste
    if (ctrl && e.key.toLowerCase() === 'v') {
      if (clipboard) {
        if (clipboard.type === 'shape' && onAddShape && setSelectedShapeId) {
          const shape = { ...clipboard.data, id: `${clipboard.data.type}-${Date.now()}`, x: (clipboard.data.x ?? clipboard.data.cx ?? 0) + 20, y: (clipboard.data.y ?? clipboard.data.cy ?? 0) + 20 };
          if (shape.type === 'rectangle') shape.x += 20, shape.y += 20;
          if (shape.type === 'circle' || shape.type === 'oval') shape.cx += 20, shape.cy += 20;
          if (shape.type === 'polygon') shape.points = shape.points.map((pt: any) => ({ x: pt.x + 20, y: pt.y + 20 }));
          onAddShape(shape);
          setSelectedShapeId(shape.id);
        } else if (clipboard.type === 'text' && onAddText && setSelectedTextId) {
          const text = { ...clipboard.data, id: `text-${Date.now()}`, x: clipboard.data.x + 20, y: clipboard.data.y + 20 };
          if (onAddText) onAddText(text.x, text.y);
          setSelectedTextId(text.id);
        }
      }
      e.preventDefault();
      return;
    }
    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedShapeId && onUpdateShape) {
        onUpdateShape(selectedShapeId, { _delete: true });
        if (setSelectedShapeId) setSelectedShapeId(null);
      } else if (selectedTextId && onTextEdit && onTextChange) {
        onTextEdit('');
        onTextChange(selectedTextId, ''); // Mark as deleted
        if (setSelectedTextId) setSelectedTextId(null);
      }
      e.preventDefault();
      return;
    }
    // Chỉ cho phép pan khi giữ Cmd/Ctrl
    if (e.ctrlKey || e.metaKey) {
      panUp();
    }
  }

  // Lấy toạ độ SVG từ event
  function getSvgPoint(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    // Tính trực tiếp từ offsetX/offsetY, scale, translate (không cần createSVGPoint)
    const x = (e.nativeEvent.offsetX - translate.x) / scale;
    const y = (e.nativeEvent.offsetY - translate.y) / scale;
    return { x, y };
  }

  // Preview row khi vẽ
  let rowPreviewSeats: { x: number; y: number }[] = [];
  if (rowDrawing && drawingStart && drawingCurrent) {
    const dx = drawingCurrent.x - drawingStart.x;
    const dy = drawingCurrent.y - drawingStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const seatSpacing = GRID_SPACING;
    const count = Math.ceil(len / seatSpacing);
    if (dx === 0) {
      const sign = Math.sign(dy);
      for (let i = 0; i < count; ++i) {
        const x = drawingStart.x;
        const y = drawingStart.y + seatSpacing * i * sign;
        rowPreviewSeats.push({ x, y });
      }
    } else {
      const angle = Math.atan(dy / dx);
      const sign = Math.sign(dx);
      for (let i = 0; i < count; ++i) {
        const x = drawingStart.x + seatSpacing * i * sign * Math.cos(angle);
        const y = drawingStart.y + seatSpacing * i * sign * Math.sin(angle);
        rowPreviewSeats.push({ x, y });
      }
    }
  }

  // State cho vẽ block rows
  const [rowsDrawing, setRowsDrawing] = useState(false);
  const [rowsStart, setRowsStart] = useState<{ x: number; y: number } | null>(null);
  const [rowsCurrent, setRowsCurrent] = useState<{ x: number; y: number } | null>(null);

  // Preview block rows
  let rowsPreviewSeats: { x: number; y: number }[] = [];
  let rowsPreviewCols = 0, rowsPreviewRows = 0;
  if (activeTool === 'rows' && rowsDrawing && rowsStart && rowsCurrent) {
    const x0 = Math.min(rowsStart.x, rowsCurrent.x);
    const y0 = Math.min(rowsStart.y, rowsCurrent.y);
    const x1 = Math.max(rowsStart.x, rowsCurrent.x);
    const y1 = Math.max(rowsStart.y, rowsCurrent.y);
    rowsPreviewCols = Math.round((x1 - x0) / GRID_SPACING) + 1;
    rowsPreviewRows = Math.round((y1 - y0) / GRID_SPACING) + 1;
    for (let r = 0; r < rowsPreviewRows; ++r) {
      for (let c = 0; c < rowsPreviewCols; ++c) {
        rowsPreviewSeats.push({
          x: x0 + c * GRID_SPACING,
          y: y0 + r * GRID_SPACING,
        });
      }
    }
  }

  // Preview rectangle khi vẽ
  let rectPreviewSeats: { x: number; y: number }[] = [];
  if (rectDrawing && rectStart && rectCurrent) {
    const x = Math.min(rectStart.x, rectCurrent.x);
    const y = Math.min(rectStart.y, rectCurrent.y);
    const w = Math.abs(rectCurrent.x - rectStart.x);
    const h = Math.abs(rectCurrent.y - rectStart.y);
    for (let i = 0; i < 4; ++i) {
      const angle = (i * Math.PI) / 2;
      const px = x + w / 2 + w * Math.cos(angle) / 2;
      const py = y + h / 2 + h * Math.sin(angle) / 2;
      rectPreviewSeats.push({ x: px, y: py });
    }
  }

  // Preview circle khi vẽ
  let circlePreviewSeats: { x: number; y: number }[] = [];
  if (circleDrawing && circleStart && circleCurrent) {
    const dx = circleCurrent.x - circleStart.x;
    const dy = circleCurrent.y - circleStart.y;
    const r = Math.round(Math.sqrt(dx * dx + dy * dy));
    for (let i = 0; i < 360; ++i) { // Vẽ đường tròn đầy đủ
      const angle = (i * Math.PI) / 180;
      const px = circleStart.x + r * Math.cos(angle);
      const py = circleStart.y + r * Math.sin(angle);
      circlePreviewSeats.push({ x: px, y: py });
    }
  }

  // Preview oval khi vẽ
  let ovalPreviewSeats: { x: number; y: number }[] = [];
  if (ovalDrawing && ovalStart && ovalCurrent) {
    const cx = (ovalStart.x + ovalCurrent.x) / 2;
    const cy = (ovalStart.y + ovalCurrent.y) / 2;
    const rx = Math.abs(ovalCurrent.x - ovalStart.x) / 2;
    const ry = Math.abs(ovalCurrent.y - ovalStart.y) / 2;
    for (let i = 0; i < 360; ++i) { // Vẽ đường ellipse đầy đủ
      const angle = (i * Math.PI) / 180;
      const px = cx + rx * Math.cos(angle);
      const py = cy + ry * Math.sin(angle);
      ovalPreviewSeats.push({ x: px, y: py });
    }
  }

  // Preview polygon khi vẽ
  let polyPreviewSeats: { x: number; y: number }[] = [];
  if (polyDrawing && polyPoints.length > 0) {
    polyPreviewSeats = polyPoints;
  }

  // State cho resize text
  const [resizingTextId, setResizingTextId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ mouseX: number; mouseY: number; fontSize: number } | null>(null);

  // State chọn, drag, resize shape
  const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);
  const [dragOffsetShape, setDragOffsetShape] = useState<DragOffsetShape | null>(null);
  const [resizingShapeId, setResizingShapeId] = useState<string | null>(null);
  const [resizeShapeStart, setResizeShapeStart] = useState<ResizeShapeStart>(null);

  // Clipboard state
  const [clipboard, setClipboard] = useState<{ type: 'shape' | 'text'; data: any } | null>(null);

  // 1. Add to state:
  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [dragGroupStart, setDragGroupStart] = useState<{ mouseX: number; mouseY: number; groupX: number; groupY: number } | null>(null);
  // 1. Add dragGroupDelta state:
  const [dragGroupDelta, setDragGroupDelta] = useState<{ dx: number; dy: number } | null>(null);

  // 1. Add hoverLineGroupId state:
  const [hoverLineGroupId, setHoverLineGroupId] = useState<string | null>(null);

  // 1. Add rotation state for group drag:
  const [rotatingGroupId, setRotatingGroupId] = useState<string | null>(null);
  const [rotateStart, setRotateStart] = useState<{ mouseX: number; mouseY: number; startAngle: number; groupAngle: number; cx: number; cy: number } | null>(null);
  const [rotatePreview, setRotatePreview] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        onWheelNative(e);
      }
    };
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [onWheelNative]);

  // Drag text
  useEffect(() => {
    if (!onTextMove || !onTextMoveEnd) return;
    function handleMouseMove(e: MouseEvent) {
      if (onTextMove) onTextMove(e.offsetX, e.offsetY);
    }
    function handleMouseUp() {
      if (onTextMoveEnd) onTextMoveEnd();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    if (svgRef.current) {
      svgRef.current.addEventListener('mousemove', handleMouseMove);
      svgRef.current.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      if (svgRef.current) {
        svgRef.current.removeEventListener('mousemove', handleMouseMove);
        svgRef.current.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [onTextMove, onTextMoveEnd]);

  // Drag shape
  function handleShapeDragStart(id: string, shape: any, mouseX: number, mouseY: number) {
    setDraggingShapeId(id);
    if (shape.type === 'rectangle') setDragOffsetShape({ x: shape.x - mouseX, y: shape.y - mouseY });
    if (shape.type === 'circle') setDragOffsetShape({ x: shape.cx - mouseX, y: shape.cy - mouseY });
    if (shape.type === 'oval') setDragOffsetShape({ x: shape.cx - mouseX, y: shape.cy - mouseY });
    if (shape.type === 'polygon') setDragOffsetShape({
      points: shape.points.map((pt: { x: number; y: number }) => ({ x: pt.x - mouseX, y: pt.y - mouseY })),
      offset: { x: mouseX, y: mouseY }
    });
  }
  useEffect(() => {
    if (!draggingShapeId || !dragOffsetShape) return;
    function onMove(e: MouseEvent) {
      if (!onUpdateShape) return;
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;
      const shape = shapes.find(s => s.id === draggingShapeId);
      if (!shape) return;
      if (onUpdateShape && shape.type === 'rectangle' && dragOffsetShape && 'x' in dragOffsetShape && 'y' in dragOffsetShape) {
        onUpdateShape(draggingShapeId as string, { x: Math.round(mouseX + dragOffsetShape.x), y: Math.round(mouseY + dragOffsetShape.y) });
      } else if (onUpdateShape && (shape.type === 'circle' || shape.type === 'oval') && dragOffsetShape && 'x' in dragOffsetShape && 'y' in dragOffsetShape) {
        onUpdateShape(draggingShapeId as string, { cx: Math.round(mouseX + dragOffsetShape.x), cy: Math.round(mouseY + dragOffsetShape.y) });
      } else if (onUpdateShape && shape.type === 'polygon' && dragOffsetShape && 'offset' in dragOffsetShape && 'points' in dragOffsetShape) {
        const dx = mouseX - (dragOffsetShape.offset as { x: number; y: number }).x;
        const dy = mouseY - (dragOffsetShape.offset as { x: number; y: number }).y;
        onUpdateShape(draggingShapeId as string, {
          points: shape.points.map((pt: { x: number; y: number }, i: number) => ({ x: pt.x + dx, y: pt.y + dy }))
        });
      }
    }
    function onUp() {
      setDraggingShapeId(null);
      setDragOffsetShape(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingShapeId, dragOffsetShape, onUpdateShape, shapes]);

  // Resize shape (rectangle only)
  function handleShapeResizeStart(id: string, shape: any, mouseX: number, mouseY: number) {
    setResizingShapeId(id);
    let bbox = { x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0 };
    if (shape.type === 'rectangle') bbox = { x: shape.x, y: shape.y, w: shape.w, h: shape.h, cx: shape.x + shape.w/2, cy: shape.y + shape.h/2 };
    if (shape.type === 'circle') bbox = { x: shape.cx - shape.r, y: shape.cy - shape.r, w: shape.r * 2, h: shape.r * 2, cx: shape.cx, cy: shape.cy };
    if (shape.type === 'oval') bbox = { x: shape.cx - shape.rx, y: shape.cy - shape.ry, w: shape.rx * 2, h: shape.ry * 2, cx: shape.cx, cy: shape.cy };
    if (shape.type === 'polygon' && shape.points.length > 0) {
      const xs = shape.points.map((p: { x: number; y: number }) => p.x);
      const ys = shape.points.map((p: { x: number; y: number }) => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      bbox = { x: minX, y: minY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX)/2, cy: (minY + maxY)/2 };
    }
    setResizeShapeStart({ mouseX, mouseY, ...bbox, shapeType: shape.type, origShape: shape });
  }
  useEffect(() => {
    if (!resizingShapeId || !resizeShapeStart) return;
    function onMove(e: MouseEvent) {
      if (!onUpdateShape || !resizeShapeStart) return;
      const dx = e.clientX - resizeShapeStart.mouseX;
      const dy = e.clientY - resizeShapeStart.mouseY;
      const { shapeType, origShape, w, h, cx, cy } = resizeShapeStart as any;
      if (shapeType === 'rectangle') {
        onUpdateShape(resizingShapeId as string, { w: Math.max(10, w + dx), h: Math.max(10, h + dy) });
      } else if (shapeType === 'circle') {
        // Scale r based on max(dx, dy) from center
        const newR = Math.max(10, Math.max(Math.abs(w/2 + dx), Math.abs(h/2 + dy)));
        onUpdateShape(resizingShapeId as string, { r: newR });
      } else if (shapeType === 'oval') {
        // Scale rx/ry based on dx, dy
        const newRx = Math.max(10, w/2 + dx);
        const newRy = Math.max(10, h/2 + dy);
        onUpdateShape(resizingShapeId as string, { rx: newRx, ry: newRy });
      } else if (shapeType === 'polygon') {
        // Scale all points from center
        const scaleX = (w + dx) / w;
        const scaleY = (h + dy) / h;
        onUpdateShape(resizingShapeId as string, {
          points: origShape.points.map((pt: { x: number; y: number }) => ({
            x: cx + (pt.x - cx) * scaleX,
            y: cy + (pt.y - cy) * scaleY
          }))
        });
      }
    }
    function onUp() {
      setResizingShapeId(null);
      setResizeShapeStart(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizingShapeId, resizeShapeStart, onUpdateShape]);

  // Resize handle mouse events
  function handleResizeStart(id: string, mouseX: number, mouseY: number, fontSize: number) {
    setResizingTextId(id);
    setResizeStart({ mouseX, mouseY, fontSize });
  }
  useEffect(() => {
    if (!resizingTextId || !resizeStart) return;
    function onMove(e: MouseEvent) {
      if (!resizeStart) return;
      const dx = e.clientX - resizeStart.mouseX;
      const dy = e.clientY - resizeStart.mouseY;
      // Tăng fontSize theo khoảng cách kéo chéo, min 8, max 128
      const delta = Math.max(dx, dy);
      const newFontSize = Math.max(8, Math.min(128, Math.round(resizeStart.fontSize + delta)));
      if (onTextAttrChange && resizingTextId) onTextAttrChange(resizingTextId, { fontSize: newFontSize });
    }
    function onUp() {
      setResizingTextId(null);
      setResizeStart(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizingTextId, resizeStart, onTextAttrChange]);

  // 4. useEffect for drag:
  useEffect(() => {
    if (!draggingGroupId || !dragGroupStart) return;
    function onMove(e: MouseEvent) {
      if (!dragGroupStart) return;
      const dx = e.clientX - dragGroupStart.mouseX;
      const dy = e.clientY - dragGroupStart.mouseY;
      setDragGroupDelta({ dx, dy });
    }
    function onUp() {
      if (draggingGroupId && dragGroupDelta && onUpdateSeatGroup) {
        // Snap dx, dy to grid
        const snapDx = Math.round(dragGroupDelta.dx / 25) * 25;
        const snapDy = Math.round(dragGroupDelta.dy / 25) * 25;
        onUpdateSeatGroup(draggingGroupId, snapDx, snapDy);
      }
      setDraggingGroupId(null);
      setDragGroupStart(null);
      setDragGroupDelta(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingGroupId, dragGroupStart, dragGroupDelta, onUpdateSeatGroup]);

  // 5. useEffect for rotation drag:
  useEffect(() => {
    if (!rotatingGroupId || !rotateStart) return;
    function onMove(e: MouseEvent) {
      if (!rotateStart) return;
      const { cx, cy, startAngle } = rotateStart;
      if (typeof cx !== 'number' || typeof cy !== 'number' || typeof startAngle !== 'number') return;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
      let delta = angle - startAngle;
      if (delta < -180) delta += 360;
      if (delta > 180) delta -= 360;
      setRotatePreview(delta);
    }
    function onUp() {
      if (rotatingGroupId && rotatePreview !== null && onUpdateSeatGroupRotation) {
        const groupObj = seatGroups.find(g => g.id === rotatingGroupId);
        const baseAngle = groupObj?.rotation || 0;
        const newAngle = (baseAngle + rotatePreview) % 360;
        onUpdateSeatGroupRotation(rotatingGroupId, newAngle);
      }
      setRotatingGroupId(null);
      setRotateStart(null);
      setRotatePreview(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [rotatingGroupId, rotateStart, rotatePreview, onUpdateSeatGroupRotation, seatGroups]);

  return (
    <div
      className="c-plan"
      style={{ width: '100%', height: '100%', background: '#333' }}
      onMouseDown={e => {
        if (e.target === e.currentTarget) {
          if (typeof setSelectedShapeId === 'function') setSelectedShapeId(null);
          if (typeof setSelectedTextId === 'function') setSelectedTextId(null);
        }
      }}
    >
      <svg
        ref={svgRef}
        className="c-plan"
        width={svgWidth}
        height={svgHeight}
        preserveAspectRatio="none"
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)', display: 'block' }}
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onDoubleClick={handleSvgDoubleClick}
        tabIndex={0}
        onKeyDown={handleSvgKeyDown}
      >
        <defs>
          <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ddd" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#ccc" strokeWidth="1" />
          </pattern>
        </defs>
        <g
          transform={`translate(${translate.x},${translate.y}) scale(${scale})`}
          className="movable zoom-transform"
        >
          {/* Nền trắng cho vùng grid */}
          <rect width={gridWidth} height={gridHeight} fill="#fcfcfc" cursor="default" />
          {/* Lưới grid */}
          {gridEnabled && (
            <rect width={gridWidth} height={gridHeight} fill="url(#grid)" cursor="default" />
          )}
          {/* Dấu cộng tại điểm bắt đầu row */}
          {activeTool === 'row' && rowDrawing && drawingStart && !drawingCurrent && (
            <g className="row-start-marker">
              <circle cx={drawingStart.x} cy={drawingStart.y} r={10} fill="#fff" stroke="#222" strokeWidth={2} />
              <text x={drawingStart.x} y={drawingStart.y + 3} textAnchor="middle" fontSize={16} fill="#222">+</text>
            </g>
          )}
          {/* Preview row khi vẽ */}
          {activeTool === 'row' && rowDrawing && drawingStart && drawingCurrent && (
            <g className="row-preview">
              <line
                className="preview"
                x1={drawingStart.x}
                y1={drawingStart.y}
                x2={drawingCurrent.x}
                y2={drawingCurrent.y}
                stroke="#aaa"
                strokeDasharray="1 1"
              />
              {/* Số lượng ghế preview */}
              {rowPreviewSeats.length > 0 && (
                <text
                  x={(drawingStart.x + drawingCurrent.x) / 2}
                  y={Math.min(drawingStart.y, drawingCurrent.y) - 18}
                  textAnchor="middle"
                  fontSize={14}
                  fill="#222"
                  fontWeight="bold"
                  style={{ userSelect: 'none' }}
                >
                  {rowPreviewSeats.length} ghế
                </text>
              )}
              {rowPreviewSeats.map((pt, i) => (
                <circle
                  key={i}
                  className="seat-preview"
                  cx={pt.x}
                  cy={pt.y}
                  r={10}
                />
              ))}
            </g>
          )}
          {/* Preview block rows khi vẽ */}
          {activeTool === 'rows' && rowsDrawing && rowsStart && rowsCurrent && (
            <g className="rows-preview">
              {/* Số cột x số hàng tiếng Việt */}
              {rowsPreviewCols > 0 && rowsPreviewRows > 0 && (
                <text
                  x={(rowsStart.x + rowsCurrent.x) / 2}
                  y={Math.min(rowsStart.y, rowsCurrent.y) - 18}
                  textAnchor="middle"
                  fontSize={14}
                  fill="#222"
                  fontWeight="bold"
                  style={{ userSelect: 'none' }}
                >
                  {rowsPreviewCols} cột, {rowsPreviewRows} hàng
                </text>
              )}
              {rowsPreviewSeats.map((pt, i) => (
                <circle
                  key={i}
                  className="seat-preview"
                  cx={pt.x}
                  cy={pt.y}
                  r={10}
                />
              ))}
            </g>
          )}
          {/* Preview rectangle khi vẽ */}
          {activeTool === 'rectangle' && rectDrawing && rectStart && rectCurrent && (
            <rect
              x={Math.min(rectStart.x, rectCurrent.x)}
              y={Math.min(rectStart.y, rectCurrent.y)}
              width={Math.abs(rectCurrent.x - rectStart.x)}
              height={Math.abs(rectCurrent.y - rectStart.y)}
              fill="rgba(25, 118, 210, 0.1)"
              stroke="#1976d2"
              strokeDasharray="1 1"
              strokeWidth={0.5}
            />
          )}
          {/* Preview circle khi vẽ */}
          {activeTool === 'circle' && circleDrawing && circleStart && circleCurrent && (
            <circle
              cx={circleStart.x}
              cy={circleStart.y}
              r={Math.sqrt(Math.pow(circleCurrent.x - circleStart.x, 2) + Math.pow(circleCurrent.y - circleStart.y, 2))}
              fill="rgba(67, 160, 71, 0.1)"
              stroke="#43a047"
              strokeDasharray="4 2"
              strokeWidth={2}
            />
          )}
          {/* Preview oval khi vẽ */}
          {activeTool === 'oval' && ovalDrawing && ovalStart && ovalCurrent && (
            <ellipse
              cx={(ovalStart.x + ovalCurrent.x) / 2}
              cy={(ovalStart.y + ovalCurrent.y) / 2}
              rx={Math.abs(ovalCurrent.x - ovalStart.x) / 2}
              ry={Math.abs(ovalCurrent.y - ovalStart.y) / 2}
              fill="rgba(251, 192, 45, 0.1)"
              stroke="#fbc02d"
              strokeDasharray="4 2"
              strokeWidth={2}
            />
          )}
          {/* Preview polygon khi vẽ */}
          {activeTool === 'polygon' && polyDrawing && polyPoints.length > 0 && (
            <g>
              <polyline
                points={polyPoints.map(pt => `${pt.x},${pt.y}`).join(' ')}
                fill="rgba(211, 47, 47, 0.1)"
                stroke="#d32f2f"
                strokeDasharray="4 2"
                strokeWidth={2}
              />
              {/* Draw points */}
              {polyPoints.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r={5} fill="#d32f2f" />
              ))}
              {/* Optionally, show a line from last point to mouse (not implemented here) */}
            </g>
          )}
          {/* Render seats that are NOT in any group */}
          {seats.filter(seat => !seatGroups.some(g => g.seats.some(s => s.id === seat.id))).map(seat => (
            <g
              key={seat.id}
              className={`seat${selected && selected.id === seat.id ? ' selected' : ''}`}
              onClick={e => {
                e.stopPropagation();
                onSeatClick && onSeatClick(seat);
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle r={10} cx={seat.x} cy={seat.y} fill="white" stroke="#222" strokeWidth={1.5} />
              <text
                x={seat.x}
                y={seat.y}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={8}
                fill="#888"
              >
                {seat.label}
              </text>
            </g>
          ))}
          {/* Render seat groups */}
          {seatGroups.map(group => {
            const isSelected = selectedGroupId === group.id;
            const isDragging = draggingGroupId === group.id && dragGroupDelta;
            const dragX = isDragging ? group.x + dragGroupDelta!.dx : group.x;
            const dragY = isDragging ? group.y + dragGroupDelta!.dy : group.y;
            const groupRotation = (isDragging ? group.rotation || 0 : group.rotation || 0) + (rotatingGroupId === group.id && rotatePreview !== null ? rotatePreview : 0);
            const groupTransform = `translate(${dragX},${dragY}) rotate(${groupRotation},${group.w / 2},${group.h / 2})`;
            return (
              <g key={group.id} transform={groupTransform} onClick={e => { e.stopPropagation(); setSelectedGroupId && setSelectedGroupId(group.id); }}>
                {isSelected && (
                  <g>
                    {/* Drag area: transparent rect over bounding box */}
                    <rect
                      x={0}
                      y={0}
                      width={group.w}
                      height={group.h}
                      fill="transparent"
                      style={{ cursor: 'move' }}
                      onMouseDown={e => {
                        e.stopPropagation();
                        setDraggingGroupId(group.id);
                        setDragGroupStart({ mouseX: e.clientX, mouseY: e.clientY, groupX: group.x, groupY: group.y });
                      }}
                    />
                  
                    {/* Bounding box nét đứt */}
                    <rect
                      x={0}
                      y={0}
                      width={group.w}
                      height={group.h}
                      fill="none"
                      stroke={hoverLineGroupId === group.id ? '#1565c0' : '#1976d2'}
                      strokeWidth={0.5}
                      strokeDasharray="1 1"
                      opacity={hoverLineGroupId === group.id ? 1 : 1}
                    />
                    {/* 4 handle vuông */}
                    <rect x={-3} y={-3} width={6} height={6} fill="#1976d2" />
                    <rect x={group.w - 3} y={-3} width={6} height={6} fill="#1976d2" />
                    <rect x={-3} y={group.h - 3} width={6} height={6} fill="#1976d2" />
                    <rect x={group.w - 3} y={group.h - 3} width={6} height={6} fill="#1976d2" />
                    {/* Center dot */}
                    <circle cx={group.w / 2} cy={group.h / 2} r={5} fill="#1976d2" />
                    {/* Rotation handle + line */}
                    <line x1={group.w / 2} y1={0} x2={group.w / 2} y2={-32} stroke="#1976d2" strokeWidth={2} />
                    <circle
                      cx={group.w / 2}
                      cy={-32}
                      r={7}
                      fill="#1976d2"
                      className="rotation-handle"
                      style={{ cursor: 'grab', transition: 'all 0.15s' }}
                      onMouseDown={e => {
                        e.stopPropagation();
                        setRotatingGroupId(group.id);
                        const cx = dragX + group.w / 2;
                        const cy = dragY + group.h / 2;
                        setRotateStart({
                          mouseX: e.clientX,
                          mouseY: e.clientY,
                          startAngle: Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI,
                          groupAngle: group.rotation || 0,
                          cx,
                          cy,
                        });
                      }}
                      onMouseEnter={e => { e.currentTarget.style.cursor = 'grab'; }}
                      onMouseLeave={e => { e.currentTarget.style.cursor = ''; }}
                    />
                    {/* Horizontal drag line */}
                    <line
                      x1={0}
                      y1={group.h / 2}
                      x2={group.w}
                      y2={group.h / 2}
                      stroke="#1976d2"
                      strokeWidth={hoverLineGroupId === group.id ? 6 : 4}
                      opacity={hoverLineGroupId === group.id ? 0.9 : 0.5}
                      style={{ cursor: 'move', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoverLineGroupId(group.id)}
                      onMouseLeave={() => setHoverLineGroupId(null)}
                      onMouseDown={e => {
                        e.stopPropagation();
                        setDraggingGroupId(group.id);
                        setDragGroupStart({ mouseX: e.clientX, mouseY: e.clientY, groupX: group.x, groupY: group.y });
                      }}
                    />
                  </g>
                )}
                {group.seats.map(seat => (
                  <g key={seat.id}>
                    <circle r={10} cx={seat.x - group.x} cy={seat.y - group.y} fill="white" stroke="#222" strokeWidth={1} />
                    <text x={seat.x - group.x} y={seat.y - group.y} textAnchor="middle" alignmentBaseline="central" fontSize={8} fill="#888">{seat.label}</text>
                  </g>
                ))}
              </g>
            );
          })}
          {/* Render shapes */}
          {shapes.map(shape => {
            const isSelected = selectedShapeId === shape.id;
            // Compute bounding box for all shape types
            let bbox = { x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0, rotation: 0 };
            if (shape.type === 'rectangle') {
              bbox = { x: shape.x, y: shape.y, w: shape.w, h: shape.h, cx: shape.x + shape.w/2, cy: shape.y + shape.h/2, rotation: shape.rotation || 0 };
            } else if (shape.type === 'circle') {
              bbox = { x: shape.cx - shape.r, y: shape.cy - shape.r, w: shape.r * 2, h: shape.r * 2, cx: shape.cx, cy: shape.cy, rotation: shape.rotation || 0 };
            } else if (shape.type === 'oval') {
              bbox = { x: shape.cx - shape.rx, y: shape.cy - shape.ry, w: shape.rx * 2, h: shape.ry * 2, cx: shape.cx, cy: shape.cy, rotation: shape.rotation || 0 };
            } else if (shape.type === 'polygon' && shape.points.length > 0) {
              const xs = shape.points.map((p: { x: number; y: number }) => p.x);
              const ys = shape.points.map((p: { x: number; y: number }) => p.y);
              const minX = Math.min(...xs), maxX = Math.max(...xs);
              const minY = Math.min(...ys), maxY = Math.max(...ys);
              bbox = { x: minX, y: minY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX)/2, cy: (minY + maxY)/2, rotation: shape.rotation || 0 };
            }
            // Drag logic
            const onShapeMouseDown = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
              e.stopPropagation();
              setSelectedShapeId && setSelectedShapeId(shape.id);
              handleShapeDragStart(shape.id, shape, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            };
            // Resize logic (start)
            const onResizeMouseDown = (corner: string, e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
              e.stopPropagation();
              // For all shapes, store initial bbox and mouse
              setResizingShapeId(shape.id);
              setResizeShapeStart({
                mouseX: e.clientX,
                mouseY: e.clientY,
                ...bbox,
                shapeType: shape.type,
                origShape: shape
              });
            };
            // Render shape
            let shapeElem = null;
            if (shape.type === 'rectangle') {
              shapeElem = <rect
                x={shape.x}
                y={shape.y}
                width={shape.w}
                height={shape.h}
                fill={shape.fillColor || '#ddd'}
                stroke={shape.borderColor || shape.color || '#1976d2'}
                strokeWidth={shape.borderWidth || (isSelected ? 3 : 2)}
                style={{ cursor: isSelected ? 'move' : 'pointer' }}
                onMouseDown={onShapeMouseDown}
              />;
            } else if (shape.type === 'circle') {
              shapeElem = <circle
                cx={shape.cx}
                cy={shape.cy}
                r={shape.r}
                fill={shape.fillColor || 'none'}
                stroke={shape.borderColor || shape.color || '#43a047'}
                strokeWidth={shape.borderWidth || 2}
                style={{ cursor: isSelected ? 'move' : 'pointer' }}
                onMouseDown={onShapeMouseDown}
              />;
            } else if (shape.type === 'oval') {
              shapeElem = <ellipse
                cx={shape.cx}
                cy={shape.cy}
                rx={shape.rx}
                ry={shape.ry}
                fill={shape.fillColor || 'none'}
                stroke={shape.borderColor || shape.color || '#fbc02d'}
                strokeWidth={shape.borderWidth || 2}
                style={{ cursor: isSelected ? 'move' : 'pointer' }}
                onMouseDown={onShapeMouseDown}
              />;
            } else if (shape.type === 'polygon') {
              shapeElem = <polygon
                points={shape.points.map(pt => `${pt.x},${pt.y}`).join(' ')}
                fill={shape.fillColor || 'none'}
                stroke={shape.borderColor || shape.color || '#d32f2f'}
                strokeWidth={shape.borderWidth || 2}
                style={{ cursor: isSelected ? 'move' : 'pointer' }}
                onMouseDown={onShapeMouseDown}
              />;
            }
            // Render bounding box and handles if selected
            let bboxElem = null;
            if (isSelected && bbox.w > 0 && bbox.h > 0) {
              // Calculate 4 corners for handles, center, and rotation handle, all rotated if needed
              const corners = [
                { x: bbox.x, y: bbox.y, cursor: 'nwse-resize', corner: 'nw' },
                { x: bbox.x + bbox.w, y: bbox.y, cursor: 'nesw-resize', corner: 'ne' },
                { x: bbox.x, y: bbox.y + bbox.h, cursor: 'nesw-resize', corner: 'sw' },
                { x: bbox.x + bbox.w, y: bbox.y + bbox.h, cursor: 'nwse-resize', corner: 'se' },
              ];
              // Rotation math
              const rotatePoint = (px: number, py: number, cx: number, cy: number, angle: number) => {
                const rad = (angle * Math.PI) / 180;
                const dx = px - cx;
                const dy = py - cy;
                return {
                  x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
                  y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
                };
              };
              const rot = bbox.rotation || 0;
              const rotatedCorners = corners.map(c => ({ ...rotatePoint(c.x, c.y, bbox.cx, bbox.cy, rot), cursor: c.cursor, corner: c.corner }));
              const center = { x: bbox.cx, y: bbox.cy };
              const rotatedCenter = rotatePoint(center.x, center.y, bbox.cx, bbox.cy, rot);
              // Rotation handle (above top center)
              const topCenter = { x: bbox.cx, y: bbox.y };
              const rotatedTopCenter = rotatePoint(topCenter.x, topCenter.y, bbox.cx, bbox.cy, rot);
              const rotHandle = rotatePoint(bbox.cx, bbox.y - 32, bbox.cx, bbox.cy, rot);
              bboxElem = (
                <g>
                  {/* Bounding box */}
                  <rect
                    x={bbox.x}
                    y={bbox.y}
                    width={bbox.w}
                    height={bbox.h}
                    fill="none"
                    stroke="#1976d2"
                    strokeWidth={0.5}
                    pointerEvents="none"
                    transform={rot ? `rotate(${rot},${bbox.cx},${bbox.cy})` : undefined}
                  />
                  {/* 4 handle vuông ở 4 góc */}
                  {rotatedCorners.map((c, i) => (
                    <rect key={i} x={c.x - 4} y={c.y - 4} width={8} height={8} fill="#1976d2" style={{ cursor: c.cursor, pointerEvents: 'all' }}
                      onMouseDown={e => onResizeMouseDown(c.corner, e)} />
                  ))}
                  {/* Chấm tròn ở tâm */}
                  <circle cx={rotatedCenter.x} cy={rotatedCenter.y} r={5} fill="#1976d2" />
                  {/* Rotation handle */}
                  <line x1={rotatedTopCenter.x} y1={rotatedTopCenter.y} x2={rotHandle.x} y2={rotHandle.y} stroke="#1976d2" strokeWidth={2} />
                  <circle cx={rotHandle.x} cy={rotHandle.y} r={7} fill="#1976d2" />
                </g>
              );
            }
            // Wrap everything in a <g> with rotation if needed
            const groupTransform = bbox.rotation ? `rotate(${bbox.rotation},${bbox.cx},${bbox.cy})` : undefined;
            return <g key={shape.id} transform={groupTransform}>{shapeElem}{bboxElem}</g>;
          })}
          {/* Render texts attached to shapes (always above shapes) */}
          {texts.filter(text => text.shapeId).map(text => {
            const shape = shapes.find(s => s.id === text.shapeId);
            if (!shape) return null;
            let x = 0, y = 0, rotation = 0;
            if (shape.type === 'rectangle') {
              x = shape.x + shape.w / 2;
              y = shape.y + shape.h / 2;
              rotation = shape.rotation || 0;
            } else if (shape.type === 'circle') {
              x = shape.cx;
              y = shape.cy;
              rotation = shape.rotation || 0;
            } else if (shape.type === 'oval') {
              x = shape.cx;
              y = shape.cy;
              rotation = shape.rotation || 0;
            } else if (shape.type === 'polygon' && shape.points.length > 0) {
              const pts = shape.points;
              const n = pts.length;
              x = pts.reduce((sum, p) => sum + p.x, 0) / n;
              y = pts.reduce((sum, p) => sum + p.y, 0) / n;
              rotation = shape.rotation || 0;
            }
            return (
              <text
                key={text.id}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={text.fontSize}
                fill={text.color}
                fontWeight="bold"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
                transform={rotation ? `rotate(${rotation},${x},${y})` : undefined}
              >
                {text.content}
              </text>
            );
          })}
          {/* Render free texts (not attached to shape) */}
          {texts.filter(text => !text.shapeId).map(text => {
            const isSelected = selectedTextId === text.id;
            // Ước lượng bbox
            const width = (text.content.length * (text.fontSize ?? 16) * 0.6) || 40;
            const height = (text.fontSize ?? 16) * 1.2;
            const x = text.x - width / 2;
            const y = text.y - height / 2;
            const rotation = text.rotation || 0;
            // Tính vị trí rotation handle
            const handleY = y - 32;
            return editingText === text.id ? (
              <foreignObject
                key={text.id}
                x={text.x - 60}
                y={text.y - 16}
                width={120}
                height={32}
                style={{ overflow: 'visible' }}
              >
                <input
                  type="text"
                  value={text.content}
                  autoFocus
                  style={{ width: '100%', fontSize: text.fontSize, fontWeight: 'bold', color: text.color, textAlign: 'center', background: 'rgba(255,255,255,0.9)', border: `1px solid ${text.color}`, borderRadius: 4 }}
                  onChange={e => onTextChange && onTextChange(text.id, e.target.value)}
                  onBlur={() => onTextEdit && onTextEdit('')}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onTextEdit && onTextEdit('');
                  }}
                />
              </foreignObject>
            ) : (
              <g key={text.id}>
                {/* Bounding box + handle nếu được chọn */}
                {isSelected && (
                  <g
                    transform={`rotate(${rotation},${text.x},${text.y})`}
                    style={{ pointerEvents: 'none' }}
                  >
                    {/* Khung viền */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill="none"
                      stroke="#1976d2"
                      strokeWidth={0.5}
                    />
                    {/* 4 handle vuông ở 4 góc */}
                    <rect x={x - 4} y={y - 4} width={8} height={8} fill="#1976d2" style={{ pointerEvents: 'all', cursor: 'nwse-resize' }}
                      onMouseDown={e => { e.stopPropagation(); handleResizeStart(text.id, e.clientX, e.clientY, text.fontSize ?? 16); }} />
                    <rect x={x + width - 4} y={y - 4} width={8} height={8} fill="#1976d2" style={{ pointerEvents: 'all', cursor: 'nesw-resize' }}
                      onMouseDown={e => { e.stopPropagation(); handleResizeStart(text.id, e.clientX, e.clientY, text.fontSize ?? 16); }} />
                    <rect x={x - 4} y={y + height - 4} width={8} height={8} fill="#1976d2" style={{ pointerEvents: 'all', cursor: 'nesw-resize' }}
                      onMouseDown={e => { e.stopPropagation(); handleResizeStart(text.id, e.clientX, e.clientY, text.fontSize ?? 16); }} />
                    <rect x={x + width - 4} y={y + height - 4} width={8} height={8} fill="#1976d2" style={{ pointerEvents: 'all', cursor: 'nwse-resize' }}
                      onMouseDown={e => { e.stopPropagation(); handleResizeStart(text.id, e.clientX, e.clientY, text.fontSize ?? 16); }} />
                    {/* Chấm tròn ở tâm */}
                    <circle cx={text.x} cy={text.y} r={5} fill="#1976d2" />
                    {/* Rotation handle */}
                    <line x1={text.x} y1={y} x2={text.x} y2={handleY} stroke="#1976d2" strokeWidth={2} />
                    <circle cx={text.x} cy={handleY} r={7} fill="#1976d2" />
                    {/* Hiển thị fontSize khi resize */}
                    {resizingTextId === text.id && (
                      <text x={text.x} y={y - 24} textAnchor="middle" fontSize={14} fill="#1976d2" fontWeight="bold" style={{ userSelect: 'none' }}>{text.fontSize}px</text>
                    )}
                  </g>
                )}
                <text
                  x={text.x}
                  y={text.y}
                  textAnchor="middle"
                  fontSize={text.fontSize}
                  fill={text.color}
                  fontWeight="bold"
                  style={{ userSelect: 'none', pointerEvents: 'auto', cursor: 'pointer' }}
                  transform={`rotate(${text.rotation},${text.x},${text.y})`}
                  onClick={e => {
                    e.stopPropagation();
                    if (onTextClick) onTextClick(text.id);
                  }}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    if (onTextEdit) onTextEdit(text.id);
                  }}
                  onMouseDown={e => {
                    if (onTextMoveStart) onTextMoveStart(text.id, text.x, text.y, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  }}
                >
                  {text.content}
                </text>
              </g>
            );
          })}
          {/* Render selection rectangle */}
          {activeTool === 'select' && selecting && selectStart && selectCurrent && (
            <rect
              x={Math.min(selectStart.x, selectCurrent.x)}
              y={Math.min(selectStart.y, selectCurrent.y)}
              width={Math.abs(selectCurrent.x - selectStart.x)}
              height={Math.abs(selectCurrent.y - selectStart.y)}
              fill="rgba(25, 118, 210, 0.08)"
              stroke="#1976d2"
              strokeDasharray="4 2"
              strokeWidth={1}
              pointerEvents="none"
            />
          )}
        </g>
      </svg>
    </div>
  );
}