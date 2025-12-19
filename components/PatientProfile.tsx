
import React, { useState } from 'react';
import { Patient, ToothStatus } from '../types';
import DentalChart from './DentalChart';
import { dbService } from '../services/dbService';

interface PatientProfileProps {
  patient: Patient;
  onBack: () => void;
  onUpdate: (updatedPatient: Patient) => void;
  onEdit: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onBack, onUpdate, onEdit }) => {
  const [activeSubTab, setActiveSubTab] = useState<'chart' | 'history' | 'info'>('chart');

  const handleUpdateTooth = async (num: number, status: ToothStatus, note: string) => {
    const updatedChart = { ...patient.chart };
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      status,
      note,
      date: new Date().toLocaleDateString()
    };
    
    updatedChart[num] = [...(updatedChart[num] || []), newNote];
    
    const updatedPatient = { ...patient, chart: updatedChart };
    await dbService.savePatient(updatedPatient);
    onUpdate(updatedPatient);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full" dir="rtl">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-xs transition-colors"
        >
          <i className="fas fa-arrow-right"></i>
          العودة للسجل
        </button>
        
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-400 font-black text-xs transition-all shadow-sm"
        >
          <i className="fas fa-user-edit"></i>
          تعديل البيانات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Patient Info Card */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-lg">
              {patient.name.charAt(0)}
            </div>
            <h2 className="text-lg font-black text-slate-800 truncate px-2">{patient.name}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{patient.phone}</p>
            
            <div className="space-y-3 text-right border-t border-slate-100 pt-5 mt-5">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <i className="fas fa-calendar-alt text-indigo-400 w-4"></i>
                <span>{patient.dob}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <i className="fas fa-venus-mars text-indigo-400 w-4"></i>
                <span>{patient.gender === 'Female' ? 'أنثى' : 'ذكر'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <i className="fas fa-map-marker-alt text-indigo-400 w-4"></i>
                <span className="truncate">{patient.address || 'بدون عنوان'}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-right border border-slate-200">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-1 border-slate-200">التنبيهات</h4>
              <div className="space-y-1 text-[10px]">
                {patient.medConditionHypertension && <p className="text-red-600 font-bold">• ضغط</p>}
                {patient.medConditionDiabetes && <p className="text-red-600 font-bold">• سكر</p>}
                {patient.hasAntibioticAllergy && <p className="text-red-600 font-bold">• حساسية مضاد!</p>}
                {!(patient.medConditionHypertension || patient.medConditionDiabetes || patient.hasAntibioticAllergy) && <p className="text-slate-400 italic">لا توجد تنبيهات</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-3 space-y-6 w-full overflow-hidden">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex border-b border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {[
                { id: 'chart', label: 'المخطط', icon: 'fa-tooth' },
                { id: 'history', label: 'العلاجات', icon: 'fa-history' },
                { id: 'info', label: 'الأشعة', icon: 'fa-file-medical' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex-1 min-w-[100px] px-4 py-4 flex items-center justify-center gap-2 text-[10px] md:text-xs font-black transition-all ${
                    activeSubTab === tab.id 
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 md:p-6 flex-1 overflow-x-auto">
              {activeSubTab === 'chart' && (
                <DentalChart 
                  chartData={patient.chart} 
                  onUpdateTooth={handleUpdateTooth}
                />
              )}
              {activeSubTab === 'history' && (
                <div className="py-20 text-center text-slate-300 font-black italic text-xs">
                  لا يوجد سجل علاجي سابق
                </div>
              )}
              {activeSubTab === 'info' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1].map(i => (
                    <div key={i} className="aspect-square bg-slate-50 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-300 group hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer">
                      <i className="fas fa-plus text-xl mb-2"></i>
                      <span className="text-[9px] font-black">إضافة أشعة</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
