import React from 'react';

interface ColorDisplayProps {
  color: string;
  showHex?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ColorDisplay: React.FC<ColorDisplayProps> = ({ 
  color, 
  showHex = true, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (!color) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded border border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer hover:scale-110 transition-transform`}
        style={{ backgroundColor: color }}
        title={`Màu: ${color}`}
      />
      {showHex && (
        <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400 font-mono`}>
          {color}
        </span>
      )}
    </div>
  );
};

export default ColorDisplay; 