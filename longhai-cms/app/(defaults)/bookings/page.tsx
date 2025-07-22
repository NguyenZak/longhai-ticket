'use client';
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import { formatDate } from '@/lib/dateUtils';
import DateDisplay from '@/components/common/DateDisplay';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconFile from '@/components/icon/icon-file';
import IconPrinter from '@/components/icon/icon-printer';
import { sortBy } from 'lodash';

interface Booking {
  id: number;
  event_id: number;
  ticket_id: number;
  user_id: number;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  event: {
    title: string;
    venue: string;
    start_date: string;
  };
  ticket: {
    ticket_type: string;
    price: number;
  };
  user: {
    name: string;
    email: string;
  };
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState<Booking[]>([]);
  const [recordsData, setRecordsData] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: "id", direction: "desc" });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => { setInitialRecords(bookings); }, [bookings]);
  useEffect(() => { setPage(1); }, [pageSize]);
  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);
  useEffect(() => {
    setInitialRecords(() => {
      return bookings.filter((item) => {
        return (
          item.user.name.toLowerCase().includes(search.toLowerCase()) ||
          item.user.email.toLowerCase().includes(search.toLowerCase()) ||
          item.event.title.toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search, bookings]);
  useEffect(() => {
    const data = sortBy(initialRecords, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === "desc" ? data.reverse() : data);
    setPage(1);
  }, [sortStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/bookings');
      setBookings(response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa đặt vé này?')) return;
    
    try {
      await apiCall(`/bookings/${id}`, { method: 'DELETE' });
      fetchBookings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bookings.map((b) => b.id));
    }
  };

  const handleBulkDelete = async () => {
    setShowBulkDeleteModal(false);
    try {
      await apiCall('/bookings/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds })
      });
    } catch (err: any) {
      setError(err.message);
    }
    setSelectedIds([]);
    fetchBookings();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const exportTable = (type: string) => {
    let columns = ['id', 'user', 'email', 'event', 'ticket_type', 'quantity', 'total_amount', 'status', 'created_at'];
    let records = bookings;
    let filename = 'bookings';
    let newVariable: any = window.navigator;
    if (type === 'csv' || type === 'txt') {
      let coldelimiter = type === 'csv' ? ';' : ',';
      let linedelimiter = '\n';
      let result = columns.map((d) => d.toUpperCase()).join(coldelimiter);
      result += linedelimiter;
      records.forEach((item) => {
        result += [
          item.id,
          item.user.name,
          item.user.email,
          item.event.title,
          item.ticket.ticket_type,
          item.quantity,
          item.total_amount,
          getStatusText(item.status),
          formatDate(item.event.start_date)
        ].join(coldelimiter) + linedelimiter;
      });
      if (!result.match(/^data:text\/(csv|txt)/i) && !newVariable.msSaveOrOpenBlob) {
        var data = `data:application/${type};charset=utf-8,` + encodeURIComponent(result);
        var link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename + '.' + type);
        link.click();
      } else {
        var blob = new Blob([result]);
        if (newVariable.msSaveOrOpenBlob) {
          newVariable.msSaveBlob(blob, filename + '.' + type);
        }
      }
    } else if (type === 'print') {
      var rowhtml = '<p>' + filename + '</p>';
      rowhtml += '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
      columns.forEach((d) => {
        rowhtml += '<th>' + d.toUpperCase() + '</th>';
      });
      rowhtml += '</tr></thead>';
      rowhtml += '<tbody>';
      records.forEach((item) => {
        rowhtml += '<tr>';
        [
          item.id,
          item.user.name,
          item.user.email,
          item.event.title,
          item.ticket.ticket_type,
          item.quantity,
          item.total_amount,
          getStatusText(item.status),
          formatDate(item.event.start_date)
        ].forEach((val) => {
          rowhtml += '<td>' + val + '</td>';
        });
        rowhtml += '</tr>';
      });
      rowhtml += '<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px;}th{padding:8px 4px;}tr:nth-child(2n-1){background:#f7f7f7; }</style>';
      rowhtml += '</tbody></table>';
      var winPrint: any = window.open('', '', 'left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0');
      winPrint.document.write('<title>Print</title>' + rowhtml);
      winPrint.document.close();
      winPrint.focus();
      winPrint.print();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý Đặt vé
        </h1>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xoá hàng loạt
            </button>
          )}
        </div>
      </div>

      {/* Modal xác nhận xoá hàng loạt */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Xác nhận xoá</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Bạn có chắc chắn muốn xoá <b>{selectedIds.length}</b> đặt vé đã chọn không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="panel mt-6">
        <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center">
            <button type="button" onClick={() => exportTable('csv')} className="btn btn-primary btn-sm m-1 ">
              <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
              CSV
            </button>
            <button type="button" onClick={() => exportTable('txt')} className="btn btn-primary btn-sm m-1">
              <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
              TXT
            </button>
            <button type="button" onClick={() => exportTable('print')} className="btn btn-primary btn-sm m-1">
              <IconPrinter className="ltr:mr-2 rtl:ml-2" />
              PRINT
            </button>
          </div>
          <input type="text" className="form-input w-auto" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="datatables">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={recordsData}
            columns={[
              { accessor: 'id', title: '#', sortable: true },
              { accessor: 'user', title: 'Khách hàng', sortable: true, render: ({ user }) => user.name },
              { accessor: 'email', title: 'Email', sortable: true, render: ({ user }) => user.email },
              { accessor: 'event', title: 'Sự kiện', sortable: true, render: ({ event }) => event.title },
              { accessor: 'ticket_type', title: 'Loại vé', sortable: true, render: ({ ticket }) => ticket.ticket_type },
              { accessor: 'quantity', title: 'Số lượng', sortable: true },
              { accessor: 'total_amount', title: 'Tổng tiền', sortable: true, render: ({ total_amount }) => formatCurrency(total_amount) },
              { accessor: 'status', title: 'Trạng thái', sortable: true, render: ({ status }) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(status)}`}>{getStatusText(status)}</span>
              ) },
              { accessor: 'created_at', title: 'Ngày đặt', sortable: true, render: ({ event }) => <div>{formatDate(event.start_date)}</div> },
            ]}
            totalRecords={initialRecords.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) => `Hiển thị ${from} đến ${to} trên tổng ${totalRecords} đơn hàng`}
          />
        </div>
      </div>

      {bookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Không có đặt vé</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Chưa có đặt vé nào được tạo.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingsPage; 