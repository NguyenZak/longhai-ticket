import React, { useRef, useState } from 'react';

export const Ripple: React.FC = () => {
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties | null>(null);
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const createRipple = (event: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    let x = 0, y = 0;
    if ('touches' in event && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left - size / 2;
      y = event.touches[0].clientY - rect.top - size / 2;
    } else if ('clientX' in event) {
      x = event.clientX - rect.left - size / 2;
      y = event.clientY - rect.top - size / 2;
    }
    setRippleStyle({
      width: size,
      height: size,
      left: x,
      top: y,
    });
    setShow(true);
    setTimeout(() => setShow(false), 500);
  };

  return (
    <div
      ref={containerRef}
      className="bunt-ripple-ink"
      onMouseDown={createRipple}
      onTouchStart={createRipple}
      style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', pointerEvents: 'none' }}
    >
      {show && <div className="ripple" style={rippleStyle ?? undefined} />}
    </div>
  );
}; 