import { Seat, Point, Zone, Shape, TextElement } from './types';

// Coordinate transformation utilities - matching pretix implementation
export function getSvgPoint(e: React.MouseEvent, svgElement: SVGSVGElement): Point {
  const rect = svgElement.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Transform screen coordinates to SVG coordinates
  const pt = svgElement.createSVGPoint();
  pt.x = x;
  pt.y = y;
  
  const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

export function snapPoint(point: Point, gridSize: number = 10): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}

// Seat generation utilities - matching pretix implementation
export function generateSeatsFromLine(
  startPoint: Point,
  endPoint: Point,
  seatSpacing: number = 25,
  seatRadius: number = 10,
  seatLabelPrefix: string = 'S',
  startIndex: number = 1
): Seat[] {
  const seats: Seat[] = [];
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const numSeats = Math.floor(distance / seatSpacing);
  
  for (let i = 0; i < numSeats; i++) {
    const t = i / (numSeats - 1);
    const x = startPoint.x + dx * t;
    const y = startPoint.y + dy * t;
    
    seats.push({
      id: `seat-${Date.now()}-${i}`,
      x,
      y,
      label: `${seatLabelPrefix}${startIndex + i}`,
      radius: seatRadius,
      color: '#ffffff',
      borderColor: '#000000'
    });
  }
  
  return seats;
}

export function generateSeatsInRectangle(
  topLeft: Point,
  bottomRight: Point,
  seatSpacing: number = 25,
  seatRadius: number = 10,
  seatLabelPrefix: string = 'S',
  startIndex: number = 1
): Seat[] {
  const seats: Seat[] = [];
  const width = bottomRight.x - topLeft.x;
  const height = bottomRight.y - topLeft.y;
  
  const cols = Math.floor(width / seatSpacing);
  const rows = Math.floor(height / seatSpacing);
  
  let seatIndex = startIndex;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = topLeft.x + col * seatSpacing + seatSpacing / 2;
      const y = topLeft.y + row * seatSpacing + seatSpacing / 2;
      
      seats.push({
        id: `seat-${Date.now()}-${seatIndex}`,
        x,
        y,
        label: `${seatLabelPrefix}${seatIndex}`,
        radius: seatRadius,
        color: '#ffffff',
        borderColor: '#000000'
      });
      
      seatIndex++;
    }
  }
  
  return seats;
}

export function generateSeatsInCircle(
  center: Point,
  radius: number,
  seatSpacing: number = 25,
  seatRadius: number = 10,
  seatLabelPrefix: string = 'S',
  startIndex: number = 1
): Seat[] {
  const seats: Seat[] = [];
  const circumference = 2 * Math.PI * radius;
  const numSeats = Math.floor(circumference / seatSpacing);
  
  for (let i = 0; i < numSeats; i++) {
    const angle = (2 * Math.PI * i) / numSeats;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    
    seats.push({
      id: `seat-${Date.now()}-${startIndex + i}`,
      x,
      y,
      label: `${seatLabelPrefix}${startIndex + i}`,
      radius: seatRadius,
      color: '#ffffff',
      borderColor: '#000000'
    });
  }
  
  return seats;
}

export function generateSeatsInRow(
  startPoint: Point,
  direction: 'horizontal' | 'vertical',
  count: number,
  seatSpacing: number = 25,
  seatRadius: number = 10,
  seatLabelPrefix: string = 'S',
  startIndex: number = 1
): Seat[] {
  const seats: Seat[] = [];
  
  for (let i = 0; i < count; i++) {
    const x = direction === 'horizontal' 
      ? startPoint.x + i * seatSpacing 
      : startPoint.x;
    const y = direction === 'vertical' 
      ? startPoint.y + i * seatSpacing 
      : startPoint.y;
    
    seats.push({
      id: `seat-${Date.now()}-${startIndex + i}`,
      x,
      y,
      label: `${seatLabelPrefix}${startIndex + i}`,
      radius: seatRadius,
      color: '#ffffff',
      borderColor: '#000000'
    });
  }
  
  return seats;
}

// Selection utilities - matching pretix implementation
export function getSelectionBounds(items: (Seat | Zone | Shape | TextElement)[]): {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
} | null {
  if (items.length === 0) return null;
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  items.forEach(item => {
    if ('x' in item && 'y' in item && typeof item.x === 'number' && typeof item.y === 'number') {
      const itemX = item.x;
      const itemY = item.y;
      const itemWidth = 'width' in item && typeof item.width === 'number' ? item.width : 0;
      const itemHeight = 'height' in item && typeof item.height === 'number' ? item.height : 0;
      const itemRadius = 'radius' in item && typeof item.radius === 'number' ? item.radius : 0;
      
      if (itemRadius) {
        minX = Math.min(minX, itemX - itemRadius);
        minY = Math.min(minY, itemY - itemRadius);
        maxX = Math.max(maxX, itemX + itemRadius);
        maxY = Math.max(maxY, itemY + itemRadius);
      } else {
        minX = Math.min(minX, itemX);
        minY = Math.min(minY, itemY);
        maxX = Math.max(maxX, itemX + itemWidth);
        maxY = Math.max(maxY, itemY + itemHeight);
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
}

// Transform utilities - matching pretix implementation
export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

export function scalePoint(point: Point, center: Point, scaleX: number, scaleY: number): Point {
  return {
    x: center.x + (point.x - center.x) * scaleX,
    y: center.y + (point.y - center.y) * scaleY
  };
}

// Distance calculation - matching pretix implementation
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Angle calculation - matching pretix implementation
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

// Color utilities - matching pretix implementation
export function generateSeatColor(index: number): string {
  const colors = [
    '#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0',
    '#ffebee', '#e3f2fd', '#e8f5e8', '#fff3e0',
    '#fce4ec', '#f3e5f5', '#e0f2f1', '#fff8e1'
  ];
  return colors[index % colors.length];
}

export function generateZoneColor(index: number): string {
  const colors = [
    '#2196f3', '#4caf50', '#ff9800', '#f44336',
    '#9c27b0', '#00bcd4', '#8bc34a', '#ff5722',
    '#673ab7', '#009688', '#cddc39', '#795548'
  ];
  return colors[index % colors.length];
}

// Validation utilities - matching pretix implementation
export function isValidSeatPosition(x: number, y: number, existingSeats: Seat[], minDistance: number = 20): boolean {
  return !existingSeats.some(seat => {
    const dist = distance({ x, y }, { x: seat.x, y: seat.y });
    return dist < minDistance;
  });
}

export function validateSeatLabel(label: string, existingSeats: Seat[]): boolean {
  return !existingSeats.some(seat => seat.label === label);
}

// Export utilities - matching pretix implementation
export function exportSeatingData(seats: Seat[], zones: Zone[], shapes: Shape[], texts: TextElement[]): string {
  const data = {
    seats,
    zones,
    shapes,
    texts,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(data, null, 2);
}

export function importSeatingData(data: string): {
  seats: Seat[];
  zones: Zone[];
  shapes: Shape[];
  texts: TextElement[];
} {
  try {
    const parsed = JSON.parse(data);
    return {
      seats: parsed.seats || [],
      zones: parsed.zones || [],
      shapes: parsed.shapes || [],
      texts: parsed.texts || []
    };
  } catch (error) {
    console.error('Failed to import seating data:', error);
    return { seats: [], zones: [], shapes: [], texts: [] };
  }
}