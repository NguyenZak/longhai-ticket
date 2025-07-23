import { useRef, useState } from 'react';

export function useSvgPanZoom(initialViewBox = { x: 0, y: 0, w: 1000, h: 1000 }) {
  const [viewBox, setViewBox] = useState(initialViewBox);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    setViewBox(vb => ({
      ...vb,
      x: vb.x - dx * (vb.w / 1000),
      y: vb.y - dy * (vb.h / 1000),
    }));
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => {
    dragging.current = false;
  };
  const onWheel = () => {
    // Không làm gì, để tránh lỗi linter khi gọi không đối số
  };
  const onWheelNative = (e: WheelEvent) => {
    e.preventDefault();
    const scale = e.deltaY < 0 ? 0.9 : 1.1;
    setViewBox(vb => {
      return {
        x: vb.x + (vb.w * (1 - scale)) / 2,
        y: vb.y + (vb.h * (1 - scale)) / 2,
        w: vb.w * scale,
        h: vb.h * scale,
      };
    });
  };
  return { viewBox, setViewBox, onMouseDown, onMouseMove, onMouseUp, onWheel, onWheelNative };
} 