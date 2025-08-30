import React, { useState } from 'react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Tools',
      items: [
        { key: 'V', description: 'Select Tool' },
        { key: 'H', description: 'Pan Tool' },
        { key: 'T', description: 'Text Tool' },
        { key: 'R', description: 'Row Tool' },
        { key: 'Z', description: 'Zone Tool' },
        { key: 'G', description: 'Toggle Grid' },
      ]
    },
    {
      category: 'Edit',
      items: [
        { key: 'Ctrl+Z', description: 'Undo' },
        { key: 'Ctrl+Y', description: 'Redo' },
        { key: 'Ctrl+X', description: 'Cut' },
        { key: 'Ctrl+C', description: 'Copy' },
        { key: 'Ctrl+V', description: 'Paste' },
        { key: 'Ctrl+A', description: 'Select All' },
        { key: 'Delete', description: 'Delete' },
        { key: 'Escape', description: 'Clear Selection' },
      ]
    },
    {
      category: 'View',
      items: [
        { key: 'Ctrl++', description: 'Zoom In' },
        { key: 'Ctrl+-', description: 'Zoom Out' },
        { key: 'Ctrl+0', description: 'Reset Zoom' },
        { key: 'F5', description: 'Center View' },
        { key: 'F11', description: 'Fullscreen' },
      ]
    },
    {
      category: 'Export',
      items: [
        { key: 'Ctrl+Shift+P', description: 'Export PDF' },
        { key: 'Ctrl+Shift+S', description: 'Export SVG' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item.key} className="flex justify-between items-center py-1">
                      <span className="text-gray-600">{item.description}</span>
                      <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 text-gray-800 rounded border">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Tip: You can also access these shortcuts from the toolbar and context menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 