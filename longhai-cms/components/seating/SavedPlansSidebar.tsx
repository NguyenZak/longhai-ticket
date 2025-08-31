import Link from 'next/link';
import IconMenuSeating from '@/components/icon/menu/icon-menu-seating';

export default function SavedPlansSidebar() {
  return (
    <li className="nav-item">
      <Link href="/seating/saved-plans" className="group">
        <div className="flex items-center">
          <IconMenuSeating className="shrink-0 group-hover:!text-primary" />
          <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Sơ đồ đã lưu</span>
        </div>
      </Link>
    </li>
  );
}


