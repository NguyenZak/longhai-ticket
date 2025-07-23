import React from 'react';

const TOOLBAR_GROUPS = [
  [
    { key: 'file', icon: '/icons/tool-file.svg', tooltip: 'File' },
    { key: 'open-file', icon: '/icons/tool-open-file.svg', tooltip: 'Open' },
    { key: 'save-file', icon: '/icons/tool-save-file.svg', tooltip: 'Save' },
    { key: 'export-pdf', icon: '/icons/tool-export-pdf.svg', tooltip: 'Export PDF' },
  ],
  [
    { key: 'validate', icon: '/icons/tool-validate.svg', tooltip: 'Validate' },
  ],
  [
    { key: 'select', icon: '/icons/tool-select.svg', tooltip: 'Select' },
    { key: 'seat', icon: '/icons/tool-seat.svg', tooltip: 'Add Seat' },
    { key: 'row', icon: '/icons/tool-row.svg', tooltip: 'Row' },
    { key: 'rows', icon: '/icons/tool-rows.svg', tooltip: 'Rows & Column' },
    { key: 'text', icon: '/icons/tool-text.svg', tooltip: 'Text' },
  ],
  [
    { key: 'rectangle', icon: '/icons/tool-rectangle.svg', tooltip: 'Rectangle' },
    { key: 'circle', icon: '/icons/tool-circle.svg', tooltip: 'Circle' },
    { key: 'oval', icon: '/icons/tool-oval.svg', tooltip: 'Oval' },
    { key: 'polygon', icon: '/icons/tool-polygon.svg', tooltip: 'Polygon' },
  ],
  [
    { key: 'undo', icon: '/icons/tool-undo.svg', tooltip: 'Undo' },
    { key: 'redo', icon: '/icons/tool-redo.svg', tooltip: 'Redo' },
    { key: 'cut', icon: '/icons/tool-cut.svg', tooltip: 'Cut' },
    { key: 'copy', icon: '/icons/tool-copy.svg', tooltip: 'Copy' },
    { key: 'paste', icon: '/icons/tool-paste.svg', tooltip: 'Paste' },
    { key: 'delete', icon: '/icons/tool-delete.svg', tooltip: 'Delete' },
  ],
  [
    { key: 'zoom-out', icon: '/icons/tool-zoom-out.svg', tooltip: 'Zoom Out' },
    { key: 'zoom', icon: '/icons/tool-zoom.svg', tooltip: '100%' },
    { key: 'zoom-in', icon: '/icons/tool-zoom-in.svg', tooltip: 'Zoom In' },
  ],
  [
    { key: 'grid', icon: '/icons/tool-grid.svg', tooltip: 'Grid' },
    { key: 'fullscreen', icon: '/icons/tool-fullscreen.svg', tooltip: 'Full Screen' },
  ],
  [
    { key: 'center', icon: '/icons/tool-center.svg', tooltip: 'Center' },
    { key: 'pan', icon: '/icons/tool-pan.svg', tooltip: 'Pan' },
  ],
];

export default function Toolbar({ activeTool, onToolSelect, onUndo, onRedo, onCut, onCopy, onPaste, onDelete, zoom, onZoomIn, onZoomOut, onZoomReset, onCenter, onPan, onFullscreen }: {
  activeTool: string;
  onToolSelect?: (tool: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onCenter?: () => void;
  onPan?: () => void;
  onFullscreen?: () => void;
}) {
  return (
    <div className="c-toolbar flex flex-row items-center bg-white border-b border-gray-200 px-2 py-1 shadow-sm overflow-x-auto">
      {TOOLBAR_GROUPS.map((group, idx) => (
        <div
          key={idx}
          className={
            'group flex flex-row items-center gap-1 pr-2 mr-2' +
            (idx < TOOLBAR_GROUPS.length - 1 ? ' border-r border-gray-200' : '')
          }
        >
          {group.map(tool => {
            if (tool.key === 'fullscreen') {
              return (
                <button
                  key={tool.key}
                  className="bunt-icon-button mx-1 p-1 rounded-full transition hover:bg-gray-100 hover:border-gray-400 border border-transparent"
                  onClick={onFullscreen}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'undo') {
              return (
                <button
                  key={tool.key}
                  className={`bunt-icon-button mx-1 p-1 rounded-full transition ${activeTool === tool.key ? 'bg-blue-100 border-2 border-blue-500 shadow-md hover:bg-blue-200 hover:border-blue-700' : 'hover:bg-gray-100 hover:border-gray-400 border border-transparent'}`}
                  onClick={onUndo}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'redo') {
              return (
                <button
                  key={tool.key}
                  className={`bunt-icon-button mx-1 p-1 rounded-full transition ${activeTool === tool.key ? 'bg-blue-100 border-2 border-blue-500 shadow-md hover:bg-blue-200 hover:border-blue-700' : 'hover:bg-gray-100 hover:border-gray-400 border border-transparent'}`}
                  onClick={onRedo}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'cut') {
              return (
                <button
                  key={tool.key}
                  className={`bunt-icon-button mx-1 p-1 rounded-full transition ${activeTool === tool.key ? 'bg-blue-100 border-2 border-blue-500 shadow-md hover:bg-blue-200 hover:border-blue-700' : 'hover:bg-gray-100 hover:border-gray-400 border border-transparent'}`}
                  onClick={onCut}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'copy') {
              return (
                <button
                  key={tool.key}
                  className={`bunt-icon-button mx-1 p-1 rounded-full transition ${activeTool === tool.key ? 'bg-blue-100 border-2 border-blue-500 shadow-md hover:bg-blue-200 hover:border-blue-700' : 'hover:bg-gray-100 hover:border-gray-400 border border-transparent'}`}
                  onClick={onCopy}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'paste') {
              return (
                <button
                  key={tool.key}
                  className={`bunt-icon-button mx-1 p-1 rounded-full transition ${activeTool === tool.key ? 'bg-blue-100 border-2 border-blue-500 shadow-md hover:bg-blue-200 hover:border-blue-700' : 'hover:bg-gray-100 hover:border-gray-400 border border-transparent'}`}
                  onClick={onPaste}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'delete') {
              return (
                <button
                  key={tool.key}
                  className={`bunt-icon-button mx-1 p-1 rounded-full transition ${activeTool === tool.key ? 'bg-blue-100 border-2 border-blue-500 shadow-md hover:bg-blue-200 hover:border-blue-700' : 'hover:bg-gray-100 hover:border-gray-400 border border-transparent'}`}
                  onClick={onDelete}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'zoom-in') {
              return (
                <button
                  key={tool.key}
                  className="bunt-icon-button mx-1 p-1 rounded-full transition hover:bg-gray-100 hover:border-gray-400 border border-transparent"
                  onClick={onZoomIn}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'zoom-out') {
              return (
                <button
                  key={tool.key}
                  className="bunt-icon-button mx-1 p-1 rounded-full transition hover:bg-gray-100 hover:border-gray-400 border border-transparent"
                  onClick={onZoomOut}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'zoom') {
              return (
                <button
                  key={tool.key}
                  className="bunt-icon-button mx-1 p-1 rounded-full transition hover:bg-gray-100 hover:border-gray-400 border border-transparent"
                  onClick={onZoomReset}
                  title={tool.tooltip}
                  type="button"
                >
                  <span style={{ minWidth: 36, display: 'inline-block', textAlign: 'center', fontWeight: 600 }}>{zoom ? Math.round(zoom * 100) + '%' : '100%'}</span>
                </button>
              );
            }
            if (tool.key === 'center') {
              return (
                <button
                  key={tool.key}
                  className="bunt-icon-button mx-1 p-1 rounded-full transition hover:bg-gray-100 hover:border-gray-400 border border-transparent"
                  onClick={onCenter}
                  title={tool.tooltip}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            if (tool.key === 'pan') {
              return (
                <button
                  key={tool.key}
                  className={`bunt-icon-button mx-1 p-1 rounded-full transition ${activeTool === 'pan' ? 'bg-blue-100 border-2 border-blue-500 shadow-md hover:bg-blue-200 hover:border-blue-700' : 'hover:bg-gray-100 hover:border-gray-400 border border-transparent'}`}
                  onClick={onPan}
                  title={tool.tooltip + ' (H)'}
                  type="button"
                >
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                </button>
              );
            }
            return (
              <button
                key={tool.key}
                className={`bunt-icon-button mx-1 p-1 rounded-full transition
                ${activeTool === tool.key
                  ? 'bg-blue-100 border-2 border-blue-500 shadow-md hover:bg-blue-200 hover:border-blue-700'
                  : 'hover:bg-gray-100 hover:border-gray-400 border border-transparent'}
              `}
                onClick={() => onToolSelect && onToolSelect(tool.key)}
                title={tool.tooltip}
                type="button"
              >
                {tool.icon ? (
                  <img src={tool.icon} alt={tool.key} width={24} height={24} style={{ display: 'block' }} />
                ) : (
                  <span className="text-xs font-medium">{tool.tooltip}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
} 