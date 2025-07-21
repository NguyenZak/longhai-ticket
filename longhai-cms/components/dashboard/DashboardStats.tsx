'use client';
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api';
import ReactApexChart from 'react-apexcharts';

interface StatsData {
  overview: {
    total_events: number;
    total_bookings: number;
    total_tickets: number;
    total_users: number;
    total_revenue: number;
  };
  monthly_stats: any[];
  upcoming_events: any[];
  recent_bookings: any[];
  top_events: any[];
  booking_status_stats: any[];
  event_status_stats: any[];
}

const DashboardStats = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revenueChart, setRevenueChart] = useState<any>(null);
  const [bookingChart, setBookingChart] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchRevenueChart();
    fetchBookingChart();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/dashboard/stats'); // Sửa endpoint tại đây
      console.log('Dashboard stats response:', data);
      setStats(data.data);
    } catch (err: any) {
      console.error('Dashboard stats error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueChart = async () => {
    try {
      const data = await apiCall('/dashboard/revenue-chart');
      setRevenueChart(data.data);
    } catch (err) {
      setRevenueChart(null);
    }
  };

  const fetchBookingChart = async () => {
    try {
      const data = await apiCall('/dashboard/booking-chart');
      setBookingChart(data.data);
    } catch (err) {
      setBookingChart(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats || !stats.overview) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <p className="text-yellow-600 dark:text-yellow-400">Không có dữ liệu thống kê</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const {
    
    overview,
    upcoming_events,
    recent_bookings,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Số liệu trong ngày/tháng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              {/* Vé bán được */}
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vé bán hôm nay</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(tickets_sold_today ?? 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              {/* Doanh thu hôm nay */}
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doanh thu hôm nay</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(revenue_today ?? 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              {/* Khách hàng mới */}
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Khách mới hôm nay</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(new_customers_today ?? 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              {/* Doanh thu tháng */}
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doanh thu tháng</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(revenue_month ?? 0)}
              </p>
            </div>
          </div>
        </div>
        {typeof visits_today === 'number' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/20">
                {/* Lượt truy cập hôm nay */}
                <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Truy cập hôm nay</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(visits_today)}
                </p>
              </div>
            </div>
          </div>
        )}
        {typeof visits_month === 'number' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                {/* Lượt truy cập tháng */}
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Truy cập tháng</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(visits_month)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng sự kiện</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(overview.total_events)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng đặt vé</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(overview.total_bookings)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng vé</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(overview.total_tickets)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Doanh thu</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(overview.total_revenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sự kiện sắp diễn ra
          </h3>
          <div className="space-y-3">
            {upcoming_events && upcoming_events.length > 0 ? (
              upcoming_events.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(event.start_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    {event.venue}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Không có sự kiện sắp diễn ra
              </p>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Đặt vé gần đây
          </h3>
          <div className="space-y-3">
            {recent_bookings && recent_bookings.length > 0 ? (
              recent_bookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.user?.name || booking.user?.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.event?.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(booking.total_amount)}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Không có đặt vé gần đây
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu ngày */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu ngày</h3>
        <ReactApexChart
          type="line"
          height={300}
          series={[
            {
              name: 'Doanh thu',
              data: (stats?.daily_revenue_chart?.data || stats?.daily_revenue_chart.data),
            },
          ]}
          options={{
            chart: { id: 'daily-revenue' },
            xaxis: { categories: (stats?.daily_revenue_chart?.labels || stats?.daily_revenue_chart.labels) },
            yaxis: { labels: { formatter: formatCurrency } },
            stroke: { curve: 'smooth' },
            colors: ['#1B55E2'],
          }}
        />
      </div>

      {/* Biểu đồ doanh thu tháng */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu tháng</h3>
        <ReactApexChart
          type="bar"
          height={300}
          series={[
            {
              name: 'Doanh thu',
              data: (stats?.monthly_revenue_chart?.data || stats?.monthly_revenue_chart.data),
            },
          ]}
          options={{
            chart: { id: 'monthly-revenue' },
            xaxis: { categories: (stats?.monthly_revenue_chart?.labels || stats?.monthly_revenue_chart.labels) },
            yaxis: { labels: { formatter: formatCurrency } },
            colors: ['#805dca'],
          }}
        />
      </div>

      {/* Biểu đồ doanh thu tổng hợp (theo tháng) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-4">Biểu đồ tổng doanh thu</h3>
        <ReactApexChart
          type="area"
          height={300}
          series={[
            {
              name: 'Doanh thu',
              data: (revenueChart?.data || revenueChart.data),
            },
          ]}
          options={{
            chart: { id: 'revenue-chart' },
            xaxis: { categories: (revenueChart?.labels || revenueChart.labels) },
            yaxis: { labels: { formatter: formatCurrency } },
            colors: ['#00ab55'],
          }}
        />
      </div>

      {/* Biểu đồ số lượng đặt vé theo tháng */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-4">Biểu đồ số lượng đặt vé</h3>
        <ReactApexChart
          type="bar"
          height={300}
          series={[
            {
              name: 'Đặt vé',
              data: (bookingChart?.data || bookingChart.data),
            },
          ]}
          options={{
            chart: { id: 'booking-chart' },
            xaxis: { categories: (bookingChart?.labels || bookingChart.labels) },
            yaxis: { labels: { formatter: formatNumber } },
            colors: ['#e7515a'],
          }}
        />
      </div>
    </div>
  );
};

export default DashboardStats; 