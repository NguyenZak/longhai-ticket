'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Toast } from '@/components/ui/toast';
import NewsForm from '@/components/news/NewsForm';
import NewsPreview from '@/components/news/NewsPreview';
import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconMore from '@/components/icon/icon-more';
import IconStar from '@/components/icon/icon-star';
import IconCalendar from '@/components/icon/icon-calendar';
import IconArchive from '@/components/icon/icon-archive';
import IconCopy from '@/components/icon/icon-copy';
import Link from "next/link";

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

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [previewNews, setPreviewNews] = useState<News | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/news');
      if (data.success) {
        setNews(data.data.data || data.data);
      } else {
        showNotification('error', data.message || 'Không thể tải tin tức');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      showNotification('error', 'Không thể tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tức này?')) return;
    try {
      const data = await apiCall(`/news/${id}`, { method: 'DELETE' });
      if (data.success) {
        showNotification('success', 'Tin tức đã được xóa thành công');
        fetchNews();
      } else {
        showNotification('error', data.message || 'Không thể xóa tin tức');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      showNotification('error', 'Không thể xóa tin tức');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const data = await apiCall(`/news/${id}/toggle-featured`, { method: 'POST' });
      if (data.success) {
        showNotification('success', 'Trạng thái nổi bật đã được cập nhật');
        fetchNews();
      } else {
        showNotification('error', data.message || 'Không thể cập nhật trạng thái nổi bật');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      showNotification('error', 'Không thể cập nhật trạng thái nổi bật');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const data = await apiCall(`/news/${id}/publish`, { method: 'POST' });
      if (data.success) {
        showNotification('success', 'Tin tức đã được xuất bản');
        fetchNews();
      } else {
        showNotification('error', data.message || 'Không thể xuất bản tin tức');
      }
    } catch (error) {
      console.error('Error publishing news:', error);
      showNotification('error', 'Không thể xuất bản tin tức');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const data = await apiCall(`/news/${id}/archive`, { method: 'POST' });
      if (data.success) {
        showNotification('success', 'Tin tức đã được lưu trữ');
        fetchNews();
      } else {
        showNotification('error', data.message || 'Không thể lưu trữ tin tức');
      }
    } catch (error) {
      console.error('Error archiving news:', error);
      showNotification('error', 'Không thể lưu trữ tin tức');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const data = await apiCall(`/news/${id}/duplicate`, { method: 'POST' });
      if (data.success) {
        showNotification('success', 'Tin tức đã được sao chép thành công');
        fetchNews();
      } else {
        showNotification('error', data.message || 'Không thể sao chép tin tức');
      }
    } catch (error) {
      console.error('Error duplicating news:', error);
      showNotification('error', 'Không thể sao chép tin tức');
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Bản nháp', className: 'text-gray-800 border-gray-300' },
      published: { label: 'Đã xuất bản', className: 'text-green-700 border-green-300' },
      archived: { label: 'Đã lưu trữ', className: 'text-orange-700 border-orange-300' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="outline" className={`whitespace-nowrap ${config.className}`}>{config.label}</Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className="text-xs">
        {category}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tin tức</h1>
          <p className="text-gray-600">Quản lý và xuất bản tin tức cho website</p>
        </div>
        <Link href="/news/create">
          <Button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center'>
            + Thêm tin tức
          </Button>
        </Link>
      </div>

      {/* News Preview */}
      {previewNews && (
        <NewsPreview
          news={previewNews}
          onClose={() => setPreviewNews(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{news.length}</div>
          <div className="text-sm text-gray-600">Tổng số tin tức</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {news.filter(item => item.status === 'published').length}
          </div>
          <div className="text-sm text-gray-600">Đã xuất bản</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {news.filter(item => item.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-600">Bản nháp</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-pink-600">
            {news.filter(item => item.featured).length}
          </div>
          <div className="text-sm text-gray-600">Nổi bật</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <Input
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48 h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Sự kiện">Sự kiện</option>
            <option value="Nghệ sĩ">Nghệ sĩ</option>
            <option value="Thông báo">Thông báo</option>
            <option value="Behind the scenes">Behind the scenes</option>
            <option value="Phỏng vấn">Phỏng vấn</option>
            <option value="Công nghệ">Công nghệ</option>
          </select>
        </div>
      </Card>

      {/* News Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNews.length > 0 ? (
              filteredNews.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-start space-x-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate">{item.title}</p>
                          {item.featured && (
                            <span className="text-yellow-500">⭐</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{item.excerpt}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>⏱️ {item.read_time} phút</span>
                          {item.published_at && (
                            <span>📅 {formatDate(item.published_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(item.category)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center whitespace-nowrap">
                      👤 {item.author}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewNews(item)}
                        title="Xem trước"
                      >
                        <IconEye className="w-5 h-5" />
                      </Button>
                      <Link href={`/news/${item.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Chỉnh sửa"
                        >
                          <IconEdit className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Xóa"
                      >
                        <IconTrash className="w-5 h-5" />
                      </Button>
                      {/* Nút ba chấm mở menu */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMenuOpenId(item.id)}
                          title="Thao tác khác"
                        >
                          <IconMore className="w-5 h-5" />
                        </Button>
                        {menuOpenId === item.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                            <button
                              className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                              onClick={() => { handleToggleFeatured(item.id); setMenuOpenId(null); }}
                            >
                              <IconStar className="w-4 h-4 mr-2" />
                              {item.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                            </button>
                            {item.status === 'draft' && (
                              <button
                                className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                                onClick={() => { handlePublish(item.id); setMenuOpenId(null); }}
                              >
                                <IconCalendar className="w-4 h-4 mr-2" />
                                Xuất bản
                              </button>
                            )}
                            {item.status === 'published' && (
                              <button
                                className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                                onClick={() => { handleArchive(item.id); setMenuOpenId(null); }}
                              >
                                <IconArchive className="w-4 h-4 mr-2" />
                                Lưu trữ
                              </button>
                            )}
                            <button
                              className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                              onClick={() => { handleDuplicate(item.id); setMenuOpenId(null); }}
                            >
                              <IconCopy className="w-4 h-4 mr-2" />
                              Sao chép
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-gray-500">Không tìm thấy tin tức nào</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 