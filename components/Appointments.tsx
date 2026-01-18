
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Appointment, Patient } from '../types';
import { 
  Calendar as CalendarIcon, 
  RefreshCw,
  Trash2,
  Loader2,
  CheckCircle2,
  DollarSign,
  Clock,
  User,
  Stethoscope,
  Pencil
} from 'lucide-react';
import AddAppointmentModal from './AddAppointmentModal';
import PatientDetailsModal from './PatientDetailsModal';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Today' | 'Upcoming'>('All');
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAppointments();
      const allPatients = await dbService.getPatients();
      setPatients(allPatients);
      
      const today = new Date().toISOString().split('T')[0];
      let filteredData = data;
      if (filter === 'Today') filteredData = data.filter(apt => apt.dateTime.startsWith(today));
      else if (filter === 'Upcoming') filteredData = data.filter(apt => new Date(apt.dateTime) >= new Date());
      setAppointments(filteredData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    setActionLoading(id);
    let nextStatus: 'Scheduled' | 'Completed' | 'Cancelled' = 'Scheduled';
    if (currentStatus === 'Scheduled') nextStatus = 'Completed';
    else if (currentStatus === 'Completed') nextStatus = 'Cancelled';
    
    try {
      await dbService.updateAppointmentStatus(id, nextStatus);
      await fetch();
    } catch (e) { alert('فشل تحديث الحالة'); } finally { setActionLoading(null); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('🚨 حذف الموعد نهائياً؟')) return;
    setActionLoading(id);
    try {
      await dbService.deleteAppointment(id);
      await fetch();
    } catch (error) { alert('فشل الحذف'); } finally { setActionLoading(null); }
  };

  const handleEdit = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsModalOpen(true);
  };

  const handleOpenFinance = (patientId: string) => {
    const p = patients.find(p => p.id === patientId);
    if (p) {
      setSelectedPatient(p);
      setIsDetailsOpen(true);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
      <p className="mt-4 text-slate-400 font-bold">مزامنة جدول العيادة...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-slide-up" dir="rtl">
      <div className="flex flex-col lg:flex-row-reverse lg:items-center justify-between gap-6">
        <div className="text-right">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة الحجوزات</h2>
          <p className="text-teal-600 font-bold text-[10px] tracking-[5px] mt-1 uppercase">Clinic Appointment Flow</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          {[
            { id: 'All', label: 'الكل' },
            { id: 'Today', label: 'اليوم' },
            { id: 'Upcoming', label: 'القادمة' }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id as any)} 
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] transition-all ${filter === f.id ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-4">
          {appointments.length > 0 ? appointments.map(apt => {
            const patient = patients.find(p => p.id === apt.patientId);
            const needsFinance = apt.status === 'Completed' && (patient?.totalPrice === 0 || !patient?.totalPrice);

            return (
              <div key={apt.id} className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row-reverse items-center gap-6 hover:shadow-xl transition-all relative overflow-hidden text-right">
                <div className={`absolute top-0 right-0 w-2.5 h-full ${
                  apt.status === 'Completed' ? 'bg-emerald-500' : 
                  apt.status === 'Cancelled' ? 'bg-rose-500' : 'bg-teal-600'
                }`}></div>
                
                <div className={`w-24 h-24 rounded-[32px] shrink-0 flex flex-col items-center justify-center font-black transition-all ${
                  apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  <span className="text-[10px] opacity-40 mb-1">{new Date(apt.dateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-3xl">{new Date(apt.dateTime).getDate()}</span>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-3 justify-end">
                     <span className={`px-4 py-1 rounded-lg text-[9px] font-black border ${
                       apt.status === 'Completed' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 
                       apt.status === 'Cancelled' ? 'bg-rose-100 border-rose-200 text-rose-700' :
                       'bg-slate-100 border-slate-200 text-slate-500'
                     }`}>
                       {apt.status === 'Scheduled' ? 'قيد الانتظار' : apt.status === 'Completed' ? 'تم الكشف ✅' : 'موعد ملغى'}
                     </span>
                     <h4 className="text-2xl font-black text-slate-800">{apt.patientName}</h4>
                  </div>
                  
                  <div className="flex items-center justify-end gap-5 text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock size={14}/> {apt.duration} دقيقة</span>
                    <span className="flex items-center gap-1.5"><Stethoscope size={14}/> {apt.reason}</span>
                  </div>
                  
                  {needsFinance && (
                    <button 
                      onClick={() => handleOpenFinance(apt.patientId)}
                      className="mt-4 px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-xs flex items-center gap-2 mr-auto md:ml-0 md:mr-auto animate-bounce shadow-xl shadow-amber-100"
                    >
                      <DollarSign size={16} /> المريض بدون خطة سعرية - حدد التكلفة الآن
                    </button>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleUpdateStatus(apt.id, apt.status)}
                    disabled={actionLoading === apt.id}
                    className={`flex-1 md:w-32 px-5 py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                      apt.status === 'Scheduled' 
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-50 hover:brightness-110' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {actionLoading === apt.id ? <Loader2 className="animate-spin" size={16}/> : (
                      apt.status === 'Scheduled' ? <CheckCircle2 size={16} /> : <RefreshCw size={16} />
                    )}
                    {apt.status === 'Scheduled' ? 'إتمام' : 'الحالة'}
                  </button>
                  
                  <button 
                    onClick={() => handleEdit(apt)}
                    className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-teal-50 hover:text-teal-600 transition-all active:scale-90"
                  >
                    <Pencil size={20} />
                  </button>

                  <button 
                    onClick={(e) => handleDelete(e, apt.id)}
                    disabled={actionLoading === apt.id}
                    className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white rounded-[50px] py-40 text-center border-2 border-dashed border-slate-100">
               <CalendarIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
               <p className="text-slate-400 font-black text-2xl">لا توجد مواعيد حالية</p>
            </div>
          )}
        </div>

        <div className="space-y-6 sticky top-32 h-fit">
          <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
             <h4 className="text-2xl font-black mb-4 relative z-10">تنظيم العيادة</h4>
             <p className="text-slate-400 font-bold text-xs leading-relaxed mb-8 relative z-10">
               بمجرد الضغط على "إتمام الكشف"، سيقوم النظام بالتحقق مما إذا كان المريض قد سدد تكاليفه أو يحتاج لتحديد سعر جديد.
             </p>
             <button onClick={() => { setSelectedAppointment(null); setIsModalOpen(true); }} className="w-full py-5 bg-teal-600 text-white rounded-[25px] font-black shadow-xl hover:bg-teal-500 transition-all flex items-center justify-center gap-3 relative z-10">
               <CalendarIcon size={20} /> حجز موعد جديد
             </button>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      <AddAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedAppointment(null); }} 
        onSuccess={fetch} 
        editAppointment={selectedAppointment}
      />
      <PatientDetailsModal patient={selectedPatient} isOpen={isDetailsOpen} onClose={() => { setIsDetailsOpen(false); fetch(); }} onUpdate={fetch} />
    </div>
  );
};

export default Appointments;
