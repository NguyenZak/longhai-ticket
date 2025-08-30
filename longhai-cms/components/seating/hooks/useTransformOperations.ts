import { useState, useCallback } from 'react';
import { Seat, Zone, Shape, TextElement, SelectionItem, Point } from '../types';
import { rotatePoint, scalePoint, distance, angle } from '../utils';

interface TransformState {
  isTransforming: boolean;
  transformType: 'move' | 'rotate' | 'scale' | null;
  transformStart: Point | null;
  transformOrigin: Point | null;
  currentPoint: Point | null;
  originalPositions?: { [id: string]: { x: number; y: number } };
}

interface TransformOperationsOptions {
  seats: Seat[];
  zones: Zone[];
  shapes: Shape[];
  texts: TextElement[];
  selectedItems: SelectionItem[];
  onUpdateSeat: (id: string, updates: Partial<Seat>) => void;
  onUpdateZone: (id: string, updates: Partial<Zone>) => void;
  onUpdateShape: (id: string, updates: Partial<Shape>) => void;
  onUpdateText: (id: string, updates: Partial<TextElement>) => void;
}

export function useTransformOperations(options: TransformOperationsOptions) {
  const {
    seats,
    zones,
    shapes,
    texts,
    selectedItems,
    onUpdateSeat,
    onUpdateZone,
    onUpdateShape,
    onUpdateText
  } = options;

  const [transformState, setTransformState] = useState<TransformState>({
    isTransforming: false,
    transformType: null,
    transformStart: null,
    transformOrigin: null,
    currentPoint: null
  });

  // Calculate selection bounds - matching pretix implementation
  const calculateSelectionBounds = useCallback(() => {
    if (selectedItems.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedItems.forEach(item => {
      if (item.type === 'seat') {
        const seat = seats.find(s => s.id === item.id);
        if (seat) {
          const radius = seat.radius || 10;
          minX = Math.min(minX, seat.x - radius);
          minY = Math.min(minY, seat.y - radius);
          maxX = Math.max(maxX, seat.x + radius);
          maxY = Math.max(maxY, seat.y + radius);
        }
      } else if (item.type === 'zone') {
        const zone = zones.find(z => z.id === item.id);
        if (zone) {
          minX = Math.min(minX, zone.x);
          minY = Math.min(minY, zone.y);
          maxX = Math.max(maxX, zone.x + zone.width);
          maxY = Math.max(maxY, zone.y + zone.height);
        }
      } else if (item.type === 'shape') {
        const shape = shapes.find(s => s.id === item.id);
        if (shape) {
          if (shape.type === 'rectangle' && shape.x !== undefined && shape.y !== undefined && shape.w !== undefined && shape.h !== undefined) {
            minX = Math.min(minX, shape.x);
            minY = Math.min(minY, shape.y);
            maxX = Math.max(maxX, shape.x + shape.w);
            maxY = Math.max(maxY, shape.y + shape.h);
          } else if (shape.type === 'circle' && shape.cx !== undefined && shape.cy !== undefined && shape.r !== undefined) {
            minX = Math.min(minX, shape.cx - shape.r);
            minY = Math.min(minY, shape.cy - shape.r);
            maxX = Math.max(maxX, shape.cx + shape.r);
            maxY = Math.max(maxY, shape.cy + shape.r);
          } else if (shape.type === 'oval' && shape.cx !== undefined && shape.cy !== undefined && shape.rx !== undefined && shape.ry !== undefined) {
            minX = Math.min(minX, shape.cx - shape.rx);
            minY = Math.min(minY, shape.cy - shape.ry);
            maxX = Math.max(maxX, shape.cx + shape.rx);
            maxY = Math.max(maxY, shape.cy + shape.ry);
          }
        }
      } else if (item.type === 'text') {
        const text = texts.find(t => t.id === item.id);
        if (text) {
          const fontSize = text.fontSize || 16;
          const textWidth = (text.content.length * fontSize * 0.6) || 40;
          const textHeight = fontSize * 1.2;
          minX = Math.min(minX, text.x);
          minY = Math.min(minY, text.y - textHeight);
          maxX = Math.max(maxX, text.x + textWidth);
          maxY = Math.max(maxY, text.y);
        }
      }
    });

    if (minX === Infinity) return null;

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      x: minX,
      y: minY,
      width,
      height,
      cx: minX + width / 2,
      cy: minY + height / 2
    };
  }, [selectedItems, seats, zones, shapes, texts]);

  // Start transform operation - matching pretix implementation
  const startTransform = useCallback((type: 'move' | 'rotate' | 'scale', startPoint: Point, origin?: Point) => {
    console.log('Starting transform', { type, startPoint, origin, selectedItems });
    
    // Store original positions for move operations
    let originalPositions: { [id: string]: { x: number; y: number } } = {};
    if (type === 'move') {
      selectedItems.forEach(item => {
        if (item.type === 'seat') {
          const seat = seats.find(s => s.id === item.id);
          if (seat) {
            originalPositions[item.id] = { x: seat.x, y: seat.y };
          }
        }
      });
    }
    
    setTransformState({
      isTransforming: true,
      transformType: type,
      transformStart: startPoint,
      transformOrigin: origin || calculateSelectionBounds() || { x: 0, y: 0 },
      currentPoint: startPoint,
      originalPositions
    });
  }, [calculateSelectionBounds, selectedItems, seats]);

  // Update transform operation - matching pretix implementation
  const updateTransform = useCallback((currentPoint: Point) => {
    if (!transformState.isTransforming || !transformState.transformStart || !transformState.transformOrigin) return;

    setTransformState(prev => ({
      ...prev,
      currentPoint
    }));

    const { transformType, transformStart, transformOrigin } = transformState;

    if (transformType === 'move') {
      // Calculate total movement from original position
      const totalDx = currentPoint.x - transformStart.x;
      const totalDy = currentPoint.y - transformStart.y;

      console.log('Moving seats', { totalDx, totalDy, currentPoint, transformStart });

      selectedItems.forEach(item => {
        if (item.type === 'seat') {
          const originalPos = transformState.originalPositions?.[item.id];
          if (originalPos) {
            const newX = originalPos.x + totalDx;
            const newY = originalPos.y + totalDy;
            
            console.log(`Moving seat ${item.id} from (${originalPos.x}, ${originalPos.y}) to (${newX}, ${newY})`);
            onUpdateSeat(item.id, {
              x: newX,
              y: newY
            });
          }
        } else if (item.type === 'zone') {
          const zone = zones.find(z => z.id === item.id);
          if (zone) {
            onUpdateZone(item.id, {
              x: zone.x + totalDx,
              y: zone.y + totalDy
            });
          }
        } else if (item.type === 'shape') {
          const shape = shapes.find(s => s.id === item.id);
          if (shape) {
            const updates: Partial<Shape> = {};
            if (shape.x !== undefined) updates.x = shape.x + totalDx;
            if (shape.y !== undefined) updates.y = shape.y + totalDy;
            if (shape.cx !== undefined) updates.cx = shape.cx + totalDx;
            if (shape.cy !== undefined) updates.cy = shape.cy + totalDy;
            onUpdateShape(item.id, updates);
          }
        } else if (item.type === 'text') {
          const text = texts.find(t => t.id === item.id);
          if (text) {
            onUpdateText(item.id, {
              x: text.x + totalDx,
              y: text.y + totalDy
            });
          }
        }
      });
    } else if (transformType === 'rotate') {
      const startAngle = angle(transformOrigin, transformStart);
      const currentAngle = angle(transformOrigin, currentPoint);
      const rotationDelta = currentAngle - startAngle;

      selectedItems.forEach(item => {
        if (item.type === 'seat') {
          const seat = seats.find(s => s.id === item.id);
          if (seat) {
            const rotatedPoint = rotatePoint(seat, transformOrigin, rotationDelta);
            onUpdateSeat(item.id, {
              x: rotatedPoint.x,
              y: rotatedPoint.y
            });
          }
        } else if (item.type === 'zone') {
          const zone = zones.find(z => z.id === item.id);
          if (zone) {
            const center = { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 };
            const rotatedCenter = rotatePoint(center, transformOrigin, rotationDelta);
            onUpdateZone(item.id, {
              x: rotatedCenter.x - zone.width / 2,
              y: rotatedCenter.y - zone.height / 2
            });
          }
        } else if (item.type === 'shape') {
          const shape = shapes.find(s => s.id === item.id);
          if (shape) {
            const currentRotation = shape.rotation || 0;
            onUpdateShape(item.id, {
              rotation: currentRotation + rotationDelta
            });
          }
        } else if (item.type === 'text') {
          const text = texts.find(t => t.id === item.id);
          if (text) {
            const currentRotation = text.rotation || 0;
            onUpdateText(item.id, {
              rotation: currentRotation + rotationDelta
            });
          }
        }
      });
    } else if (transformType === 'scale') {
      const startDistance = distance(transformOrigin, transformStart);
      const currentDistance = distance(transformOrigin, currentPoint);
      const scaleFactor = currentDistance / startDistance;

      selectedItems.forEach(item => {
        if (item.type === 'seat') {
          const seat = seats.find(s => s.id === item.id);
          if (seat) {
            const scaledPoint = scalePoint(seat, transformOrigin, scaleFactor, scaleFactor);
            onUpdateSeat(item.id, {
              x: scaledPoint.x,
              y: scaledPoint.y,
              radius: (seat.radius || 10) * scaleFactor
            });
          }
        } else if (item.type === 'zone') {
          const zone = zones.find(z => z.id === item.id);
          if (zone) {
            onUpdateZone(item.id, {
              width: zone.width * scaleFactor,
              height: zone.height * scaleFactor
            });
          }
        } else if (item.type === 'shape') {
          const shape = shapes.find(s => s.id === item.id);
          if (shape) {
            const updates: Partial<Shape> = {};
            if (shape.w !== undefined) updates.w = shape.w * scaleFactor;
            if (shape.h !== undefined) updates.h = shape.h * scaleFactor;
            if (shape.r !== undefined) updates.r = shape.r * scaleFactor;
            if (shape.rx !== undefined) updates.rx = shape.rx * scaleFactor;
            if (shape.ry !== undefined) updates.ry = shape.ry * scaleFactor;
            onUpdateShape(item.id, updates);
          }
        } else if (item.type === 'text') {
          const text = texts.find(t => t.id === item.id);
          if (text) {
            onUpdateText(item.id, {
              fontSize: (text.fontSize || 16) * scaleFactor
            });
          }
        }
      });
    }
  }, [transformState, selectedItems, seats, zones, shapes, texts, onUpdateSeat, onUpdateZone, onUpdateShape, onUpdateText]);

  // End transform operation - matching pretix implementation
  const endTransform = useCallback(() => {
    setTransformState({
      isTransforming: false,
      transformType: null,
      transformStart: null,
      transformOrigin: null,
      currentPoint: null
    });
  }, []);

  // Rotate selection - matching pretix implementation
  const rotate = useCallback((angle: number) => {
    const bounds = calculateSelectionBounds();
    if (!bounds) return;

    const center = { x: bounds.cx, y: bounds.cy };

    selectedItems.forEach(item => {
      if (item.type === 'seat') {
        const seat = seats.find(s => s.id === item.id);
        if (seat) {
          const rotatedPoint = rotatePoint(seat, center, angle);
          onUpdateSeat(item.id, {
            x: rotatedPoint.x,
            y: rotatedPoint.y
          });
        }
      } else if (item.type === 'zone') {
        const zone = zones.find(z => z.id === item.id);
        if (zone) {
          const zoneCenter = { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 };
          const rotatedCenter = rotatePoint(zoneCenter, center, angle);
          onUpdateZone(item.id, {
            x: rotatedCenter.x - zone.width / 2,
            y: rotatedCenter.y - zone.height / 2
          });
        }
      } else if (item.type === 'shape') {
        const shape = shapes.find(s => s.id === item.id);
        if (shape) {
          const currentRotation = shape.rotation || 0;
          onUpdateShape(item.id, {
            rotation: currentRotation + angle
          });
        }
      } else if (item.type === 'text') {
        const text = texts.find(t => t.id === item.id);
        if (text) {
          const currentRotation = text.rotation || 0;
          onUpdateText(item.id, {
            rotation: currentRotation + angle
          });
        }
      }
    });
  }, [selectedItems, seats, zones, shapes, texts, calculateSelectionBounds, onUpdateSeat, onUpdateZone, onUpdateShape, onUpdateText]);

  // Flip selection - matching pretix implementation
  const flip = useCallback((direction: 'horizontal' | 'vertical') => {
    const bounds = calculateSelectionBounds();
    if (!bounds) return;

    const center = { x: bounds.cx, y: bounds.cy };

    selectedItems.forEach(item => {
      if (item.type === 'seat') {
        const seat = seats.find(s => s.id === item.id);
        if (seat) {
          if (direction === 'horizontal') {
            const flippedX = center.x + (center.x - seat.x);
            onUpdateSeat(item.id, { x: flippedX });
          } else {
            const flippedY = center.y + (center.y - seat.y);
            onUpdateSeat(item.id, { y: flippedY });
          }
        }
      } else if (item.type === 'zone') {
        const zone = zones.find(z => z.id === item.id);
        if (zone) {
          if (direction === 'horizontal') {
            const flippedX = center.x + (center.x - zone.x - zone.width);
            onUpdateZone(item.id, { x: flippedX });
          } else {
            const flippedY = center.y + (center.y - zone.y - zone.height);
            onUpdateZone(item.id, { y: flippedY });
          }
        }
      } else if (item.type === 'shape') {
        const shape = shapes.find(s => s.id === item.id);
        if (shape) {
          const updates: Partial<Shape> = {};
          if (direction === 'horizontal') {
            if (shape.x !== undefined) {
              const flippedX = center.x + (center.x - shape.x - (shape.w || 0));
              updates.x = flippedX;
            }
            if (shape.cx !== undefined) {
              const flippedCx = center.x + (center.x - shape.cx);
              updates.cx = flippedCx;
            }
          } else {
            if (shape.y !== undefined) {
              const flippedY = center.y + (center.y - shape.y - (shape.h || 0));
              updates.y = flippedY;
            }
            if (shape.cy !== undefined) {
              const flippedCy = center.y + (center.y - shape.cy);
              updates.cy = flippedCy;
            }
          }
          onUpdateShape(item.id, updates);
        }
      } else if (item.type === 'text') {
        const text = texts.find(t => t.id === item.id);
        if (text) {
          if (direction === 'horizontal') {
            const flippedX = center.x + (center.x - text.x);
            onUpdateText(item.id, { x: flippedX });
          } else {
            const flippedY = center.y + (center.y - text.y);
            onUpdateText(item.id, { y: flippedY });
          }
        }
      }
    });
  }, [selectedItems, seats, zones, shapes, texts, calculateSelectionBounds, onUpdateSeat, onUpdateZone, onUpdateShape, onUpdateText]);

  return {
    isTransforming: transformState.isTransforming,
    transformType: transformState.transformType,
    transformStart: transformState.transformStart,
    transformOrigin: transformState.transformOrigin,
    currentPoint: transformState.currentPoint,
    calculateSelectionBounds,
    startTransform,
    updateTransform,
    endTransform,
    rotate,
    flip
  };
} 