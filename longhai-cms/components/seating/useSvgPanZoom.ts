import { useRef, useState, useCallback, useEffect } from 'react';

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

export function useSvgPanZoom(initialViewBox: ViewBox = { x: 0, y: 0, w: 1000, h: 1000 }) {
  const [viewBox, setViewBox] = useState<ViewBox>(initialViewBox);
  const [isPanning, setIsPanning] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const lastPoint = useRef<Point>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const panStartPoint = useRef<Point>({ x: 0, y: 0 });

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
    return { x: transformedPoint.x, y: transformedPoint.y };
  }, []);

  // Enhanced pan handling - matching pretix behavior
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button or Ctrl/Cmd + left click for panning
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsPanning(true);
      const point = getSvgPoint(e);
      lastPoint.current = point;
      panStartPoint.current = point;
      
      // Update cursor
      if (svgRef.current) {
        svgRef.current.style.cursor = 'grabbing';
      }
    }
  }, [getSvgPoint]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const currentPoint = getSvgPoint(e);
    const dx = currentPoint.x - lastPoint.current.x;
    const dy = currentPoint.y - lastPoint.current.y;
    
    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx,
      y: prev.y - dy,
    }));
    
    lastPoint.current = currentPoint;
  }, [isPanning, getSvgPoint]);

  const onMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      
      // Update cursor
      if (svgRef.current) {
        svgRef.current.style.cursor = 'grab';
      }
    }
  }, [isPanning]);

  // Enhanced zoom handling - matching pretix behavior
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const transformedPoint = pt.matrixTransform(ctm.inverse());
    const zoomPoint = { x: transformedPoint.x, y: transformedPoint.y };
    
    // Calculate zoom factor with smooth scaling
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(10, zoomFactor));
    
    setViewBox(prev => {
      const newW = prev.w * newScale;
      const newH = prev.h * newScale;
      const newX = zoomPoint.x - (zoomPoint.x - prev.x) * newScale;
      const newY = zoomPoint.y - (zoomPoint.y - prev.y) * newScale;
      
      return {
        x: newX,
        y: newY,
        w: newW,
        h: newH,
      };
    });
  }, []);

  // Keyboard shortcuts for zoom - matching pretix
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      setViewBox(prev => {
        const scale = 1.2;
        const centerX = prev.x + prev.w / 2;
        const centerY = prev.y + prev.h / 2;
        const newW = prev.w * scale;
        const newH = prev.h * scale;
        
        return {
          x: centerX - newW / 2,
          y: centerY - newH / 2,
          w: newW,
          h: newH,
        };
      });
    } else if (e.key === '-') {
      e.preventDefault();
      setViewBox(prev => {
        const scale = 0.8;
        const centerX = prev.x + prev.w / 2;
        const centerY = prev.y + prev.h / 2;
        const newW = prev.w * scale;
        const newH = prev.h * scale;
        
        return {
          x: centerX - newW / 2,
          y: centerY - newH / 2,
          w: newW,
          h: newH,
        };
      });
    } else if (e.key === '0') {
      e.preventDefault();
      setViewBox(initialViewBox);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      // Fit to content functionality
      if (svgRef.current) {
        const svg = svgRef.current;
        const bbox = svg.getBBox();
        if (bbox.width > 0 && bbox.height > 0) {
          fitToContent({
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height
          });
        }
      }
    }
  }, [initialViewBox]);

  // Reset zoom to fit content - matching pretix
  const fitToContent = useCallback((contentBounds: { x: number; y: number; width: number; height: number }) => {
    const padding = 50;
    const scaleX = (viewBox.w - padding * 2) / contentBounds.width;
    const scaleY = (viewBox.h - padding * 2) / contentBounds.height;
    const scale = Math.min(scaleX, scaleY, 1);
    
    setViewBox({
      x: contentBounds.x - (viewBox.w - contentBounds.width * scale) / 2,
      y: contentBounds.y - (viewBox.h - contentBounds.height * scale) / 2,
      w: contentBounds.width * scale + padding * 2,
      h: contentBounds.height * scale + padding * 2,
    });
  }, [viewBox.w, viewBox.h]);

  // Event listeners - matching pretix implementation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only zoom on Ctrl/Cmd + wheel or when not over interactive elements
      if (e.ctrlKey || e.metaKey) {
        onWheel(e);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      onKeyDown(e);
    };

    const handleMouseUp = () => {
      onMouseUp();
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onWheel, onKeyDown, onMouseUp]);

  // Update cursor based on state - matching pretix
  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.style.cursor = isPanning ? 'grabbing' : 'grab';
    }
  }, [isPanning]);

  return {
    viewBox,
    setViewBox,
    svgRef,
    isPanning,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    fitToContent,
    getSvgPoint,
  };
} 