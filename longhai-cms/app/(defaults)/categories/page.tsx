"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import Swal from 'sweetalert2';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  description?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

// Hàm chuyển tiếng Việt có dấu sang không dấu và tạo slug
function removeVietnameseTones(str: string) {
  return str
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d")
    .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
    .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
    .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
    .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
    .replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
    .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
    .replace(/Đ/g, "D");
}
function generateSlug(str: string) {
  return removeVietnameseTones(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Category>>({ type: "news" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/categories`);
      setCategories(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    if (name === 'name') {
      // Nếu user chưa sửa slug thủ công, tự động cập nhật slug
      if (!form.slug || form.slug === generateSlug(form.name || '')) {
        newForm.slug = generateSlug(value);
      }
    }
    setForm(newForm);
  };

  const showMessage = (msg = '', type = 'success') => {
    const toast: any = Swal.mixin({
      toast: true,
      position: 'center', // Đổi từ 'top' sang 'center'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.type) return showMessage("Vui lòng nhập đủ thông tin", "error");
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${apiUrl}/api/categories/${editingId}`, form);
        showMessage("Cập nhật danh mục thành công", "success");
      } else {
        await axios.post(`${apiUrl}/api/categories`, form);
        showMessage("Thêm danh mục thành công", "success");
      }
      setForm({ type: "news" });
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      showMessage(err?.response?.data?.message || "Lỗi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setForm(cat);
    setEditingId(cat.id);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn xoá danh mục này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/categories/${id}`);
      showMessage("Đã xoá danh mục", "success");
      fetchCategories();
    } catch (err) {
      showMessage("Lỗi xoá danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="name">Tên danh mục</Label>
              <Input id="name" name="name" value={form.name || ""} onChange={handleChange} autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" value={form.slug || ""} onChange={handleChange} autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="type">Loại</Label>
              <select id="type" name="type" value={form.type || "news"} onChange={handleChange} className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="news">Tin tức</option>
                <option value="static">Trang tĩnh</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input id="description" name="description" value={form.description || ""} onChange={handleChange} autoComplete="off" />
            </div>
            <div className="md:col-span-2 flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>{editingId ? "Cập nhật" : "Thêm mới"}</button>
              {editingId && <button type="button" className="btn btn-outline-danger" onClick={()=>{setForm({type:'news'});setEditingId(null);}}>Huỷ</button>}
            </div>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{cat.type === 'news' ? 'Tin tức' : 'Trang tĩnh'}</TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell>
                    <button onClick={()=>handleEdit(cat)} className="text-blue-600 hover:text-blue-800 mr-2" title="Sửa">
                      <IconEdit className="w-5 h-5" />
                    </button>
                    <button onClick={()=>handleDelete(cat.id)} className="text-red-600 hover:text-red-800" title="Xoá">
                      <IconTrash className="w-5 h-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 