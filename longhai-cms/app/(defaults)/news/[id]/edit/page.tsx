"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NewsForm from "@/components/news/NewsForm";
import { apiCall } from '@/lib/api';
import Swal from 'sweetalert2';

export default function NewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm showMessage dùng SweetAlert2
  const showMessage = (msg = '', type = 'success') => {
    const toast: any = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: 'toast' },
    });
    toast.fire({
      icon: type,
      title: msg,
      padding: '10px 20px',
    });
  };

  useEffect(() => {
    if (params?.id) {
      apiCall(`/news/${params.id}`)
        .then(data => {
          setNews(data.data || null);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          console.error('Fetch error:', err);
        });
    }
  }, [params?.id]);

  if (loading) return <div className="py-8 text-center">Đang tải...</div>;
  if (!news) return <div className="py-8 text-center text-red-500">Không tìm thấy tin tức</div>;

  return (
    <div className="w-full mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa tin tức</h1>
      <NewsForm
        news={news}
        onSuccess={() => { showMessage('Cập nhật thành công', 'success'); router.push('/news'); }}
      />
    </div>
  );
} 