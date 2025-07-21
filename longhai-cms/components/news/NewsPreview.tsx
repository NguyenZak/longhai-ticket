'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface News {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  category: string;
  tags: string[];
  read_time: number;
  featured: boolean;
  published_at: string;
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

interface NewsPreviewProps {
  news: News;
  onClose: () => void;
}

export default function NewsPreview({ news, onClose }: NewsPreviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Bản nháp', className: 'bg-gray-100 text-gray-800' },
      published: { label: 'Đã xuất bản', className: 'bg-green-100 text-green-800' },
      archived: { label: 'Đã lưu trữ', className: 'bg-orange-100 text-orange-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Xem trước tin tức</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              {getStatusBadge(news.status)}
              {news.featured && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  ⭐ Nổi bật
                </Badge>
              )}
              <Badge variant="outline">
                {news.category}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <span>👤 {news.author}</span>
              <span>⏱️ {news.read_time} phút đọc</span>
              {news.published_at && (
                <span>📅 {formatDate(news.published_at)}</span>
              )}
            </div>

            {news.image && (
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}

            <p className="text-lg text-gray-700 mb-4">{news.excerpt}</p>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: news.content }} />
          </div>

          {/* Tags */}
          {news.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* SEO Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Thông tin SEO</h3>
              <div className="space-y-2">
                <div>
                  <strong>Meta Title:</strong>
                  <p className="text-sm text-gray-600">{news.meta_title || 'Chưa có'}</p>
                </div>
                <div>
                  <strong>Meta Description:</strong>
                  <p className="text-sm text-gray-600">{news.meta_description || 'Chưa có'}</p>
                </div>
                <div>
                  <strong>Slug:</strong>
                  <p className="text-sm text-gray-600">{news.slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Đóng
            </button>
            <button
              onClick={() => window.open(`/news/${news.slug}`, '_blank')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Xem trên website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 