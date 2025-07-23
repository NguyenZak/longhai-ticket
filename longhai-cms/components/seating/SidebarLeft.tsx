import React, { useState } from 'react';

export default function SidebarLeft() {
  const [zones, setZones] = useState([
    { id: 1, name: 'Zone 1' },
    { id: 2, name: 'Zone 2' },
  ]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Category A', color: 'bg-green-500' },
    { id: 2, name: 'Category B', color: 'bg-yellow-500' },
  ]);
  const [editingZone, setEditingZone] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);

  const addZone = () => {
    const newId = zones.length ? Math.max(...zones.map(z => z.id)) + 1 : 1;
    setZones([...zones, { id: newId, name: `Zone ${newId}` }]);
    setEditingZone(newId);
  };
  const removeZone = (id: number) => setZones(zones.filter(z => z.id !== id));
  const renameZone = (id: number, name: string) => setZones(zones.map(z => z.id === id ? { ...z, name } : z));

  const addCategory = () => {
    const newId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const color = newId % 2 === 0 ? 'bg-yellow-500' : 'bg-green-500';
    setCategories([...categories, { id: newId, name: `Category ${String.fromCharCode(64 + newId)}`, color }]);
    setEditingCategory(newId);
  };
  const removeCategory = (id: number) => setCategories(categories.filter(c => c.id !== id));
  const renameCategory = (id: number, name: string) => setCategories(categories.map(c => c.id === id ? { ...c, name } : c));

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col p-4">
      <div className="mb-6 c-tree-zone">
        <div className="group-title flex items-center justify-between mb-2">
          <span className="font-semibold text-base">Zones</span>
          <button className="bunt-icon-button w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-700 text-lg font-bold transition" title="Add Zone" onClick={addZone}>
            +
          </button>
        </div>
        <div className="space-y-1">
          {zones.map(zone => (
            <div key={zone.id} className="flex items-center group px-2 py-1 rounded hover:bg-blue-50 cursor-pointer transition">
              {editingZone === zone.id ? (
                <input
                  className="flex-1 border rounded px-1 text-sm"
                  value={zone.name}
                  autoFocus
                  onChange={e => renameZone(zone.id, e.target.value)}
                  onBlur={() => setEditingZone(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingZone(null); }}
                />
              ) : (
                <span className="flex-1 text-blue-700 font-medium" onDoubleClick={() => setEditingZone(zone.id)}>{zone.name}</span>
              )}
              <button className="ml-1 bunt-icon-button text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" onClick={() => removeZone(zone.id)} title="Delete">×</button>
            </div>
          ))}
        </div>
      </div>
      <hr className="my-4 border-gray-200" />
      <div className="c-tree-category">
        <div className="group-title flex items-center justify-between mb-2">
          <span className="font-semibold text-base">Categories</span>
          <button className="bunt-icon-button w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-700 text-lg font-bold transition" title="Add Category" onClick={addCategory}>
            +
          </button>
        </div>
        <div className="space-y-1">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center group gap-2 px-2 py-1 rounded hover:bg-green-50 cursor-pointer transition">
              <span className={`w-3 h-3 rounded-full inline-block border border-gray-400 ${cat.color}`}></span>
              {editingCategory === cat.id ? (
                <input
                  className="flex-1 border rounded px-1 text-sm"
                  value={cat.name}
                  autoFocus
                  onChange={e => renameCategory(cat.id, e.target.value)}
                  onBlur={() => setEditingCategory(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingCategory(null); }}
                />
              ) : (
                <span className="flex-1 text-green-700 font-medium" onDoubleClick={() => setEditingCategory(cat.id)}>{cat.name}</span>
              )}
              <button className="ml-1 bunt-icon-button text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" onClick={() => removeCategory(cat.id)} title="Delete">×</button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
} 