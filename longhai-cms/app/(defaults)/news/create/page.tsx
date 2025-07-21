"use client";
import { useRouter } from "next/navigation";
import NewsForm from "@/components/news/NewsForm";

export default function NewsCreatePage() {
  const router = useRouter();
  return (
    <div className="mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Thêm tin tức mới</h1>
      <NewsForm
        onSuccess={() => router.push("/news")}
      />
    </div>
  );
} 