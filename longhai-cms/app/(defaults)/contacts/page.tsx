"use client";
import { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import IconFile from '@/components/icon/icon-file';
import IconPrinter from '@/components/icon/icon-printer';
import { apiCall } from '@/lib/api';
import Select from 'react-select';
import axios from 'axios';
import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import IconChevronDown from '@/components/icon/icon-caret-down';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

interface Contact {
  id: number;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: string;
  created_at: string;
}

const PAGE_SIZES = [10, 20, 30, 50, 100];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState<Contact[]>([]);
  const [recordsData, setRecordsData] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "id",
    direction: "desc",
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const res = await apiCall("/contacts");
    setContacts(res.data || []);
    setInitialRecords(sortBy(res.data || [], "id").reverse());
  };

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    setInitialRecords(() => {
      return contacts.filter((item) => {
        return (
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.phone.toLowerCase().includes(search.toLowerCase()) ||
          (item.email || "").toLowerCase().includes(search.toLowerCase()) ||
          (item.subject || "").toLowerCase().includes(search.toLowerCase()) ||
          (item.message || "").toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search, contacts]);

  useEffect(() => {
    const data = sortBy(initialRecords, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === "desc" ? data.reverse() : data);
    setPage(1);
  }, [sortStatus]);

  const formatDate = (date: string) => {
    if (date) {
      const dt = new Date(date);
      const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
      const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
      return day + '/' + month + '/' + dt.getFullYear();
    }
    return '';
  };

  const exportTable = (type: string) => {
    let columns = ['id', 'name', 'phone', 'email', 'subject', 'message', 'created_at'];
    let records = contacts;
    let filename = 'contacts';
    let newVariable: any = window.navigator;
    if (type === 'csv' || type === 'txt') {
      let coldelimiter = type === 'csv' ? ';' : ',';
      let linedelimiter = '\n';
      let result = columns.map((d) => d.toUpperCase()).join(coldelimiter);
      result += linedelimiter;
      records.forEach((item) => {
        columns.forEach((d, index) => {
          if (index > 0) result += coldelimiter;
          let val = (item as any)[d] ? (item as any)[d] : '';
          result += val;
        });
        result += linedelimiter;
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
        columns.forEach((d) => {
          let val = (item as any)[d] ? (item as any)[d] : '';
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

  const statusOptions = [
    { value: 'chua_xu_ly', label: 'Chưa xử lý' },
    { value: 'dang_xu_ly', label: 'Đang xử lý' },
    { value: 'da_xu_ly', label: 'Đã xử lý' },
  ];

  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.put(`${apiUrl}/api/contacts/${id}`, { status });
      Swal.fire({ icon: 'success', title: 'Cập nhật trạng thái thành công', toast: true, position: 'center', timer: 2000, showConfirmButton: false });
      fetchContacts();
    } catch {
      Swal.fire({ icon: 'error', title: 'Lỗi cập nhật trạng thái', toast: true, position: 'center', timer: 2000, showConfirmButton: false });
    }
  };

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

  return (
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
            { accessor: 'name', title: 'Họ tên', sortable: true },
            { accessor: 'phone', title: 'SĐT', sortable: true },
            { accessor: 'email', title: 'Email', sortable: true },
            { accessor: 'subject', title: 'Chủ đề', sortable: true },
            { accessor: 'message', title: 'Nội dung', sortable: false },
            { accessor: 'status', title: 'Trạng thái', sortable: true, render: ({ id, status }) => (
              <div className="dropdown inline-block">
                <Dropdown
                  placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                  btnClassName={`btn btn-sm dropdown-toggle ${status === 'da_xu_ly' ? 'btn-success' : status === 'dang_xu_ly' ? 'btn-warning' : 'btn-outline-dark'}`}
                  button={
                    <span className="flex items-center gap-2">
                      {status === 'da_xu_ly' ? 'Đã xử lý' : status === 'dang_xu_ly' ? 'Đang xử lý' : 'Chưa xử lý'}
                      <IconChevronDown className="w-4 h-4" />
                    </span>
                  }
                >
                  <ul className="!min-w-[170px]">
                    <li>
                      <button type="button" onClick={() => updateStatus(id, 'chua_xu_ly')} className={status === 'chua_xu_ly' ? 'text-primary font-bold' : ''}>Chưa xử lý</button>
                    </li>
                    <li>
                      <button type="button" onClick={() => updateStatus(id, 'dang_xu_ly')} className={status === 'dang_xu_ly' ? 'text-warning font-bold' : ''}>Đang xử lý</button>
                    </li>
                    <li>
                      <button type="button" onClick={() => updateStatus(id, 'da_xu_ly')} className={status === 'da_xu_ly' ? 'text-success font-bold' : ''}>Đã xử lý</button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            ) },
            { accessor: 'created_at', title: 'Ngày gửi', sortable: true, render: ({ created_at }) => <div>{formatDate(created_at)}</div> },
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
          paginationText={({ from, to, totalRecords }) => `Hiển thị ${from} đến ${to} trên tổng ${totalRecords} liên hệ`}
        />
      </div>
    </div>
  );
} 