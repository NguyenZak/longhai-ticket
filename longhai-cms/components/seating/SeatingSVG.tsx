import React, { useRef, useState } from 'react';

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

type Shape =
  | { id: string; type: 'rect'; x: number; y: number; width: number; height: number; color: string; label?: string }
  | { id: string; type: 'circle'; cx: number; cy: number; r: number; color: string; label?: string }
  | { id: string; type: 'line'; x1: number; y1: number; x2: number; y2: number; color: string };

interface SeatingSVGProps {
  width: number;
  height: number;
  seats: Seat[];
  onSeatUpdate: (seats: Seat[]) => void;
  editable?: boolean;
  showLabels?: boolean;
  ticketTypes?: TicketType[];
  className?: string;
}

const defaultTicketTypes: TicketType[] = [
  { id: 'vip', name: 'VIP', price: 500000, color: '#FFD700' },
  { id: 'premium', name: 'Premium', price: 300000, color: '#FF6B6B' },
  { id: 'standard', name: 'Thường', price: 200000, color: '#4CAF50' },
  { id: 'economy', name: 'Tiết kiệm', price: 150000, color: '#9E9E9E' }
];

const shapeColors = ['#6366f1', '#f59e42', '#10b981', '#ef4444', '#fbbf24', '#0ea5e9'];

const SeatingSVG: React.FC<SeatingSVGProps> = ({
  width,
  height,
  seats,
  onSeatUpdate,
  editable = true,
  showLabels = true,
  ticketTypes = defaultTicketTypes,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<'single' | 'row' | 'erase' | 'rect' | 'circle' | 'line'>('single');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [inspector, setInspector] = useState<{ seat?: Seat; shape?: Shape; x: number; y: number } | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [drawingShape, setDrawingShape] = useState<Shape | null>(null);
  const [shapeColor, setShapeColor] = useState<string>(shapeColors[0]);

  // Helper
  const getSeatColor = (seat: Seat) => seat.color || ticketTypes.find(t => t.id === seat.ticketType)?.color || '#4CAF50';

  // SVG viewBox
  const viewBox = `${-pan.x} ${-pan.y} ${width / zoom} ${height / zoom}`;

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editable) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Vẽ shape
    if (drawMode === 'rect') {
      setDrawingShape({ id: `shape-${Date.now()}`, type: 'rect', x: cursor.x, y: cursor.y, width: 1, height: 1, color: shapeColor });
      return;
    }
    if (drawMode === 'circle') {
      setDrawingShape({ id: `shape-${Date.now()}`, type: 'circle', cx: cursor.x, cy: cursor.y, r: 1, color: shapeColor });
      return;
    }
    if (drawMode === 'line') {
      setDrawingShape({ id: `shape-${Date.now()}`, type: 'line', x1: cursor.x, y1: cursor.y, x2: cursor.x, y2: cursor.y, color: shapeColor });
      return;
    }

    // Check if click on seat
    const seat = seats.find(s =>
      cursor.x >= s.x && cursor.x <= s.x + s.width &&
      cursor.y >= s.y && cursor.y <= s.y + s.height
    );
    if (seat) {
      if (drawMode === 'erase') {
        onSeatUpdate(seats.filter(s => s.id !== seat.id));
        setSelectedSeatId(null);
      } else {
        setSelectedSeatId(seat.id);
        setInspector({ seat, x: e.clientX, y: e.clientY });
      }
      return;
    }
    if (drawMode === 'single') {
      // Snap to grid 40x40
      const x = Math.floor(cursor.x / 40) * 40;
      const y = Math.floor(cursor.y / 40) * 40;
      const newSeat: Seat = {
        id: `seat-${Date.now()}-${Math.random()}`,
        row: Math.floor(cursor.y / 40) + 1,
        column: Math.floor(cursor.x / 40) + 1,
        x,
        y,
        width: 35,
        height: 35,
        status: 'available',
        ticketType: selectedTicketType?.id,
        price: selectedTicketType?.price,
        color: selectedTicketType?.color,
        category: selectedTicketType?.name,
        seatName: `${Math.floor(cursor.y / 40) + 1}-${Math.floor(cursor.x / 40) + 1}`,
        rowName: `Hàng ${Math.floor(cursor.y / 40) + 1}`
      };
      onSeatUpdate([...seats, newSeat]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x - deltaX / zoom, y: prev.y - deltaY / zoom }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
    if (drawingShape) {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const cursor = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      if (drawingShape.type === 'rect') {
        setDrawingShape({ ...drawingShape, width: cursor.x - drawingShape.x, height: cursor.y - drawingShape.y });
      } else if (drawingShape.type === 'circle') {
        const r = Math.sqrt(Math.pow(cursor.x - drawingShape.cx, 2) + Math.pow(cursor.y - drawingShape.cy, 2));
        setDrawingShape({ ...drawingShape, r });
      } else if (drawingShape.type === 'line') {
        setDrawingShape({ ...drawingShape, x2: cursor.x, y2: cursor.y });
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsPanning(false);
    if (drawingShape) {
      setShapes(prev => [...prev, drawingShape]);
      setDrawingShape(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.2, Math.min(5, prev * delta)));
  };

  // Toolbar actions
  const zoomIn = () => setZoom(z => Math.min(5, z * 1.2));
  const zoomOut = () => setZoom(z => Math.max(0.2, z / 1.2));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const clearSeats = () => { onSeatUpdate([]); setSelectedSeatId(null); };
  const clearShapes = () => setShapes([]);

  // Inspector actions
  const updateSeat = (patch: Partial<Seat>) => {
    if (!inspector?.seat) return;
    onSeatUpdate(seats.map(s => s.id === inspector.seat!.id ? { ...s, ...patch } : s));
    setInspector(inspector && { ...inspector, seat: { ...inspector.seat, ...patch } });
  };
  const deleteSeat = () => {
    if (!inspector?.seat) return;
    onSeatUpdate(seats.filter(s => s.id !== inspector.seat!.id));
    setInspector(null);
    setSelectedSeatId(null);
  };
  const updateShape = (patch: Partial<Shape>) => {
    if (!inspector?.shape) return;
    setShapes(shapes.map(s => s.id === inspector.shape!.id ? { ...s, ...patch } as Shape : s));
    setInspector(inspector && { ...inspector, shape: { ...inspector.shape, ...patch } as Shape });
  };
  const deleteShape = () => {
    if (!inspector?.shape) return;
    setShapes(shapes.filter(s => s.id !== inspector.shape!.id));
    setInspector(null);
  };

  // SVG seat rendering
  const renderSeats = () => seats.map(seat => (
    <g key={seat.id}>
      <rect
        x={seat.x}
        y={seat.y}
        width={seat.width}
        height={seat.height}
        rx={7}
        fill={getSeatColor(seat)}
        stroke={selectedSeatId === seat.id ? '#3b82f6' : '#fff'}
        strokeWidth={selectedSeatId === seat.id ? 3 : 2}
        className="cursor-pointer seat shadow"
        onClick={e => { e.stopPropagation(); setSelectedSeatId(seat.id); setInspector({ seat, x: e.clientX, y: e.clientY }); }}
      />
      {showLabels && (
        <text
          x={seat.x + seat.width / 2}
          y={seat.y + seat.height / 2 + 2}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          fill="#fff"
          pointerEvents="none"
        >
          {seat.seatName}
        </text>
      )}
    </g>
  ));

  // SVG shape rendering
  const renderShapes = () => [
    ...shapes,
    ...(drawingShape ? [drawingShape] : [])
  ].map(shape => {
    if (shape.type === 'rect') {
      const w = Math.abs(shape.width);
      const h = Math.abs(shape.height);
      const x = shape.width < 0 ? shape.x + shape.width : shape.x;
      const y = shape.height < 0 ? shape.y + shape.height : shape.y;
      return (
        <g key={shape.id}>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill={shape.color}
            fillOpacity={0.2}
            stroke={shape.color}
            strokeWidth={2}
            className="cursor-pointer"
            onClick={e => { e.stopPropagation(); setInspector({ shape, x: e.clientX, y: e.clientY }); }}
          />
          {shape.label && (
            <text x={x + w / 2} y={y + h / 2} textAnchor="middle" fontSize={14} fill={shape.color}>{shape.label}</text>
          )}
        </g>
      );
    }
    if (shape.type === 'circle') {
      return (
        <g key={shape.id}>
          <circle
            cx={shape.cx}
            cy={shape.cy}
            r={Math.abs(shape.r)}
            fill={shape.color}
            fillOpacity={0.2}
            stroke={shape.color}
            strokeWidth={2}
            className="cursor-pointer"
            onClick={e => { e.stopPropagation(); setInspector({ shape, x: e.clientX, y: e.clientY }); }}
          />
          {shape.label && (
            <text x={shape.cx} y={shape.cy} textAnchor="middle" fontSize={14} fill={shape.color}>{shape.label}</text>
          )}
        </g>
      );
    }
    if (shape.type === 'line') {
      return (
        <g key={shape.id}>
          <line
            x1={shape.x1}
            y1={shape.y1}
            x2={shape.x2}
            y2={shape.y2}
            stroke={shape.color}
            strokeWidth={3}
            markerEnd="url(#arrowhead)"
            className="cursor-pointer"
            onClick={e => { e.stopPropagation(); setInspector({ shape, x: e.clientX, y: e.clientY }); }}
          />
        </g>
      );
    }
    return null;
  });

  // Stage rendering
  const renderStage = () => (
    <rect
      x={width * 0.2}
      y={30}
      width={width * 0.6}
      height={60}
      rx={20}
      fill="url(#stageGradient)"
      stroke="#764ba2"
      strokeWidth={2}
    />
  );

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Toolbar Figma-style */}
      <div className="p-4 shadow-lg" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #7c3aed 100%)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">🎨</span>
              <span className="text-white font-medium">Công cụ vẽ</span>
            </div>
            <div className="h-6 w-px bg-white/30"></div>
            {/* Trong toolbar, thêm dropdown chọn loại vé (ticketType) bên cạnh các nút vẽ ghế */}
            {/* Khi chọn, ghế vẽ mới sẽ mang loại vé, màu và giá tương ứng */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-semibold">Loại vé:</span>
              <select
                value={selectedTicketType?.id || ''}
                onChange={e => {
                  const type = ticketTypes.find(t => t.id === e.target.value);
                  setSelectedTicketType(type || null);
                }}
                className="px-2 py-1 rounded bg-white/80 text-gray-800 text-sm font-semibold shadow min-w-[120px] border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ backgroundColor: selectedTicketType?.color || undefined }}
              >
                <option value="">Chọn loại vé</option>
                {ticketTypes.map(type => (
                  <option key={type.id} value={type.id} style={{ color: type.color }}>
                    {type.name} - {type.price.toLocaleString()}đ
                  </option>
                ))}
              </select>
              {selectedTicketType && (
                <span className="inline-block w-4 h-4 rounded-full ml-1 border-2 border-white shadow" style={{ backgroundColor: selectedTicketType.color }}></span>
              )}
            </div>
            {/* Nút vẽ ghế sẽ hiển thị màu loại vé đang chọn */}
            <button
              onClick={() => setDrawMode('single')}
              className={`px-3 py-1 rounded-md text-sm font-semibold transition-all flex items-center space-x-2 ${drawMode === 'single' ? 'bg-white/80 text-blue-700 shadow' : 'bg-white/20 text-white hover:bg-blue-500/60 hover:text-white'}`}
              style={selectedTicketType ? { borderColor: selectedTicketType.color, borderWidth: 2, color: selectedTicketType.color } : {}}
            >
              <span>✏️ Vẽ ghế</span>
              {selectedTicketType && (
                <span className="inline-block w-4 h-4 rounded-full ml-1 border-2 border-white shadow" style={{ backgroundColor: selectedTicketType.color }}></span>
              )}
            </button>
            <button onClick={() => setDrawMode('row')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${drawMode === 'row' ? 'bg-white/80 text-blue-700 shadow' : 'bg-white/20 text-white hover:bg-blue-500/60 hover:text-white'}`}>
              📏 Vẽ hàng
            </button>
            <button onClick={() => setDrawMode('erase')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${drawMode === 'erase' ? 'bg-red-500 text-white shadow' : 'bg-white/20 text-white hover:bg-red-500/80 hover:text-white'}`}>
              🗑️ Xóa
            </button>
            {/* Shape tools */}
            <div className="h-6 w-px bg-white/30"></div>
            <button onClick={() => setDrawMode('rect')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${drawMode === 'rect' ? 'bg-white/80 text-purple-700 shadow' : 'bg-white/20 text-white hover:bg-purple-500/60 hover:text-white'}`}>
              ▭ Vẽ Rect
            </button>
            <button onClick={() => setDrawMode('circle')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${drawMode === 'circle' ? 'bg-white/80 text-purple-700 shadow' : 'bg-white/20 text-white hover:bg-purple-500/60 hover:text-white'}`}>
              ◯ Vẽ Circle
            </button>
            <button onClick={() => setDrawMode('line')} className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${drawMode === 'line' ? 'bg-white/80 text-purple-700 shadow' : 'bg-white/20 text-white hover:bg-purple-500/60 hover:text-white'}`}>
              ↔️ Vẽ Line
            </button>
            <select value={shapeColor} onChange={e => setShapeColor(e.target.value)} className="ml-2 px-2 py-1 rounded bg-white/80 text-gray-800 text-sm font-semibold shadow">
              {shapeColors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={clearShapes} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all text-sm ml-2 shadow font-semibold">🗑️ Xóa shape</button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">Zoom:</span>
              <button onClick={zoomOut} className="px-2 py-1 bg-white/20 text-white rounded hover:bg-blue-500/60 transition-all">-</button>
              <span className="text-white text-sm font-bold">{Math.round(zoom * 100)}%</span>
              <button onClick={zoomIn} className="px-2 py-1 bg-white/20 text-white rounded hover:bg-blue-500/60 transition-all">+</button>
            </div>
            <button onClick={resetView} className="px-3 py-1 bg-white/20 text-white rounded-md hover:bg-blue-500/60 transition-all text-sm font-semibold">🔄 Reset View</button>
            <button onClick={clearSeats} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all text-sm font-semibold">🗑️ Xóa tất cả ghế</button>
          </div>
        </div>
      </div>
      {/* SVG Area */}
      <div className="w-full h-full flex items-center justify-center" style={{ minHeight: height + 60 }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={viewBox}
          className="bg-white rounded-xl shadow border border-gray-200 cursor-crosshair"
          style={{ touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            <linearGradient id="stageGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
          {renderStage()}
          {/* Stage label */}
          <text
            x={width / 2}
            y={60}
            textAnchor="middle"
            fontSize={22}
            fontWeight="bold"
            fill="#fff"
            style={{ textShadow: '0 2px 8px #764ba2' }}
          >
            🎪 SÂN KHẤU
          </text>
          {renderShapes()}
          {renderSeats()}
        </svg>
      </div>
      {/* Inspector popup */}
      {inspector && inspector.seat && (
        <div
          className="absolute bg-white rounded-xl shadow-xl border border-gray-200 p-6 min-w-[320px] z-50"
          style={{ left: inspector.x + 10, top: inspector.y - 10, transform: 'translateY(-100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Chỉnh sửa ghế</h4>
            <button onClick={() => setInspector(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên ghế</label>
              <input
                type="text"
                value={inspector.seat.seatName || ''}
                onChange={e => updateSeat({ seatName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại vé</label>
              <select
                value={inspector.seat.ticketType || ''}
                onChange={e => {
                  const type = ticketTypes.find(t => t.id === e.target.value);
                  updateSeat({
                    ticketType: e.target.value,
                    price: type?.price,
                    color: type?.color,
                    category: type?.name
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                {ticketTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.price.toLocaleString()}đ
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={inspector.seat.status}
                onChange={e => updateSeat({ status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="available">Có sẵn</option>
                <option value="occupied">Đã đặt</option>
                <option value="reserved">Đã giữ</option>
                <option value="disabled">Vô hiệu</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={deleteSeat}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
              >
                Xóa ghế
              </button>
              <button
                onClick={() => setInspector(null)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Inspector popup cho shape */}
      {inspector && inspector.shape && (
        <div
          className="absolute bg-white rounded-xl shadow-xl border border-gray-200 p-6 min-w-[320px] z-50"
          style={{ left: inspector.x + 10, top: inspector.y - 10, transform: 'translateY(-100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Chỉnh sửa shape</h4>
            <button onClick={() => setInspector(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-4">
            {inspector.shape.type !== 'line' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <input
                  type="text"
                  value={inspector.shape.label || ''}
                  onChange={e => updateShape({ label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Màu</label>
              <select
                value={inspector.shape.color}
                onChange={e => updateShape({ color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                {shapeColors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={deleteShape}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
              >
                Xóa shape
              </button>
              <button
                onClick={() => setInspector(null)}
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

export default SeatingSVG; 