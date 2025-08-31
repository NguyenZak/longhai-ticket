"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Point = { x: number; y: number };

type Seat = {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string;
  borderColor?: string;
  radius?: number;
  ticketType?: string;
  seatName?: string;
  rowName?: string | number;
  price?: number;
};

type Shape = {
  id: string;
  type: 'rectangle' | 'circle' | 'oval' | 'polygon';
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  points?: Point[];
  color?: string;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  rotation?: number;
};

type TextEl = {
  id: string;
  x: number;
  y: number;
  content: string;
  color?: string;
  fontSize?: number;
  rotation?: number;
};

export default function SavedPlanPreview({
  state,
  height = 600
}: {
  state: any;
  height?: number;
}) {
  const seats: Seat[] = (state?.seats || []) as Seat[];
  const shapes: Shape[] = (state?.shapes || []) as Shape[];
  const texts: TextEl[] = (state?.texts || []) as TextEl[];

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showPrices, setShowPrices] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const lastClient = useRef<{ x: number; y: number } | null>(null);

  const bounds = useMemo(() => {
    // compute min/max from seats and shapes
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    const grow = (x: number, y: number) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    };

    seats.forEach(s => grow(s.x, s.y));
    shapes.forEach(sh => {
      if (sh.type === 'rectangle') {
        const x = sh.x || 0, y = sh.y || 0, w = sh.w || 0, h = sh.h || 0;
        grow(x, y); grow(x + w, y + h);
      } else if (sh.type === 'circle') {
        const cx = sh.cx || 0, cy = sh.cy || 0, r = sh.r || 0;
        grow(cx - r, cy - r); grow(cx + r, cy + r);
      } else if (sh.type === 'oval') {
        const cx = sh.cx || 0, cy = sh.cy || 0, rx = sh.rx || 0, ry = sh.ry || 0;
        grow(cx - rx, cy - ry); grow(cx + rx, cy + ry);
      } else if (sh.type === 'polygon' && sh.points && sh.points.length) {
        sh.points.forEach(p => grow(p.x, p.y));
      }
    });
    texts.forEach(t => grow(t.x, t.y));

    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      return { x: 0, y: 0, w: 800, h: 600 };
    }
    const pad = 40;
    return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 };
  }, [seats, shapes, texts]);

  const [view, setView] = useState<{ x: number; y: number; w: number; h: number }>(bounds);

  useEffect(() => {
    setView(bounds);
  }, [bounds.x, bounds.y, bounds.w, bounds.h]);

  const zoom = (factor: number) => {
    setView(v => {
      const cx = v.x + v.w / 2;
      const cy = v.y + v.h / 2;
      const nw = v.w * factor;
      const nh = v.h * factor;
      return { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    });
  };

  const handleWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.1 : 0.9;
    zoom(scale);
  };

  const handleMouseDown: React.MouseEventHandler<SVGSVGElement> = (e) => {
    setIsPanning(true);
    lastClient.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!isPanning || !lastClient.current || !svgRef.current) return;
    const dxClient = e.clientX - lastClient.current.x;
    const dyClient = e.clientY - lastClient.current.y;

    const svgRect = svgRef.current.getBoundingClientRect();
    const unitsPerPxX = view.w / svgRect.width;
    const unitsPerPxY = view.h / svgRect.height;

    setView(v => ({ x: v.x - dxClient * unitsPerPxX, y: v.y - dyClient * unitsPerPxY, w: v.w, h: v.h }));
    lastClient.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp: React.MouseEventHandler<SVGSVGElement> = () => {
    setIsPanning(false);
    lastClient.current = null;
  };

  const ticketTypes = useMemo(() => {
    const map: Record<string, { id: string; name?: string; color?: string }> = {};
    (seats || []).forEach(s => {
      if (!s.ticketType) return;
      map[s.ticketType] = map[s.ticketType] || { id: s.ticketType, name: s.rowName?.toString(), color: s.color };
      map[s.ticketType].name = map[s.ticketType].name || s.rowName?.toString();
      map[s.ticketType].color = map[s.ticketType].color || s.color;
    });
    return Object.values(map);
  }, [seats]);

  const [enabledTypes, setEnabledTypes] = useState<string[]>([]);
  useEffect(() => {
    setEnabledTypes(ticketTypes.map(t => t.id));
  }, [ticketTypes.length]);

  const toggleType = (id: string) => {
    setEnabledTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const enableAll = () => setEnabledTypes(ticketTypes.map(t => t.id));
  const disableAll = () => setEnabledTypes([]);

  const seatsToRender = useMemo(() => {
    if (enabledTypes.length === 0) return seats;
    return seats.filter(s => !s.ticketType || enabledTypes.includes(String(s.ticketType)));
  }, [seats, enabledTypes]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-3 flex items-center gap-2 text-xs">
        <button onClick={() => zoom(1.1)} className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">Zoom -</button>
        <button onClick={() => zoom(0.9)} className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">Zoom +</button>
        <button onClick={() => setView(bounds)} className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">Reset</button>
        <button onClick={() => setShowGrid(g => !g)} className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">
          {showGrid ? 'Ẩn lưới' : 'Hiện lưới'}
        </button>
        <button onClick={() => setShowLabels(v => !v)} className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">
          {showLabels ? 'Ẩn nhãn' : 'Hiện nhãn'}
        </button>
        <button onClick={() => setShowPrices(v => !v)} className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">
          {showPrices ? 'Ẩn giá' : 'Hiện giá'}
        </button>
        <span className="ml-2 text-gray-500">{Math.round((bounds.w / view.w) * 100)}%</span>
      </div>

      {/* Legend */}
      {ticketTypes.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {ticketTypes.map(tt => {
            const active = enabledTypes.includes(tt.id);
            return (
              <button
                key={tt.id}
                type="button"
                onClick={() => toggleType(tt.id)}
                className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded border ${active ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
              >
                <span className="w-3 h-3 rounded" style={{ backgroundColor: tt.color || '#999' }} />
                <span>{tt.name || tt.id}</span>
              </button>
            );
          })}
          <button type="button" onClick={enableAll} className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">Chọn tất cả</button>
          <button type="button" onClick={disableAll} className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50">Bỏ chọn</button>
        </div>
      )}

      <div className="w-full overflow-auto border border-gray-200 rounded">
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          {/* Grid */}
          {showGrid && (
            <g>
              {(() => {
                const lines: JSX.Element[] = [];
                const step = 50;
                const xStart = Math.floor(view.x / step) * step;
                for (let x = xStart; x < view.x + view.w; x += step) {
                  lines.push(<line key={`vx-${x}`} x1={x} y1={view.y} x2={x} y2={view.y + view.h} stroke="#e5e7eb" strokeWidth={1} />);
                }
                const yStart = Math.floor(view.y / step) * step;
                for (let y = yStart; y < view.y + view.h; y += step) {
                  lines.push(<line key={`hz-${y}`} x1={view.x} y1={y} x2={view.x + view.w} y2={y} stroke="#e5e7eb" strokeWidth={1} />);
                }
                return lines;
              })()}
            </g>
          )}
          {/* Shapes */}
          {shapes.map(shape => {
            const common = {
              fill: shape.fillColor || shape.color || 'none',
              stroke: shape.borderColor || shape.color || '#999',
              strokeWidth: shape.borderWidth || 1
            } as any;
            if (shape.type === 'rectangle') {
              return (
                <rect key={shape.id} x={shape.x || 0} y={shape.y || 0} width={shape.w || 0} height={shape.h || 0} {...common} />
              );
            }
            if (shape.type === 'circle') {
              return (
                <circle key={shape.id} cx={shape.cx || 0} cy={shape.cy || 0} r={shape.r || 0} {...common} />
              );
            }
            if (shape.type === 'oval') {
              return (
                <ellipse key={shape.id} cx={shape.cx || 0} cy={shape.cy || 0} rx={shape.rx || 0} ry={shape.ry || 0} {...common} />
              );
            }
            if (shape.type === 'polygon' && shape.points && shape.points.length) {
              const pts = shape.points.map(p => `${p.x},${p.y}`).join(' ');
              return <polygon key={shape.id} points={pts} {...common} />;
            }
            return null;
          })}

          {/* Seats */}
          {seatsToRender.map(seat => (
            <g key={seat.id}>
              <circle cx={seat.x} cy={seat.y} r={seat.radius || 10} fill={seat.color || '#e5e7eb'} stroke={seat.borderColor || '#6b7280'} strokeWidth={1} />
              {showLabels && (seat.label || seat.seatName) && (
                <text x={seat.x} y={seat.y} textAnchor="middle" dy=".35em" fontSize="8" fill="#111827">
                  {seat.label || seat.seatName}
                </text>
              )}
              {showPrices && typeof seat.price === 'number' && (
                <text x={seat.x} y={seat.y + (seat.radius || 10) + 12} textAnchor="middle" fontSize="8" fill="#16a34a">
                  {seat.price.toLocaleString('vi-VN')}đ
                </text>
              )}
            </g>
          ))}

          {/* Texts */}
          {texts.map(t => (
            <text key={t.id} x={t.x} y={t.y} fontSize={t.fontSize || 14} fill={t.color || '#111827'} textAnchor="middle">
              {t.content}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}


