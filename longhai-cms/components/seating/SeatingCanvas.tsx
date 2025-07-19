'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Seat {
  id: string;
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'available' | 'occupied' | 'reserved' | 'disabled';
  price?: number;
  category?: string;
  color?: string;
  ticketType?: string;
  seatName?: string;
  rowName?: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  color: string;
}

interface SeatingCanvasProps {
  width: number;
  height: number;
  seats: Seat[];
  onSeatUpdate: (seats: Seat[]) => void;
  editable?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  ticketTypes?: TicketType[];
  className?: string;
}

const SeatingCanvas: React.FC<SeatingCanvasProps> = ({
  width,
  height,
  seats,
  onSeatUpdate,
  editable = true,
  showGrid = false, // Mặc định tắt lưới
  showLabels = true,
  ticketTypes = [],
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [drawMode, setDrawMode] = useState<'single' | 'row' | 'erase'>('single');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [showSeatInspector, setShowSeatInspector] = useState(false);
  const [inspectorPosition, setInspectorPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default ticket types if none provided
  const availableTicketTypes = ticketTypes.length > 0 ? ticketTypes : [
    { id: 'vip', name: 'VIP', price: 500000, color: '#FFD700' },
    { id: 'premium', name: 'Premium', price: 300000, color: '#FF6B6B' },
    { id: 'standard', name: 'Thường', price: 200000, color: '#4CAF50' },
    { id: 'economy', name: 'Tiết kiệm', price: 150000, color: '#9E9E9E' }
  ];

  const getSeatColor = (seat: Seat) => {
    if (seat.color) return seat.color;
    if (seat.ticketType) {
      const ticketType = availableTicketTypes.find(t => t.id === seat.ticketType);
      return ticketType?.color || '#4CAF50';
    }
    return '#4CAF50';
  };

  const getSeatStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'occupied': return '#F44336';
      case 'reserved': return '#FF9800';
      case 'disabled': return '#9E9E9E';
      default: return '#4CAF50';
    }
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw background gradient (Figma-style)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid (chỉ khi showGrid = true)
    if (showGrid) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 20;
      
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw stage area (Figma-style)
    const stageWidth = width * 0.6;
    const stageHeight = 80;
    const stageX = (width - stageWidth) / 2;
    const stageY = 50;

    // Stage background with gradient
    const stageGradient = ctx.createLinearGradient(stageX, stageY, stageX, stageY + stageHeight);
    stageGradient.addColorStop(0, '#667eea');
    stageGradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = stageGradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillRect(stageX, stageY, stageWidth, stageHeight);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Stage text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎪 SÂN KHẤU', stageX + stageWidth / 2, stageY + stageHeight / 2 + 6);

    // Draw seats with Figma-style design
    seats.forEach(seat => {
      const isSelected = selectedSeat?.id === seat.id;
      const seatColor = getSeatColor(seat);
      const statusColor = getSeatStatusColor(seat.status);

      // Seat shadow (Figma-style)
      ctx.shadowColor = isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = isSelected ? 15 : 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = isSelected ? 6 : 4;

      // Seat background with gradient (Figma-style)
      const seatGradient = ctx.createLinearGradient(seat.x, seat.y, seat.x, seat.y + seat.height);
      seatGradient.addColorStop(0, seatColor);
      seatGradient.addColorStop(1, adjustBrightness(seatColor, -20));

      ctx.fillStyle = seatGradient;
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#ffffff';
      ctx.lineWidth = isSelected ? 3 : 2;

      // Rounded rectangle (Figma-style)
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(seat.x + radius, seat.y);
      ctx.lineTo(seat.x + seat.width - radius, seat.y);
      ctx.quadraticCurveTo(seat.x + seat.width, seat.y, seat.x + seat.width, seat.y + radius);
      ctx.lineTo(seat.x + seat.width, seat.y + seat.height - radius);
      ctx.quadraticCurveTo(seat.x + seat.width, seat.y + seat.height, seat.x + seat.width - radius, seat.y + seat.height);
      ctx.lineTo(seat.x + radius, seat.y + seat.height);
      ctx.quadraticCurveTo(seat.x, seat.y + seat.height, seat.x, seat.y + seat.height - radius);
      ctx.lineTo(seat.x, seat.y + radius);
      ctx.quadraticCurveTo(seat.x, seat.y, seat.x + radius, seat.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw seat labels if enabled
      if (showLabels) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const label = seat.seatName || `${seat.rowName || seat.row}-${seat.column}`;
        ctx.fillText(label, seat.x + seat.width / 2, seat.y + seat.height / 2);
      }

      // Draw status indicator
      if (seat.status !== 'available') {
        ctx.fillStyle = statusColor;
        ctx.beginPath();
        ctx.arc(seat.x + seat.width - 8, seat.y + 8, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    ctx.restore();
  }, [width, height, seats, selectedSeat, zoom, pan, showGrid, showLabels, availableTicketTypes]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const adjustBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const findSeatAtPosition = (x: number, y: number): Seat | null => {
    return seats.find(seat => 
      x >= seat.x && x <= seat.x + seat.width &&
      y >= seat.y && y <= seat.y + seat.height
    ) || null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;

    const mousePos = getMousePos(e);
    
    if (e.button === 1 || e.button === 2) { // Middle or right click
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    const existingSeat = findSeatAtPosition(mousePos.x, mousePos.y);
    
    if (existingSeat) {
      if (drawMode === 'erase') {
        const updatedSeats = seats.filter(s => s.id !== existingSeat.id);
        onSeatUpdate(updatedSeats);
      } else {
        setSelectedSeat(existingSeat);
        setShowSeatInspector(true);
        setInspectorPosition({ x: e.clientX, y: e.clientY });
      }
      return;
    }

    if (drawMode === 'single') {
      setIsDrawing(true);
      const newSeat: Seat = {
        id: `seat-${Date.now()}-${Math.random()}`,
        row: Math.floor(mousePos.y / 40) + 1,
        column: Math.floor(mousePos.x / 40) + 1,
        x: Math.floor(mousePos.x / 40) * 40,
        y: Math.floor(mousePos.y / 40) * 40,
        width: 35,
        height: 35,
        status: 'available',
        ticketType: selectedTicketType?.id,
        price: selectedTicketType?.price,
        color: selectedTicketType?.color,
        category: selectedTicketType?.name,
        seatName: `${Math.floor(mousePos.y / 40) + 1}-${Math.floor(mousePos.x / 40) + 1}`,
        rowName: `Hàng ${Math.floor(mousePos.y / 40) + 1}`
      };
      
      const updatedSeats = [...seats, newSeat];
      onSeatUpdate(updatedSeats);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;
    
    const mousePos = getMousePos(e);
    const seat = findSeatAtPosition(mousePos.x, mousePos.y);
    
    if (seat) {
      setSelectedSeat(seat);
      setShowSeatInspector(true);
      setInspectorPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const drawRow = () => {
    if (!editable) return;
    
    const rowY = 150;
    const seatsInRow = Math.floor(width / 50);
    const newSeats: Seat[] = [];
    
    for (let i = 0; i < seatsInRow; i++) {
      const seat: Seat = {
        id: `seat-row-${Date.now()}-${i}`,
        row: 1,
        column: i + 1,
        x: i * 50 + 25,
        y: rowY,
        width: 40,
        height: 40,
        status: 'available',
        ticketType: selectedTicketType?.id,
        price: selectedTicketType?.price,
        color: selectedTicketType?.color,
        category: selectedTicketType?.name,
        seatName: `1-${i + 1}`,
        rowName: 'Hàng 1'
      };
      newSeats.push(seat);
    }
    
    onSeatUpdate([...seats, ...newSeats]);
  };

  const clearCanvas = () => {
    if (!editable) return;
    onSeatUpdate([]);
  };

  const zoomIn = () => setZoom(prev => Math.min(5, prev * 1.2));
  const zoomOut = () => setZoom(prev => Math.max(0.1, prev / 1.2));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleGrid = () => {
    // Toggle grid visibility
    const newShowGrid = !showGrid;
    // Note: This would need to be handled by parent component
    // For now, we'll just update the local state
  };

  // Fullscreen styles
  const fullscreenStyles = isFullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: '#f8fafc'
  } : {};

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={fullscreenStyles}
    >
      {/* Figma-style Toolbar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {/* Left side - Drawing tools */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">🎨</span>
              <span className="text-white font-medium">Công cụ vẽ</span>
            </div>
            <div className="h-6 w-px bg-gray-600"></div>
            <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setDrawMode('single')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  drawMode === 'single'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title="Vẽ ghế đơn lẻ"
              >
                ✏️ Vẽ ghế
              </button>
              <button
                onClick={() => setDrawMode('row')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  drawMode === 'row'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title="Vẽ hàng ghế"
              >
                📏 Vẽ hàng
              </button>
              <button
                onClick={() => setDrawMode('erase')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  drawMode === 'erase'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title="Xóa ghế"
              >
                🗑️ Xóa
              </button>
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            {/* Ticket type selector */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm font-medium">Loại vé:</span>
              <select
                value={selectedTicketType?.id || ''}
                onChange={(e) => {
                  const type = availableTicketTypes.find(t => t.id === e.target.value);
                  setSelectedTicketType(type || null);
                }}
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn loại vé</option>
                {availableTicketTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.price.toLocaleString()}đ
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right side - View controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm font-medium">Zoom:</span>
              <button
                onClick={zoomOut}
                className="w-8 h-8 bg-gray-800 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center"
              >
                -
              </button>
              <span className="text-white text-sm font-medium min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="w-8 h-8 bg-gray-800 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>

            <button
              onClick={resetView}
              className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors text-sm font-medium"
            >
              🔄 Reset View
            </button>

            <div className="h-6 w-px bg-gray-600"></div>

            <button
              onClick={toggleGrid}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showGrid
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              📐 {showGrid ? 'Tắt lưới' : 'Bật lưới'}
            </button>

            <button
              onClick={drawRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              📏 Vẽ hàng nhanh
            </button>

            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              🗑️ Xóa tất cả
            </button>

            <div className="h-6 w-px bg-gray-600"></div>

            <button
              onClick={toggleFullscreen}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isFullscreen
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-green-600 text-white shadow-sm'
              }`}
            >
              {isFullscreen ? '⛌ Thoát full màn hình' : '⛶ Full màn hình'}
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : 'auto' }}>
        <canvas
          ref={canvasRef}
          width={isFullscreen ? window.innerWidth : width}
          height={isFullscreen ? window.innerHeight - 80 : height}
          className={`cursor-crosshair ${className}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Instructions overlay (Figma-style) */}
        {seats.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-50">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bắt đầu vẽ sơ đồ ghế
              </h3>
              <p className="text-gray-600 mb-4">
                Chọn công cụ vẽ và click vào canvas để tạo ghế. Sử dụng chuột giữa để di chuyển view.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>🖱️ Click trái: Vẽ ghế</div>
                <div>🖱️ Click giữa: Di chuyển</div>
                <div>🖱️ Double-click: Sửa tên</div>
                <div>🔍 Scroll: Zoom in/out</div>
              </div>
            </div>
          </div>
        )}

        {/* Zoom indicator (Figma-style) */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-medium">
          {Math.round(zoom * 100)}%
        </div>

        {/* Fullscreen indicator */}
        {isFullscreen && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-medium">
            ⛶ Chế độ full màn hình
          </div>
        )}
      </div>

      {/* Seat Inspector Panel (Figma-style) */}
      {showSeatInspector && selectedSeat && (
        <div
          className="absolute bg-white rounded-xl shadow-xl border border-gray-200 p-6 min-w-[320px] z-50"
          style={{
            left: inspectorPosition.x + 10,
            top: inspectorPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Chỉnh sửa ghế</h4>
            <button
              onClick={() => setShowSeatInspector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên ghế</label>
              <input
                type="text"
                value={selectedSeat.seatName || ''}
                onChange={(e) => {
                  const updatedSeats = seats.map(s =>
                    s.id === selectedSeat.id ? { ...s, seatName: e.target.value } : s
                  );
                  onSeatUpdate(updatedSeats);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại vé</label>
              <select
                value={selectedSeat.ticketType || ''}
                onChange={(e) => {
                  const type = availableTicketTypes.find(t => t.id === e.target.value);
                  const updatedSeats = seats.map(s =>
                    s.id === selectedSeat.id ? {
                      ...s,
                      ticketType: e.target.value,
                      price: type?.price || s.price,
                      color: type?.color || s.color,
                      category: type?.name || s.category
                    } : s
                  );
                  onSeatUpdate(updatedSeats);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                {availableTicketTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.price.toLocaleString()}đ
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={selectedSeat.status}
                onChange={(e) => {
                  const updatedSeats = seats.map(s =>
                    s.id === selectedSeat.id ? { ...s, status: e.target.value as any } : s
                  );
                  onSeatUpdate(updatedSeats);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="available">Có sẵn</option>
                <option value="occupied">Đã đặt</option>
                <option value="reserved">Đã giữ</option>
                <option value="disabled">Vô hiệu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá vé</label>
              <input
                type="number"
                value={selectedSeat.price || 0}
                onChange={(e) => {
                  const updatedSeats = seats.map(s =>
                    s.id === selectedSeat.id ? { ...s, price: parseInt(e.target.value) || 0 } : s
                  );
                  onSeatUpdate(updatedSeats);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  const updatedSeats = seats.filter(s => s.id !== selectedSeat.id);
                  onSeatUpdate(updatedSeats);
                  setShowSeatInspector(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
              >
                Xóa ghế
              </button>
              <button
                onClick={() => setShowSeatInspector(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatingCanvas; 