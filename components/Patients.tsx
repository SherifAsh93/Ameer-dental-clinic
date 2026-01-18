
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Patient } from '../types';
// Added Loader2 to the imports
import { Search, UserPlus, FileText, Phone, Hash, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import AddPatientModal from './AddPatientModal';
import PatientDetailsModal from './PatientDetailsModal';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await dbService.getPatients();
      setPatients(data);
      if (selectedPatient) {
        const updated = data.find(p => p.id === selectedPatient.id);
        if (updated) setSelectedPatient(updated);
        else { setSelectedPatient(null); setIsDetailsOpen(false); }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  );

  const handleOpenDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 animate-slide-up" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">سجل المرضى</h2>
          <p className="text-teal-600 font-bold text-sm mt-1 uppercase tracking-[5px]">Ameer Dental Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchPatients} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl shadow-sm"><RefreshCw className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-4 px-10 py-5 bg-teal-600 text-white rounded-3xl font-black shadow-xl active:scale-95 transition-all"><UserPlus /><span>تسجيل مريض</span></button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input type="text" placeholder="ابحث بالاسم أو رقم الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pr-16 pl-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[30px] font-bold text-xl outline-none focus:border-teal-500 transition-all" />
        </div>
        <div className="px-8 py-5 bg-teal-50 rounded-[30px] border border-teal-100"><span className="text-teal-700 font-black text-sm uppercase tracking-widest">إجمالي المرضى: {patients.length}</span></div>
      </div>

      {/* Grid */}
      {loading && patients.length === 0 ? (
        // Fix: Loader2 is now correctly imported
        <div className="flex justify-center py-32"><Loader2 className="animate-spin w-12 h-12 text-teal-600" /></div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => (
            <div key={p.id} onClick={() => handleOpenDetails(p)} className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-teal-200 transition-all group cursor-pointer relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center text-teal-600 font-black text-3xl group-hover:bg-teal-600 group-hover:text-white transition-all">{p.name.charAt(0)}</div>
                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${p.gender === 'Female' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>{p.gender === 'Male' ? 'ذكر' : 'أنثى'}</div>
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-6 tracking-tight leading-tight">{p.name}</h3>
              <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4 text-slate-500">
                  <Phone className="w-5 h-5 text-teal-500/30" />
                  <span className="font-bold text-sm">{p.phone}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <Hash className="w-5 h-5 text-teal-500/30" />
                  <span className="font-bold text-sm">السن: {p.age} عام</span>
                </div>
              </div>
              <div className="mt-8"><button className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black shadow-xl hover:bg-slate-800 flex items-center justify-center gap-3">دخول الملف <ArrowRight size={22} /></button></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 bg-white rounded-[60px] border border-slate-100 text-center shadow-inner"><FileText className="w-20 h-20 text-slate-100 mx-auto mb-6" /><p className="text-slate-400 font-black text-2xl">لا توجد نتائج</p></div>
      )}

      <AddPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchPatients} />
      <PatientDetailsModal patient={selectedPatient} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} onUpdate={fetchPatients} />
    </div>
  );
};

export default Patients;
