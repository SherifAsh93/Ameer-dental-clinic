
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'fa-home' },
    { id: 'patients', label: 'سجل المرضى', icon: 'fa-users' },
    { id: 'appointments', label: 'المواعيد', icon: 'fa-calendar' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden w-full max-w-full" dir="rtl">
      {/* Sidebar - Desktop & Tablet */}
      <aside className={`
        fixed inset-y-0 right-0 w-64 bg-slate-900 text-white z-50 transition-transform duration-300 md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <div className="text-right">
            <h1 className="text-xl font-black tracking-tighter text-blue-400 leading-none">د. أمير</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">عيادة الدكتور أمير</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-600 w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-bars"></i>
            </button>
            <h2 className="text-base md:text-lg font-black text-slate-800 truncate">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
             <div className="hidden sm:block text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">اليوم</p>
                <p className="text-xs font-black text-slate-700">{new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</p>
             </div>
             <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm">
                DR
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8 w-full">
          {children}
        </main>

        {/* Bottom Nav - Mobile Only */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
           <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
              <i className="fas fa-home text-lg"></i>
              <span className="text-[10px] font-bold">الرئيسية</span>
           </button>
           
           <div className="-mt-10 bg-white p-1 rounded-full">
              <button 
                onClick={() => { setActiveTab('patients'); }} 
                className="w-12 h-12 bg-slate-900 text-blue-400 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/10 border-4 border-white"
              >
                <i className="fas fa-plus"></i>
              </button>
           </div>

           <button onClick={() => setActiveTab('appointments')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'appointments' ? 'text-blue-600' : 'text-slate-400'}`}>
              <i className="fas fa-calendar text-lg"></i>
              <span className="text-[10px] font-bold">المواعيد</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;
