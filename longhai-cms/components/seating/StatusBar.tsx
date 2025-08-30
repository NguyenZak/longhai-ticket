import React from 'react';

interface StatusBarProps {
  selectedCount: number;
  totalSeats: number;
  zoom: number;
  gridEnabled: boolean;
  activeTool: string;
  statusMessage?: string;
}

export default function StatusBar({
  selectedCount,
  totalSeats,
  zoom,
  gridEnabled,
  activeTool,
  statusMessage
}: StatusBarProps) {
  const formatZoom = (zoom: number) => `${Math.round(zoom * 100)}%`;
  
  const getToolName = (tool: string) => {
    const toolNames: Record<string, string> = {
      'select': 'Select',
      'row': 'Row Tool',
      'rows': 'Rows Tool',
      'zone': 'Zone Tool',
      'pan': 'Pan Tool',
      'text': 'Text Tool',
      'rectangle': 'Rectangle Tool',
      'circle': 'Circle Tool',
      'oval': 'Oval Tool',
      'polygon': 'Polygon Tool'
    };
    return toolNames[tool] || tool;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
      {/* Left side - Status and selection info */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Status:</span>
          <span className="text-gray-700">
            {statusMessage || `${selectedCount} selected, ${totalSeats} total seats`}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-medium">Tool:</span>
          <span className="text-gray-700">{getToolName(activeTool)}</span>
        </div>
      </div>

      {/* Right side - Zoom and grid info */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Zoom:</span>
          <span className="text-gray-700">{formatZoom(zoom)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-medium">Grid:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            gridEnabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {gridEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
} 