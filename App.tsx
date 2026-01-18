
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Plus, 
  Menu,
  X,
  CreditCard,
  UserPlus,
  Stethoscope
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import Finances from './components/Finances';
import AddPatientModal from './components/AddPatientModal';

type Tab = 'dashboard' | 'patients' | 'appointments' | 'finances';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const navigation = [
    { id: 'dashboard', name: 'الرئيسية', icon: LayoutDashboard },
    { id: 'patients', name: 'المرضى', icon: Users },
    { id: 'appointments', name: 'المواعيد', icon: Calendar },
    { id: 'finances', name: 'الحسابات', icon: CreditCard },
  ];

  const handleDataRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans" dir="rtl">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-l border-slate-200 z-50 shadow-xl">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 transform -rotate-3 transition-transform hover:rotate-0">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-800 leading-none mb-1 tracking-tighter">عيادة الأمير</h1>
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[3px]">Dental Clinic</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
                ${activeTab === item.id 
                  ? 'bg-teal-600 text-white shadow-xl shadow-teal-100' 
                  : 'text-slate-400 hover:bg-teal-50 hover:text-teal-600'}`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-bold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
           <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-teal-100">أ</div>
              <div>
                <p className="text-xs font-black text-slate-800">د. أمير</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">المدير العام</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="lg:hidden p-3 bg-slate-100 rounded-2xl text-slate-600 active:scale-95 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <h2 className="font-black text-slate-800 text-lg tracking-tight">AMEER DENTAL</h2>
                <p className="text-[9px] font-black text-teal-600 tracking-widest leading-none">PREMIUM CLINIC CARE</p>
             </div>
             <button 
               onClick={() => setIsPatientModalOpen(true)}
               className="h-14 px-8 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-teal-200 hover:brightness-110 active:scale-95 transition-all gap-3"
             >
                <Plus className="w-5 h-5" />
                <span className="font-black text-sm hidden sm:inline">إضافة مريض</span>
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar relative z-10">
          <div className="max-w-[1400px] mx-auto pb-20">
            {activeTab === 'dashboard' && <Dashboard key={`dash-${refreshKey}`} />}
            {activeTab === 'patients' && <Patients key={`pats-${refreshKey}`} />}
            {activeTab === 'appointments' && <Appointments key={`apts-${refreshKey}`} />}
            {activeTab === 'finances' && <Finances key={`fins-${refreshKey}`} />}
          </div>
        </main>
      </div>

      <AddPatientModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
        onSuccess={() => {
          handleDataRefresh();
          setActiveTab('patients');
        }} 
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-80 bg-white p-8 shadow-2xl flex flex-col transition-transform duration-300">
             <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Stethoscope size={24} /></div>
                 <h1 className="font-black text-xl">عيادة الأمير</h1>
               </div>
               <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90"><X size={24} /></button>
             </div>
             <div className="space-y-3 flex-1">
               {navigation.map(item => (
                 <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as Tab); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-teal-600 text-white shadow-xl shadow-teal-100' : 'bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600'}`}
                 >
                   <item.icon className="w-6 h-6" /> {item.name}
                 </button>
               ))}
             </div>
             <div className="pt-8 border-t border-slate-100">
                <button 
                  onClick={() => { setIsPatientModalOpen(true); setIsSidebarOpen(false); }} 
                  className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-base"
                >
                  <UserPlus size={20} /> تسجيل مريض جديد
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
