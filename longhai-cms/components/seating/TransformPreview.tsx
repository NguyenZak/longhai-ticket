import React from 'react';
import { Point } from './types';

interface Boundary {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

interface TransformPreviewProps {
  boundary: Boundary | null;
  isTransforming: boolean;
  transformType: 'move' | 'rotate' | 'scale' | null;
  transformStart: Point | null;
  transformOrigin: Point | null;
  currentPoint: Point | null;
}

export default function TransformPreview({
  boundary,
  isTransforming,
  transformType,
  transformStart,
  transformOrigin,
  currentPoint
}: TransformPreviewProps) {
  if (!isTransforming || !boundary || !transformStart || !transformOrigin || !currentPoint) {
    return null;
  }

  // Render move preview - matching pretix implementation
  const renderMovePreview = () => {
    const dx = currentPoint.x - transformStart.x;
    const dy = currentPoint.y - transformStart.y;

    return (
      <g className="transform-preview move-preview">
        {/* Original boundary */}
        <rect
          x={boundary.x}
          y={boundary.y}
          width={boundary.width}
          height={boundary.height}
          fill="none"
          stroke="#999"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
        
        {/* Preview boundary */}
        <rect
          x={boundary.x + dx}
          y={boundary.y + dy}
          width={boundary.width}
          height={boundary.height}
          fill="rgba(25, 118, 210, 0.1)"
          stroke="#1976d2"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        
        {/* Movement arrow */}
        <line
          x1={boundary.cx}
          y1={boundary.cy}
          x2={boundary.cx + dx}
          y2={boundary.cy + dy}
          stroke="#1976d2"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      </g>
    );
  };

  // Render rotate preview - matching pretix implementation
  const renderRotatePreview = () => {
    const startAngle = Math.atan2(transformStart.y - transformOrigin.y, transformStart.x - transformOrigin.x);
    const currentAngle = Math.atan2(currentPoint.y - transformOrigin.y, currentPoint.x - transformOrigin.x);
    const rotationDelta = (currentAngle - startAngle) * 180 / Math.PI;

    return (
      <g className="transform-preview rotate-preview">
        {/* Original boundary */}
        <rect
          x={boundary.x}
          y={boundary.y}
          width={boundary.width}
          height={boundary.height}
          fill="none"
          stroke="#999"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
        
        {/* Preview boundary */}
        <rect
          x={boundary.x}
          y={boundary.y}
          width={boundary.width}
          height={boundary.height}
          fill="rgba(25, 118, 210, 0.1)"
          stroke="#1976d2"
          strokeWidth="2"
          strokeDasharray="5,5"
          transform={`rotate(${rotationDelta} ${boundary.cx} ${boundary.cy})`}
        />
        
        {/* Rotation arc */}
        <path
          d={`M ${transformOrigin.x} ${transformOrigin.y} A 50 50 0 0 1 ${currentPoint.x} ${currentPoint.y}`}
          fill="none"
          stroke="#1976d2"
          strokeWidth="2"
          strokeDasharray="3,3"
        />
        
        {/* Rotation center */}
        <circle
          cx={transformOrigin.x}
          cy={transformOrigin.y}
          r="3"
          fill="#1976d2"
        />
        
        {/* Rotation line */}
        <line
          x1={transformOrigin.x}
          y1={transformOrigin.y}
          x2={currentPoint.x}
          y2={currentPoint.y}
          stroke="#1976d2"
          strokeWidth="1"
        />
      </g>
    );
  };

  // Render scale preview - matching pretix implementation
  const renderScalePreview = () => {
    const startDistance = Math.sqrt(
      Math.pow(transformStart.x - transformOrigin.x, 2) + 
      Math.pow(transformStart.y - transformOrigin.y, 2)
    );
    const currentDistance = Math.sqrt(
      Math.pow(currentPoint.x - transformOrigin.x, 2) + 
      Math.pow(currentPoint.y - transformOrigin.y, 2)
    );
    const scaleFactor = currentDistance / startDistance;

    const scaledWidth = boundary.width * scaleFactor;
    const scaledHeight = boundary.height * scaleFactor;
    const scaledX = boundary.cx - scaledWidth / 2;
    const scaledY = boundary.cy - scaledHeight / 2;

    return (
      <g className="transform-preview scale-preview">
        {/* Original boundary */}
        <rect
          x={boundary.x}
          y={boundary.y}
          width={boundary.width}
          height={boundary.height}
          fill="none"
          stroke="#999"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
        
        {/* Preview boundary */}
        <rect
          x={scaledX}
          y={scaledY}
          width={scaledWidth}
          height={scaledHeight}
          fill="rgba(25, 118, 210, 0.1)"
          stroke="#1976d2"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        
        {/* Scale lines */}
        <line
          x1={boundary.x}
          y1={boundary.y}
          x2={scaledX}
          y2={scaledY}
          stroke="#1976d2"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <line
          x1={boundary.x + boundary.width}
          y1={boundary.y}
          x2={scaledX + scaledWidth}
          y2={scaledY}
          stroke="#1976d2"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <line
          x1={boundary.x}
          y1={boundary.y + boundary.height}
          x2={scaledX}
          y2={scaledY + scaledHeight}
          stroke="#1976d2"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <line
          x1={boundary.x + boundary.width}
          y1={boundary.y + boundary.height}
          x2={scaledX + scaledWidth}
          y2={scaledY + scaledHeight}
          stroke="#1976d2"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        
        {/* Scale center */}
        <circle
          cx={transformOrigin.x}
          cy={transformOrigin.y}
          r="3"
          fill="#1976d2"
        />
        
        {/* Scale line to cursor */}
        <line
          x1={transformOrigin.x}
          y1={transformOrigin.y}
          x2={currentPoint.x}
          y2={currentPoint.y}
          stroke="#1976d2"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      </g>
    );
  };

  return (
    <g className="transform-preview-container">
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#1976d2"
          />
        </marker>
      </defs>
      
      {/* Render appropriate preview based on transform type */}
      {transformType === 'move' && renderMovePreview()}
      {transformType === 'rotate' && renderRotatePreview()}
      {transformType === 'scale' && renderScalePreview()}
    </g>
  );
} 