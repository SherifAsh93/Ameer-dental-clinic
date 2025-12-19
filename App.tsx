
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import PatientDirectory from './components/PatientDirectory';
import PatientProfile from './components/PatientProfile';
import AppointmentManager from './components/AppointmentManager';
import { dbService } from './services/dbService';
import { Patient, DentalChartData } from './types';

const Dashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  useEffect(() => {
    dbService.getPatients().then(setPatients);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full" dir="rtl">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('patients')} 
          className="group relative overflow-hidden bg-white p-5 rounded-3xl border border-slate-200 text-right hover:border-blue-400 transition-all shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <i className="fas fa-users text-lg"></i>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">المرضى المسجلين</p>
            <p className="text-xl font-black text-slate-800">{patients.length}</p>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('appointments')} 
          className="group relative overflow-hidden bg-white p-5 rounded-3xl border border-slate-200 text-right hover:border-blue-400 transition-all shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <i className="fas fa-calendar-check text-lg"></i>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">جدول اليوم</p>
            <p className="text-xl font-black text-slate-800">نشط</p>
          </div>
        </button>
      </div>

      {/* Welcome Hero */}
      <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 text-center space-y-6 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-slate-900"></div>
         <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <i className="fas fa-tooth text-2xl text-blue-600"></i>
         </div>
         <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">عيادة الدكتور أمير<br/><span className="text-blue-600">Dr. Ameer Dental Clinic</span></h3>
         <p className="text-slate-500 max-w-xl mx-auto font-bold text-xs md:text-sm leading-relaxed">
           نظام إدارة العيادة الذكي المتصل بـ Neon DB. يمكنك تسجيل المرضى وتنظيم المواعيد بسهولة وباحترافية تامة.
         </p>
         <div className="flex flex-col gap-3 mt-4">
            <button onClick={() => onNavigate('patients')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg text-sm">سجل المرضى</button>
            <button onClick={() => onNavigate('appointments')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg text-sm">المواعيد</button>
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormData: Partial<Patient> = {
    name: '', phone: '', dob: '', email: '', occupation: '', address: '', gender: 'Male',
    medConditionHypertension: false, medConditionDiabetes: false, medConditionStomachUlcer: false,
    medConditionRheumaticFever: false, medConditionHepatitis: false, medConditionPregnancyLactation: false,
    hasAntibioticAllergy: false, hasLocalAnesthesiaAllergy: false, hasHeartProblems: false,
    hasKidneyProblems: false, hasLiverProblems: false, takesRegularMedication: false,
    medicationPressure: false, medicationDiabetes: false, medicationBloodThinner: false, medicationOther: ''
  };

  const [formData, setFormData] = useState<Partial<Patient>>(initialFormData);

  useEffect(() => {
    refreshPatients();
  }, []);

  const refreshPatients = async () => {
    const data = await dbService.getPatients();
    setPatients([...data]);
  };

  const handleTabChange = (tab: string) => {
    setSelectedPatient(null);
    setActiveTab(tab);
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowPatientModal(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setFormData({ ...patient });
    setIsEditing(true);
    setShowPatientModal(true);
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("الرجاء إكمال البيانات الأساسية");
      return;
    }

    const patientToSave: Patient = {
      ...(formData as Patient),
      id: isEditing ? (formData.id as string) : Math.random().toString(36).substr(2, 9),
      chart: isEditing ? (formData.chart || {} as DentalChartData) : ({} as DentalChartData),
      createdAt: isEditing ? (formData.createdAt || new Date().toISOString()) : new Date().toISOString()
    } as Patient;

    await dbService.savePatient(patientToSave);
    setFormData(initialFormData);
    setShowPatientModal(false);
    await refreshPatients();
    
    // If we were editing a selected patient, update it
    if (selectedPatient && selectedPatient.id === patientToSave.id) {
      setSelectedPatient(patientToSave);
    }
  };

  const renderContent = () => {
    if (selectedPatient) {
      return (
        <PatientProfile 
          patient={selectedPatient} 
          onBack={() => setSelectedPatient(null)}
          onUpdate={(p) => { setSelectedPatient(p); refreshPatients(); }}
          onEdit={() => handleOpenEditModal(selectedPatient)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={handleTabChange} />;
      case 'patients': return (
        <PatientDirectory 
          patients={patients} 
          onSelectPatient={setSelectedPatient} 
          onAddPatient={handleOpenAddModal} 
          onEditPatient={handleOpenEditModal}
          onRefresh={refreshPatients} 
        />
      );
      case 'appointments': return <AppointmentManager />;
      default: return <Dashboard onNavigate={handleTabChange} />;
    }
  };

  const CheckboxItem = ({ label, field }: { label: string, field: keyof Patient }) => (
    <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors">
      <div className="flex items-center gap-2">
         <input 
            type="checkbox" 
            checked={formData[field] as boolean} 
            onChange={e => setFormData({...formData, [field]: e.target.checked})} 
            className="w-5 h-5 rounded-lg text-blue-600 border-slate-300 focus:ring-blue-500" 
         />
         <span className="text-xs font-bold text-slate-700">{label}</span>
      </div>
    </label>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      <div className="max-w-full overflow-hidden">
        {renderContent()}
      </div>

      {showPatientModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in" dir="rtl">
          <div className="bg-white w-full max-w-4xl rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-top-4 flex flex-col h-[95vh] md:h-[90vh]">
             {/* Modal Header */}
             <div className="px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <i className={`fas ${isEditing ? 'fa-edit' : 'fa-user-plus'} text-sm`}></i>
                   </div>
                   <h3 className="text-lg md:text-xl font-black text-slate-900">
                     {isEditing ? 'تعديل بيانات مريض' : 'تسجيل مريض جديد'}
                   </h3>
                </div>
                <button onClick={() => setShowPatientModal(false)} className="w-9 h-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                  <i className="fas fa-times"></i>
                </button>
             </div>

             {/* Modal Body */}
             <form className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar" onSubmit={handleSavePatient}>
                
                {/* 1. Personal Information */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">البيانات الشخصية والأساسية</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 block pr-2 uppercase">إسم المريض (رباعي)</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm shadow-inner" placeholder="شريف ..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 block pr-2 uppercase">رقم الهاتف</label>
                      <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm shadow-inner" placeholder="01xxxxxxxxx" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 block pr-2 uppercase">تاريخ الميلاد</label>
                      <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm shadow-inner text-right" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 block pr-2 uppercase">النوع</label>
                      <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm shadow-inner">
                        <option value="Male">ذكر</option>
                        <option value="Female">أنثى</option>
                        <option value="Other">آخر</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 block pr-2 uppercase">المهنة</label>
                      <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm shadow-inner" placeholder="المهنة..." />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 block pr-2 uppercase">العنوان</label>
                      <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm shadow-inner" placeholder="العنوان بالتفصيل..." />
                    </div>
                  </div>
                </section>

                {/* 2. Medical History (Checkboxes) */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">التاريخ المرضي العام</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <CheckboxItem label="سكر" field="medConditionDiabetes" />
                    <CheckboxItem label="ضغط" field="medConditionHypertension" />
                    <CheckboxItem label="قلب" field="hasHeartProblems" />
                    <CheckboxItem label="حساسية بنج" field="hasLocalAnesthesiaAllergy" />
                    <CheckboxItem label="حساسية مضاد" field="hasAntibioticAllergy" />
                    <CheckboxItem label="قرحة معدة" field="medConditionStomachUlcer" />
                    <CheckboxItem label="حمى روماتيزمية" field="medConditionRheumaticFever" />
                    <CheckboxItem label="التهاب كبدي" field="medConditionHepatitis" />
                    <CheckboxItem label="مشاكل كلى" field="hasKidneyProblems" />
                    <CheckboxItem label="مشاكل كبد" field="hasLiverProblems" />
                    {formData.gender === 'Female' && (
                      <CheckboxItem label="حمل / رضاعة" field="medConditionPregnancyLactation" />
                    )}
                  </div>
                </section>

                {/* 3. Current Medications */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">الأدوية التي يتم تناولها بانتظام</h4>
                  </div>
                  <div className="space-y-4">
                    <CheckboxItem label="هل تتناول أي أدوية بانتظام؟" field="takesRegularMedication" />
                    
                    {formData.takesRegularMedication && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                        <CheckboxItem label="أدوية ضغط" field="medicationPressure" />
                        <CheckboxItem label="أدوية سكر" field="medicationDiabetes" />
                        <CheckboxItem label="أدوية سيولة" field="medicationBloodThinner" />
                        <div className="sm:col-span-3 space-y-1 mt-2">
                           <label className="text-[9px] font-black text-slate-400 block pr-2 uppercase">أدوية أخرى (يرجى ذكرها)</label>
                           <input 
                              type="text" 
                              value={formData.medicationOther} 
                              onChange={e => setFormData({...formData, medicationOther: e.target.value})} 
                              className="w-full p-4 bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 text-xs" 
                              placeholder="اسم الدواء والغرض منه..."
                           />
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Form Action */}
                <div className="pb-10 pt-4">
                  <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 group">
                    <i className="fas fa-check-circle text-blue-400 group-hover:scale-125 transition-transform"></i>
                    {isEditing ? 'تحديث بيانات المريض' : 'حفظ بيانات المريض بصفة دائمة'}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
