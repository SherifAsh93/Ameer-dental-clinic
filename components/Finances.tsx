
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  DollarSign, 
  Filter,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Patient, Payment } from '../types';

interface ExtendedPayment extends Payment {
  patientName: string;
}

const Finances: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjected: 0,
    totalCollected: 0,
    totalReceivables: 0,
    todayCollections: 0
  });
  const [recentPayments, setRecentPayments] = useState<ExtendedPayment[]>([]);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const patients = await dbService.getPatients();
      const allPayments = await dbService.getAllPayments();
      
      const totalProjected = patients.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
      const totalCollected = patients.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
      const totalReceivables = totalProjected - totalCollected;
      
      const today = new Date().toISOString().split('T')[0];
      const todayCollections = allPayments
        .filter(p => p.date.startsWith(today))
        .reduce((acc, p) => acc + p.amount, 0);

      setStats({
        totalProjected,
        totalCollected,
        totalReceivables,
        todayCollections
      });
      setRecentPayments(allPayments);
    } catch (error) {
      console.error("Finance Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 font-bold">جاري تحميل البيانات المالية...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-slide-up" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-right">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">المركز المالي</h2>
          <p className="text-slate-500 font-bold text-xs md:text-sm mt-1 uppercase tracking-[4px]">Ameer Dental Clinic Finances</p>
        </div>
        <button 
          onClick={loadFinanceData}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي المتوقع', value: stats.totalProjected, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', suffix: 'ج.م' },
          { label: 'إجمالي المحصل', value: stats.totalCollected, icon: ArrowDownCircle, color: 'text-teal-600', bg: 'bg-teal-50', suffix: 'ج.م' },
          { label: 'إجمالي المتبقي', value: stats.totalReceivables, icon: ArrowUpCircle, color: 'text-rose-600', bg: 'bg-rose-50', suffix: 'ج.م' },
          { label: 'تحصيل اليوم', value: stats.todayCollections, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50', suffix: 'ج.م' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`p-4 w-fit rounded-2xl ${stat.bg} ${stat.color} mb-6 relative z-10 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[4px] mb-1 relative z-10">{stat.label}</p>
            <p className="text-3xl font-black text-slate-800 relative z-10">{stat.value.toLocaleString()} <span className="text-sm font-bold text-slate-400">{stat.suffix}</span></p>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform ${stat.bg}`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Transactions List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <History className="text-teal-600" /> آخر العمليات المالية
            </h3>
            <div className="flex items-center gap-2 text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest">
              <Filter size={14} /> تصفية
            </div>
          </div>
          
          <div className="space-y-3">
            {recentPayments.length > 0 ? (
              recentPayments.map((pay) => (
                <div key={pay.id} className="bg-white p-5 md:p-6 rounded-[30px] border border-slate-50 shadow-sm flex items-center justify-between hover:border-teal-100 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-black shadow-inner group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg leading-none mb-1">{pay.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(pay.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black text-teal-600">+{pay.amount} ج.م</p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{pay.notes || 'دفعة كشف'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[40px] py-20 text-center border-2 border-dashed border-slate-100">
                <Wallet className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">لا توجد عمليات مالية مسجلة بعد.</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Health / Tips Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-2xl font-black mb-4">ملخص الأداء</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">نسبة التحصيل</span>
                    <span className="font-black text-teal-400">{stats.totalProjected > 0 ? Math.round((stats.totalCollected / stats.totalProjected) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${stats.totalProjected > 0 ? (stats.totalCollected / stats.totalProjected) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10">
                   <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                     "تذكير: متابعة المبالغ المتبقية بانتظام يساهم في تحسين التدفق النقدي للعيادة بنسبة 30%."
                   </p>
                </div>

                <div className="pt-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[4px] text-teal-400 mb-2 text-center">الإيرادات المكتملة</p>
                    <p className="text-center text-3xl font-black">{stats.totalCollected.toLocaleString()} ج.م</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finances;
