'use client';

import SavedPlanList from '@/components/seating-plans/SavedPlanList';

export default function SavedPlansPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sơ đồ đã lưu</h1>
        <p className="text-gray-600 dark:text-gray-400">Quản lý các sơ đồ ghế đã import/lưu cục bộ</p>
      </div>
      <SavedPlanList />
    </div>
  );
}


