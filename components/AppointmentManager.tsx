
import React, { useState, useEffect } from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';
import { dbService } from '../services/dbService';

const AppointmentManager: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [appDate, setAppDate] = useState('');
  const [appTime, setAppTime] = useState('');
  const [appReason, setAppReason] = useState('');
  const [appStatus, setAppStatus] = useState<AppointmentStatus>(AppointmentStatus.SCHEDULED);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [apps, pts] = await Promise.all([
      dbService.getAppointments(),
      dbService.getPatients()
    ]);
    setAppointments(apps);
    setPatients(pts);
  };

  const resetForm = () => {
    setSelectedPatientId('');
    setAppDate('');
    setAppTime('');
    setAppReason('');
    setAppStatus(AppointmentStatus.SCHEDULED);
    setIsEditing(false);
    setEditingAppId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (app: Appointment) => {
    setSelectedPatientId(app.patientId);
    const [date, time] = app.dateTime.split('T');
    setAppDate(date);
    setAppTime(time);
    setAppReason(app.reason);
    setAppStatus(app.status);
    setIsEditing(true);
    setEditingAppId(app.id);
    setShowModal(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const appData: Appointment = {
      id: isEditing ? (editingAppId as string) : Math.random().toString(36).substr(2, 9),
      patientId: patient.id,
      patientName: patient.name,
      dateTime: `${appDate}T${appTime}`,
      duration: 30,
      reason: appReason,
      status: appStatus
    };

    await dbService.saveAppointment(appData);
    setShowModal(false);
    resetForm();
    loadData();
  };

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      await dbService.deleteAppointment(id);
      loadData();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter(a => a.dateTime.startsWith(todayStr));

  const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const dayNamesAr = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return (day + 1) % 7;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="space-y-6 animate-in fade-in w-full overflow-hidden" dir="rtl">
      {/* Header with Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-calendar-check"></i>
          </div>
          <h2 className="text-base md:text-xl font-black text-slate-800">جدول المواعيد</h2>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setView('list')}
            className={`flex-1 px-4 md:px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            <i className="fas fa-list-ul"></i>
            قائمة
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`flex-1 px-4 md:px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${view === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            <i className="fas fa-calendar-alt"></i>
            تقويم
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6 w-full overflow-hidden">
          {view === 'calendar' ? (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 md:p-8 w-full overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                   <i className="fas fa-chevron-right"></i>
                 </button>
                 <span className="font-black text-slate-700 text-sm md:text-base">
                   {monthNamesAr[month]} {year}
                 </span>
                 <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                   <i className="fas fa-chevron-left"></i>
                 </button>
              </div>

              <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
                {dayNamesAr.map(d => (
                  <div key={d} className="bg-white py-3 text-center text-[10px] font-black text-blue-600 uppercase">
                    {d}
                  </div>
                ))}
                {calendarDays.map((day, idx) => {
                  const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                  const dayApps = appointments.filter(a => a.dateTime.startsWith(dateStr));
                  const isToday = day && dateStr === todayStr;

                  return (
                    <div key={idx} className={`bg-white min-h-[70px] md:min-h-[100px] p-1 transition-colors ${day ? 'hover:bg-slate-50' : 'bg-slate-50/50'}`}>
                      {day && (
                        <>
                          <div className={`text-[10px] font-black mb-1 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                            {day}
                          </div>
                          <div className="space-y-0.5">
                            {dayApps.slice(0, 3).map(app => (
                              <div key={app.id} onClick={() => handleOpenEditModal(app)} className="text-[8px] p-1 bg-blue-50 text-blue-700 rounded border border-blue-100 font-bold truncate cursor-pointer hover:bg-blue-100">
                                {app.dateTime.split('T')[1].substr(0, 5)} {app.patientName}
                              </div>
                            ))}
                            {dayApps.length > 3 && <div className="text-[7px] text-center text-slate-400 font-black">+{dayApps.length - 3}</div>}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
               <table className="w-full text-right min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الموعد</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">المريض</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">السبب</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">الحالة</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {appointments.sort((a,b) => b.dateTime.localeCompare(a.dateTime)).map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="text-xs font-black text-slate-700">{app.dateTime.split('T')[0]}</div>
                           <div className="text-[9px] text-slate-400 font-bold">{app.dateTime.split('T')[1]}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-black text-slate-900">{app.patientName}</td>
                        <td className="px-6 py-4 text-[10px] text-slate-500 font-bold">{app.reason}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                             app.status === AppointmentStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 
                             app.status === AppointmentStatus.CANCELLED ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                           }`}>
                             {app.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleOpenEditModal(app)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center">
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button onClick={() => handleDeleteAppointment(app.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center">
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100 text-center">
             <div className="text-3xl font-black mb-1">{todayApps.length}</div>
             <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">مواعيد اليوم</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-5 min-h-[300px]">
             <h4 className="text-center text-slate-400 text-[10px] font-black mb-6 border-b pb-3 uppercase">قائمة الانتظار</h4>
             <div className="space-y-3">
                {todayApps.length === 0 ? (
                  <div className="py-20 text-center opacity-20">
                     <i className="fas fa-check-circle text-4xl mb-3"></i>
                     <p className="text-[10px] font-black">لا مواعيد اليوم</p>
                  </div>
                ) : (
                  todayApps.map(app => (
                    <div key={app.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 group cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => handleOpenEditModal(app)}>
                       <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 font-black text-[10px] shadow-sm">
                          {app.dateTime.split('T')[1].substr(0, 5)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-800 truncate">{app.patientName}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
          
          <button 
            onClick={handleOpenAddModal}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-xl"
          >
            حجز جديد
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-bottom">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900">{isEditing ? 'تعديل موعد' : 'حجز موعد جديد'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400"><i className="fas fa-times"></i></button>
             </div>
             
             <form onSubmit={handleSaveAppointment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase pr-2">المريض</label>
                  <select required value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} disabled={isEditing} className="w-full p-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold text-xs disabled:opacity-50">
                    <option value="">اختر مريض...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase pr-2">التاريخ</label>
                    <input type="date" required value={appDate} onChange={e => setAppDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase pr-2">الوقت</label>
                    <input type="time" required value={appTime} onChange={e => setAppTime(e.target.value)} className="w-full p-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase pr-2">السبب</label>
                  <input type="text" required value={appReason} onChange={e => setAppReason(e.target.value)} className="w-full p-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold text-xs" placeholder="مثلاً: كشف، حشو..." />
                </div>

                {isEditing && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase pr-2">الحالة</label>
                    <select value={appStatus} onChange={e => setAppStatus(e.target.value as AppointmentStatus)} className="w-full p-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold text-xs">
                      {Object.values(AppointmentStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm transition-all shadow-lg hover:bg-blue-700">
                   {isEditing ? 'تحديث البيانات' : 'تأكيد الحجز'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
