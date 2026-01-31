
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Booking, User } from '../types';
import { saveBooking, deleteBooking, updateBooking } from '../services/indexedDBStorage';
import { ArrowLeft, Plus, Trash2, Edit2, CreditCard, Clock, CheckCircle, Calendar, X, Phone, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Official WhatsApp Branded Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface DateDetailsViewProps {
  bookings: Booking[];
  currentUser: User;
  onRefresh: () => void;
}

const DateDetailsView: React.FC<DateDetailsViewProps> = ({ bookings, currentUser, onRefresh }) => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');

  const dayBookings = useMemo(() => {
    return bookings
      .filter(b => b.date === date)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [bookings, date]);

  const totals = useMemo(() => {
    return dayBookings.reduce((acc, curr) => ({
      total: acc.total + curr.totalAmount,
      advance: acc.advance + curr.advanceAmount,
      pending: acc.pending + curr.pendingAmount
    }), { total: 0, advance: 0, pending: 0 });
  }, [dayBookings]);

  // Handle pre-filling form for editing
  useEffect(() => {
    if (editingBooking) {
      setTitle(editingBooking.title);
      setClientMobile(editingBooking.clientMobile);
      setDescription(editingBooking.description);
      setTotalAmount(editingBooking.totalAmount.toString());
      setAdvanceAmount(editingBooking.advanceAmount.toString());
    } else {
      setTitle('');
      setClientMobile('');
      setDescription('');
      setTotalAmount('');
      setAdvanceAmount('');
    }
  }, [editingBooking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalAmount);
    const advance = parseFloat(advanceAmount);
    
    if (isNaN(total) || isNaN(advance) || !title || !clientMobile) return;

    try {
      if (editingBooking) {
        const updated: Booking = {
          ...editingBooking,
          title,
          clientMobile,
          description,
          totalAmount: total,
          advanceAmount: advance,
          pendingAmount: total - advance,
        };
        await updateBooking(updated);
      } else {
        const newBooking: Booking = {
          id: Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          userName: currentUser.name,
          clientMobile,
          title,
          description,
          date: date!,
          totalAmount: total,
          advanceAmount: advance,
          pendingAmount: total - advance,
          createdAt: Date.now()
        };
        await saveBooking(newBooking);
      }

      onRefresh();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save booking:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBooking(null);
  };

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
  };

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : '';

  const getFormattedBookingText = (booking: Booking) => {
    return `*Booking Confirmation*\n\n` +
      `*Title:* ${booking.title}\n` +
      `*Date:* ${formattedDate}\n` +
      `*Mobile:* ${booking.clientMobile}\n` +
      `*Details:* ${booking.description || 'N/A'}\n\n` +
      `*Payment Summary:*\n` +
      `Total Amount: ₹${booking.totalAmount.toLocaleString()}\n` +
      `Advance Paid: ₹${booking.advanceAmount.toLocaleString()}\n` +
      `Pending Due: ₹${booking.pendingAmount.toLocaleString()}\n\n` +
      `Thank you for choosing us!`;
  };

  const handleCopyDetails = (booking: Booking) => {
    const text = getFormattedBookingText(booking);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(booking.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShareWhatsApp = (booking: Booking) => {
    const text = getFormattedBookingText(booking);
    // Sanitize phone number (remove all non-numeric characters)
    const sanitizedNumber = booking.clientMobile.replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${sanitizedNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-1 md:px-0">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium text-sm md:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Calendar
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{formattedDate}</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Daily summary and booking management</p>
        </div>
        <button 
          onClick={() => { setEditingBooking(null); setShowForm(true); }}
          className="bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 font-bold w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total" amount={totals.total} icon={<CreditCard className="w-5 h-5" />} color="indigo" />
        <StatCard label="Advance" amount={totals.advance} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
        <StatCard label="Pending" amount={totals.pending} icon={<Clock className="w-5 h-5" />} color="amber" />
      </div>

      <div className="space-y-4 pb-12">
        {dayBookings.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
            <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900">No bookings scheduled</h3>
            <p className="text-sm text-slate-500 mt-1">Tap the plus button to add your first entry.</p>
          </div>
        ) : (
          dayBookings.map((booking, index) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 truncate">{booking.title}</h3>
                  <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mt-1">
                    <Phone className="w-3 h-3" />
                    {booking.clientMobile}
                  </div>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{booking.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button 
                    onClick={() => handleShareWhatsApp(booking)}
                    className="p-2 text-slate-300 hover:text-emerald-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
                    title="Share via WhatsApp"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleCopyDetails(booking)}
                    className={`p-2 transition-all md:opacity-0 md:group-hover:opacity-100 ${copiedId === booking.id ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-600'}`}
                    title="Copy Details"
                  >
                    {copiedId === booking.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => handleEditClick(booking)}
                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors md:opacity-0 md:group-hover:opacity-100"
                    title="Edit Booking"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(booking.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
                    title="Delete Booking"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Total</p>
                  <p className="text-base md:text-lg font-bold text-slate-900">₹{booking.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Paid</p>
                  <p className="text-base md:text-lg font-bold text-emerald-600">₹{booking.advanceAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Due</p>
                  <p className="text-base md:text-lg font-bold text-amber-600">₹{booking.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 z-10 px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{editingBooking ? 'Edit Booking' : 'New Booking'}</h2>
                  <p className="text-slate-500 text-xs">{formattedDate}</p>
                </div>
                <button onClick={handleCloseForm} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-widest mb-2">Booking Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event or Customer Name"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-widest mb-2">Client Mobile Number</label>
                  <input 
                    type="tel" 
                    required
                    value={clientMobile}
                    onChange={(e) => setClientMobile(e.target.value)}
                    placeholder="Mandatory mobile number"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-widest mb-2">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all h-24 text-sm resize-none"
                    placeholder="Additional details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 tracking-widest mb-2">Total Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 tracking-widest mb-2">Advance Paid (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm"
                  >
                    {editingBooking ? 'Update Booking' : 'Save Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard: React.FC<{ label: string, amount: number, icon: React.ReactNode, color: 'indigo' | 'emerald' | 'amber' }> = ({ label, amount, icon, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border ${colors[color]} flex items-center gap-4 shadow-sm`}>
      <div className={`p-2.5 md:p-3 rounded-xl bg-white shadow-sm flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">{label}</p>
        <p className="text-lg md:text-2xl font-black truncate">₹{amount.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default DateDetailsView;
