import BannerList from '../../../components/banners/BannerList';

export default function BannersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý Banner
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý banner hiển thị trên trang chủ
        </p>
      </div>
      
      <BannerList />
    </div>
  );
} 