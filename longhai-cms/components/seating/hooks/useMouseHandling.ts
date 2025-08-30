import { useRef, useCallback, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface MouseState {
  isDown: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  lastPoint: Point | null;
}

interface MouseHandlingOptions {
  svgRef: React.RefObject<SVGSVGElement>;
  zoom: number;
  offset: Point;
  onMouseDown?: (point: Point, event: React.MouseEvent) => void;
  onMouseMove?: (point: Point, event: React.MouseEvent) => void;
  onMouseUp?: (point: Point, event: React.MouseEvent) => void;
  onDragStart?: (point: Point, event: React.MouseEvent) => void;
  onDragMove?: (point: Point, event: React.MouseEvent) => void;
  onDragEnd?: (point: Point, event: React.MouseEvent) => void;
  onWheel?: (delta: number, point: Point, event: WheelEvent) => void;
  onDoubleClick?: (point: Point, event: React.MouseEvent) => void;
}

export function useMouseHandling(options: MouseHandlingOptions) {
  const {
    svgRef,
    zoom,
    offset,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onDragStart,
    onDragMove,
    onDragEnd,
    onWheel,
    onDoubleClick
  } = options;

  const [mouseState, setMouseState] = useState<MouseState>({
    isDown: false,
    startPoint: null,
    currentPoint: null,
    lastPoint: null
  });

  const dragThreshold = 3; // Minimum distance to start dragging
  const isDragging = useRef(false);

  // Get SVG point from mouse event - matching pretix implementation
  const getSvgPoint = useCallback((e: React.MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    
    const transformedPoint = pt.matrixTransform(ctm.inverse());
    const result = { 
      x: transformedPoint.x, 
      y: transformedPoint.y 
    };
    
    // Debug: check for NaN values
    if (isNaN(result.x) || isNaN(result.y)) {
      console.log('getSvgPoint NaN detected', {
        clientX: e.clientX,
        clientY: e.clientY,
        ctm: ctm,
        transformedPoint: transformedPoint,
        result: result
      });
    }
    
    return result;
  }, [svgRef]);

  // Calculate distance between two points
  const getDistance = useCallback((p1: Point, p2: Point): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Snap point to fixed angles when Shift is held - matching pretix behavior
  const snapToFixedAngles = useCallback((startPoint: Point, currentPoint: Point, shiftKey: boolean): Point => {
    if (!shiftKey) return currentPoint;
    
    const dx = currentPoint.x - startPoint.x;
    const dy = currentPoint.y - startPoint.y;
    const angle = Math.atan2(dy, dx);
    
    // Snap to 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
    const snapAngles = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Find closest snap angle
    let closestAngle = snapAngles[0];
    let minDiff = Math.abs(angle - closestAngle);
    
    for (const snapAngle of snapAngles) {
      const diff = Math.abs(angle - snapAngle);
      if (diff < minDiff) {
        minDiff = diff;
        closestAngle = snapAngle;
      }
    }
    
    // Calculate snapped point
    const snappedX = startPoint.x + distance * Math.cos(closestAngle);
    const snappedY = startPoint.y + distance * Math.sin(closestAngle);
    
    return { x: snappedX, y: snappedY };
  }, []);

  // Handle mouse down - matching pretix behavior
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const point = getSvgPoint(e);
    
    setMouseState({
      isDown: true,
      startPoint: point,
      currentPoint: point,
      lastPoint: point
    });
    
    isDragging.current = false;
    
    onMouseDown?.(point, e);
  }, [getSvgPoint, onMouseDown]);

  // Handle mouse move - matching pretix behavior
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const point = getSvgPoint(e);
    
    // Apply snap to fixed angles if Shift is held and mouse is down (drawing mode)
    const snappedPoint = mouseState.isDown && mouseState.startPoint && e.shiftKey 
      ? snapToFixedAngles(mouseState.startPoint, point, e.shiftKey)
      : point;
    
    // Always update current point for drawing preview
    setMouseState(prev => ({
      ...prev,
      currentPoint: snappedPoint,
      lastPoint: prev.currentPoint
    }));
    
    // Handle dragging only when mouse is down
    if (mouseState.isDown) {
      // Check if we should start dragging
      if (!isDragging.current && mouseState.startPoint) {
        const distance = getDistance(mouseState.startPoint, snappedPoint);
        if (distance > dragThreshold) {
          isDragging.current = true;
          onDragStart?.(snappedPoint, e);
        }
      }
      
      // Handle dragging
      if (isDragging.current) {
        onDragMove?.(snappedPoint, e);
      }
    }
    
    // Always call onMouseMove for drawing preview
    onMouseMove?.(snappedPoint, e);
  }, [mouseState.isDown, mouseState.startPoint, getSvgPoint, getDistance, snapToFixedAngles, onDragStart, onDragMove, onMouseMove]);

  // Handle mouse up - matching pretix behavior
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!mouseState.isDown) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const point = getSvgPoint(e);
    
    // Handle drag end
    if (isDragging.current) {
      onDragEnd?.(point, e);
    }
    
    // Handle mouse up
    onMouseUp?.(point, e);
    
    // Reset state
    setMouseState({
      isDown: false,
      startPoint: null,
      currentPoint: null,
      lastPoint: null
    });
    
    isDragging.current = false;
  }, [mouseState.isDown, getSvgPoint, onDragEnd, onMouseUp]);

  // Handle wheel events - matching pretix behavior
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const transformedPoint = pt.matrixTransform(ctm.inverse());
    const point = { x: transformedPoint.x, y: transformedPoint.y };
    
    onWheel?.(e.deltaY, point, e);
  }, [svgRef, onWheel]);

  // Handle double click - matching pretix behavior
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const point = getSvgPoint(e);
    onDoubleClick?.(point, e);
  }, [getSvgPoint, onDoubleClick]);

  // Get current mouse position
  const getCurrentPoint = useCallback((): Point | null => {
    return mouseState.currentPoint;
  }, [mouseState.currentPoint]);

  // Check if mouse is down
  const isMouseDown = useCallback((): boolean => {
    return mouseState.isDown;
  }, [mouseState.isDown]);

  // Check if dragging
  const isDraggingState = useCallback((): boolean => {
    return isDragging.current;
  }, []);

  // Get drag distance
  const getDragDistance = useCallback((): number => {
    if (!mouseState.startPoint || !mouseState.currentPoint) return 0;
    return getDistance(mouseState.startPoint, mouseState.currentPoint);
  }, [mouseState.startPoint, mouseState.currentPoint, getDistance]);

  // Get drag direction
  const getDragDirection = useCallback((): { x: number; y: number } | null => {
    if (!mouseState.startPoint || !mouseState.currentPoint) return null;
    
    const dx = mouseState.currentPoint.x - mouseState.startPoint.x;
    const dy = mouseState.currentPoint.y - mouseState.startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return null;
    
    return {
      x: dx / distance,
      y: dy / distance
    };
  }, [mouseState.startPoint, mouseState.currentPoint]);

  return {
    mouseState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleDoubleClick,
    getSvgPoint,
    getCurrentPoint,
    isMouseDown,
    isDraggingState,
    getDragDistance,
    getDragDirection
  };
} 