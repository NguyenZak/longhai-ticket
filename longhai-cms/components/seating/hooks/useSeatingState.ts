import { useState, useCallback, useRef, useMemo } from 'react';
import { Seat, Zone, Shape, TextElement, ToolType, SelectionItem } from '../types';

interface SeatingState {
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

interface SeatingStateActions {
  addSeats: (seats: Seat[]) => void;
  addZone: (zone: Zone) => void;
  addShape: (shape: Shape) => void;
  addText: (text: TextElement) => void;
  setSeats: (seats: Seat[] | ((prev: Seat[]) => Seat[])) => void;
  setZones: (zones: Zone[] | ((prev: Zone[]) => Zone[])) => void;
  setShapes: (shapes: Shape[] | ((prev: Shape[]) => Shape[])) => void;
  setTexts: (texts: TextElement[] | ((prev: TextElement[]) => TextElement[])) => void;
  setSelectedItems: (items: SelectionItem[]) => void;
  setDrawingState: (state: SeatingState['drawingState']) => void;
  setActiveTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  clearSelection: () => void;
  updateSeat: (id: string, updates: Partial<Seat>) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  updateText: (id: string, updates: Partial<TextElement>) => void;
  deleteSeat: (id: string) => void;
  deleteZone: (id: string) => void;
  deleteShape: (id: string) => void;
  deleteText: (id: string) => void;
  duplicateSeat: (id: string) => void;
  duplicateZone: (id: string) => void;
  duplicateShape: (id: string) => void;
  duplicateText: (id: string) => void;
}

export function useSeatingState(): SeatingState & SeatingStateActions {
  const [state, setState] = useState<SeatingState>({
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
  });

  const addSeats = useCallback((seats: Seat[]) => {
    console.log('addSeats called with', seats);
    setState(prev => {
      const newState = {
        ...prev,
        seats: [...prev.seats, ...seats]
      };
      console.log('addSeats new state', newState);
      return newState;
    });
  }, []);

  const addZone = useCallback((zone: Zone) => {
    setState(prev => ({
      ...prev,
      zones: [...prev.zones, zone]
    }));
  }, []);

  const addShape = useCallback((shape: Shape) => {
    setState(prev => ({
      ...prev,
      shapes: [...prev.shapes, shape]
    }));
  }, []);

  const addText = useCallback((text: TextElement) => {
    setState(prev => ({
      ...prev,
      texts: [...prev.texts, text]
    }));
  }, []);

  const setSelectedItems = useCallback((items: SelectionItem[]) => {
    setState(prev => ({
      ...prev,
      selectedItems: items
    }));
  }, []);

  const setDrawingState = useCallback((drawingState: SeatingState['drawingState']) => {
    setState(prev => ({
      ...prev,
      drawingState
    }));
  }, []);

  const setActiveTool = useMemo(() => (tool: ToolType) => {
    setState(prev => {
      if (prev.activeTool === tool) return prev;
      return {
        ...prev,
        activeTool: tool
      };
    });
  }, []);

  const setZoom = useMemo(() => (zoom: number) => {
    setState(prev => {
      const newZoom = Math.max(0.1, Math.min(10, zoom));
      if (prev.zoom === newZoom) return prev;
      return {
        ...prev,
        zoom: newZoom
      };
    });
  }, []);

  const toggleGrid = useCallback(() => {
    setState(prev => ({
      ...prev,
      gridEnabled: !prev.gridEnabled
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItems: []
    }));
  }, []);

  const updateSeat = useCallback((id: string, updates: Partial<Seat>) => {
    setState(prev => ({
      ...prev,
      seats: prev.seats.map(seat => 
        seat.id === id ? { ...seat, ...updates } : seat
      )
    }));
  }, []);

  const updateZone = useCallback((id: string, updates: Partial<Zone>) => {
    setState(prev => ({
      ...prev,
      zones: prev.zones.map(zone => 
        zone.id === id ? { ...zone, ...updates } : zone
      )
    }));
  }, []);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setState(prev => ({
      ...prev,
      shapes: prev.shapes.map(shape => 
        shape.id === id ? { ...shape, ...updates } : shape
      )
    }));
  }, []);

  const updateText = useCallback((id: string, updates: Partial<TextElement>) => {
    setState(prev => ({
      ...prev,
      texts: prev.texts.map(text => 
        text.id === id ? { ...text, ...updates } : text
      )
    }));
  }, []);

  const deleteSeat = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      seats: prev.seats.filter(seat => seat.id !== id),
      selectedItems: prev.selectedItems.filter(item => !(item.type === 'seat' && item.id === id))
    }));
  }, []);

  const deleteZone = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      zones: prev.zones.filter(zone => zone.id !== id),
      selectedItems: prev.selectedItems.filter(item => !(item.type === 'zone' && item.id === id))
    }));
  }, []);

  const deleteShape = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      shapes: prev.shapes.filter(shape => shape.id !== id),
      selectedItems: prev.selectedItems.filter(item => !(item.type === 'shape' && item.id === id))
    }));
  }, []);

  const deleteText = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      texts: prev.texts.filter(text => text.id !== id),
      selectedItems: prev.selectedItems.filter(item => !(item.type === 'text' && item.id === id))
    }));
  }, []);

  const duplicateSeat = useCallback((id: string) => {
    setState(prev => {
      const seat = prev.seats.find(s => s.id === id);
      if (!seat) return prev;

      const newSeat: Seat = {
        ...seat,
        id: `seat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: seat.x + 20,
        y: seat.y + 20,
        label: `${seat.label}-copy`
      };

      return {
        ...prev,
        seats: [...prev.seats, newSeat]
      };
    });
  }, []);

  const duplicateZone = useCallback((id: string) => {
    setState(prev => {
      const zone = prev.zones.find(z => z.id === id);
      if (!zone) return prev;

      const newZone: Zone = {
        ...zone,
        id: `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: zone.x + 20,
        y: zone.y + 20
      };

      return {
        ...prev,
        zones: [...prev.zones, newZone]
      };
    });
  }, []);

  const duplicateShape = useCallback((id: string) => {
    setState(prev => {
      const shape = prev.shapes.find(s => s.id === id);
      if (!shape) return prev;

      const newShape: Shape = {
        ...shape,
        id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: shape.x ? shape.x + 20 : undefined,
        y: shape.y ? shape.y + 20 : undefined,
        cx: shape.cx ? shape.cx + 20 : undefined,
        cy: shape.cy ? shape.cy + 20 : undefined
      };

      return {
        ...prev,
        shapes: [...prev.shapes, newShape]
      };
    });
  }, []);

  const duplicateText = useCallback((id: string) => {
    setState(prev => {
      const text = prev.texts.find(t => t.id === id);
      if (!text) return prev;

      const newText: TextElement = {
        ...text,
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: text.x + 20,
        y: text.y + 20,
        content: `${text.content}-copy`
      };

      return {
        ...prev,
        texts: [...prev.texts, newText]
      };
    });
  }, []);

  // Add setter functions
  const setSeats = useCallback((seats: Seat[] | ((prev: Seat[]) => Seat[])) => {
    setState(prev => ({
      ...prev,
      seats: typeof seats === 'function' ? seats(prev.seats) : seats
    }));
  }, []);

  const setZones = useCallback((zones: Zone[] | ((prev: Zone[]) => Zone[])) => {
    setState(prev => ({
      ...prev,
      zones: typeof zones === 'function' ? zones(prev.zones) : zones
    }));
  }, []);

  const setShapes = useCallback((shapes: Shape[] | ((prev: Shape[]) => Shape[])) => {
    setState(prev => ({
      ...prev,
      shapes: typeof shapes === 'function' ? shapes(prev.shapes) : shapes
    }));
  }, []);

  const setTexts = useCallback((texts: TextElement[] | ((prev: TextElement[]) => TextElement[])) => {
    setState(prev => ({
      ...prev,
      texts: typeof texts === 'function' ? texts(prev.texts) : texts
    }));
  }, []);

  return {
    ...state,
    addSeats,
    addZone,
    addShape,
    addText,
    setSeats,
    setZones,
    setShapes,
    setTexts,
    setSelectedItems,
    setDrawingState,
    setActiveTool,
    setZoom,
    toggleGrid,
    clearSelection,
    updateSeat,
    updateZone,
    updateShape,
    updateText,
    deleteSeat,
    deleteZone,
    deleteShape,
    deleteText,
    duplicateSeat,
    duplicateZone,
    duplicateShape,
    duplicateText
  };
}