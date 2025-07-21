"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NewsForm from "@/components/news/NewsForm";
import { apiCall } from '@/lib/api';

export default function NewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

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
        onSuccess={() => router.push("/news")}
      />
    </div>
  );
} 