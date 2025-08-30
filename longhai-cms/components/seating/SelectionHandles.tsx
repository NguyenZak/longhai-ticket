import React from 'react';

interface Boundary {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

interface SelectionHandlesProps {
  boundary: Boundary;
  onResizeStart: (corner: string, e: React.MouseEvent) => void;
  onRotateStart: (e: React.MouseEvent) => void;
  onMoveStart: (e: React.MouseEvent) => void;
}

export default function SelectionHandles({
  boundary,
  onResizeStart,
  onRotateStart,
  onMoveStart
}: SelectionHandlesProps) {
  const handleSize = 8;
  const handleOffset = handleSize / 2;

  // Corner handles for resizing - matching pretix implementation
  const renderCornerHandles = () => {
    const corners = [
      { x: boundary.x, y: boundary.y, cursor: 'nw-resize', corner: 'nw' },
      { x: boundary.x + boundary.width / 2, y: boundary.y, cursor: 'n-resize', corner: 'n' },
      { x: boundary.x + boundary.width, y: boundary.y, cursor: 'ne-resize', corner: 'ne' },
      { x: boundary.x + boundary.width, y: boundary.y + boundary.height / 2, cursor: 'e-resize', corner: 'e' },
      { x: boundary.x + boundary.width, y: boundary.y + boundary.height, cursor: 'se-resize', corner: 'se' },
      { x: boundary.x + boundary.width / 2, y: boundary.y + boundary.height, cursor: 's-resize', corner: 's' },
      { x: boundary.x, y: boundary.y + boundary.height, cursor: 'sw-resize', corner: 'sw' },
      { x: boundary.x, y: boundary.y + boundary.height / 2, cursor: 'w-resize', corner: 'w' }
    ];

    return corners.map((corner, index) => (
      <rect
        key={index}
        x={corner.x - handleOffset}
        y={corner.y - handleOffset}
        width={handleSize}
        height={handleSize}
        fill="#ffffff"
        stroke="#1976d2"
        strokeWidth="1"
        style={{ cursor: corner.cursor }}
        onMouseDown={(e) => onResizeStart(corner.corner, e)}
      />
    ));
  };

  // Rotate handle - matching pretix implementation
  const renderRotateHandle = () => {
    const rotateHandleDistance = 30;
    const rotateHandleX = boundary.cx;
    const rotateHandleY = boundary.y - rotateHandleDistance;

    return (
      <g>
        {/* Rotate handle line */}
        <line
          x1={boundary.cx}
          y1={boundary.y}
          x2={rotateHandleX}
          y2={rotateHandleY}
          stroke="#1976d2"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        {/* Rotate handle circle */}
        <circle
          cx={rotateHandleX}
          cy={rotateHandleY}
          r={handleSize}
          fill="#ffffff"
          stroke="#1976d2"
          strokeWidth="1"
          style={{ cursor: 'grab' }}
          onMouseDown={onRotateStart}
        />
        {/* Rotate icon */}
        <path
          d="M 6 6 L 10 6 L 10 10 M 6 6 L 6 10 L 10 10"
          transform={`translate(${rotateHandleX - 8}, ${rotateHandleY - 8})`}
          stroke="#1976d2"
          strokeWidth="1"
          fill="none"
        />
      </g>
    );
  };

  // Selection rectangle - matching pretix implementation
  const renderSelectionRectangle = () => {
    return (
      <rect
        x={boundary.x}
        y={boundary.y}
        width={boundary.width}
        height={boundary.height}
        fill="none"
        stroke="#1976d2"
        strokeWidth="1"
        strokeDasharray="5,5"
        style={{ pointerEvents: 'none' }}
      />
    );
  };

  // Move handle - matching pretix implementation
  const renderMoveHandle = () => {
    return (
      <rect
        x={boundary.x}
        y={boundary.y}
        width={boundary.width}
        height={boundary.height}
        fill="rgba(25, 118, 210, 0.1)"
        stroke="none"
        style={{ cursor: 'move' }}
        onMouseDown={onMoveStart}
      />
    );
  };

  return (
    <g className="selection-handles">
      {/* Move handle (invisible overlay) */}
      {renderMoveHandle()}
      
      {/* Selection rectangle */}
      {renderSelectionRectangle()}
      
      {/* Corner handles */}
      {renderCornerHandles()}
      
      {/* Rotate handle */}
      {renderRotateHandle()}
    </g>
  );
}