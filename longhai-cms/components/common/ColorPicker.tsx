import React from 'react';
import ColorDisplay from './ColorDisplay';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  label = 'Màu sắc',
  className = '' 
}) => {
  const presetColors = [
    '#FFD700', // Vàng
    '#4CAF50', // Xanh lá
    '#2196F3', // Xanh dương
    '#FF5722', // Đỏ cam
    '#9C27B0', // Tím
    '#FF9800', // Cam
    '#607D8B', // Xám xanh
    '#E91E63', // Hồng
    '#00BCD4', // Xanh ngọc
    '#8BC34A', // Xanh lá nhạt
    '#FFC107', // Vàng cam
    '#795548'  // Nâu
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 cursor-pointer"
        />
        <ColorDisplay color={value} size="lg" />
      </div>
      <div className="mt-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Màu sắc phổ biến:</p>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                value === color 
                  ? 'border-gray-800 dark:border-white scale-110 shadow-lg' 
                  : 'border-gray-300 dark:border-gray-600 hover:shadow-md'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker; 