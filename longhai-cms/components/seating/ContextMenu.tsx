import React, { useState, useEffect } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onRotate?: (angle: number) => void;
  onFlip?: (direction: 'horizontal' | 'vertical') => void;
  onAlign?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute?: (direction: 'horizontal' | 'vertical') => void;
  onSetTicketType?: (type: string) => void;
  onSetSeatStatus?: (status: string) => void;
  onSetPrice?: (price: number) => void;
  canCut?: boolean;
  canCopy?: boolean;
  canPaste?: boolean;
  canDelete?: boolean;
  canDuplicate?: boolean;
  canGroup?: boolean;
  canUngroup?: boolean;
  canRotate?: boolean;
  canFlip?: boolean;
  canAlign?: boolean;
  canDistribute?: boolean;
  hasSelection?: boolean;
  hasMultipleSelection?: boolean;
  selectedType?: 'seat' | 'row' | 'zone' | 'shape' | 'text';
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onGroup,
  onUngroup,
  onRotate,
  onFlip,
  onAlign,
  onDistribute,
  canCut = true,
  canCopy = true,
  canPaste = true,
  canDelete = true,
  canDuplicate = true,
  canGroup = false,
  canUngroup = false,
  canRotate = true,
  canFlip = true,
  canAlign = false,
  canDistribute = false,
  hasSelection = false,
  hasMultipleSelection = false
}: ContextMenuProps) {
  const [menuRef, setMenuRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef && !menuRef.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, onClose]);

  const handleAction = (action: () => void | undefined) => {
    if (action) {
      action();
    }
    onClose();
  };

  return (
    <div
      ref={setMenuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[200px]"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {/* Edit actions */}
      {hasSelection && (
        <>
          {canCut && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAction(onCut)}
            >
              <span className="mr-2">✂️</span>
              Cut
              <span className="ml-auto text-xs text-gray-500">Ctrl+X</span>
            </button>
          )}
          
          {canCopy && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAction(onCopy)}
            >
              <span className="mr-2">📋</span>
              Copy
              <span className="ml-auto text-xs text-gray-500">Ctrl+C</span>
            </button>
          )}
          
          {canDelete && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAction(onDelete)}
            >
              <span className="mr-2">🗑️</span>
              Delete
              <span className="ml-auto text-xs text-gray-500">Del</span>
            </button>
          )}
          
          {canDuplicate && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAction(onDuplicate)}
            >
              <span className="mr-2">📄</span>
              Duplicate
              <span className="ml-auto text-xs text-gray-500">Ctrl+D</span>
            </button>
          )}
        </>
      )}

      {/* Paste action */}
      {canPaste && (
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
          onClick={() => handleAction(onPaste)}
        >
          <span className="mr-2">📋</span>
          Paste
          <span className="ml-auto text-xs text-gray-500">Ctrl+V</span>
        </button>
      )}

      {/* Group actions */}
      {hasMultipleSelection && (
        <>
          {canGroup && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAction(onGroup)}
            >
              <span className="mr-2">🔗</span>
              Group
              <span className="ml-auto text-xs text-gray-500">Ctrl+G</span>
            </button>
          )}
          
          {canUngroup && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAction(onUngroup)}
            >
              <span className="mr-2">🔓</span>
              Ungroup
              <span className="ml-auto text-xs text-gray-500">Ctrl+Shift+G</span>
            </button>
          )}
        </>
      )}

      {/* Layer actions */}
      {hasSelection && (
        <>
          <div className="border-t border-gray-200 my-1"></div>
          
          {onBringToFront && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAction(onBringToFront)}
            >
              <span className="mr-2">⬆️</span>
              Bring to Front
              <span className="ml-auto text-xs text-gray-500">Ctrl+]</span>
            </button>
          )}
          
          {onSendToBack && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
              onClick={() => handleAction(onSendToBack)}
            >
              <span className="mr-2">⬇️</span>
              Send to Back
              <span className="ml-auto text-xs text-gray-500">Ctrl+[</span>
            </button>
          )}
        </>
      )}

      {/* Transform actions */}
      {hasSelection && canRotate && (
        <>
          <div className="border-t border-gray-200 my-1"></div>
          
          <div className="px-4 py-2 text-sm text-gray-600">Rotate</div>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onRotate?.(90))}
          >
            <span className="mr-2">🔄</span>
            Rotate 90° Right
            <span className="ml-auto text-xs text-gray-500">R</span>
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onRotate?.(-90))}
          >
            <span className="mr-2">🔄</span>
            Rotate 90° Left
            <span className="ml-auto text-xs text-gray-500">Shift+R</span>
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onRotate?.(180))}
          >
            <span className="mr-2">🔄</span>
            Rotate 180°
          </button>
        </>
      )}

      {/* Flip actions */}
      {hasSelection && canFlip && (
        <>
          <div className="border-t border-gray-200 my-1"></div>
          
          <div className="px-4 py-2 text-sm text-gray-600">Flip</div>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onFlip?.('horizontal'))}
          >
            <span className="mr-2">↔️</span>
            Flip Horizontal
            <span className="ml-auto text-xs text-gray-500">H</span>
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onFlip?.('vertical'))}
          >
            <span className="mr-2">↕️</span>
            Flip Vertical
            <span className="ml-auto text-xs text-gray-500">V</span>
          </button>
        </>
      )}

      {/* Alignment actions */}
      {hasMultipleSelection && canAlign && (
        <>
          <div className="border-t border-gray-200 my-1"></div>
          
          <div className="px-4 py-2 text-sm text-gray-600">Align</div>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onAlign?.('left'))}
          >
            <span className="mr-2">⬅️</span>
            Align Left
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onAlign?.('center'))}
          >
            <span className="mr-2">↔️</span>
            Align Center
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onAlign?.('right'))}
          >
            <span className="mr-2">➡️</span>
            Align Right
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onAlign?.('top'))}
          >
            <span className="mr-2">⬆️</span>
            Align Top
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onAlign?.('middle'))}
          >
            <span className="mr-2">↕️</span>
            Align Middle
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onAlign?.('bottom'))}
          >
            <span className="mr-2">⬇️</span>
            Align Bottom
          </button>
        </>
      )}

      {/* Distribute actions */}
      {hasMultipleSelection && canDistribute && (
        <>
          <div className="border-t border-gray-200 my-1"></div>
          
          <div className="px-4 py-2 text-sm text-gray-600">Distribute</div>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onDistribute?.('horizontal'))}
          >
            <span className="mr-2">↔️</span>
            Distribute Horizontally
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onDistribute?.('vertical'))}
          >
            <span className="mr-2">↕️</span>
            Distribute Vertically
          </button>
        </>
      )}

      {/* Ticket Management - only for seats */}
      {selectedType === 'seat' && hasSelection && (
        <>
          <div className="border-t border-gray-200 my-1"></div>
          
          <div className="px-4 py-2 text-sm text-gray-600">Ticket Settings</div>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onSetTicketType?.('vip'))}
          >
            <span className="mr-2">👑</span>
            Set as VIP
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onSetTicketType?.('premium'))}
          >
            <span className="mr-2">⭐</span>
            Set as Premium
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onSetTicketType?.('standard'))}
          >
            <span className="mr-2">🎫</span>
            Set as Standard
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onSetTicketType?.('economy'))}
          >
            <span className="mr-2">💰</span>
            Set as Economy
          </button>
          
          <div className="border-t border-gray-200 my-1"></div>
          
          <div className="px-4 py-2 text-sm text-gray-600">Status</div>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onSetSeatStatus?.('available'))}
          >
            <span className="mr-2">🟢</span>
            Available
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onSetSeatStatus?.('reserved'))}
          >
            <span className="mr-2">🟡</span>
            Reserved
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onSetSeatStatus?.('occupied'))}
          >
            <span className="mr-2">🔴</span>
            Occupied
          </button>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
            onClick={() => handleAction(() => onSetSeatStatus?.('disabled'))}
          >
            <span className="mr-2">⚫</span>
            Disabled
          </button>
        </>
      )}
    </div>
  );
}