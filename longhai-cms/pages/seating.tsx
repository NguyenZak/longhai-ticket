import dynamic from 'next/dynamic';

// Dùng dynamic import để tránh lỗi SSR với canvas
const SeatingEditorPage = dynamic(() => import('../components/seating'), { ssr: false });

export default function SeatingPage() {
  return <SeatingEditorPage />;
} 