import React from 'react';

interface TransformToolbarProps {
  hasSelection: boolean;
  hasMultipleSelection: boolean;
  onRotate: (angle: number) => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute: (direction: 'horizontal' | 'vertical') => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDuplicate: () => void;
  onGroup: () => void;
  onUngroup: () => void;
}

export default function TransformToolbar({
  hasSelection,
  hasMultipleSelection,
  onRotate,
  onFlip,
  onAlign,
  onDistribute,
  onBringToFront,
  onSendToBack,
  onDuplicate,
  onGroup,
  onUngroup
}: TransformToolbarProps) {
  if (!hasSelection) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-40">
      <div className="flex items-center space-x-1">
        {/* Rotate buttons */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Rotate 90° Left"
            onClick={() => onRotate(-90)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Rotate 90° Right"
            onClick={() => onRotate(90)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Flip buttons */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Flip Horizontal"
            onClick={() => onFlip('horizontal')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Flip Vertical"
            onClick={() => onFlip('vertical')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Layer buttons */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Bring to Front"
            onClick={onBringToFront}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Send to Back"
            onClick={onSendToBack}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Duplicate button */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Duplicate (Ctrl+D)"
            onClick={onDuplicate}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Group buttons */}
        {hasMultipleSelection && (
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Group (Ctrl+G)"
              onClick={onGroup}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Ungroup (Ctrl+Shift+G)"
              onClick={onUngroup}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Alignment buttons */}
        {hasMultipleSelection && (
          <div className="flex items-center space-x-1">
            <div className="flex flex-col space-y-1">
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Align Top"
                onClick={() => onAlign('top')}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Align Middle"
                onClick={() => onAlign('middle')}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Align Bottom"
                onClick={() => onAlign('bottom')}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="flex space-x-1">
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Align Left"
                onClick={() => onAlign('left')}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Align Center"
                onClick={() => onAlign('center')}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8" />
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Align Right"
                onClick={() => onAlign('right')}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 