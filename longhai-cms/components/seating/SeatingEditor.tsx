'use client';
import React, { useState, useEffect, useRef } from 'react';
import SeatingSVG from './SeatingSVG';
import { generateMusiqueSalonLayout, ticketTypes as musiqueSalonTicketTypes } from './templates/musiqueSalonLayout';

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

interface SeatingEditorProps {
  eventId?: string;
  onSave?: (seats: Seat[]) => void;
  onCancel?: () => void;
  initialSeats?: Seat[];
  ticketTypes?: TicketType[];
}

const SeatingEditor: React.FC<SeatingEditorProps> = ({
  eventId,
  onSave,
  onCancel,
  initialSeats = [],
  ticketTypes = []
}) => {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'canvas' | 'settings'>('templates');
  const [showGrid, setShowGrid] = useState(false); // Mặc định tắt lưới
  // Thêm state ticketTypes để override khi chọn template đặc biệt
  const [ticketTypesState, setTicketTypes] = useState<TicketType[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default ticket types if none provided
  const defaultTicketTypes: TicketType[] = [
    { id: 'vip', name: 'VIP', price: 500000, color: '#FFD700' },
    { id: 'premium', name: 'Premium', price: 300000, color: '#FF6B6B' },
    { id: 'standard', name: 'Thường', price: 200000, color: '#4CAF50' },
    { id: 'economy', name: 'Tiết kiệm', price: 150000, color: '#9E9E9E' }
  ];

  const availableTicketTypes = ticketTypesState.length > 0 ? ticketTypesState : (ticketTypes.length > 0 ? ticketTypes : defaultTicketTypes);

  // Seating templates
  const templates = {
    theater: {
      name: 'Nhà hát',
      description: 'Bố cục nhà hát với hàng ghế cong',
      seats: generateTheaterSeats(),
      icon: '🎭',
      color: '#667eea'
    },
    concert: {
      name: 'Sân khấu',
      description: 'Bố cục sân khấu cho concert',
      seats: generateConcertSeats(),
      icon: '🎤',
      color: '#f093fb'
    },
    conference: {
      name: 'Hội nghị',
      description: 'Bố cục hội nghị với bàn tròn',
      seats: generateConferenceSeats(),
      icon: '🏢',
      color: '#4facfe'
    },
    cinema: {
      name: 'Rạp chiếu phim',
      description: 'Bố cục rạp chiếu phim',
      seats: generateCinemaSeats(),
      icon: '🎬',
      color: '#43e97b'
    },
    musiqueSalon: {
      name: 'Musique de Salon',
      description: 'Layout theo sự kiện Musique de Salon (theo ảnh)',
      seats: generateMusiqueSalonLayout(),
      icon: '🎼',
      color: '#d32f2f'
    }
  };

  function generateTheaterSeats(): Seat[] {
    const seats: Seat[] = [];
    let seatId = 1;
    
    // VIP section (front rows)
    for (let row = 1; row <= 3; row++) {
      const seatsInRow = 8 + (row - 1) * 2; // Increasing seats per row
      const startCol = 1;
      
      for (let col = startCol; col <= seatsInRow; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 43,
          y: (row - 1) * 50,
          width: 35,
          height: 35,
          status: 'available',
          price: 500000,
          category: 'VIP',
          color: '#FFD700',
          ticketType: 'vip',
          seatName: `${row}${String.fromCharCode(64 + col)}`,
          rowName: `VIP ${row}`
        });
      }
    }
    
    // Premium section (middle rows)
    for (let row = 4; row <= 8; row++) {
      const seatsInRow = 12;
      const startCol = 1;
      
      for (let col = startCol; col <= seatsInRow; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 43,
          y: (row - 1) * 50,
          width: 35,
          height: 35,
          status: 'available',
          price: 300000,
          category: 'Premium',
          color: '#FF6B6B',
          ticketType: 'premium',
          seatName: `${row}${String.fromCharCode(64 + col)}`,
          rowName: `Premium ${row - 3}`
        });
      }
    }
    
    // Standard section (back rows)
    for (let row = 9; row <= 12; row++) {
      const seatsInRow = 14;
      const startCol = 1;
      
      for (let col = startCol; col <= seatsInRow; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 43,
          y: (row - 1) * 50,
          width: 35,
          height: 35,
          status: 'available',
          price: 200000,
          category: 'Thường',
          color: '#4CAF50',
          ticketType: 'standard',
          seatName: `${row}${String.fromCharCode(64 + col)}`,
          rowName: `Thường ${row - 8}`
        });
      }
    }
    
    return seats;
  }

  function generateConcertSeats(): Seat[] {
    const seats: Seat[] = [];
    let seatId = 1;
    
    // Standing area (VIP)
    for (let row = 1; row <= 2; row++) {
      for (let col = 1; col <= 20; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 43,
          y: (row - 1) * 50,
          width: 35,
          height: 35,
          status: 'available',
          price: 600000,
          category: 'VIP Standing',
          color: '#FFD700',
          ticketType: 'vip',
          seatName: `S${row}${col.toString().padStart(2, '0')}`,
          rowName: `VIP Standing ${row}`
        });
      }
    }
    
    // Seated area
    for (let row = 3; row <= 8; row++) {
      const seatsInRow = 15;
      for (let col = 1; col <= seatsInRow; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 43,
          y: (row - 1) * 50,
          width: 35,
          height: 35,
          status: 'available',
          price: 400000,
          category: 'Premium',
          color: '#FF6B6B',
          ticketType: 'premium',
          seatName: `${row}${String.fromCharCode(64 + col)}`,
          rowName: `Premium ${row - 2}`
        });
      }
    }
    
    // General admission
    for (let row = 9; row <= 15; row++) {
      const seatsInRow = 18;
      for (let col = 1; col <= seatsInRow; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 43,
          y: (row - 1) * 50,
          width: 35,
          height: 35,
          status: 'available',
          price: 250000,
          category: 'Thường',
          color: '#4CAF50',
          ticketType: 'standard',
          seatName: `${row}${String.fromCharCode(64 + col)}`,
          rowName: `Thường ${row - 8}`
        });
      }
    }
    
    return seats;
  }

  function generateConferenceSeats(): Seat[] {
    const seats: Seat[] = [];
    let seatId = 1;
    
    // Front row (VIP)
    for (let col = 1; col <= 10; col++) {
      seats.push({
        id: `seat_${seatId++}`,
        row: 1,
        column: col,
        x: (col - 1) * 50,
        y: 50,
        width: 40,
        height: 40,
        status: 'available',
        price: 300000,
        category: 'VIP',
        color: '#FFD700',
        ticketType: 'vip',
        seatName: `VIP${col.toString().padStart(2, '0')}`,
        rowName: 'VIP'
      });
    }
    
    // Main conference area
    for (let row = 2; row <= 6; row++) {
      const seatsInRow = 12;
      for (let col = 1; col <= seatsInRow; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 45,
          y: (row - 1) * 55,
          width: 35,
          height: 35,
          status: 'available',
          price: 200000,
          category: 'Thường',
          color: '#4CAF50',
          ticketType: 'standard',
          seatName: `${row}${String.fromCharCode(64 + col)}`,
          rowName: `Hàng ${row - 1}`
        });
      }
    }
    
    return seats;
  }

  function generateCinemaSeats(): Seat[] {
    const seats: Seat[] = [];
    let seatId = 1;
    
    // Premium seats (front)
    for (let row = 1; row <= 3; row++) {
      const seatsInRow = 12;
      for (let col = 1; col <= seatsInRow; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 40,
          y: (row - 1) * 45,
          width: 30,
          height: 30,
          status: 'available',
          price: 150000,
          category: 'Premium',
          color: '#FF6B6B',
          ticketType: 'premium',
          seatName: `${row}${String.fromCharCode(64 + col)}`,
          rowName: `Premium ${row}`
        });
      }
    }
    
    // Standard seats
    for (let row = 4; row <= 10; row++) {
      const seatsInRow = 14;
      for (let col = 1; col <= seatsInRow; col++) {
        seats.push({
          id: `seat_${seatId++}`,
          row,
          column: col,
          x: (col - 1) * 40,
          y: (row - 1) * 45,
          width: 30,
          height: 30,
          status: 'available',
          price: 100000,
          category: 'Thường',
          color: '#4CAF50',
          ticketType: 'standard',
          seatName: `${row}${String.fromCharCode(64 + col)}`,
          rowName: `Thường ${row - 3}`
        });
      }
    }
    
    return seats;
  }

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = templates[templateKey as keyof typeof templates];
    if (template) {
      setSeats(template.seats);
      // Nếu chọn Musique de Salon thì dùng ticketTypes riêng
      if (templateKey === 'musiqueSalon') {
        setTicketTypes(musiqueSalonTicketTypes);
      } else {
        setTicketTypes([]); // reset về mặc định
      }
      setMessage({ type: 'success', text: `Đã áp dụng template ${template.name}` });
    }
  };

  const handleSeatUpdate = (updatedSeats: Seat[]) => {
    setSeats(updatedSeats);
  };

  const handleSave = async () => {
    if (!eventId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn sự kiện để lưu' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/seating/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seats }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Đã lưu sơ đồ ghế thành công!' });
        if (onSave) {
          onSave(seats);
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Lỗi khi lưu sơ đồ ghế' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi kết nối mạng' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả ghế?')) {
      setSeats([]);
      setMessage({ type: 'success', text: 'Đã xóa tất cả ghế' });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(seats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seating-${eventId || 'export'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSeats = JSON.parse(e.target?.result as string);
          setSeats(importedSeats);
          setMessage({ type: 'success', text: 'Đã import dữ liệu thành công!' });
        } catch (error) {
          setMessage({ type: 'error', text: 'Lỗi khi đọc file JSON' });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'text-blue-600 bg-white rounded-md shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Templates
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === 'canvas'
                  ? 'text-blue-600 bg-white rounded-md shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎨 Canvas
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-blue-600 bg-white rounded-md shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ Cài đặt
            </button>
          </nav>
        </div>

        {/* Templates Section */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Template sơ đồ ghế</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => handleTemplateSelect(key)}
                  className={`p-4 rounded-xl border-2 transition-all text-left group hover:shadow-lg ${
                    selectedTemplate === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-3xl mb-3">{template.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    {template.seats.length} ghế
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas Tab */}
        {activeTab === 'canvas' && (
          <div className="space-y-6">
            {/* Grid Toggle */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎛️ Tùy chọn hiển thị</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`w-full p-3 rounded-lg border transition-colors text-left shadow-sm ${
                    showGrid
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xl mb-2">📐</div>
                  <h4 className="font-medium">
                    {showGrid ? 'Tắt lưới' : 'Bật lưới'}
                  </h4>
                  <p className="text-sm">
                    {showGrid ? 'Ẩn lưới để vẽ tự do hơn' : 'Hiển thị lưới để căn chỉnh chính xác'}
                  </p>
                </button>
              </div>
            </div>

            {/* Ticket Types Display */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎫 Loại vé có sẵn</h3>
              <div className="space-y-3">
                {availableTicketTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-3 shadow-sm"
                      style={{ backgroundColor: type.color }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {type.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {type.price.toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Thống kê</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{seats.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Tổng ghế</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {seats.filter(s => s.status === 'available').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Có sẵn</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-red-600">
                    {seats.filter(s => s.status === 'occupied').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Đã đặt</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">
                    {seats.filter(s => s.status === 'reserved').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Đã giữ</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Cài đặt</h3>
            <div className="space-y-3">
              <button
                onClick={handleClear}
                className="w-full p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left shadow-sm"
              >
                <div className="text-xl mb-2">🗑️</div>
                <h4 className="font-medium text-red-800">Xóa tất cả</h4>
                <p className="text-sm text-red-600">Xóa toàn bộ ghế hiện tại</p>
              </button>
              
              <button
                onClick={handleExport}
                className="w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left shadow-sm"
              >
                <div className="text-xl mb-2">📤</div>
                <h4 className="font-medium text-green-800">Xuất file</h4>
                <p className="text-sm text-green-600">Tải xuống dữ liệu JSON</p>
              </button>
              
              <label className="w-full p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left cursor-pointer shadow-sm">
                <div className="text-xl mb-2">📥</div>
                <h4 className="font-medium text-purple-800">Import file</h4>
                <p className="text-sm text-purple-600">Tải lên dữ liệu JSON</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Save/Cancel buttons */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900"> Chỉnh sửa sơ đồ ghế</h2>
            <p className="text-sm text-gray-600">Vẽ và quản lý sơ đồ ghế cho sự kiện</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${isFullscreen ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
              style={{ minWidth: 48 }}
            >
              {isFullscreen ? '⛌ Thoát full màn hình' : '⛶ Full màn hình'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !eventId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu sơ đồ'}
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-sm"
              >
                ❌ Hủy
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              📥 Import JSON
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg shadow-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-xl mr-3">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className={isFullscreen ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/70' : ''} style={isFullscreen ? {width: '100vw', height: '100vh'} : {}}>
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-8 px-4 py-2 rounded-full bg-white/90 text-gray-900 font-bold shadow-lg border border-gray-300 hover:bg-red-500 hover:text-white transition-all text-lg z-50"
              style={{ minWidth: 48 }}
            >
              ⛌ Thoát full màn hình
            </button>
          )}
          <div className={isFullscreen ? 'rounded-2xl shadow-2xl bg-white p-2 border border-gray-200' : ''} style={isFullscreen ? {maxWidth: '98vw', maxHeight: '92vh'} : {}}>
            <SeatingSVG
              width={isFullscreen ? window.innerWidth - 64 : 1000}
              height={isFullscreen ? window.innerHeight - 120 : 700}
              seats={seats}
              onSeatUpdate={handleSeatUpdate}
              editable={true}
              showLabels={true}
              ticketTypes={availableTicketTypes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingEditor; 