import { useState, useCallback } from 'react';
import { Seat, Point } from '../types';
import { generateSeatsFromLine } from '../utils';

interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  previewSeats: Seat[];
  drawingType: 'row' | 'rows' | 'circle' | 'rectangle' | 'polygon' | null;
}

interface SeatDrawingOptions {
  seatSpacing: number;
  seatRadius: number;
  seatColor: string;
  seatBorderColor: string;
  seatLabelPrefix: string;
  onSeatsCreated: (seats: Seat[]) => void;
}

export function useSeatDrawing(options: SeatDrawingOptions) {
  const {
    seatSpacing = 25,
    seatRadius = 10,
    seatColor = '#ffffff',
    seatBorderColor = '#000000',
    seatLabelPrefix = 'S',
    onSeatsCreated
  } = options;

  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    previewSeats: [],
    drawingType: null
  });

  // Generate seat ID - only numbers, no prefix
  const generateSeatId = useCallback((index: number): string => {
    return `${index + 1}`;
  }, []);

  // Generate seats in a row - matching pretix implementation
  const generateSeatsInRow = useCallback((startPoint: Point, endPoint: Point, spacing: number): Seat[] => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Pretix logic: minimum 2 seats when distance is sufficient, otherwise 1 seat
    let numSeats = Math.floor(distance / spacing);
    if (distance >= spacing && numSeats < 2) {
      numSeats = 2;
    } else if (numSeats < 1) {
      numSeats = 1;
    }
    
    const seats: Seat[] = [];
    for (let i = 0; i < numSeats; i++) {
      // Handle case when numSeats = 1 to avoid division by zero
      const t = numSeats === 1 ? 0 : i / (numSeats - 1);
      const x = startPoint.x + dx * t;
      const y = startPoint.y + dy * t;
      
      seats.push({
        id: generateSeatId(i),
        x,
        y,
        label: generateSeatId(i),
        color: seatColor,
        borderColor: seatBorderColor,
        radius: seatRadius
      });
    }
    
    return seats;
  }, [seatSpacing, seatRadius, seatColor, seatBorderColor, generateSeatId]);

  // Generate seats in a circle - matching pretix implementation
  const generateSeatsInCircle = useCallback((centerPoint: Point, radius: number, numSeats: number, startAngle: number = 0): Seat[] => {
    const seats: Seat[] = [];
    const angleStep = (2 * Math.PI) / numSeats;
    
    for (let i = 0; i < numSeats; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerPoint.x + radius * Math.cos(angle);
      const y = centerPoint.y + radius * Math.sin(angle);
      
      seats.push({
        id: generateSeatId(i),
        x,
        y,
        label: generateSeatId(i),
        color: seatColor,
        borderColor: seatBorderColor,
        radius: seatRadius
      });
    }
    
    return seats;
  }, [seatRadius, seatColor, seatBorderColor, generateSeatId]);

  // Generate seats in a rectangle - matching pretix implementation
  const generateSeatsInRectangle = useCallback((startPoint: Point, endPoint: Point, spacing: number): Seat[] => {
    const x1 = Math.min(startPoint.x, endPoint.x);
    const y1 = Math.min(startPoint.y, endPoint.y);
    const x2 = Math.max(startPoint.x, endPoint.x);
    const y2 = Math.max(startPoint.y, endPoint.y);
    
    const width = x2 - x1;
    const height = y2 - y1;
    const cols = Math.max(1, Math.floor(width / spacing));
    const rows = Math.max(1, Math.floor(height / spacing));
    
    const seats: Seat[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = x1 + (col + 0.5) * spacing;
        const y = y1 + (row + 0.5) * spacing;
        
        // Mỗi hàng bắt đầu đếm từ 1
        const seatNumber = col + 1;
        const seatId = `seat_${row + 1}_${seatNumber}`;
        
        seats.push({
          id: seatId,
          x,
          y,
          label: `${seatNumber}`,
          color: seatColor,
          borderColor: seatBorderColor,
          radius: seatRadius
        });
      }
    }
    
    return seats;
  }, [seatSpacing, seatRadius, seatColor, seatBorderColor]);

  // Start drawing - matching pretix behavior (click to start)
  const startDrawing = useCallback((point: Point, type: 'row' | 'rows' | 'circle' | 'rectangle' | 'polygon') => {
    setDrawingState({
      isDrawing: true,
      startPoint: point,
      currentPoint: point,
      previewSeats: [],
      drawingType: type
    });
  }, []);

  // Update drawing - matching pretix behavior (drag to preview)
  const updateDrawing = useCallback((point: Point) => {
    console.log('updateDrawing called', {
      isDrawing: drawingState.isDrawing,
      startPoint: drawingState.startPoint,
      drawingType: drawingState.drawingType,
      point
    });
    
    if (!drawingState.isDrawing || !drawingState.startPoint || !drawingState.drawingType) {
      console.log('updateDrawing early return');
      return;
    }
    
    setDrawingState(prev => {
      let previewSeats: Seat[] = [];
      
      console.log('updateDrawing generating seats', {
        drawingType: prev.drawingType,
        startPoint: prev.startPoint,
        point
      });
      
      switch (prev.drawingType) {
        case 'row':
          if (prev.startPoint) {
            // Single row logic
            previewSeats = generateSeatsInRow(prev.startPoint, point, seatSpacing);
          }
          break;
        case 'rows':
          if (prev.startPoint) {
            // Sử dụng logic của Rectangle cho Rows & Column
            console.log('Generating seats for rows tool', {
              startPoint: prev.startPoint,
              point,
              seatSpacing
            });
            previewSeats = generateSeatsInRectangle(prev.startPoint, point, seatSpacing);
            console.log('Generated seats for rows:', previewSeats);
          }
          break;
        case 'circle':
          if (prev.startPoint) {
            const radius = Math.sqrt(
              Math.pow(point.x - prev.startPoint.x, 2) + 
              Math.pow(point.y - prev.startPoint.y, 2)
            );
            const numSeats = Math.max(8, Math.floor((2 * Math.PI * radius) / seatSpacing));
            previewSeats = generateSeatsInCircle(prev.startPoint, radius, numSeats);
                    }
          break;
        case 'rectangle':
          if (prev.startPoint) {
            // Use rectangle generator to preview grid like Pretix
            previewSeats = generateSeatsInRectangle(prev.startPoint, point, seatSpacing);
          }
          break;
        case 'polygon':
          // Polygon drawing would be more complex - simplified for now
          previewSeats = [];
          break;
      }
      
      console.log('updateDrawing generated seats', previewSeats);
      
      return {
        ...prev,
        currentPoint: point,
        previewSeats
      };
    });
  }, [drawingState.isDrawing, drawingState.startPoint, drawingState.drawingType, generateSeatsInRow, generateSeatsInCircle, generateSeatsInRectangle, seatSpacing]);

  // Finish drawing - matching pretix behavior (click to finish)
  const finishDrawing = useCallback(() => {
    console.log('finishDrawing called', {
      previewSeatsLength: drawingState.previewSeats.length,
      previewSeats: drawingState.previewSeats,
      drawingType: drawingState.drawingType
    });
    
    // Always try to create seats from current preview, even if not drawing
    if (drawingState.previewSeats.length > 0) {
      // Create the actual seats
      const seats = drawingState.previewSeats.map(seat => ({
        ...seat,
        id: `seat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
      
      console.log('Creating seats from preview:', seats);
      onSeatsCreated(seats);
    } else {
      console.log('No preview seats to create');
    }
    
    // Reset drawing state
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      previewSeats: [],
      drawingType: null
    });
  }, [drawingState.previewSeats, onSeatsCreated]);

  // Cancel drawing - matching pretix behavior
  const cancelDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      previewSeats: [],
      drawingType: null
    });
  }, []);

  // Get drawing preview - matching pretix behavior
  const getDrawingPreview = useCallback((): Seat[] => {
    return drawingState.previewSeats;
  }, [drawingState.previewSeats]);

  // Check if currently drawing
  const isDrawing = useCallback((): boolean => {
    console.log('isDrawing called', drawingState.isDrawing);
    return drawingState.isDrawing;
  }, [drawingState.isDrawing]);

  // Get current drawing type
  const getDrawingType = useCallback((): string | null => {
    return drawingState.drawingType;
  }, [drawingState.drawingType]);

  // Get drawing bounds
  const getDrawingBounds = useCallback((): { x: number; y: number; width: number; height: number } | null => {
    if (!drawingState.startPoint || !drawingState.currentPoint) return null;
    
    const x1 = Math.min(drawingState.startPoint.x, drawingState.currentPoint.x);
    const y1 = Math.min(drawingState.startPoint.y, drawingState.currentPoint.y);
    const x2 = Math.max(drawingState.startPoint.x, drawingState.currentPoint.x);
    const y2 = Math.max(drawingState.startPoint.y, drawingState.currentPoint.y);
    
    return {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1
    };
  }, [drawingState.startPoint, drawingState.currentPoint]);

  // Get drawing center for circle drawing
  const getDrawingCenter = useCallback((): Point | null => {
    return drawingState.startPoint;
  }, [drawingState.startPoint]);

  // Get drawing radius for circle drawing
  const getDrawingRadius = useCallback((): number => {
    if (!drawingState.startPoint || !drawingState.currentPoint) return 0;
    
    const dx = drawingState.currentPoint.x - drawingState.startPoint.x;
    const dy = drawingState.currentPoint.y - drawingState.startPoint.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [drawingState.startPoint, drawingState.currentPoint]);

  return {
    drawingState,
    startDrawing,
    updateDrawing,
    finishDrawing,
    cancelDrawing,
    getDrawingPreview,
    isDrawing,
    getDrawingType,
    getDrawingBounds,
    getDrawingCenter,
    getDrawingRadius,
    generateSeatsInRow,
    generateSeatsInCircle,
    generateSeatsInRectangle
  };
} 