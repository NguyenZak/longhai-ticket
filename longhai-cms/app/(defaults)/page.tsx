import DashboardStats from '@/components/dashboard/DashboardStats';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Thống kê tổng quan hệ thống bán vé
        </p>
      </div>
      
      <DashboardStats />
    </div>
  );
}
