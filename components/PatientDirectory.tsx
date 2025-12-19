
import React, { useState } from 'react';
import { Patient } from '../types';
import { dbService } from '../services/dbService';

interface PatientDirectoryProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onAddPatient: () => void;
  onRefresh: () => void;
}

const PatientDirectory: React.FC<PatientDirectoryProps> = ({ patients, onSelectPatient, onEditPatient, onAddPatient, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المريض؟')) {
      await dbService.deletePatient(id);
      onRefresh();
    }
  };

  const handleEdit = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    onEditPatient(patient);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4 md:space-y-6 w-full" dir="rtl">
      {/* Search and Add Section */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="بحث بالإسم أو التليفون..."
            className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-right font-bold text-xs md:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={onAddPatient}
          className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg text-xs md:text-sm"
        >
          <i className="fas fa-user-plus"></i>
          إضافة مريض جديد
        </button>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200 hover:border-indigo-400 hover:shadow-xl group cursor-pointer transition-all relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400 text-base md:text-lg font-black shadow-md">
                    {patient.name.trim().charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-black text-slate-800 truncate">{patient.name}</h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{patient.phone}</p>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex gap-1.5">
                      {patient.medConditionDiabetes && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                      {patient.medConditionHypertension && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                      {patient.hasAntibioticAllergy && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={(e) => handleEdit(e, patient)}
                       className="w-8 h-8 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center"
                       title="تعديل"
                     >
                       <i className="fas fa-edit text-xs"></i>
                     </button>
                     <button 
                       onClick={(e) => handleDelete(e, patient.id)}
                       className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                       title="حذف"
                     >
                       <i className="fas fa-trash-alt text-xs"></i>
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
           <i className="fas fa-user-slash text-3xl text-slate-200 mb-4 block"></i>
           <p className="text-slate-400 font-bold text-sm">لا يوجد مرضى مطابقين للبحث</p>
        </div>
      )}
    </div>
  );
};

export default PatientDirectory;
