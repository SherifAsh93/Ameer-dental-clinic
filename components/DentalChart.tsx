
import React, { useState } from 'react';
import { ToothStatus, ToothNote, DentalChartData } from '../types';

interface DentalChartProps {
  chartData: DentalChartData;
  onUpdateTooth: (toothNumber: number, status: ToothStatus, note: string) => void;
}

const DentalChart: React.FC<DentalChartProps> = ({ chartData, onUpdateTooth }) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState<ToothStatus>('Healthy');

  const teethTop = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const teethBottom = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const getStatusColor = (status?: ToothStatus) => {
    switch (status) {
      case 'Decay': return 'text-red-500';
      case 'Filled': return 'text-blue-500';
      case 'Crowned': return 'text-indigo-500';
      case 'Missing': return 'text-slate-300 opacity-30';
      case 'Bridge': return 'text-violet-500';
      case 'Implant': return 'text-emerald-500';
      default: return 'text-slate-400';
    }
  };

  const handleSave = () => {
    if (selectedTooth) {
      onUpdateTooth(selectedTooth, newStatus, newNote);
      setNewNote('');
      setSelectedTooth(null);
    }
  };

  const renderTooth = (num: number) => {
    const history = chartData[num] || [];
    const currentStatus = history.length > 0 ? history[history.length - 1].status : 'Healthy';
    const isSelected = selectedTooth === num;

    return (
      <div 
        key={num}
        onClick={() => {
          setSelectedTooth(num);
          setNewStatus(currentStatus);
        }}
        className={`relative group cursor-pointer flex flex-col items-center p-1 rounded-lg transition-all ${
          isSelected ? 'bg-indigo-50 ring-2 ring-indigo-500 scale-110 z-10' : 'hover:bg-slate-50'
        }`}
      >
        <span className="text-[10px] font-bold text-slate-400 mb-1">{num}</span>
        <div className={`transition-colors duration-300 ${getStatusColor(currentStatus)}`}>
           <i className={`fas fa-tooth text-2xl ${currentStatus === 'Missing' ? 'fa-times' : ''}`}></i>
        </div>
        {history.length > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border border-white"></div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-slate-800">مخطط الأسنان</h3>
        <div className="hidden sm:flex gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Decay</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Filled</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Crown</div>
        </div>
      </div>

      <div className="space-y-10 min-w-[600px] md:min-w-0">
        {/* Upper Jaw */}
        <div className="flex justify-center gap-2 md:gap-3">
          {teethTop.map(renderTooth)}
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-100 relative">
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">خط الوسط</span>
        </div>

        {/* Lower Jaw */}
        <div className="flex justify-center gap-2 md:gap-3">
          {teethBottom.map(renderTooth)}
        </div>
      </div>

      {selectedTooth && (
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-slate-800">تحديث السن #{selectedTooth}</h4>
            <button onClick={() => setSelectedTooth(null)} className="text-slate-400">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600">الحالة الطبية</label>
              <div className="grid grid-cols-3 gap-2">
                {['Healthy', 'Decay', 'Filled', 'Missing', 'Crowned', 'Implant'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s as ToothStatus)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                      newStatus === s 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600">ملاحظات</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="تفاصيل الحالة أو الخطة العلاجية..."
                className="w-full h-20 p-3 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-bold"
              ></textarea>
              <button
                onClick={handleSave}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs hover:bg-slate-800 transition-all"
              >
                تحديث المخطط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DentalChart;
