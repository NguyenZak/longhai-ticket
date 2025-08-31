"use client";

import React, { useEffect, useState } from 'react';
import SavedPlanPreview from './SavedPlanPreview';

type SavedPlan = {
  id: string;
  name: string;
  updatedAt: string;
  state: any;
  ticketTypes?: Array<{ id: string; name?: string; color?: string }>;
};

const STORAGE_KEY = 'lh_seating_plans';

export default function SavedPlanList() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewPlan, setPreviewPlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setPlans(raw ? JSON.parse(raw) : []);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải danh sách sơ đồ');
    } finally {
      setLoading(false);
    }
  }, []);

  const savePlans = (list: SavedPlan[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setPlans(list);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa sơ đồ này?')) return;
    savePlans(plans.filter(p => p.id !== id));
  };

  const handleExport = (plan: SavedPlan) => {
    const dataStr = JSON.stringify(plan.state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${plan.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const content = ev.target?.result as string;
          const importedState = JSON.parse(content);
          // Normalize external plan (zones/rows/seats) to preview state { seats, shapes, texts }
          const normalizePlan = (data: any) => {
            if (Array.isArray(data?.seats)) {
              return data; // already in expected format
            }
            const categoryMap: Record<string, string> = {};
            (data?.categories || []).forEach((c: any) => {
              if (c?.name) categoryMap[c.name] = c.color || undefined;
            });
            const seats: any[] = [];
            (data?.zones || []).forEach((zone: any) => {
              const zx = zone?.position?.x || 0;
              const zy = zone?.position?.y || 0;
              (zone?.rows || []).forEach((row: any) => {
                const rx = row?.position?.x || 0;
                const ry = row?.position?.y || 0;
                const rowName = (row?.row_number ?? '').toString();
                (row?.seats || []).forEach((seat: any) => {
                  const sx = seat?.position?.x || 0;
                  const sy = seat?.position?.y || 0;
                  const category = seat?.category || '';
                  const id = seat?.uuid || seat?.seat_guid || `${rowName}-${seat?.seat_number}`;
                  seats.push({
                    id,
                    x: zx + rx + sx,
                    y: zy + ry + sy,
                    label: String(seat?.seat_number ?? ''),
                    seatName: `${rowName}${seat?.seat_number ?? ''}`,
                    rowName,
                    ticketType: category,
                    color: categoryMap[category] || undefined,
                    radius: 10,
                    borderColor: '#000000'
                  });
                });
              });
            });
            return { seats, shapes: [], texts: [] };
          };

          const normalizedState = normalizePlan(importedState);
          const ttMap: Record<string, { id: string; name?: string; color?: string }> = {};
          (normalizedState?.seats || []).forEach((s: any) => {
            if (!s?.ticketType) return;
            ttMap[s.ticketType] = ttMap[s.ticketType] || { id: s.ticketType, name: s.ticketType, color: s.color };
            ttMap[s.ticketType].name = ttMap[s.ticketType].name || s.ticketType;
            ttMap[s.ticketType].color = ttMap[s.ticketType].color || s.color;
          });
          const newPlan: SavedPlan = {
            id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: file.name.replace(/\.json$/i, ''),
            updatedAt: new Date().toISOString(),
            state: normalizedState,
            ticketTypes: Object.values(ttMap)
          };
          savePlans([newPlan, ...plans]);
        } catch (err) {
          alert('Không thể import file JSON.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách sơ đồ</h2>
        <button
          onClick={handleImport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Import JSON
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sơ đồ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại vé</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{plan.name || 'Không tên'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {(plan.ticketTypes || []).map(tt => (
                      <span key={tt.id} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded border border-gray-200">
                        <span className="w-3 h-3 rounded" style={{ backgroundColor: tt.color || '#999' }} />
                        <span>{tt.name || tt.id}</span>
                      </span>
                    ))}
                    {(!plan.ticketTypes || plan.ticketTypes.length === 0) && (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(plan.updatedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleExport(plan)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => setPreviewPlan(plan)}
                    className="text-green-600 hover:text-green-800 mr-4"
                  >
                    Xem sơ đồ
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {plans.length === 0 && (
          <div className="text-center py-8 text-gray-500">Chưa có sơ đồ nào</div>
        )}
      </div>

      {/* Preview Inline */}
      {previewPlan && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Xem sơ đồ: {previewPlan.name}</h3>
              <p className="text-xs text-gray-500">Cập nhật: {new Date(previewPlan.updatedAt).toLocaleString()}</p>
            </div>
            <button onClick={() => setPreviewPlan(null)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Ẩn</button>
          </div>
          <SavedPlanPreview state={previewPlan.state} height={600} />
        </div>
      )}
    </div>
  );
}


