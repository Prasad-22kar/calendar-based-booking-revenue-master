
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  bookings: Booking[];
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, onRefresh }) => {
  const navigate = useNavigate();
  
  // Initialize to the current local date
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Helper to get today's date in YYYY-MM-DD local format
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const firstDayIndex = startOfMonth(year, month);
  const todayStr = getTodayStr();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getBookingsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date === dateStr);
  };

  const renderCalendar = () => {
    const days = [];
    // Previous month's empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 md:h-32 border border-slate-100 bg-slate-50/30"></div>);
    }

    // Current month's days
    for (let d = 1; d <= totalDays; d++) {
      const dayBookings = getBookingsForDate(d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;

      days.push(
        <motion.div 
          key={d} 
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate(`/date/${dateStr}`)}
          className={`h-20 md:h-32 border border-slate-100 p-1.5 md:p-2 cursor-pointer transition-all hover:bg-indigo-50/50 group relative ${isToday ? 'bg-indigo-50/40' : 'bg-white'}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs md:text-sm font-bold w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-700'}`}>
              {d}
            </span>
            {dayBookings.length > 0 && (
              <span className="text-[8px] md:text-[10px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-lg uppercase tracking-tight">
                {dayBookings.length} {dayBookings.length === 1 ? 'Job' : 'Jobs'}
              </span>
            )}
          </div>
          <div className="mt-1.5 md:mt-2 space-y-1 overflow-hidden">
            {dayBookings.slice(0, 2).map(b => (
              <div key={b.id} className="text-[8px] md:text-[10px] bg-slate-50 text-slate-600 px-1.5 py-1 rounded border-l-2 border-indigo-500 truncate hidden sm:block font-medium">
                {b.title}
              </div>
            ))}
            {dayBookings.length > 2 && (
              <div className="text-[8px] text-slate-400 font-bold pl-1 hidden sm:block">
                + {dayBookings.length - 2} more
              </div>
            )}
            {dayBookings.length > 0 && (
              <div className="sm:hidden flex justify-center mt-2">
                 <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-indigo-600' : 'bg-indigo-400'} animate-pulse`} />
              </div>
            )}
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <div className="bg-indigo-600 text-white p-1.5 rounded-xl shadow-lg shadow-indigo-200">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-6xl mx-auto px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{monthNames[month]} {year}</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">Managing schedules and revenue flow</p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={handlePrevMonth} 
              className="p-3 hover:bg-slate-50 text-slate-600 transition-colors border-r border-slate-100 active:bg-slate-100"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleGoToToday}
              className="px-6 py-3 text-sm font-black text-indigo-600 hover:bg-indigo-50/50 transition-colors active:bg-indigo-50 flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Today
            </button>
            <button 
              onClick={handleNextMonth} 
              className="p-3 hover:bg-slate-50 text-slate-600 transition-colors border-l border-slate-100 active:bg-slate-100"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden transition-all">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
