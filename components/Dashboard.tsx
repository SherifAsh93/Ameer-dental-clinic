import React, { useState, useEffect } from "react";
import {
  Users,
  CalendarCheck,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Zap,
  Loader2,
} from "lucide-react";
import { dbService } from "../services/dbService";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    patientCount: 0,
    todayAppointments: 0,
    totalCollected: 0,
    totalReceivables: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const patients = await dbService.getPatients();
      const appointments = await dbService.getAppointments();

      const today = new Date().toISOString().split("T")[0];
      const todayApts = appointments.filter((apt) =>
        apt.dateTime.startsWith(today),
      );

      const totalCollected = patients.reduce(
        (acc, p) => acc + (p.paidAmount || 0),
        0,
      );
      const totalProjected = patients.reduce(
        (acc, p) => acc + (p.totalPrice || 0),
        0,
      );
      const totalReceivables = Math.max(0, totalProjected - totalCollected);

      setStats({
        patientCount: patients.length,
        todayAppointments: todayApts.length,
        totalCollected,
        totalReceivables,
      });
    } catch (e) {
      console.error("Dashboard Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full py-40">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <p className="mt-4 text-slate-400 font-bold">جاري تحميل البيانات...</p>
      </div>
    );

  return (
    <div className="space-y-12 animate-slide-up" dir="rtl">
      {/* Premium Hero Banner */}
      <div className="relative p-10 md:p-20 bg-slate-900 rounded-[60px] md:rounded-[80px] overflow-hidden text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl text-right">
          <div className="flex items-center gap-4 mb-8">
            <div className="px-4 py-2 bg-teal-500 rounded-full text-[10px] font-black uppercase tracking-[5px] text-slate-900 flex items-center gap-2">
              <Star size={14} fill="currentColor" /> نظام إدارة معتمد
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[5px] text-teal-400 flex items-center gap-2">
              <Zap size={14} /> وصول ذكي وسريع
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
            أهلاً بك، د. أمير
          </h1>
          <p className="text-slate-400 text-lg md:text-2xl font-medium leading-relaxed max-w-xl">
            أنت تشاهد الآن ملخص الأداء اليومي لعيادتك. قمنا بتنظيم كافة سجلات
            المرضى والعمليات المالية لضمان أعلى مستوى من الكفاءة في العمل.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] -translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Grid of Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: "إجمالي الحالات",
            value: stats.patientCount.toString(),
            icon: Users,
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
          {
            label: "زيارات اليوم",
            value: stats.todayAppointments.toString(),
            icon: CalendarCheck,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "الإيرادات المحصلة",
            value: stats.totalCollected.toLocaleString(),
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            suffix: "ج.م",
          },
          {
            label: "أرصدة متبقية",
            value: stats.totalReceivables.toLocaleString(),
            icon: ArrowUpRight,
            color: "text-rose-600",
            bg: "bg-rose-50",
            suffix: "ج.م",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group cursor-default relative overflow-hidden"
          >
            <div
              className={`p-5 w-fit rounded-3xl ${stat.bg} ${stat.color} mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm`}
            >
              <stat.icon className="w-8 h-8" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[5px] mb-2">
              {stat.label}
            </p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">
              {stat.value}{" "}
              {stat.suffix && (
                <span className="text-sm font-bold text-slate-400 mr-1">
                  {stat.suffix}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Trust Badge Section */}
      <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-center gap-10">
        <div className="flex items-center gap-6 text-center md:text-right">
          <div className="w-20 h-20 bg-teal-50 rounded-[30px] flex items-center justify-center text-teal-600 shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">
              بيئة عمل احترافية
            </h4>
            <p className="text-slate-400 font-bold mt-1 max-w-md">
              تم تصميم النظام لضمان دقة البيانات الطبية والمالية، مع توفير أقصى
              درجات الخصوصية وحفظ السجلات بشكل دائم ومنظم.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
