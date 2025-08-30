import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSvgPanZoom } from './useSvgPanZoom';

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CanvasAreaProps {
  width?: number;
  height?: number;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  gridEnabled?: boolean;
  children?: React.ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onWheel?: (e: WheelEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  statusBarContent?: React.ReactNode;
  className?: string;
  svgRef?: React.RefObject<SVGSVGElement>;
  viewBox?: ViewBox;
}

export default function CanvasArea({
  width = 800,
  height = 800,
  zoom = 1,
  onZoomChange,
  gridEnabled = true,
  children,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onDoubleClick,
  onKeyDown,
  statusBarContent,
  className = '',
  svgRef: externalSvgRef,
  viewBox: externalViewBox
}: CanvasAreaProps) {
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Pan zoom state
  const initialViewBox = { x: 0, y: 0, w: width, h: height };
  const { 
    viewBox: internalViewBox, 
    setViewBox, 
    onMouseDown: panDown, 
    onMouseMove: panMove, 
    onMouseUp: panUp, 
    onWheelNative 
  } = useSvgPanZoom(initialViewBox);

  const viewBox = externalViewBox || internalViewBox;

  // Calculate transform
  const scale = (100 / viewBox.w) * zoom;
  const translate = {
    x: 0 - viewBox.x * scale,
    y: 0 - viewBox.y * scale,
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default to avoid text selection
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      panDown(e);
    } else {
      onMouseDown?.(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Prevent default to avoid text selection
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      panMove(e);
    } else {
      onMouseMove?.(e);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Prevent default to avoid text selection
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      panUp();
    } else {
      onMouseUp?.(e);
    }
  };

  // Handle wheel for zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (onWheel) {
          onWheel(e);
        } else {
          onWheelNative(e);
        }
      }
    };
    
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [onWheel, onWheelNative, svgRef]);

  // Get SVG point from mouse event
  const getSvgPoint = useCallback((e: React.MouseEvent) => {
    const x = (e.nativeEvent.offsetX - translate.x) / scale;
    const y = (e.nativeEvent.offsetY - translate.y) / scale;
    return { x, y };
  }, [translate, scale]);

  // Alternative method using SVG point transformation
  const getSvgPointFromEvent = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (ctm) {
      const svgP = pt.matrixTransform(ctm.inverse());
      return { x: svgP.x, y: svgP.y };
    }
    return { x: 0, y: 0 };
  }, [svgRef]);

  return (
    <div className={`app-canvas-area ${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 'auto 1 1', 
      background: '#333',
      height: '100%',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }}>
      {/* App Canvas */}
      <div className="app-canvas" style={{ 
        flex: 'auto 1 1', 
        height: 'calc(100% - 24px)',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}>
        <div className="c-plan" style={{ 
          width: '100%', 
          height: '100%', 
          background: '#333',
          position: 'relative',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            preserveAspectRatio="none"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            style={{ 
              WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
              display: 'block',
              width: '100%',
              height: '100%',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={onDoubleClick}
            tabIndex={0}
            onKeyDown={onKeyDown}
          >
            {/* Grid patterns */}
            <defs>
              <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ddd" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#smallGrid)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#ccc" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Background */}
            <rect 
              width={width} 
              height={height} 
              fill="#fcfcfc" 
              cursor="crosshair"
              style={{ pointerEvents: 'auto' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onMouseDown?.(e);
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                onMouseMove?.(e);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                onMouseUp?.(e);
              }}
            />
            
            {/* Grid */}
            {gridEnabled && (
              <rect 
                width={width} 
                height={height} 
                fill="url(#grid)" 
                cursor="crosshair"
                style={{ pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onMouseDown?.(e);
                }}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  onMouseMove?.(e);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  onMouseUp?.(e);
                }}
              />
            )}

            {/* Content */}
            {children}
          </svg>
        </div>
      </div>

      {/* App Status Bar */}
      <div className="app-status-bar" style={{ 
        overflow: 'hidden', 
        width: '100%', 
        flexShrink: 0, 
        flexGrow: 0, 
        flexBasis: '24px', 
        height: '24px', 
        background: '#fff', 
        borderTop: '1px solid #ddd', 
        color: '#888', 
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px'
      }}>
        <div className="c-status-bar" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {statusBarContent || <span className="hint">Ready</span>}
        </div>
      </div>
    </div>
  );
}