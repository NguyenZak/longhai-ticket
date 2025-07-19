import TestUpload from '../../../components/banners/TestUpload';

export default function TestUploadPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Test Cloudinary Upload
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test upload ảnh qua Cloudinary
        </p>
      </div>
      
      <TestUpload />
    </div>
  );
} 