import { useCallback } from 'react';
import { Seat, Shape, Text, SelectionItem } from '../types';

interface UseClipboardOperationsProps {
  selectedItems: SelectionItem[];
  seats: Seat[];
  shapes: Shape[];
  texts: Text[];
  onUpdateSeats?: (seats: Seat[]) => void;
  onUpdateShapes?: (shapes: Shape[]) => void;
  onUpdateTexts?: (texts: Text[]) => void;
  onClearSelection?: () => void;
}

export function useClipboardOperations({
  selectedItems,
  seats,
  shapes,
  texts,
  onUpdateSeats,
  onUpdateShapes,
  onUpdateTexts,
  onClearSelection
}: UseClipboardOperationsProps) {
  
  // Copy selected items to clipboard
  const copyToClipboard = useCallback(() => {
    if (selectedItems.length === 0) return;

    const clipboardData: any = {};

    selectedItems.forEach(item => {
      if (item.type === 'seat') {
        const seat = seats.find(s => s.id === item.id);
        if (seat) {
          if (!clipboardData.seats) clipboardData.seats = [];
          clipboardData.seats.push({ ...seat });
        }
      } else if (item.type === 'shape') {
        const shape = shapes.find(s => s.id === item.id);
        if (shape) {
          if (!clipboardData.shapes) clipboardData.shapes = [];
          clipboardData.shapes.push({ ...shape });
        }
      } else if (item.type === 'text') {
        const text = texts.find(t => t.id === item.id);
        if (text) {
          if (!clipboardData.texts) clipboardData.texts = [];
          clipboardData.texts.push({ ...text });
        }
      }
    });

    // Store in localStorage for persistence
    localStorage.setItem('seating-clipboard', JSON.stringify(clipboardData));
    
    // Also copy to system clipboard if possible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(clipboardData));
    }
  }, [selectedItems, seats, shapes, texts]);

  // Cut selected items (copy and delete)
  const cutToClipboard = useCallback(() => {
    copyToClipboard();
    
    // Delete selected items
    const newSeats = seats.filter(seat => 
      !selectedItems.some(item => item.type === 'seat' && item.id === seat.id)
    );
    const newShapes = shapes.filter(shape => 
      !selectedItems.some(item => item.type === 'shape' && item.id === shape.id)
    );
    const newTexts = texts.filter(text => 
      !selectedItems.some(item => item.type === 'text' && item.id === text.id)
    );

    onUpdateSeats?.(newSeats);
    onUpdateShapes?.(newShapes);
    onUpdateTexts?.(newTexts);
    onClearSelection?.();
  }, [copyToClipboard, selectedItems, seats, shapes, texts, onUpdateSeats, onUpdateShapes, onUpdateTexts, onClearSelection]);

  // Paste from clipboard
  const pasteFromClipboard = useCallback(() => {
    try {
      // Try to get from localStorage first
      const clipboardData = localStorage.getItem('seating-clipboard');
      if (!clipboardData) return;

      const data = JSON.parse(clipboardData);
      const offset = 20; // Offset pasted items by 20px

      if (data.seats && data.seats.length > 0) {
        const newSeats = data.seats.map((seat: Seat) => ({
          ...seat,
          id: `seat-${Date.now()}-${Math.random()}`,
          x: seat.x + offset,
          y: seat.y + offset
        }));
        onUpdateSeats?.([...seats, ...newSeats]);
      }

      if (data.shapes && data.shapes.length > 0) {
        const newShapes = data.shapes.map((shape: Shape) => ({
          ...shape,
          id: `shape-${Date.now()}-${Math.random()}`,
          x: shape.x ? shape.x + offset : undefined,
          y: shape.y ? shape.y + offset : undefined,
          cx: shape.cx ? shape.cx + offset : undefined,
          cy: shape.cy ? shape.cy + offset : undefined
        }));
        onUpdateShapes?.([...shapes, ...newShapes]);
      }

      if (data.texts && data.texts.length > 0) {
        const newTexts = data.texts.map((text: Text) => ({
          ...text,
          id: `text-${Date.now()}-${Math.random()}`,
          x: text.x + offset,
          y: text.y + offset
        }));
        onUpdateTexts?.([...texts, ...newTexts]);
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
    }
  }, [seats, shapes, texts, onUpdateSeats, onUpdateShapes, onUpdateTexts]);

  // Delete selected items
  const deleteSelected = useCallback(() => {
    if (selectedItems.length === 0) return;

    const newSeats = seats.filter(seat => 
      !selectedItems.some(item => item.type === 'seat' && item.id === seat.id)
    );
    const newShapes = shapes.filter(shape => 
      !selectedItems.some(item => item.type === 'shape' && item.id === shape.id)
    );
    const newTexts = texts.filter(text => 
      !selectedItems.some(item => item.type === 'text' && item.id === text.id)
    );

    onUpdateSeats?.(newSeats);
    onUpdateShapes?.(newShapes);
    onUpdateTexts?.(newTexts);
    onClearSelection?.();
  }, [selectedItems, seats, shapes, texts, onUpdateSeats, onUpdateShapes, onUpdateTexts, onClearSelection]);

  // Check if clipboard has data
  const hasClipboardData = useCallback(() => {
    const clipboardData = localStorage.getItem('seating-clipboard');
    if (!clipboardData) return false;
    
    try {
      const data = JSON.parse(clipboardData);
      return data.seats?.length > 0 || data.shapes?.length > 0 || data.texts?.length > 0;
    } catch {
      return false;
    }
  }, []);

  return {
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
    deleteSelected,
    hasClipboardData
  };
} 