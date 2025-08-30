import React from 'react';
import { ToolType } from './types';

interface ToolInfoProps {
  activeTool: ToolType;
}

export default function ToolInfo({ activeTool }: ToolInfoProps) {
  const getToolInfo = () => {
    switch (activeTool) {
      case 'select':
        return {
          title: 'Select Tool',
          description: 'Click to select items. Drag to select multiple items.',
          shortcuts: ['V', 'Click', 'Drag']
        };
      
      case 'row':
        return {
          title: 'Row Tool',
          description: 'Click and drag to create a row of seats.',
          shortcuts: ['R', 'Click + Drag']
        };
      
      case 'rows':
        return {
          title: 'Rows & Columns Tool',
          description: 'Create multiple rows and columns of seats.',
          shortcuts: ['R', 'Click + Drag']
        };
      
      case 'text':
        return {
          title: 'Text Tool',
          description: 'Click to add text labels.',
          shortcuts: ['T', 'Click']
        };
      
      case 'rectangle':
        return {
          title: 'Rectangle Tool',
          description: 'Click and drag to draw rectangles.',
          shortcuts: ['1', 'Click + Drag']
        };
      
      case 'circle':
        return {
          title: 'Circle Tool',
          description: 'Click and drag to draw circles.',
          shortcuts: ['2', 'Click + Drag']
        };
      
      case 'oval':
        return {
          title: 'Oval Tool',
          description: 'Click and drag to draw ovals.',
          shortcuts: ['3', 'Click + Drag']
        };
      
      case 'polygon':
        return {
          title: 'Polygon Tool',
          description: 'Click and drag to draw polygons.',
          shortcuts: ['4', 'Click + Drag']
        };
      
      case 'pan':
        return {
          title: 'Pan Tool',
          description: 'Click and drag to pan the canvas.',
          shortcuts: ['H', 'Space + Drag']
        };
      
      default:
        return {
          title: 'Unknown Tool',
          description: 'Select a tool to get started.',
          shortcuts: []
        };
    }
  };

  const toolInfo = getToolInfo();

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs z-40">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">
        {toolInfo.title}
      </h3>
      <p className="text-xs text-gray-600 mb-2">
        {toolInfo.description}
      </p>
      {toolInfo.shortcuts.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {toolInfo.shortcuts.map((shortcut, index) => (
            <kbd
              key={index}
              className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded border"
            >
              {shortcut}
            </kbd>
          ))}
        </div>
      )}
    </div>
  );
} 