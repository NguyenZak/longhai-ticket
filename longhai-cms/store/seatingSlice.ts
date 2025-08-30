import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Seat, Zone, Shape, TextElement, ToolType, SelectionItem } from '@/components/seating/types';

export interface SeatingState {
  seats: Seat[];
  zones: Zone[];
  shapes: Shape[];
  texts: TextElement[];
  selectedItems: SelectionItem[];
  activeTool: ToolType;
  zoom: number;
  gridEnabled: boolean;
  drawingState: {
    isDrawing: boolean;
    startPoint: { x: number; y: number } | null;
    currentPoint: { x: number; y: number } | null;
    drawingType: string | null;
  };
}

const initialState: SeatingState = {
  seats: [],
  zones: [],
  shapes: [],
  texts: [],
  selectedItems: [],
  activeTool: 'select',
  zoom: 1,
  gridEnabled: true,
  drawingState: {
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    drawingType: null
  }
};

export const seatingSlice = createSlice({
  name: 'seating',
  initialState,
  reducers: {
    // Seat actions
    addSeats: (state, action: PayloadAction<Seat[]>) => {
      state.seats.push(...action.payload);
    },
    setSeats: (state, action: PayloadAction<Seat[]>) => {
      state.seats = action.payload;
    },
    updateSeat: (state, action: PayloadAction<{ id: string; updates: Partial<Seat> }>) => {
      const { id, updates } = action.payload;
      const seatIndex = state.seats.findIndex(seat => seat.id === id);
      if (seatIndex !== -1) {
        state.seats[seatIndex] = { ...state.seats[seatIndex], ...updates };
      }
    },
    deleteSeat: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.seats = state.seats.filter(seat => seat.id !== id);
      state.selectedItems = state.selectedItems.filter(item => !(item.type === 'seat' && item.id === id));
    },
    duplicateSeat: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const seat = state.seats.find(s => s.id === id);
      if (seat) {
        const newSeat: Seat = {
          ...seat,
          id: `seat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: seat.x + 20,
          y: seat.y + 20,
          label: `${seat.label}-copy`
        };
        state.seats.push(newSeat);
      }
    },

    // Zone actions
    addZone: (state, action: PayloadAction<Zone>) => {
      state.zones.push(action.payload);
    },
    setZones: (state, action: PayloadAction<Zone[]>) => {
      state.zones = action.payload;
    },
    updateZone: (state, action: PayloadAction<{ id: string; updates: Partial<Zone> }>) => {
      const { id, updates } = action.payload;
      const zoneIndex = state.zones.findIndex(zone => zone.id === id);
      if (zoneIndex !== -1) {
        state.zones[zoneIndex] = { ...state.zones[zoneIndex], ...updates };
      }
    },
    deleteZone: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.zones = state.zones.filter(zone => zone.id !== id);
      state.selectedItems = state.selectedItems.filter(item => !(item.type === 'zone' && item.id === id));
    },
    duplicateZone: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const zone = state.zones.find(z => z.id === id);
      if (zone) {
        const newZone: Zone = {
          ...zone,
          id: `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: zone.x + 20,
          y: zone.y + 20
        };
        state.zones.push(newZone);
      }
    },

    // Shape actions
    addShape: (state, action: PayloadAction<Shape>) => {
      state.shapes.push(action.payload);
    },
    setShapes: (state, action: PayloadAction<Shape[]>) => {
      state.shapes = action.payload;
    },
    updateShape: (state, action: PayloadAction<{ id: string; updates: Partial<Shape> }>) => {
      const { id, updates } = action.payload;
      const shapeIndex = state.shapes.findIndex(shape => shape.id === id);
      if (shapeIndex !== -1) {
        state.shapes[shapeIndex] = { ...state.shapes[shapeIndex], ...updates };
      }
    },
    deleteShape: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.shapes = state.shapes.filter(shape => shape.id !== id);
      state.selectedItems = state.selectedItems.filter(item => !(item.type === 'shape' && item.id === id));
    },
    duplicateShape: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const shape = state.shapes.find(s => s.id === id);
      if (shape) {
        const newShape: Shape = {
          ...shape,
          id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: shape.x ? shape.x + 20 : undefined,
          y: shape.y ? shape.y + 20 : undefined,
          cx: shape.cx ? shape.cx + 20 : undefined,
          cy: shape.cy ? shape.cy + 20 : undefined
        };
        state.shapes.push(newShape);
      }
    },

    // Text actions
    addText: (state, action: PayloadAction<TextElement>) => {
      state.texts.push(action.payload);
    },
    setTexts: (state, action: PayloadAction<TextElement[]>) => {
      state.texts = action.payload;
    },
    updateText: (state, action: PayloadAction<{ id: string; updates: Partial<TextElement> }>) => {
      const { id, updates } = action.payload;
      const textIndex = state.texts.findIndex(text => text.id === id);
      if (textIndex !== -1) {
        state.texts[textIndex] = { ...state.texts[textIndex], ...updates };
      }
    },
    deleteText: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.texts = state.texts.filter(text => text.id !== id);
      state.selectedItems = state.selectedItems.filter(item => !(item.type === 'text' && item.id === id));
    },
    duplicateText: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const text = state.texts.find(t => t.id === id);
      if (text) {
        const newText: TextElement = {
          ...text,
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: text.x + 20,
          y: text.y + 20,
          content: `${text.content}-copy`
        };
        state.texts.push(newText);
      }
    },

    // Selection actions
    setSelectedItems: (state, action: PayloadAction<SelectionItem[]>) => {
      state.selectedItems = action.payload;
    },
    clearSelection: (state) => {
      state.selectedItems = [];
    },

    // Tool and UI actions
    setActiveTool: (state, action: PayloadAction<ToolType>) => {
      state.activeTool = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.1, Math.min(10, action.payload));
    },
    toggleGrid: (state) => {
      state.gridEnabled = !state.gridEnabled;
    },

    // Drawing state actions
    setDrawingState: (state, action: PayloadAction<SeatingState['drawingState']>) => {
      state.drawingState = action.payload;
    },

    // Bulk delete selected items
    deleteSelected: (state) => {
      state.selectedItems.forEach(item => {
        switch (item.type) {
          case 'seat':
            state.seats = state.seats.filter(seat => seat.id !== item.id);
            break;
          case 'zone':
            state.zones = state.zones.filter(zone => zone.id !== item.id);
            break;
          case 'shape':
            state.shapes = state.shapes.filter(shape => shape.id !== item.id);
            break;
          case 'text':
            state.texts = state.texts.filter(text => text.id !== item.id);
            break;
        }
      });
      state.selectedItems = [];
    }
  }
});

export const {
  addSeats,
  setSeats,
  updateSeat,
  deleteSeat,
  duplicateSeat,
  addZone,
  setZones,
  updateZone,
  deleteZone,
  duplicateZone,
  addShape,
  setShapes,
  updateShape,
  deleteShape,
  duplicateShape,
  addText,
  setTexts,
  updateText,
  deleteText,
  duplicateText,
  setSelectedItems,
  clearSelection,
  setActiveTool,
  setZoom,
  toggleGrid,
  setDrawingState,
  deleteSelected
} = seatingSlice.actions;

export default seatingSlice.reducer;
