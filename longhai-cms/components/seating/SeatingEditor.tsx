import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import CanvasArea from './CanvasArea';
import SelectionHandles from './SelectionHandles';
import TransformPreview from './TransformPreview';
import DrawingPreview from './DrawingPreview';
import { useSeatingRedux } from './hooks/useSeatingRedux';
import { useTransformOperations } from './hooks/useTransformOperations';
import { useMouseHandling } from './hooks/useMouseHandling';

import { useSeatDrawing } from './hooks/useSeatDrawing';
import { useDrawingTools } from './hooks/useDrawingTools';
import { useSvgPanZoom } from './useSvgPanZoom';
import { 
  Seat, 
  Zone, 
  Shape, 
  TextElement, 
  ToolType, 
  SeatingEditorProps,
  SelectionItem,
  Point
} from './types';
import { 
  snapPoint, 
  getSvgPoint, 
  generateSeatsFromLine, 
  generateSeatsInRectangle,
  generateSeatsInCircle,
  generateSeatsInRow
} from './utils';

export default function SeatingEditor({
  width = 800,
  height = 800,
  zoom = 1,
  onZoomChange,
  gridEnabled = true,
  onSeatClick,
  onZoneClick,
  selectedSeats = [],
  selectedZones = [],
  onSelectionChange,
  activeTool = 'select',
  onToolChange,
  statusBarContent,
  onStateChange
}: SeatingEditorProps) {
  const {
    seats: stateSeats,
    zones: stateZones,
    shapes: stateShapes,
    texts: stateTexts,
    selectedItems: stateSelectedItems,
    activeTool: stateActiveTool,
    zoom: stateZoom,
    gridEnabled: stateGridEnabled,
    addSeats,
    addZone,
    addShape,
    addText,
    setSelectedItems,
    setActiveTool,
    setZoom,
    toggleGrid,
    clearSelection,
    updateSeat,
    updateZone,
    updateShape,
    updateText,
    setSeats,
    setZones,
    setShapes,
    setTexts
  } = useSeatingRedux();

  // SVG Pan and Zoom - matching pretix implementation
  const {
    viewBox,
    setViewBox,
    svgRef,
    isPanning,
    onMouseMove: onPanMouseMove,
    onMouseUp: onPanMouseUp,
    onMouseDown: onPanMouseDown,
    fitToContent,
    getSvgPoint: getPanSvgPoint
  } = useSvgPanZoom();

  // Convert selected IDs to SelectionItem format and update state
  const selectedItems: SelectionItem[] = useMemo(() => [
    ...selectedSeats.map(id => ({ id, type: 'seat' as const })),
    ...stateSelectedItems.filter(item => item.type !== 'seat') // Keep non-seat selections
  ], [selectedSeats, stateSelectedItems]);

  // Wrapper function to handle selection changes
  const handleSelectionChange = useCallback((newSelectedSeats: string[], newSelectedZones: string[]) => {
    const newSelectedItems = [
      ...newSelectedSeats.map(id => ({ id, type: 'seat' as const })),
      ...stateSelectedItems.filter(item => item.type !== 'seat') // Keep non-seat selections
    ];
    setSelectedItems(newSelectedItems);
    onSelectionChange?.(newSelectedSeats, newSelectedZones);
  }, [stateSelectedItems, setSelectedItems, onSelectionChange]);



  // Track previous values to avoid infinite loops
  const prevActiveTool = useRef(activeTool);
  const prevZoom = useRef(zoom);

  // Update state when props change (only when actually different)
  useEffect(() => {
    if (activeTool !== prevActiveTool.current) {
      setActiveTool(activeTool);
      prevActiveTool.current = activeTool;
    }
  }, [activeTool]);

  useEffect(() => {
    if (zoom !== prevZoom.current) {
      setZoom(zoom);
      prevZoom.current = zoom;
    }
  }, [zoom]);

  // Notify parent when internal state changes (only when actually different)
  useEffect(() => {
    if (stateActiveTool !== prevActiveTool.current) {
      onToolChange?.(stateActiveTool);
      prevActiveTool.current = stateActiveTool;
    }
  }, [stateActiveTool, onToolChange]);

  useEffect(() => {
    if (stateZoom !== prevZoom.current) {
      onZoomChange?.(stateZoom);
      prevZoom.current = stateZoom;
    }
  }, [stateZoom, onZoomChange]);

  // Notify parent when state changes
  useEffect(() => {
    onStateChange?.({
      seats: stateSeats,
      zones: stateZones,
      shapes: stateShapes,
      texts: stateTexts
    });
  }, [stateSeats, stateZones, stateShapes, stateTexts, onStateChange]);

  // Transform operations - matching pretix implementation
  const {
    isTransforming,
    transformType,
    transformStart,
    transformOrigin,
    startTransform,
    updateTransform,
    endTransform,
    rotate,
    flip,
    calculateSelectionBounds
  } = useTransformOperations({
    seats: stateSeats,
    zones: stateZones,
    shapes: stateShapes,
    texts: stateTexts,
    selectedItems,
    onUpdateSeat: updateSeat,
    onUpdateZone: updateZone,
    onUpdateShape: updateShape,
    onUpdateText: updateText
  });

  // Multi-row state (giống pretix)
  // Local state for row options - removed since Rows & Column now uses Rectangle logic

  // Seat drawing functionality - matching pretix implementation
  const {
    drawingState,
    startDrawing, 
    updateDrawing,
    finishDrawing,
    cancelDrawing,
    getDrawingPreview,
    isDrawing,
    getDrawingType
  } = useSeatDrawing({
    seatSpacing: 25,
    seatRadius: 10,
    seatColor: '#ffffff',
    seatBorderColor: '#000000',
    seatLabelPrefix: 'S',
    onSeatsCreated: (seats) => {
      console.log('onSeatsCreated called', seats);
      addSeats(seats);
    }
  });

  // Shape drawing functionality
  const {
    isDrawing: isDrawingShape,
    startDrawing: startDrawingShape,
    updateDrawing: updateDrawingShape,
    finishDrawing: finishDrawingShape,
    cancelDrawing: cancelDrawingShape,
    getDrawingPreview: getShapeDrawingPreview
  } = useDrawingTools({
    activeTool: stateActiveTool,
    onAddShape: (shape) => {
      console.log('Adding shape:', shape);
      addShape(shape);
      // Select the new shape
      setSelectedItems([{ id: shape.id, type: 'shape' }]);
    }
  });

  // Local state for selection - matching pretix behavior
  const [localSelection, setLocalSelection] = useState({
    isSelecting: false,
    startPoint: null as Point | null,
    currentPoint: null as Point | null
  });

  // Zone drawing local state (Pretix-like)
  const [isZoneDrawing, setIsZoneDrawing] = useState(false);
  const [zoneStart, setZoneStart] = useState<Point | null>(null);
  const [zoneCurrent, setZoneCurrent] = useState<Point | null>(null);

  // Mouse handling - matching pretix implementation
  const {
    mouseState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    getSvgPoint,
    isDraggingState
  } = useMouseHandling({
    svgRef,
    zoom: stateZoom,
    offset: { x: 0, y: 0 },
    onMouseDown: (point, event) => {
      // Handle panning - matching pretix behavior
      if (event.button === 1 || (event.button === 0 && (event.ctrlKey || event.metaKey))) {
        onPanMouseDown(event);
        return;
      }

      // Handle tool-specific actions - matching pretix behavior
      if (stateActiveTool === 'select') {
        // Check if clicking on a seat
        const clickedSeat = stateSeats.find(s => 
          Math.abs(s.x - point.x) < 15 && 
          Math.abs(s.y - point.y) < 15
        );
        
        if (clickedSeat) {
          // Check if clicking on already selected seat
          const isSelected = selectedSeats.includes(clickedSeat.id);
          
          if (isSelected) {
            // Clicked on selected seat - don't start moving yet, wait for drag
            // The move will start in onMouseMove when dragging
          } else {
            // Clicked on unselected seat - handle selection
            if (event.ctrlKey || event.metaKey) {
              // Multi-select: toggle selection
              handleSelectionChange([...selectedSeats, clickedSeat.id], []);
            } else {
              // Single select: replace selection
              handleSelectionChange([clickedSeat.id], []);
            }
          }
        } else {
          // Clicked on empty space - start selection rectangle
      setLocalSelection({
        isSelecting: true,
            startPoint: point,
            currentPoint: point
          });
        }
      } else if (stateActiveTool === 'row' || stateActiveTool === 'rows' || stateActiveTool === 'rectangle') {
        // Start drawing at first click - matching pretix behavior
        console.log('Starting drawing with tool:', stateActiveTool);
        startDrawing(point, stateActiveTool);
      } else if (stateActiveTool === 'zone') {
        // Start zone drawing
        setIsZoneDrawing(true);
        setZoneStart(point);
        setZoneCurrent(point);
      } else if (stateActiveTool === 'circle' || stateActiveTool === 'oval' || stateActiveTool === 'polygon') {
        // Start shape drawing
        console.log('Starting shape drawing with tool:', stateActiveTool);
        startDrawingShape(point);
      } else if (stateActiveTool === 'text') {
        // Add text at click point
        console.log('Adding text at point:', point);
        const newText: TextElement = {
          id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: point.x,
          y: point.y,
          content: 'Text mới',
          color: '#1976d2',
          rotation: 0,
          fontSize: 16,
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
          textAlign: 'left'
        };
        addText(newText);
        // Select the new text
        setSelectedItems([{ id: newText.id, type: 'text' }]);
      }
    },
    onMouseMove: (point, event) => {
      // Handle panning - matching pretix behavior
      if (isPanning) {
        onPanMouseMove(event);
        return;
      }

      // Handle transforming - matching pretix behavior
    if (isTransforming) {
        updateTransform(point);
      return;
    }
    
      // Start moving if dragging selected seats
      if (stateActiveTool === 'select' && selectedSeats.length > 0 && mouseState.isDown) {
        // Check if we're dragging a selected seat
        const draggedSeat = selectedSeats.find(seatId => {
          const seat = stateSeats.find(s => s.id === seatId);
          if (!seat) return false;
          const distance = Math.sqrt(
            Math.pow(seat.x - mouseState.startPoint!.x, 2) + 
            Math.pow(seat.y - mouseState.startPoint!.y, 2)
          );
          return distance < 15;
        });

        if (draggedSeat && !isTransforming) {
          // Start moving all selected seats
          const bounds = calculateSelectionBounds();
          if (bounds) {
            console.log('Starting move for selected seats');
            startTransform('move', mouseState.startPoint!, bounds);
          }
          return;
        }
      }

      // Handle selection - matching pretix behavior
      if (stateActiveTool === 'select' && localSelection.isSelecting && localSelection.startPoint) {
      setLocalSelection(prev => ({
        ...prev,
          currentPoint: point
      }));
    }

      // Handle drawing preview - only update when actually drawing
      if (isDrawing()) {
        updateDrawing(point);
      }
      
      // Handle shape drawing preview
      if (isDrawingShape) {
        updateDrawingShape(point);
      }
    },
    onMouseUp: (point, event) => {
      // Handle panning - matching pretix behavior
      if (isPanning) {
        onPanMouseUp();
        return;
      }

      // Handle transforming - matching pretix behavior
    if (isTransforming) {
        console.log('Ending transform on mouse up');
      endTransform();
      return;
    }
    
            // Handle selection - matching pretix behavior
      if (stateActiveTool === 'select' && localSelection.isSelecting && localSelection.startPoint && localSelection.currentPoint) {
        // Calculate selection rectangle - matching pretix behavior
      const x0 = Math.min(localSelection.startPoint.x, localSelection.currentPoint.x);
      const y0 = Math.min(localSelection.startPoint.y, localSelection.currentPoint.y);
      const x1 = Math.max(localSelection.startPoint.x, localSelection.currentPoint.x);
      const y1 = Math.max(localSelection.startPoint.y, localSelection.currentPoint.y);
      
        // Check if it's a single click (no drag)
        const distance = Math.sqrt(
          Math.pow(localSelection.currentPoint.x - localSelection.startPoint!.x, 2) +
          Math.pow(localSelection.currentPoint.y - localSelection.startPoint!.y, 2)
        );
        
        if (distance < 5) {
          // Single click on empty space - clear selection
          handleSelectionChange([], []);
        } else {
          // Drag selection - select all seats in rectangle
          const selectedSeatIds = stateSeats.filter(s => 
        s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1
      ).map(s => s.id);
      
          // Apply modifier key behavior
          if (event.ctrlKey || event.metaKey) {
            // Add to existing selection
            const newSelection = [...selectedSeats, ...selectedSeatIds];
            const uniqueSelection = Array.from(new Set(newSelection));
            handleSelectionChange(uniqueSelection, []);
          } else {
            // Replace selection
      handleSelectionChange(selectedSeatIds, []);
          }
        }
      
      setLocalSelection({
        isSelecting: false,
        startPoint: null,
        currentPoint: null
      });
      }

      // Handle drawing - finish drawing on mouse up
      if (stateActiveTool === 'row' || stateActiveTool === 'rows' || stateActiveTool === 'circle' || stateActiveTool === 'rectangle') {
        // Always finish drawing for drawing tools
        finishDrawing();
      }
      
      // Handle zone drawing finish
      if (stateActiveTool === 'zone' && isZoneDrawing && zoneStart && zoneCurrent) {
        const x1 = Math.min(zoneStart.x, zoneCurrent.x);
        const y1 = Math.min(zoneStart.y, zoneCurrent.y);
        const x2 = Math.max(zoneStart.x, zoneCurrent.x);
        const y2 = Math.max(zoneStart.y, zoneCurrent.y);
        const newZone = {
          id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
          label: 'Zone',
          color: '#666666',
          opacity: 0.5
        } as Zone;
        addZone(newZone);
        setIsZoneDrawing(false);
        setZoneStart(null);
        setZoneCurrent(null);
      }

      // Handle shape drawing - finish shape drawing on mouse up
      if (stateActiveTool === 'circle' || stateActiveTool === 'oval' || stateActiveTool === 'polygon') {
        // Always finish shape drawing for shape tools
        finishDrawingShape();
      }
    },
    onWheel: (delta, point, event) => {
      // Handle zoom
      // - Mouse wheel: delta > 0 => zoom in, delta < 0 => zoom out (Pretix-like)
      // - Trackpad pinch (ctrlKey true on many browsers): invert mapping so
      //   pinch-out (delta < 0) => zoom in, pinch-in (delta > 0) => zoom out
      const isPinchGesture = (event as any)?.ctrlKey === true;
      const scale = isPinchGesture
        ? (delta > 0 ? 0.9 : 1.1)
        : (delta > 0 ? 1.1 : 0.9);
      const newZoom = Math.max(0.1, Math.min(10, stateZoom * scale));
      onZoomChange?.(newZoom);
    }
  });

  // Handle selection handle events - matching pretix behavior
  const handleResizeStart = useCallback((corner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const pt = getSvgPoint(e);
    startTransform('scale', pt);
  }, [startTransform, getSvgPoint]);

  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const pt = getSvgPoint(e);
    const bounds = calculateSelectionBounds();
    if (bounds) {
      startTransform('rotate', pt, { x: bounds.cx, y: bounds.cy });
    }
  }, [startTransform, calculateSelectionBounds, getSvgPoint]);

  const handleMoveStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const pt = getSvgPoint(e);
    startTransform('move', pt);
  }, [startTransform, getSvgPoint]);

  // Render zones - matching pretix implementation
  const renderZones = () => {
    return stateZones.map(zone => (
      <g key={zone.id} className="zone" transform={`translate(${zone.x}, ${zone.y})`}>
        <rect
          width={zone.width}
          height={zone.height}
          fill="none"
          stroke={zone.color || "#666"}
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity={zone.opacity || 0.5}
          onClick={(e) => {
            e.stopPropagation();
            onZoneClick?.(zone);
          }}
        />
      </g>
    ));
  };

  // Render individual seats - matching pretix implementation
  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.id);
    
    return (
      <g key={seat.id} className={`seat ${isSelected ? 'selected movable' : ''}`}>
        <circle
          fill={seat.color || "#ffffff"}
          cx={seat.x}
          cy={seat.y}
          r={seat.radius || 10}
          stroke={seat.borderColor || "#000"}
          strokeWidth="1px"
          onClick={(e) => {
            e.stopPropagation();
            onSeatClick?.(seat);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
          }}
        />
        <text
          fill="#666666"
          x={seat.x}
          y={seat.y}
          textAnchor="middle"
          fontSize="10px"
          fontFamily="sans-serif"
          dy=".3em"
          style={{ pointerEvents: 'none' }}
        >
          {seat.label}
        </text>
      </g>
    );
  };

  // Render selection rectangle - matching pretix implementation
  const renderSelectionRectangle = () => {
    if (stateActiveTool === 'select' && localSelection.isSelecting && localSelection.startPoint && localSelection.currentPoint) {
      const x = Math.min(localSelection.startPoint.x, localSelection.currentPoint.x);
      const y = Math.min(localSelection.startPoint.y, localSelection.currentPoint.y);
      const width = Math.abs(localSelection.currentPoint.x - localSelection.startPoint.x);
      const height = Math.abs(localSelection.currentPoint.y - localSelection.startPoint.y);
      
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          className="selection-area"
          style={{ pointerEvents: 'none' }}
        />
      );
    }
    return null;
  };

  // Render zone preview while dragging
  const renderZonePreview = () => {
    if (stateActiveTool === 'zone' && isZoneDrawing && zoneStart && zoneCurrent) {
      const x = Math.min(zoneStart.x, zoneCurrent.x);
      const y = Math.min(zoneStart.y, zoneCurrent.y);
      const width = Math.abs(zoneCurrent.x - zoneStart.x);
      const height = Math.abs(zoneCurrent.y - zoneStart.y);
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(102,102,102,0.1)"
          stroke="#666"
          strokeWidth={1}
          strokeDasharray="5,5"
          style={{ pointerEvents: 'none' }}
        />
      );
    }
    return null;
  };

  // Render drawing preview - matching pretix implementation
  const renderDrawingPreview = () => {
    const previewSeats = getDrawingPreview();
    if (isDrawing() && previewSeats.length > 0) {
      return previewSeats.map(seat => {
        // Check for NaN values and skip rendering if found
        if (isNaN(seat.x) || isNaN(seat.y)) {
          return null;
        }
        
        return (
          <g key={seat.id} className="seat-preview">
          <circle
            fill="rgba(25, 118, 210, 0.3)"
            cx={seat.x}
            cy={seat.y}
              r={seat.radius || 10}
            stroke="rgba(25, 118, 210, 0.8)"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          <text
            fill="rgba(25, 118, 210, 0.8)"
            x={seat.x}
            y={seat.y}
            textAnchor="middle"
            fontSize="10px"
            fontFamily="sans-serif"
            dy=".3em"
            style={{ pointerEvents: 'none' }}
          >
            {seat.label}
          </text>
        </g>
        );
      }).filter(Boolean); // Remove null elements
    }
    return null;
  };

  // Xoá hàm renderRowColLabels và mọi chỗ gọi hàm này trong SVG

  // Get selection boundary for handles
  const selectionBoundary = calculateSelectionBounds();

  // Status bar content - matching pretix implementation
  const getStatusBarContent = () => {
    if (isTransforming) {
      return (
        <span>
          <span className="hint">
            {transformType === 'move' && 'Moving selection. Release to finish.'}
            {transformType === 'rotate' && 'Rotating selection. Release to finish.'}
            {transformType === 'scale' && 'Scaling selection. Release to finish.'}
          </span>
        </span>
      );
    }
    
    if (isDrawing()) {
      return (
        <span>
          <span className="hint">
            Drawing {getDrawingType()}. Click to finish.
          </span>
        </span>
      );
    }
    
    if (selectedSeats.length > 0) {
      return <span className="hint">{selectedSeats.length} objects selected</span>;
    }
    
    return statusBarContent || <span className="hint">Ready</span>;
  };

  // Use the single mouse handler for all tools
  const currentMouseHandlers = {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  };

  // Prevent unnecessary mouse move events when not needed
  const handleMouseMoveWrapper = useCallback((e: React.MouseEvent) => {
    // Only process mouse move if we're in a relevant state
    if (isPanning || isTransforming || localSelection.isSelecting || isDrawing()) {
      currentMouseHandlers.handleMouseMove(e);
    }
  }, [isPanning, isTransforming, localSelection.isSelecting, isDrawing, currentMouseHandlers]);

  // UI nhập số hàng và row spacing khi chọn tool row
  const renderRowOptions = () => {
    // Không hiển thị options cho Rows & Column vì nó sử dụng logic Rectangle
    return null;
  };

  // Hàm xoá đối tượng đang chọn
  const deleteSelected = useCallback(() => {
    setSeats((seats: Seat[]) => seats.filter((seat: Seat) => !selectedSeats.includes(seat.id)));
    setZones((zones: Zone[]) => zones.filter((zone: Zone) => !selectedZones.includes(zone.id)));
    setShapes((shapes: Shape[]) => shapes.filter((shape: Shape) => !stateSelectedItems.some(item => item.type === 'shape' && item.id === shape.id)));
    setTexts((texts: TextElement[]) => texts.filter((text: TextElement) => !stateSelectedItems.some(item => item.type === 'text' && item.id === text.id)));
    setSelectedItems([]);
    handleSelectionChange([], []);
  }, [selectedSeats, selectedZones, stateSelectedItems, handleSelectionChange]);

  // Hỗ trợ phím Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && stateSelectedItems.length > 0) {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stateSelectedItems, deleteSelected]);

  // Thêm nút Delete vào toolbar (giả sử có className='toolbar')
  // Bạn có thể điều chỉnh vị trí cho phù hợp UI thực tế
  const renderToolbar = () => (
    <div className="toolbar" style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <button
        onClick={() => setActiveTool('row')}
        className={stateActiveTool === 'row' ? 'active' : ''}
      >
        Row
      </button>
      <button
        onClick={() => setActiveTool('rows')}
        className={stateActiveTool === 'rows' ? 'active' : ''}
      >
        Rows
      </button>
      {/* Thêm các nút tool khác nếu cần */}
      <button onClick={deleteSelected} disabled={stateSelectedItems.length === 0} style={{ color: 'red' }}>
        Delete
      </button>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Canvas Area */}
      <div className="flex-1">
        <CanvasArea
          width={width}
          height={height}
          zoom={stateZoom}
          onZoomChange={onZoomChange}
          gridEnabled={gridEnabled}
          onMouseDown={currentMouseHandlers.handleMouseDown}
          onMouseMove={currentMouseHandlers.handleMouseMove}
          onMouseUp={currentMouseHandlers.handleMouseUp}
          onWheel={currentMouseHandlers.handleWheel}
          statusBarContent={getStatusBarContent()}
          svgRef={svgRef}
          viewBox={viewBox}
        >
      {renderToolbar()}
      {renderRowOptions()}
      {/* Render zones */}
      {renderZones()}
      
      {/* Render individual seats */}
      {stateSeats.map(seat => renderSeat(seat))}
      
      {/* Render shapes */}
      {stateShapes.map(shape => renderShape(shape, stateSelectedItems, setSelectedItems))}
      
      {/* Render texts */}
      {stateTexts.map(text => renderText(text, stateSelectedItems, setSelectedItems))}
      
      {/* Render selection rectangle */}
      {renderSelectionRectangle()}
      
      {/* Render drawing preview */}
      {renderDrawingPreview()}
      
      {/* Render shape drawing preview */}
      {getShapeDrawingPreview() && (
        <DrawingPreview shape={getShapeDrawingPreview()} />
      )}

      {/* Render zone drawing preview */}
      {renderZonePreview()}

      {/* Render selection handles */}
      {selectionBoundary && selectedItems.length > 0 && (
        <SelectionHandles
          boundary={selectionBoundary}
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
          onMoveStart={handleMoveStart}
        />
      )}
      
      {/* Render transform preview */}
      <TransformPreview
        boundary={selectionBoundary}
        isTransforming={isTransforming}
        transformType={transformType}
        transformStart={transformStart}
        transformOrigin={transformOrigin}
        currentPoint={mouseState.currentPoint}
      />
        </CanvasArea>
      </div>
    </div>
  );
}

// Helper function to render shapes - matching pretix implementation
function renderShape(shape: Shape, selectedItems: SelectionItem[], setSelectedItems: (items: SelectionItem[]) => void) {
  const isSelected = selectedItems.some(item => item.type === 'shape' && item.id === shape.id);
  
  const commonProps = {
    fill: shape.fillColor || shape.color,
    stroke: shape.borderColor || 'none',
    strokeWidth: shape.borderWidth || 0,
    style: { cursor: 'pointer' },
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      // Select the shape
      setSelectedItems([{ id: shape.id, type: 'shape' }]);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.stopPropagation();
    }
  };

  if (shape.type === 'rectangle') {
    return (
      <g key={shape.id} className="shape">
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.w}
          height={shape.h}
          transform={shape.rotation ? `rotate(${shape.rotation} ${shape.x! + shape.w! / 2} ${shape.y! + shape.h! / 2})` : undefined}
          {...commonProps}
        />
      </g>
    );
  } else if (shape.type === 'circle') {
    return (
      <g key={shape.id} className="shape">
        <circle
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          transform={shape.rotation ? `rotate(${shape.rotation} ${shape.cx} ${shape.cy})` : undefined}
          {...commonProps}
        />
      </g>
    );
  } else if (shape.type === 'oval') {
    return (
      <g key={shape.id} className="shape">
        <ellipse
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          transform={shape.rotation ? `rotate(${shape.rotation} ${shape.cx} ${shape.cy})` : undefined}
          {...commonProps}
        />
      </g>
    );
  } else if (shape.type === 'polygon' && shape.points) {
    const points = shape.points.map(p => `${p.x},${p.y}`).join(' ');
    return (
      <g key={shape.id} className="shape">
        <polygon
          points={points}
          transform={shape.rotation ? `rotate(${shape.rotation} ${shape.points!.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }), { x: 0, y: 0 }).x / shape.points!.length} ${shape.points!.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }), { x: 0, y: 0 }).y / shape.points!.length})` : undefined}
          {...commonProps}
        />
      </g>
    );
  }
  return null;
}

// Helper function to render texts - matching pretix implementation
function renderText(text: TextElement, selectedItems: SelectionItem[], setSelectedItems: (items: SelectionItem[]) => void) {
  const isSelected = selectedItems.some((item: SelectionItem) => item.type === 'text' && item.id === text.id);
  
  return (
    <g key={text.id} className={`text-element ${isSelected ? 'selected' : ''}`}>
      <text
        x={text.x}
        y={text.y}
        fontSize={text.fontSize || 16}
        fill={text.color || '#333'}
        fontFamily={text.fontFamily || 'sans-serif'}
        fontWeight={text.fontWeight || 'normal'}
        textAnchor={text.textAlign || 'start'}
        transform={text.rotation ? `rotate(${text.rotation} ${text.x} ${text.y})` : undefined}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          // Select the text
          setSelectedItems([{ id: text.id, type: 'text' }]);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          // TODO: Implement text editing
          console.log('Double click to edit text:', text.id);
        }}
      >
        {text.content}
      </text>
    </g>
  );
}