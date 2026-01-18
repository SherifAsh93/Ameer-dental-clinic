
import React, { useState } from 'react';
import { X, Save, User, Phone, AlertCircle, Loader2, HeartPulse, ShieldAlert, Pill } from 'lucide-react';
import { dbService } from '../services/dbService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPatientModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', age: 0, gender: 'Male',
    condPressure: false, condDiabetes: false, condStomach: false,
    condRheumatic: false, condHepatitis: false, condPregnancy: false,
    allergyAntibiotics: false, allergyAnesthesia: false,
    heartProblems: false, kidneyProblems: false,
    otherMedsText: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setErrorMsg('الاسم ورقم الهاتف مطلوبان.');
      return;
    }
    setLoading(true);
    try {
      await dbService.addPatient({
        ...formData,
        totalPrice: 0, occupation: 'N/A', address: 'N/A', status: 'Active',
        liverProblems: false, regularTreatment: false, medPressure: false, medDiabetes: false, medThinners: false
      });
      onSuccess();
      onClose();
    } catch (error) {
      setErrorMsg('خطأ في الاتصال بقاعدة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 mb-6 mt-6">
      <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><Icon size={18} /></div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-hidden" dir="rtl" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[32px] shadow-2xl flex flex-col relative animate-slide-up" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">تسجيل مريض جديد</h2>
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mt-1">Ameer Dental Clinic</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold mb-6">
              <AlertCircle size={20} /> {errorMsg}
            </div>
          )}

          <SectionHeader title="البيانات الشخصية" icon={User} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 mr-1 uppercase">اسم المريض</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-teal-500 transition-all" placeholder="مثال: محمد أحمد..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 mr-1 uppercase">رقم الهاتف</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-teal-500 transition-all" placeholder="01xxxxxxxxx" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 mr-1 uppercase">العمر</label>
              <input type="number" value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-teal-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 mr-1 uppercase">الجنس</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer">
                <option value="Male">ذكر</option>
                <option value="Female">أنثى</option>
              </select>
            </div>
          </div>

          <SectionHeader title="الأمراض المزمنة" icon={HeartPulse} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {[
              { id: 'condPressure', label: 'الضغط' },
              { id: 'condDiabetes', label: 'السكر' },
              { id: 'condStomach', label: 'المعدة' },
              { id: 'condRheumatic', label: 'روماتيزم' },
              { id: 'condHepatitis', label: 'كبد وبائي' },
              { id: 'condPregnancy', label: 'حمل/رضاعة' },
            ].map(item => (
              <label key={item.id} className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer select-none font-bold text-xs ${ (formData as any)[item.id] ? 'bg-teal-50 border-teal-600 text-teal-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200' }`}>
                <input type="checkbox" className="hidden" checked={(formData as any)[item.id]} onChange={e => setFormData({...formData, [item.id]: e.target.checked})} />
                {item.label}
              </label>
            ))}
          </div>

          <SectionHeader title="الأسئلة الطبية الهامة" icon={ShieldAlert} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { id: 'allergyAntibiotics', label: 'حساسية مضادات حيوية؟' },
              { id: 'allergyAnesthesia', label: 'حساسية بنج؟' },
              { id: 'heartProblems', label: 'مشاكل بالقلب؟' },
              { id: 'kidneyProblems', label: 'مشاكل بالكلى؟' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="font-bold text-slate-700 text-xs">{item.label}</span>
                <div className="flex gap-2">
                   <button type="button" onClick={() => setFormData({...formData, [item.id]: true})} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${ (formData as any)[item.id] ? 'bg-rose-600 text-white' : 'bg-white text-slate-400 border border-slate-200' }`}>نعم</button>
                   <button type="button" onClick={() => setFormData({...formData, [item.id]: false})} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${ !(formData as any)[item.id] ? 'bg-teal-600 text-white' : 'bg-white text-slate-400 border border-slate-200' }`}>لا</button>
                </div>
              </div>
            ))}
          </div>

          <SectionHeader title="ملاحظات إضافية" icon={Pill} />
          <textarea value={formData.otherMedsText} onChange={e => setFormData({...formData, otherMedsText: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 min-h-[120px] outline-none focus:bg-white focus:border-teal-500 shadow-sm" placeholder="اكتب أي تفاصيل أخرى هنا..." />
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-50 flex gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-4 font-bold text-slate-400 hover:text-slate-600 transition-all">إلغاء</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-100 flex items-center justify-center gap-2 active:scale-95 transition-all hover:brightness-105">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            <span>حفظ ملف المريض</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;
