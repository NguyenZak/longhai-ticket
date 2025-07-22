'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import IconStar from '@/components/icon/icon-star';
import ReactApexChart from 'react-apexcharts';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconMore from '@/components/icon/icon-more';
import IconCalendar from '@/components/icon/icon-calendar';
import IconArchive from '@/components/icon/icon-archive';
import IconCopy from '@/components/icon/icon-copy';
import IconEye from '@/components/icon/icon-eye';
import Link from 'next/link';
import IconUser from '@/components/icon/icon-user';

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

interface Props {
  data: News[];
  onPreview: (news: News) => void;
  onEdit: (news: News) => void;
  onDelete: (id: number) => void;
  onToggleFeatured: (id: number) => void;
  onPublish: (id: number) => void;
  onArchive: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDraft?: (id: number) => void;
}

const ComponentsDatatablesAdvanced = (props: Partial<Props>) => {
  const {
    data,
    onPreview,
    onEdit,
    onDelete,
    onToggleFeatured,
    onPublish,
    onArchive,
    onDuplicate,
    onDraft,
  } = props;
  // Nếu không có data truyền vào thì dùng rowData mẫu
  const tableData = data && data.length > 0 ? data : [];

    const countryList = [
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'AR', name: 'Argentina' },
        { code: 'AT', name: 'Austria' },
        { code: 'AU', name: 'Australia' },
        { code: 'BE', name: 'Belgium' },
        { code: 'BG', name: 'Bulgaria' },
        { code: 'BN', name: 'Brunei' },
        { code: 'BR', name: 'Brazil' },
        { code: 'BY', name: 'Belarus' },
        { code: 'CA', name: 'Canada' },
        { code: 'CH', name: 'Switzerland' },
        { code: 'CL', name: 'Chile' },
        { code: 'CN', name: 'China' },
        { code: 'CO', name: 'Colombia' },
        { code: 'CZ', name: 'Czech Republic' },
        { code: 'DE', name: 'Germany' },
        { code: 'DK', name: 'Denmark' },
        { code: 'DZ', name: 'Algeria' },
        { code: 'EC', name: 'Ecuador' },
        { code: 'EG', name: 'Egypt' },
        { code: 'ES', name: 'Spain' },
        { code: 'FI', name: 'Finland' },
        { code: 'FR', name: 'France' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'GR', name: 'Greece' },
        { code: 'HK', name: 'Hong Kong' },
        { code: 'HR', name: 'Croatia' },
        { code: 'HU', name: 'Hungary' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'IE', name: 'Ireland' },
        { code: 'IL', name: 'Israel' },
        { code: 'IN', name: 'India' },
        { code: 'IT', name: 'Italy' },
        { code: 'JO', name: 'Jordan' },
        { code: 'JP', name: 'Japan' },
        { code: 'KE', name: 'Kenya' },
        { code: 'KH', name: 'Cambodia' },
        { code: 'KR', name: 'South Korea' },
        { code: 'KZ', name: 'Kazakhstan' },
        { code: 'LA', name: 'Laos' },
        { code: 'LK', name: 'Sri Lanka' },
        { code: 'MA', name: 'Morocco' },
        { code: 'MM', name: 'Myanmar' },
        { code: 'MO', name: 'Macau' },
        { code: 'MX', name: 'Mexico' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'NG', name: 'Nigeria' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'NO', name: 'Norway' },
        { code: 'NZ', name: 'New Zealand' },
        { code: 'PE', name: 'Peru' },
        { code: 'PH', name: 'Philippines' },
        { code: 'PK', name: 'Pakistan' },
        { code: 'PL', name: 'Poland' },
        { code: 'PT', name: 'Portugal' },
        { code: 'QA', name: 'Qatar' },
        { code: 'RO', name: 'Romania' },
        { code: 'RS', name: 'Serbia' },
        { code: 'RU', name: 'Russia' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'SE', name: 'Sweden' },
        { code: 'SG', name: 'Singapore' },
        { code: 'SK', name: 'Slovakia' },
        { code: 'TH', name: 'Thailand' },
        { code: 'TN', name: 'Tunisia' },
        { code: 'TR', name: 'Turkey' },
        { code: 'TW', name: 'Taiwan' },
        { code: 'UK', name: 'Ukraine' },
        { code: 'UG', name: 'Uganda' },
        { code: 'US', name: 'United States' },
        { code: 'VI', name: 'Vietnam' },
        { code: 'ZA', name: 'South Africa' },
        { code: 'BA', name: 'Bosnia and Herzegovina' },
        { code: 'BD', name: 'Bangladesh' },
        { code: 'EE', name: 'Estonia' },
        { code: 'IQ', name: 'Iraq' },
        { code: 'LU', name: 'Luxembourg' },
        { code: 'LV', name: 'Latvia' },
        { code: 'MK', name: 'North Macedonia' },
        { code: 'SI', name: 'Slovenia' },
        { code: 'PA', name: 'Panama' },
    ];

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(tableData, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    const randomColor = () => {
        const color = ['#4361ee', '#805dca', '#00ab55', '#e7515a', '#e2a03f', '#2196f3'];
        const random = Math.floor(Math.random() * color.length);
        return color[random];
    };

    const randomStatusColor = () => {
        const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
        const random = Math.floor(Math.random() * color.length);
        return color[random];
    };

    const randomStatus = () => {
        const status = ['PAID', 'APPROVED', 'FAILED', 'CANCEL', 'SUCCESS', 'PENDING', 'COMPLETE'];
        const random = Math.floor(Math.random() * status.length);
        return status[random];
    };
    const getRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const getCountry = () => {
        const random = Math.floor(Math.random() * countryList.length);
        return countryList[random];
    };

    const chart_options = () => {
        let option = {
            chart: { sparkline: { enabled: true } },
            stroke: { curve: 'smooth', width: 2 },
            markers: { size: [4, 7], strokeWidth: 0 },
            colors: [randomColor()],
            grid: { padding: { top: 5, bottom: 5 } },
            tooltip: {
                x: { show: false },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
        };
        return option;
    };

    // Xác định kiểu dữ liệu: nếu có field 'title' thì là News
    const isNewsData = tableData.length > 0 && typeof tableData[0] === 'object' && 'title' in tableData[0];

    // Định nghĩa columns cho News
    const newsColumns = [
      {
        accessor: 'title',
        title: 'Tiêu đề',
        render: (item: any) => (
          <div className="flex items-center gap-2">
            {item.image && <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded" />}
            <div>
              <div className="font-semibold line-clamp-1">{item.title}</div>
              <div className="text-xs text-gray-500 line-clamp-1">{item.excerpt}</div>
            </div>
            {item.featured && <IconStar className="w-4 h-4 text-yellow-400" />}
          </div>
        ),
      },
      {
        accessor: 'category',
        title: 'Danh mục',
        render: (item: any) => <span className="badge badge-outline-primary">{item.category}</span>,
      },
      {
        accessor: 'author',
        title: 'Tác giả',
        render: (item: any) => <span className="flex items-center"><IconUser className="w-4 h-4 mr-1" />{item.author}</span>,
      },
      {
        accessor: 'status',
        title: 'Trạng thái',
        render: (item: any) => {
          const statusMap: any = {
            draft: { label: 'Bản nháp', className: 'badge badge-outline-secondary' },
            published: { label: 'Đã xuất bản', className: 'badge badge-outline-success' },
            archived: { label: 'Đã lưu trữ', className: 'badge badge-outline-warning' },
          };
          const s = statusMap[item.status] || { label: item.status, className: 'badge badge-outline' };
          return <span className={s.className}>{s.label}</span>;
        },
      },
      {
        accessor: 'actions',
        title: 'Thao tác',
        render: (item: any) => (
          <div className="flex items-center gap-1">
            {onPreview && <button className="btn btn-xs btn-ghost text-blue-600" title="Xem trước" onClick={() => onPreview(item)}><IconEye className="w-5 h-5" /></button>}
            {onEdit && <button className="btn btn-xs btn-ghost text-green-600" title="Chỉnh sửa" onClick={() => onEdit(item)}><IconEdit className="w-5 h-5" /></button>}
            {onDelete && <button className="btn btn-xs btn-ghost text-red-600" title="Xoá" onClick={() => onDelete(item.id)}><IconTrash className="w-5 h-5" /></button>}
            {onToggleFeatured && <button className="btn btn-xs btn-ghost text-yellow-500" title={item.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'} onClick={() => onToggleFeatured(item.id)}><IconStar className={`w-5 h-5 ${item.featured ? 'fill-yellow-400' : ''}`} /></button>}
            {/* Menu thao tác khác */}
            <div className="relative">
              <button className="btn btn-xs btn-ghost" title="Thao tác khác" onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}><IconMore className="w-5 h-5" /></button>
              {menuOpenId === item.id && (
                <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg z-50">
                  {onPublish && item.status === 'draft' && <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100" onClick={() => { onPublish(item.id); setMenuOpenId(null); }}><IconCalendar className="w-4 h-4 mr-2" />Xuất bản</button>}
                  {onPublish && item.status === 'archived' && <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100" onClick={() => { onPublish(item.id); setMenuOpenId(null); }}><IconCalendar className="w-4 h-4 mr-2" />Xuất bản</button>}
                  {onDraft && item.status === 'archived' && <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100" onClick={() => { onDraft(item.id); setMenuOpenId(null); }}><IconArchive className="w-4 h-4 mr-2" />Bản nháp</button>}
                  {onDuplicate && <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100" onClick={() => { onDuplicate(item.id); setMenuOpenId(null); }}><IconCopy className="w-4 h-4 mr-2" />Sao chép</button>}
                  {onArchive && ((item.status === 'draft' || item.status === 'published')) && <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100" onClick={() => { onArchive(item.id); setMenuOpenId(null); }}><IconArchive className="w-4 h-4 mr-2" />Lưu trữ</button>}
                </div>
              )}
            </div>
          </div>
        ),
      },
    ];

    // State cho menu thao tác
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

    return (
        <div className="panel mt-6">
            <h5 className="mb-5 text-lg font-semibold dark:text-white-light"></h5>
            <div className="datatables">
                {isMounted && tableData.length > 0 ? (
                    <DataTable
                        noRecordsText="No results match your search query"
                        highlightOnHover
                        className="table-hover whitespace-nowrap"
                        records={recordsData}
                        columns={isNewsData ? newsColumns : []}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                ) : (
                  <div className="text-center text-gray-500 py-8">Không có dữ liệu để hiển thị</div>
                )}
            </div>
        </div>
    );
};

export default ComponentsDatatablesAdvanced;
