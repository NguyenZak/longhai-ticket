import React from 'react';

interface SidebarRightProps {
  canvasWidth: number;
  canvasHeight: number;
  onChangeWidth: (w: number) => void;
  onChangeHeight: (h: number) => void;
  onExpandGrid: (step?: number) => void;
  onShrinkGrid: (step?: number) => void;
  selectedText?: { id: string; x: number; y: number; content: string; color: string; rotation: number; fontSize: number; shapeId?: string } | null;
  onTextAttrChange?: (id: string, attr: Partial<{ content: string; color: string; rotation: number; fontSize: number; x: number; y: number }>) => void;
  selectedShape?: any;
  onUpdateShape?: (id: string, partial: any) => void;
  getShapeText?: (shapeId: string) => any;
  onShapeTextChange?: (shapeId: string, content: string, fontSize?: number, color?: string) => void;
  onDeleteShape?: (shapeId: string) => void;
}

export default function SidebarRight({
  canvasWidth,
  canvasHeight,
  onChangeWidth,
  onChangeHeight,
  onExpandGrid,
  onShrinkGrid,
  selectedText,
  onTextAttrChange,
  selectedShape,
  onUpdateShape,
  getShapeText,
  onShapeTextChange,
  onDeleteShape,
}: SidebarRightProps) {
  return (
    <div className="sidebar-right p-4 w-100 bg-white border-l border-gray-200 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Thuộc tính vùng vẽ</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Chiều rộng vùng vẽ (px)</label>
        <input
          type="number"
          min={100}
          max={3000}
          value={canvasWidth}
          onChange={e => onChangeWidth(Number(e.target.value))}
          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Chiều cao vùng vẽ (px)</label>
        <input
          type="number"
          min={100}
          max={3000}
          value={canvasHeight}
          onChange={e => onChangeHeight(Number(e.target.value))}
          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex gap-2 mb-4">
        <button
          className="flex-1 py-2 rounded bg-blue-100 hover:bg-blue-200 border border-blue-400 text-blue-700 font-semibold transition"
          onClick={() => onExpandGrid(100)}
        >
          Mở rộng lưới +100px
        </button>
        <button
          className="flex-1 py-2 rounded bg-gray-100 hover:bg-gray-200 border border-gray-400 text-gray-700 font-semibold transition"
          onClick={() => onShrinkGrid(100)}
        >
          Thu nhỏ lưới -100px
        </button>
      </div>
      {selectedShape && (
        <div className="mb-4 border-t pt-4 mt-4">
          <h3 className="text-base font-semibold mb-2">Shape</h3>
          <label className="block text-sm font-medium mb-1">Rotation</label>
          <input
            type="number"
            value={selectedShape.rotation ?? 0}
            min={-180}
            max={180}
            onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { rotation: Number(e.target.value) })}
            className="border rounded px-2 py-1 w-full mb-2"
          />
          {selectedShape.type === 'rectangle' && <>
            <label className="block text-sm font-medium mb-1">Width</label>
            <input
              type="number"
              value={selectedShape.w}
              min={1}
              onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { w: Number(e.target.value) })}
              className="border rounded px-2 py-1 w-full mb-2"
            />
            <label className="block text-sm font-medium mb-1">Height</label>
            <input
              type="number"
              value={selectedShape.h}
              min={1}
              onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { h: Number(e.target.value) })}
              className="border rounded px-2 py-1 w-full mb-2"
            />
          </>}
          {selectedShape.type === 'circle' && <>
            <label className="block text-sm font-medium mb-1">Radius</label>
            <input
              type="number"
              value={selectedShape.r}
              min={1}
              onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { r: Number(e.target.value) })}
              className="border rounded px-2 py-1 w-full mb-2"
            />
          </>}
          {selectedShape.type === 'oval' && <>
            <label className="block text-sm font-medium mb-1">Rx</label>
            <input
              type="number"
              value={selectedShape.rx}
              min={1}
              onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { rx: Number(e.target.value) })}
              className="border rounded px-2 py-1 w-full mb-2"
            />
            <label className="block text-sm font-medium mb-1">Ry</label>
            <input
              type="number"
              value={selectedShape.ry}
              min={1}
              onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { ry: Number(e.target.value) })}
              className="border rounded px-2 py-1 w-full mb-2"
            />
          </>}
          <label className="block text-sm font-medium mb-1">Fill color</label>
          <input
            type="color"
            value={selectedShape.fillColor ?? selectedShape.color ?? '#cccccc'}
            onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { fillColor: e.target.value })}
            className="w-10 h-8 p-0 border-0 mb-2"
          />
          <label className="block text-sm font-medium mb-1">Border color</label>
          <input
            type="color"
            value={selectedShape.borderColor ?? selectedShape.color ?? '#000000'}
            onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { borderColor: e.target.value })}
            className="w-10 h-8 p-0 border-0 mb-2"
          />
          <label className="block text-sm font-medium mb-1">Border width</label>
          <input
            type="number"
            value={selectedShape.borderWidth ?? 2}
            min={0}
            max={16}
            onChange={e => onUpdateShape && onUpdateShape(selectedShape.id, { borderWidth: Number(e.target.value) })}
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <label className="block text-sm font-medium mb-1">Text in shape</label>
          <input
            type="text"
            value={getShapeText ? (getShapeText(selectedShape.id)?.content || '') : ''}
            onChange={e => onShapeTextChange && onShapeTextChange(selectedShape.id, e.target.value)}
            className="border rounded px-2 py-1 w-full mb-2"
            placeholder="Text in shape..."
          />
          <label className="block text-sm font-medium mb-1">Text size</label>
          <input
            type="number"
            min={8}
            max={128}
            value={getShapeText ? (getShapeText(selectedShape.id)?.fontSize || 16) : 16}
            onChange={e => onShapeTextChange && onShapeTextChange(selectedShape.id, undefined, Number(e.target.value))}
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <label className="block text-sm font-medium mb-1">Text color</label>
          <input
            type="color"
            value={getShapeText ? (getShapeText(selectedShape.id)?.color || '#333333') : '#333333'}
            onChange={e => onShapeTextChange && onShapeTextChange(selectedShape.id, undefined, undefined, e.target.value)}
            className="w-10 h-8 p-0 border-0 mb-2"
          />
        </div>
      )}
      {/* Hide separate text panel if editing shape text */}
      {selectedText && !(selectedShape && getShapeText && getShapeText(selectedShape.id)) && (
        <div className="mb-4 border-t pt-4 mt-4">
          <h3 className="text-base font-semibold mb-2">Text</h3>
          <label className="block text-sm font-medium mb-1">Text</label>
          <input
            type="text"
            value={selectedText.content}
            onChange={e => onTextAttrChange && onTextAttrChange(selectedText.id, { content: e.target.value })}
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <label className="block text-sm font-medium mb-1">Text size</label>
          <input
            type="number"
            value={selectedText.fontSize}
            min={8}
            max={128}
            onChange={e => onTextAttrChange && onTextAttrChange(selectedText.id, { fontSize: Number(e.target.value) })}
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <label className="block text-sm font-medium mb-1">Text position (x)</label>
          <input
            type="number"
            value={selectedText.x}
            onChange={e => onTextAttrChange && onTextAttrChange(selectedText.id, { x: Number(e.target.value) })}
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <label className="block text-sm font-medium mb-1">Text position (y)</label>
          <input
            type="number"
            value={selectedText.y}
            onChange={e => onTextAttrChange && onTextAttrChange(selectedText.id, { y: Number(e.target.value) })}
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <label className="block text-sm font-medium mb-1">Text color</label>
          <input
            type="color"
            value={selectedText.color}
            onChange={e => onTextAttrChange && onTextAttrChange(selectedText.id, { color: e.target.value })}
            className="w-10 h-8 p-0 border-0 mb-2"
          />
        </div>
      )}
      {/* Các thuộc tính khác sẽ bổ sung sau */}
    </div>
  );
} 