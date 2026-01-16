"use client";
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    email: '',
    phone: '',
    governorate: 'القاهرة',
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
    if (e.target.files && e.target.files[0]) {
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
        id_card_url: idCardUrl,
        status: 'pending'
      }]);

      if (error) throw error;

      alert("تم التسجيل بنجاح! سيتم التواصل معكم قريباً.");
      // You can redirect here: window.location.href = '/success';
      
    } catch (err: any) {
      console.error(err);
      alert("حدث خطأ: " + (err.message || "تأكد من إعدادات Storage في Supabase"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        {/* Header Decor */}
        <div className="bg-blue-900 h-3 w-full"></div>
        
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-blue-900 mb-3">الاتحاد الوطني للقيادات الشبابية</h1>
            <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full mb-3"></div>
            <p className="text-gray-600 font-medium">استمارة الانضمام للعضوية 2026</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">الاسم رباعي (كما هو في البطاقة)</label>
                <input name="full_name" type="text" onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition" required placeholder="أدخل اسمك الكامل" />
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الرقم القومي (14 رقم)</label>
                <input name="national_id" type="text" maxLength={14} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition" required placeholder="00000000000000" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الموبايل (واتساب)</label>
                <input name="phone" type="tel" onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition" required placeholder="01xxxxxxxxx" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                <input name="email" type="email" onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition" required placeholder="example@mail.com" />
              </div>

              {/* Governorate */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المحافظة</label>
                <select name="governorate" onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none transition appearance-none">
                  <option value="القاهرة">القاهرة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="الشرقية">الشرقية</option>
                  <option value="الدقهلية">الدقهلية</option>
                  <option value="القليوبية">القليوبية</option>
                  <option value="المنوفية">المنوفية</option>
                  <option value="الغربية">الغربية</option>
                </select>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>📁</span> المرفقات المطلوبة (صور واضحة)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Photo */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 mb-2 mr-1">الصورة الشخصية</label>
                  <div className="relative border-2 border-dashed border-blue-200 bg-white p-4 rounded-xl hover:border-blue-400 transition text-center cursor-pointer">
                    <input name="personal_photo" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                    <span className="text-sm text-blue-600 font-medium">
                      {files.personal_photo ? `✅ ${files.personal_photo.name}` : "إرفاق صورة شخصية"}
                    </span>
                  </div>
                </div>

                {/* ID Card Photo */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 mb-2 mr-1">صورة البطاقة</label>
                  <div className="relative border-2 border-dashed border-blue-200 bg-white p-4 rounded-xl hover:border-blue-400 transition text-center cursor-pointer">
                    <input name="id_card" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                    <span className="text-sm text-blue-600 font-medium">
                      {files.id_card ? `✅ ${files.id_card.name}` : "إرفاق صورة البطاقة"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-400 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                   جاري معالجة البيانات...
                </span>
              ) : 'تأكيد التسجيل والانتقال للدفع'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}