// Comprehensive types for pretix-style seating editor

export interface Point {
  x: number;
  y: number;
}

export interface Seat {
  id: string;
  x: number;
  y: number;
  label: string;
  zoneId?: string;
  rowId?: string;
  status?: 'available' | 'occupied' | 'reserved' | 'disabled';
  price?: number;
  category?: string;
  color?: string;
  borderColor?: string;
  radius?: number;
  ticketType?: string;
  seatName?: string;
  isSelected?: boolean;
}

export interface Row {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  color?: string;
  opacity?: number;
  spacing?: number;
  showRowNumbers?: boolean;
  showRowNumbersRight?: boolean;
  rowNumber?: number;
  numberingType?: 'sequential' | 'alphabetical' | 'roman';
  startNumber?: number;
  reversed?: boolean;
  seatLabel?: string;
  seatRadius?: number;
  seatCategory?: string;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  color?: string;
  opacity?: number;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'oval' | 'polygon';
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  w?: number;
  h?: number;
  r?: number;
  rx?: number;
  ry?: number;
  points?: { x: number; y: number }[];
  color: string;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  rotation?: number;
}

export interface TextElement {
  id: string;
  x: number;
  y: number;
  content: string;
  fontSize?: number;
  color?: string;
  rotation?: number;
  shapeId?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface SelectionItem {
  id: string;
  type: 'seat' | 'row' | 'zone' | 'shape' | 'text';
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  rotation?: number;
}

export interface DrawingState {
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
  previewItems: any[];
  spacing: number;
  angle: number;
}

export interface SelectionState {
  isSelecting: boolean;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
  selectedItems: SelectionItem[];
  boundary: BoundingBox | null;
}

export interface TransformState {
  isRotating: boolean;
  isResizing: boolean;
  isMoving: boolean;
  rotateOrigin: { x: number; y: number } | null;
  resizeCorner: string;
  moveOffset: { x: number; y: number } | null;
}

export type ToolType = 
  | 'select' 
  | 'row'
  | 'rows'
  | 'zone' 
  | 'pan' 
  | 'text' 
  | 'rectangle' 
  | 'circle' 
  | 'oval' 
  | 'polygon'
  | 'select-seat';

export interface SeatingEditorState {
  seats: Seat[];
  rows: Row[];
  zones: Zone[];
  shapes: Shape[];
  texts: TextElement[];
  activeTool: ToolType;
  zoom: number;
  gridEnabled: boolean;
  drawing: DrawingState;
  selection: SelectionState;
  transform: TransformState;
  clipboard: any | null;
  undoStack: any[];
  redoStack: any[];
}

export interface SeatingEditorProps {
  width?: number;
  height?: number;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  gridEnabled?: boolean;
  onSeatClick?: (seat: Seat) => void;
  onZoneClick?: (zone: Zone) => void;
  onShapeClick?: (shape: Shape) => void;
  onTextClick?: (text: TextElement) => void;
  selectedSeats?: string[];
  selectedZones?: string[];
  onSelectionChange?: (seats: string[], zones: string[]) => void;
  activeTool?: ToolType;
  onToolChange?: (tool: ToolType) => void;
  statusBarContent?: React.ReactNode;
  onStateChange?: (state: Partial<SeatingEditorState>) => void;
}

// Imperative API exposed by SeatingEditor for parent controls
export interface SeatingEditorHandle {
  deleteSelected: () => void;
}