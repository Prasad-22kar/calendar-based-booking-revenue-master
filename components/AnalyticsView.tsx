
import React, { useMemo } from 'react';
import { Booking, UserRole } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsViewProps {
  bookings: Booking[];
  userRole: UserRole;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ bookings, userRole }) => {
  const stats = useMemo(() => {
    const data = bookings.reduce((acc, b) => {
      acc.total += b.totalAmount;
      acc.advance += b.advanceAmount;
      acc.pending += b.pendingAmount;
      return acc;
    }, { total: 0, advance: 0, pending: 0 });

    const monthlyData: Record<string, any> = {};
    bookings.forEach(b => {
      const month = new Date(b.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, revenue: 0, advance: 0, pending: 0 };
      }
      monthlyData[month].revenue += b.totalAmount;
      monthlyData[month].advance += b.advanceAmount;
      monthlyData[month].pending += b.pendingAmount;
    });

    const monthlyArray = Object.values(monthlyData).sort((a, b) => {
      return new Date(a.name).getTime() - new Date(b.name).getTime();
    });

    return { ...data, monthlyArray };
  }, [bookings]);

  const pieData = [
    { name: 'Advance', value: stats.advance },
    { name: 'Pending', value: stats.pending }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10">
      <div className="px-1 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Revenue Analytics</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">Real-time financial performance tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard 
          label="Gross Revenue" 
          value={`₹${stats.total.toLocaleString()}`} 
          trend="+12.5%" 
          icon={<DollarSign className="w-5 h-5 md:w-6 md:h-6" />}
          color="indigo"
          delay={0}
        />
        <SummaryCard 
          label="Bookings" 
          value={bookings.length.toString()} 
          trend="+3" 
          icon={<Users className="w-5 h-5 md:w-6 md:h-6" />}
          color="slate"
          delay={0.1}
        />
        <SummaryCard 
          label="Rate" 
          value={`${stats.total ? Math.round((stats.advance / stats.total) * 100) : 0}%`} 
          trend="Stable" 
          icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6" />}
          color="emerald"
          delay={0.2}
        />
        <SummaryCard 
          label="Avg. Deal" 
          value={`₹${bookings.length ? Math.round(stats.total / bookings.length).toLocaleString() : 0}`} 
          trend="-2.4%" 
          icon={<Activity className="w-5 h-5 md:w-6 md:h-6" />}
          color="amber"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Revenue Growth
          </h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyArray}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Collections
          </h3>
          <p className="text-slate-500 text-xs mb-6">Advance vs Pending ratio</p>
          <div className="h-56 md:h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs md:text-sm p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-2 font-medium text-slate-600">Advance</span>
              <span className="font-bold text-emerald-600">₹{stats.advance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-2 font-medium text-slate-600">Pending</span>
              <span className="font-bold text-amber-600">₹{stats.pending.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-3 bg-white p-5 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Monthly Performance</h3>
          <div className="overflow-x-auto hide-scrollbar -mx-5 md:mx-0 px-5 md:px-0">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Month</th>
                  <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Revenue</th>
                  <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Paid</th>
                  <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Due</th>
                  <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.monthlyArray.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50 transition-all group">
                    <td className="py-4 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{row.name}</td>
                    <td className="py-4 font-bold text-slate-900">₹{row.revenue.toLocaleString()}</td>
                    <td className="py-4 text-emerald-600 font-medium">₹{row.advance.toLocaleString()}</td>
                    <td className="py-4 text-amber-600 font-medium">₹{row.pending.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${row.pending === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.pending === 0 ? 'Cleared' : 'Due'}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.monthlyArray.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 italic text-sm">No bookings recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string, value: string, trend: string, icon: React.ReactNode, color: string, delay: number }> = ({ label, value, trend, icon, color, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm"
    >
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className={`p-2 md:p-3 rounded-xl bg-${color}-50 text-${color}-600`}>{icon}</div>
        <span className={`text-[9px] md:text-xs font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : trend === 'Stable' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
      <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-base md:text-2xl font-black text-slate-900 truncate">{value}</h4>
    </motion.div>
  );
};

export default AnalyticsView;
