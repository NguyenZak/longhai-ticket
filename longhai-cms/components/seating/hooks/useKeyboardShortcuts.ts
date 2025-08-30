import { useEffect, useCallback } from 'react';
import { ToolType } from '../types';

interface KeyboardShortcutsProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onGridToggle: () => void;
  onFullscreen: () => void;
  onPan: () => void;
  onCenter: () => void;
  onExportPdf: () => void;
  onExportSvg: () => void;
}

export function useKeyboardShortcuts({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onSelectAll,
  onClearSelection,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onGridToggle,
  onFullscreen,
  onPan,
  onCenter,
  onExportPdf,
  onExportSvg
}: KeyboardShortcutsProps) {
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore shortcuts when typing in input fields
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    // Tool shortcuts
    switch (e.key.toLowerCase()) {
      case 'v':
        if (!isCtrlOrCmd && !isShift && !isAlt) {
          e.preventDefault();
          onToolChange('select');
        }
        break;
      case 'h':
        if (!isCtrlOrCmd && !isShift && !isAlt) {
          e.preventDefault();
          onToolChange('pan');
        }
        break;
      case 't':
        if (!isCtrlOrCmd && !isShift && !isAlt) {
          e.preventDefault();
          onToolChange('text');
        }
        break;
      case 'r':
        if (!isCtrlOrCmd && !isShift && !isAlt) {
          e.preventDefault();
          onToolChange('row');
        }
        break;
      case 'z':
        if (!isCtrlOrCmd && !isShift && !isAlt) {
          e.preventDefault();
          onToolChange('zone');
        }
        break;
    }

    // Edit shortcuts
    if (isCtrlOrCmd) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (isShift) {
            onRedo();
          } else {
            onUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          onRedo();
          break;
        case 'x':
          e.preventDefault();
          onCut();
          break;
        case 'c':
          e.preventDefault();
          onCopy();
          break;
        case 'v':
          e.preventDefault();
          onPaste();
          break;
        case 'a':
          e.preventDefault();
          onSelectAll();
          break;
        case 'd':
          e.preventDefault();
          onDelete();
          break;
      }
    }

    // Navigation shortcuts
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClearSelection();
        break;
      case 'Delete':
      case 'Backspace':
        if (!isCtrlOrCmd) {
          e.preventDefault();
          onDelete();
        }
        break;
    }

    // Zoom shortcuts
    if (isCtrlOrCmd) {
      switch (e.key) {
        case '=':
        case '+':
          e.preventDefault();
          onZoomIn();
          break;
        case '-':
          e.preventDefault();
          onZoomOut();
          break;
        case '0':
          e.preventDefault();
          onZoomReset();
          break;
      }
    }

    // Function keys
    switch (e.key) {
      case 'F11':
        e.preventDefault();
        onFullscreen();
        break;
      case 'F5':
        e.preventDefault();
        onCenter();
        break;
    }

    // Grid toggle
    if (e.key === 'g' && !isCtrlOrCmd && !isShift && !isAlt) {
      e.preventDefault();
      onGridToggle();
    }

    // Export shortcuts
    if (isCtrlOrCmd && isShift) {
      switch (e.key.toLowerCase()) {
        case 'p':
          e.preventDefault();
          onExportPdf();
          break;
        case 's':
          e.preventDefault();
          onExportSvg();
          break;
      }
    }
  }, [
    onToolChange,
    onUndo,
    onRedo,
    onCut,
    onCopy,
    onPaste,
    onDelete,
    onSelectAll,
    onClearSelection,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onGridToggle,
    onFullscreen,
    onPan,
    onCenter,
    onExportPdf,
    onExportSvg
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Return any additional functions if needed
  };
}