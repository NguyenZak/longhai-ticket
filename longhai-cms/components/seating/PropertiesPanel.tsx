import React, { useState } from 'react';
import { Seat, Row, Zone, Shape, TextElement, SelectionItem } from './types';

interface PropertiesPanelProps {
  selectedItems: SelectionItem[];
  seats: Seat[];
  rows: Row[];
  zones: Zone[];
  shapes: Shape[];
  texts: TextElement[];
  onUpdateSeat?: (seatId: string, updates: Partial<Seat>) => void;
  onUpdateRow?: (rowId: string, updates: Partial<Row>) => void;
  onUpdateZone?: (zoneId: string, updates: Partial<Zone>) => void;
  onUpdateShape?: (shapeId: string, updates: Partial<Shape>) => void;
  onUpdateText?: (textId: string, updates: Partial<TextElement>) => void;
  onAddSeat?: (rowId: string) => void;
  onAlignOnCircleByRadius?: (rowId: string) => void;
  onAlignOnCircleByCenter?: (rowId: string) => void;
}

// Mock ticket types - in real app this would come from API
const TICKET_TYPES = [
  { id: 'vip', name: 'VIP', color: '#FFD700', price: 500000 },
  { id: 'premium', name: 'Premium', color: '#FF6B6B', price: 300000 },
  { id: 'standard', name: 'Standard', color: '#4ECDC4', price: 150000 },
  { id: 'economy', name: 'Economy', color: '#95A5A6', price: 80000 },
];

const SEAT_STATUSES = [
  { id: 'available', name: 'Available', color: '#4CAF50' },
  { id: 'reserved', name: 'Reserved', color: '#FF9800' },
  { id: 'occupied', name: 'Occupied', color: '#F44336' },
  { id: 'disabled', name: 'Disabled', color: '#9E9E9E' },
];

export default function PropertiesPanel({
  selectedItems,
  seats,
  rows,
  zones,
  shapes,
  texts,
  onUpdateSeat,
  onUpdateRow,
  onUpdateZone,
  onUpdateShape,
  onUpdateText,
  onAddSeat,
  onAlignOnCircleByRadius,
  onAlignOnCircleByCenter
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'appearance' | 'layout' | 'tickets'>('properties');

  if (selectedItems.length === 0) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="text-gray-500 text-sm">
          No items selected. Select an item to view its properties.
        </div>
      </div>
    );
  }

  const selectedItem = selectedItems[0];
  const item = getSelectedItem(selectedItem, seats, rows, zones, shapes, texts);

  if (!item) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="text-gray-500 text-sm">
          Selected item not found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Properties</h3>
        <p className="text-sm text-gray-500 mt-1">
          {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'properties' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'appearance' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('appearance')}
        >
          Appearance
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'layout' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('layout')}
        >
          Layout
        </button>
        {selectedItem.type === 'seat' && (
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'tickets' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('tickets')}
          >
            Tickets
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'properties' && (
          <PropertiesTab 
            item={item} 
            itemType={selectedItem.type}
            onUpdateSeat={onUpdateSeat}
            onUpdateRow={onUpdateRow}
            onUpdateZone={onUpdateZone}
            onUpdateShape={onUpdateShape}
            onUpdateText={onUpdateText}
            onAddSeat={onAddSeat}
            onAlignOnCircleByRadius={onAlignOnCircleByRadius}
            onAlignOnCircleByCenter={onAlignOnCircleByCenter}
          />
        )}
        {activeTab === 'appearance' && (
          <AppearanceTab 
            item={item} 
            itemType={selectedItem.type}
            onUpdateSeat={onUpdateSeat}
            onUpdateRow={onUpdateRow}
            onUpdateZone={onUpdateZone}
            onUpdateShape={onUpdateShape}
            onUpdateText={onUpdateText}
          />
        )}
        {activeTab === 'layout' && (
          <LayoutTab 
            item={item} 
            itemType={selectedItem.type}
            onUpdateSeat={onUpdateSeat}
            onUpdateRow={onUpdateRow}
            onUpdateZone={onUpdateZone}
            onUpdateShape={onUpdateShape}
            onUpdateText={onUpdateText}
          />
        )}
        {activeTab === 'tickets' && selectedItem.type === 'seat' && (
          <TicketsTab 
            item={item as Seat}
            onUpdateSeat={onUpdateSeat}
          />
        )}
      </div>
    </div>
  );
}

function PropertiesTab({ item, itemType, onUpdateSeat, onUpdateRow, onUpdateZone, onUpdateShape, onUpdateText, onAddSeat, onAlignOnCircleByRadius, onAlignOnCircleByCenter }: any) {
  const [label, setLabel] = useState(item.label || item.content || '');

  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (itemType === 'seat' && onUpdateSeat) {
      onUpdateSeat(item.id, { label: value });
    } else if (itemType === 'row' && onUpdateRow) {
      onUpdateRow(item.id, { label: value });
    } else if (itemType === 'zone' && onUpdateZone) {
      onUpdateZone(item.id, { label: value });
    } else if (itemType === 'text' && onUpdateText) {
      onUpdateText(item.id, { content: value });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {itemType === 'seat' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={item.status || 'available'}
              onChange={(e) => onUpdateSeat?.(item.id, { status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              value={item.price || ''}
              onChange={(e) => onUpdateSeat?.(item.id, { price: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={item.category || ''}
              onChange={(e) => onUpdateSeat?.(item.id, { category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VIP, Premium, etc."
            />
          </div>
        </>
      )}

      {itemType === 'row' && (
        <>
          {/* Row Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Row</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seat spacing
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateRow?.(item.id, { spacing: Math.max(10, (item.spacing || 25) - 5) })}
                  className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.spacing || 25}
                  onChange={(e) => onUpdateRow?.(item.id, { spacing: parseInt(e.target.value) || 25 })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="100"
                />
                <button
                  onClick={() => onUpdateRow?.(item.id, { spacing: Math.min(100, (item.spacing || 25) + 5) })}
                  className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Row number
                <span className="ml-1 text-gray-400">?</span>
              </label>
              <input
                type="number"
                value={item.rowNumber || 1}
                onChange={(e) => onUpdateRow?.(item.id, { rowNumber: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Row label
                <span className="ml-1 text-gray-400">?</span>
              </label>
              <input
                type="text"
                value={item.label || `Row ${item.rowNumber || 1}`}
                onChange={(e) => onUpdateRow?.(item.id, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show row numbers
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.showRowNumbers !== false}
                    onChange={(e) => onUpdateRow?.(item.id, { showRowNumbers: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Left</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.showRowNumbersRight !== false}
                    onChange={(e) => onUpdateRow?.(item.id, { showRowNumbersRight: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Right</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (onAddSeat && item.id) {
                    onAddSeat(item.id);
                  }
                }}
                className="flex-1 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Add Seat"
              >
                <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a1 1 0 011 1v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H7a1 1 0 110-2h2V7a1 1 0 011-1z"/>
                </svg>
              </button>
              <button
                onClick={() => {
                  if (onAlignOnCircleByRadius && item.id) {
                    onAlignOnCircleByRadius(item.id);
                  }
                }}
                className="flex-1 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Align on Circle (by radius)"
              >
                <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 4a6 6 0 110 12 6 6 0 010-12z"/>
                </svg>
              </button>
              <button
                onClick={() => {
                  if (onAlignOnCircleByCenter && item.id) {
                    onAlignOnCircleByCenter(item.id);
                  }
                }}
                className="flex-1 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                title="Align on Circle (on center)"
              >
                <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Seat numbers Section */}
          <div className="space-y-4 mt-6">
            <h4 className="font-medium text-gray-900">Seat numbers</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numbering
              </label>
              <select
                value={item.numberingType || 'sequential'}
                onChange={(e) => onUpdateRow?.(item.id, { numberingType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sequential">1, 2, 3, ...</option>
                <option value="alphabetical">A, B, C, ...</option>
                <option value="roman">I, II, III, ...</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting at
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateRow?.(item.id, { startNumber: Math.max(1, (item.startNumber || 1) - 1) })}
                  className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.startNumber || 1}
                  onChange={(e) => onUpdateRow?.(item.id, { startNumber: parseInt(e.target.value) || 1 })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <button
                  onClick={() => onUpdateRow?.(item.id, { startNumber: (item.startNumber || 1) + 1 })}
                  className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reversed
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => onUpdateRow?.(item.id, { reversed: !item.reversed })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    item.reversed ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      item.reversed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-2 text-sm text-gray-600">
                  {item.reversed ? 'On' : 'Off'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seat label
                <span className="ml-1 text-gray-400">?</span>
              </label>
              <input
                type="text"
                value={item.seatLabel || 'Seat %s'}
                onChange={(e) => onUpdateRow?.(item.id, { seatLabel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seat %s"
              />
            </div>
          </div>

          {/* Seat Section */}
          <div className="space-y-4 mt-6">
            <h4 className="font-medium text-gray-900">Seat</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateRow?.(item.id, { seatRadius: Math.max(5, (item.seatRadius || 10) - 1) })}
                  className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.seatRadius || 10}
                  onChange={(e) => onUpdateRow?.(item.id, { seatRadius: parseInt(e.target.value) || 10 })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="50"
                />
                <button
                  onClick={() => onUpdateRow?.(item.id, { seatRadius: Math.min(50, (item.seatRadius || 10) + 1) })}
                  className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
                <span className="ml-1 text-gray-400">?</span>
              </label>
              <select
                value={item.seatCategory || ''}
                onChange={(e) => onUpdateRow?.(item.id, { seatCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="category-i">Category I</option>
                <option value="category-ii">Category II</option>
                <option value="category-iii">Category III</option>
                <option value="vip">VIP</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
              </select>
            </div>
          </div>
        </>
      )}

      {itemType === 'zone' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              type="number"
              value={item.width}
              onChange={(e) => onUpdateZone?.(item.id, { width: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              type="number"
              value={item.height}
              onChange={(e) => onUpdateZone?.(item.id, { height: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}
    </div>
  );
}

function AppearanceTab({ item, itemType, onUpdateSeat, onUpdateRow, onUpdateZone, onUpdateShape, onUpdateText }: any) {
  const [color, setColor] = useState(item.color || '#000000');

  const handleColorChange = (value: string) => {
    setColor(value);
    if (itemType === 'seat' && onUpdateSeat) {
      onUpdateSeat(item.id, { color: value });
    } else if (itemType === 'zone' && onUpdateZone) {
      onUpdateZone(item.id, { color: value });
    } else if (itemType === 'shape' && onUpdateShape) {
      onUpdateShape(item.id, { color: value });
    } else if (itemType === 'text' && onUpdateText) {
      onUpdateText(item.id, { color: value });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {itemType === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <input
            type="number"
            value={item.fontSize || 16}
            onChange={(e) => onUpdateText?.(item.id, { fontSize: parseInt(e.target.value) || 16 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="8"
            max="72"
          />
        </div>
      )}

      {itemType === 'shape' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fill Color
            </label>
            <input
              type="color"
              value={item.fillColor || '#ffffff'}
              onChange={(e) => onUpdateShape?.(item.id, { fillColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Width
            </label>
            <input
              type="number"
              value={item.borderWidth || 0}
              onChange={(e) => onUpdateShape?.(item.id, { borderWidth: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="10"
            />
          </div>
        </>
      )}
    </div>
  );
}

function LayoutTab({ item, itemType, onUpdateSeat, onUpdateRow, onUpdateZone, onUpdateShape, onUpdateText }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X Position
          </label>
          <input
            type="number"
            value={item.x || item.cx || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (itemType === 'seat' && onUpdateSeat) {
                onUpdateSeat(item.id, { x: value });
              } else if (itemType === 'row' && onUpdateRow) {
                onUpdateRow(item.id, { x: value });
              } else if (itemType === 'zone' && onUpdateZone) {
                onUpdateZone(item.id, { x: value });
              } else if (itemType === 'shape' && onUpdateShape) {
                onUpdateShape(item.id, { x: value });
              } else if (itemType === 'text' && onUpdateText) {
                onUpdateText(item.id, { x: value });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Y Position
          </label>
          <input
            type="number"
            value={item.y || item.cy || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (itemType === 'seat' && onUpdateSeat) {
                onUpdateSeat(item.id, { y: value });
              } else if (itemType === 'row' && onUpdateRow) {
                onUpdateRow(item.id, { y: value });
              } else if (itemType === 'zone' && onUpdateZone) {
                onUpdateZone(item.id, { y: value });
              } else if (itemType === 'shape' && onUpdateShape) {
                onUpdateShape(item.id, { y: value });
              } else if (itemType === 'text' && onUpdateText) {
                onUpdateText(item.id, { y: value });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {(itemType === 'row' || itemType === 'shape' || itemType === 'text') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rotation (degrees)
          </label>
          <input
            type="number"
            value={item.rotation || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (itemType === 'row' && onUpdateRow) {
                onUpdateRow(item.id, { rotation: value });
              } else if (itemType === 'shape' && onUpdateShape) {
                onUpdateShape(item.id, { rotation: value });
              } else if (itemType === 'text' && onUpdateText) {
                onUpdateText(item.id, { rotation: value });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="360"
          />
        </div>
      )}
    </div>
  );
}

function TicketsTab({ item, onUpdateSeat }: { item: Seat; onUpdateSeat?: (seatId: string, updates: Partial<Seat>) => void }) {
  const [selectedTicketType, setSelectedTicketType] = useState(item.ticketType || 'standard');
  const [price, setPrice] = useState(item.price || 0);
  const [status, setStatus] = useState(item.status || 'available');

  const handleTicketTypeChange = (value: string) => {
    setSelectedTicketType(value);
    onUpdateSeat?.(item.id, { ticketType: value });
  };

  const handlePriceChange = (value: string) => {
    setPrice(parseFloat(value) || 0);
    onUpdateSeat?.(item.id, { price: parseFloat(value) || undefined });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as 'available' | 'reserved' | 'occupied' | 'disabled');
    onUpdateSeat?.(item.id, { status: value as 'available' | 'reserved' | 'occupied' | 'disabled' });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ticket Type
        </label>
        <select
          value={selectedTicketType}
          onChange={(e) => handleTicketTypeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TICKET_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SEAT_STATUSES.map(status => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function getSelectedItem(selectedItem: SelectionItem, seats: Seat[], rows: Row[], zones: Zone[], shapes: Shape[], texts: TextElement[]) {
  if (selectedItem.type === 'seat') {
    return seats.find(s => s.id === selectedItem.id);
  } else if (selectedItem.type === 'row') {
    return rows.find(r => r.id === selectedItem.id);
  } else if (selectedItem.type === 'zone') {
    return zones.find(z => z.id === selectedItem.id);
  } else if (selectedItem.type === 'shape') {
    return shapes.find(s => s.id === selectedItem.id);
  } else if (selectedItem.type === 'text') {
    return texts.find(t => t.id === selectedItem.id);
  }
  return null;
}