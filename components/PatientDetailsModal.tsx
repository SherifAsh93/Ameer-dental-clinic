
import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, History, CheckCircle2, Trash2, Loader2, Activity, ShieldAlert, Pill, Phone, Calendar } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Patient, Payment } from '../types';

interface Props {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const PatientDetailsModal: React.FC<Props> = ({ patient, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'medical' | 'finance'>('medical');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<Partial<Patient>>({});

  useEffect(() => {
    if (patient && isOpen) {
      setTotalPrice(Number(patient.totalPrice) || 0);
      setEditData({ ...patient });
      dbService.getPayments(patient.id).then(setPayments);
    }
  }, [patient, isOpen]);

  if (!isOpen || !patient) return null;

  const handleUpdateTotal = async () => {
    setLoading(true);
    try {
      await dbService.updatePatientFinance(patient.id, totalPrice);
      onUpdate();
    } catch (e) { alert('فشل التحديث'); } finally { setLoading(false); }
  };

  const handleSaveMedical = async () => {
    setLoading(true);
    try {
      await dbService.updatePatient(patient.id, editData);
      onUpdate();
      alert('تم حفظ البيانات الطبية بنجاح');
    } catch (e) { alert('خطأ في الحفظ'); } finally { setLoading(false); }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newPaymentAmount);
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      await dbService.addPayment({ patientId: patient.id, amount, notes: 'سداد دفعة' });
      setNewPaymentAmount('');
      const updated = await dbService.getPayments(patient.id);
      setPayments(updated);
      onUpdate();
    } catch (e) { alert('خطأ في السداد'); } finally { setLoading(false); }
  };

  const balance = totalPrice - (patient.paidAmount || 0);

  const SectionHeader = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 mb-6 mt-6">
      <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><Icon size={18} /></div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-hidden" dir="rtl" onClick={onClose}>
      <div className="bg-white w-full max-w-5xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[32px] shadow-2xl flex flex-col relative animate-slide-up" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-8 py-8 flex justify-between items-center border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-teal-50">{patient.name.charAt(0)}</div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{patient.name}</h2>
              <div className="flex gap-4 mt-1 opacity-60">
                <span className="text-[10px] font-bold flex items-center gap-1"><Phone size={12}/> {patient.phone}</span>
                <span className="text-[10px] font-bold flex items-center gap-1"><Calendar size={12}/> {patient.age} عام</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50/50 p-2 gap-2 border-b border-slate-50">
          <button onClick={() => setActiveTab('medical')} className={`flex-1 py-3.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'medical' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}>السجل الطبي</button>
          <button onClick={() => setActiveTab('finance')} className={`flex-1 py-3.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'finance' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}>الحسابات</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
          {activeTab === 'medical' ? (
            <div className="space-y-8">
              <SectionHeader title="تعديل البيانات" icon={User} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 mr-1 uppercase">الاسم</label>
                  <input className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-teal-500" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 mr-1 uppercase">الهاتف</label>
                  <input className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-teal-500" value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} />
                </div>
              </div>

              <SectionHeader title="الحالة المرضية" icon={Activity} />
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {[
                  { id: 'condPressure', label: 'الضغط' },
                  { id: 'condDiabetes', label: 'السكر' },
                  { id: 'condStomach', label: 'المعدة' },
                  { id: 'condRheumatic', label: 'روماتيزم' },
                  { id: 'condHepatitis', label: 'كبد وبائي' },
                  { id: 'condPregnancy', label: 'حمل/رضاعة' }
                ].map(item => (
                  <button key={item.id} onClick={() => setEditData({...editData, [item.id]: !(editData as any)[item.id]})} className={`py-4 rounded-xl border-2 font-bold text-[10px] transition-all ${ (editData as any)[item.id] ? 'bg-teal-50 border-teal-600 text-teal-700' : 'bg-white border-slate-100 text-slate-400' }`}>
                    {item.label}
                  </button>
                ))}
              </div>

              <SectionHeader title="ملاحظات طبية" icon={Pill} />
              <textarea className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 min-h-[140px] outline-none focus:bg-white" value={editData.otherMedsText || ''} onChange={e => setEditData({...editData, otherMedsText: e.target.value})} />

              <button onClick={handleSaveMedical} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                <span>حفظ كافة التغييرات</span>
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Finance Card */}
              <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
                 <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الميزانية</p>
                      <div className="flex items-center justify-center gap-2">
                        <input type="number" value={totalPrice} onChange={e => setTotalPrice(Number(e.target.value))} className="bg-white/10 border-b-2 border-teal-500 text-3xl font-black w-28 text-center outline-none" />
                        <button onClick={handleUpdateTotal} className="p-1.5 bg-teal-500 rounded-lg text-slate-900"><CheckCircle2 size={16}/></button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ المحصل</p>
                      <p className="text-4xl font-black text-teal-400">{patient.paidAmount} <span className="text-[10px]">ج.م</span></p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المتبقي</p>
                      <p className="text-4xl font-black text-rose-400">{balance} <span className="text-[10px]">ج.م</span></p>
                    </div>
                 </div>
              </div>

              {/* Quick Pay */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-4">
                 <div className="flex-1 w-full space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 mr-2">سداد دفعة نقدية فورية</label>
                    <div className="relative">
                      <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-600" size={20}/>
                      <input type="number" placeholder="المبلغ..." value={newPaymentAmount} onChange={e => setNewPaymentAmount(e.target.value)} className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-xl outline-none" />
                    </div>
                 </div>
                 <button onClick={handleAddPayment} className="w-full md:w-auto px-10 py-4 bg-teal-600 text-white rounded-xl font-black shadow-lg active:scale-95 transition-all">تأكيد الدفع</button>
              </div>

              {/* History */}
              <div className="space-y-4">
                <h5 className="text-sm font-black text-slate-900 flex items-center gap-2"><History size={18} /> سجل العمليات المالية</h5>
                <div className="grid gap-3">
                  {payments.map((p, i) => (
                    <div key={p.id} className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-slate-400 text-xs">{i+1}</div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">+{p.amount} ج.م</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">بتاريخ {new Date(p.date).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">مدفوع</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 flex justify-between items-center bg-slate-50 shrink-0">
          <button onClick={() => { if(window.confirm('هل أنت متأكد من حذف المريض نهائياً؟')) dbService.deletePatient(patient.id).then(() => {onUpdate(); onClose();}) }} className="text-rose-500 font-black text-[10px] hover:bg-rose-50 px-4 py-2 rounded-lg transition-all">حذف الملف نهائياً</button>
          <button onClick={onClose} className="px-12 py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs active:scale-95 transition-all">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
