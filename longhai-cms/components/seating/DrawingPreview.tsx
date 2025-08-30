import React from 'react';
import { Shape } from './types';

interface DrawingPreviewProps {
  shape: Shape | null;
}

export default function DrawingPreview({ shape }: DrawingPreviewProps) {
  if (!shape) return null;

  const renderShape = () => {
    switch (shape.type) {
      case 'rectangle':
        return (
          <rect
            x={shape.x}
            y={shape.y}
            width={shape.w}
            height={shape.h}
            fill="none"
            stroke={shape.color}
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        );
      
      case 'circle':
        return (
          <circle
            cx={shape.cx}
            cy={shape.cy}
            r={shape.r}
            fill="none"
            stroke={shape.color}
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        );
      
      case 'oval':
        return (
          <ellipse
            cx={shape.cx}
            cy={shape.cy}
            rx={shape.rx}
            ry={shape.ry}
            fill="none"
            stroke={shape.color}
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        );
      
      case 'polygon':
        if (!shape.points) return null;
        const points = shape.points.map(p => `${p.x},${p.y}`).join(' ');
        return (
          <polygon
            points={points}
            fill="none"
            stroke={shape.color}
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <g className="drawing-preview">
      {renderShape()}
    </g>
  );
} 