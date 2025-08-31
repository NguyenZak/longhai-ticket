import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SeatingEditorState, Seat } from './types';

type SavedPlan = {
  id: string;
  name: string;
  updatedAt: string; // ISO string
  state: Partial<SeatingEditorState>;
  ticketTypes?: Array<{ id: string; name?: string; color?: string }>;
};

const STORAGE_KEY = 'lh_seating_plans';

export default function SavedPlansPanel({
  currentState,
  onLoadPlan
}: {
  currentState: SeatingEditorState;
  onLoadPlan: (state: Partial<SeatingEditorState>) => void;
}) {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [name, setName] = useState<string>('');

  const loadPlans = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setPlans([]);
        return;
      }
      const parsed = JSON.parse(raw) as SavedPlan[];
      setPlans(parsed);
    } catch (e) {
      console.error('Failed to load saved plans:', e);
      setPlans([]);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const ticketTypesFromState = useMemo(() => {
    const map: Record<string, { id: string; name?: string; color?: string }> = {};
    (currentState.seats || []).forEach((s: Seat) => {
      if (!s.ticketType) return;
      if (!map[s.ticketType]) {
        map[s.ticketType] = {
          id: s.ticketType,
          name: s.category,
          color: s.color
        };
      } else {
        // backfill missing fields
        map[s.ticketType].name = map[s.ticketType].name || s.category;
        map[s.ticketType].color = map[s.ticketType].color || s.color;
      }
    });
    return Object.values(map);
  }, [currentState.seats]);

  const savePlans = (list: SavedPlan[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setPlans(list);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    const planName = trimmed || `Plan ${new Date().toLocaleString()}`;
    const plan: SavedPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: planName,
      updatedAt: new Date().toISOString(),
      state: {
        seats: currentState.seats,
        rows: currentState.rows,
        zones: currentState.zones,
        shapes: currentState.shapes,
        texts: currentState.texts,
        activeTool: currentState.activeTool,
        zoom: currentState.zoom,
        gridEnabled: currentState.gridEnabled
      },
      ticketTypes: ticketTypesFromState
    };
    const next = [plan, ...plans].slice(0, 100);
    savePlans(next);
    setName('');
  };

  const handleDelete = (id: string) => {
    const next = plans.filter(p => p.id !== id);
    savePlans(next);
  };

  const handleLoad = (plan: SavedPlan) => {
    onLoadPlan(plan.state || {});
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
          const parsed = JSON.parse(content);
          // Accept either full SeatingEditorState or partial
          const importedState: Partial<SeatingEditorState> = parsed;
          const ttMap: Record<string, { id: string; name?: string; color?: string }> = {};
          (importedState.seats || []).forEach((s: any) => {
            if (!s.ticketType) return;
            ttMap[s.ticketType] = ttMap[s.ticketType] || { id: s.ticketType, name: s.category, color: s.color };
            ttMap[s.ticketType].name = ttMap[s.ticketType].name || s.category;
            ttMap[s.ticketType].color = ttMap[s.ticketType].color || s.color;
          });
          const newPlan: SavedPlan = {
            id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: file.name.replace(/\.json$/i, ''),
            updatedAt: new Date().toISOString(),
            state: importedState,
            ticketTypes: Object.values(ttMap)
          };
          savePlans([newPlan, ...plans]);
        } catch (err) {
          console.error('Failed to import plan:', err);
          alert('Không thể import file JSON. Vui lòng kiểm tra nội dung.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Saved Seating Plans</h3>
        <p className="text-xs text-gray-500 mt-1">Lưu/Import sơ đồ ghế để tái sử dụng</p>
      </div>

      <div className="p-4 space-y-3 border-b border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sơ đồ</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Sân khấu A - VIP layout"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Lưu sơ đồ hiện tại
          </button>
          <button
            onClick={handleImport}
            className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 border border-gray-300"
          >
            Import JSON
          </button>
        </div>
        {ticketTypesFromState.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-600 mb-1">Loại vé hiện tại:</div>
            <div className="flex flex-wrap gap-2">
              {ticketTypesFromState.map(tt => (
                <div key={tt.id} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: tt.color || '#999' }} />
                  <span>{tt.name || tt.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {plans.length === 0 ? (
          <div className="text-xs text-gray-500 px-2 py-4">Chưa có sơ đồ nào được lưu.</div>
        ) : (
          <ul className="space-y-2">
            {plans.map(plan => (
              <li key={plan.id} className="border border-gray-200 rounded-md p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800 truncate" title={plan.name}>{plan.name}</div>
                    <div className="text-[10px] text-gray-500">{new Date(plan.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
                {plan.ticketTypes && plan.ticketTypes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {plan.ticketTypes.map(tt => (
                      <div key={tt.id} className="flex items-center gap-1 text-[10px]">
                        <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: tt.color || '#999' }} />
                        <span>{tt.name || tt.id}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleLoad(plan)}
                    className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Tải vào editor
                  </button>
                  <button
                    onClick={() => handleExport(plan)}
                    className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs border border-gray-300 hover:bg-gray-200"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-200 hover:bg-red-100"
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


