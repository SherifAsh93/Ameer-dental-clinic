
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, Save, ChevronDown, AlignLeft, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Patient, Appointment } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAppointment?: Appointment | null; // إضافة خاصية التعديل
}

const AddAppointmentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, editAppointment }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    reason: 'كشف عام',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      dbService.getPatients().then(setPatients);
      
      if (editAppointment) {
        // في حالة التعديل، نقوم بتفكيك التاريخ والوقت
        const dt = new Date(editAppointment.dateTime);
        const dateStr = dt.toISOString().split('T')[0];
        const timeStr = dt.toTimeString().split(' ')[0].substring(0, 5);
        
        setFormData({
          patientId: editAppointment.patientId,
          date: dateStr,
          time: timeStr,
          reason: editAppointment.reason,
          notes: editAppointment.notes || '',
        });
      } else {
        // إعادة التعيين في حالة الحجز الجديد
        setFormData({
          patientId: '',
          date: '',
          time: '',
          reason: 'كشف عام',
          notes: '',
        });
      }
    }
  }, [isOpen, editAppointment]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.date || !formData.time) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const dateTime = `${formData.date}T${formData.time}:00`;
      
      if (editAppointment) {
        // تعديل موعد موجود
        await dbService.updateAppointment(editAppointment.id, {
          dateTime,
          reason: formData.reason,
          notes: formData.notes
        });
      } else {
        // إضافة موعد جديد
        const patient = patients.find(p => p.id === formData.patientId);
        await dbService.addAppointment({
          patientId: formData.patientId,
          patientName: patient?.name || 'مريض غير معروف',
          dateTime,
          duration: 30,
          reason: formData.reason,
          status: 'Scheduled',
          notes: formData.notes,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert('حدث خطأ أثناء الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto" 
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-[35px] shadow-2xl overflow-hidden animate-slide-up relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{editAppointment ? 'تعديل الموعد' : 'حجز موعد جديد'}</h3>
            <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mt-1">Ameer Dental Clinic</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">المريض</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 pointer-events-none" />
              <select 
                required
                disabled={!!editAppointment} // منع تغيير المريض أثناء تعديل الموعد لضمان سلامة البيانات
                value={formData.patientId}
                onChange={e => setFormData({...formData, patientId: e.target.value})}
                className={`w-full pr-12 pl-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 outline-none font-bold text-slate-700 appearance-none transition-all ${editAppointment ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">-- اختر مريضاً --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                ))}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">التاريخ</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 pointer-events-none" />
                <input 
                  required 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 outline-none font-bold text-slate-700 cursor-pointer block"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الوقت</label>
              <div className="relative">
                <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 pointer-events-none" />
                <input 
                  required 
                  type="time" 
                  value={formData.time} 
                  onChange={e => setFormData({...formData, time: e.target.value})} 
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 outline-none font-bold text-slate-700 cursor-pointer block"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الإجراء</label>
            <div className="relative">
              <Stethoscope className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 pointer-events-none" />
              <input 
                required 
                type="text" 
                value={formData.reason} 
                onChange={e => setFormData({...formData, reason: e.target.value})} 
                placeholder="مثال: حشو عصب، تقويم..." 
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 outline-none font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">ملاحظات</label>
            <div className="relative">
              <AlignLeft className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <textarea 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                placeholder="أي تفاصيل إضافية..." 
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 outline-none font-bold text-slate-700 min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all active:scale-95"
            >إلغاء</button>
            <button 
              disabled={loading} 
              className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-teal-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
              <span>{editAppointment ? 'حفظ التعديلات' : 'تأكيد الحجز'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
