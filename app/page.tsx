"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    email: '',
    phone: '',
    governorate: 'Cairo',
    qualification: '',
    job: ''
  });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    personal_photo: null,
    id_card: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload Personal Photo
      let photoUrl = '';
      if (files.personal_photo) {
        const fileExt = files.personal_photo.name.split('.').pop();
        const fileName = `photo_${Date.now()}.${fileExt}`;
        const { data: photoData, error: photoError } = await supabase.storage
          .from('member-files')
          .upload(`personal/${fileName}`, files.personal_photo);
        if (photoError) throw photoError;
        photoUrl = photoData.path;
      }

      // 2. Upload ID Card Photo
      let idCardUrl = '';
      if (files.id_card) {
        const fileExt = files.id_card.name.split('.').pop();
        const fileName = `id_${Date.now()}.${fileExt}`;
        const { data: idData, error: idError } = await supabase.storage
          .from('member-files')
          .upload(`ids/${fileName}`, files.id_card);
        if (idError) throw idError;
        idCardUrl = idData.path;
      }

      // 3. Save everything to Database
      const { error } = await supabase.from('members').insert([{
        ...formData,
        photo_url: photoUrl,
        id_card_url: idCardUrl
      }]);

      if (error) throw error;

      alert("Registration Successful! Welcome to the Union.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-8 border-t-8 border-blue-900">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">الاتحاد الوطني للقيادات الشبابية</h1>
        <p className="text-center text-gray-500 mb-8">بوابة التسجيل الإلكتروني</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1">الاسم رباعي</label>
            <input name="full_name" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">الرقم القومي</label>
            <input name="national_id" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">البريد الإلكتروني</label>
            <input name="email" type="email" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">رقم الموبايل (واتساب)</label>
            <input name="phone" onChange={handleInputChange} className="w-full p-3 border rounded-lg" required />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">المحافظة</label>
            <select name="governorate" onChange={handleInputChange} className="w-full p-3 border rounded-lg">
              <option value="Cairo">القاهرة</option>
              <option value="Alexandria">الإسكندرية</option>
              {/* Add more governorates as needed */}
            </select>
          </div>

          <div className="md:col-span-2 border-t pt-4">
            <h3 className="font-bold mb-4 text-blue-800">المرفقات المطلوبة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <label className="block text-sm mb-2">الصورة الشخصية</label>
                <input name="personal_photo" type="file" onChange={handleFileChange} className="text-xs" required />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <label className="block text-sm mb-2">صورة البطاقة</label>
                <input name="id_card" type="file" onChange={handleFileChange} className="text-xs" required />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 bg-blue-900 text-white py-4 rounded-lg font-bold hover:bg-blue-800 transition duration-300 disabled:bg-gray-400"
          >
            {loading ? 'جاري إرسال البيانات...' : 'تأكيد التسجيل والانتقال للدفع'}
          </button>
        </form>
      </div>
    </div>
  );
}