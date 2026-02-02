
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Booking, User } from '../types';
import { saveBooking, deleteBooking, updateBooking, getNotesForDate, saveNote, deleteNote, getBirthdaysForDate, saveBirthday, deleteBirthday } from '../services/indexedDBStorage';
import { ArrowLeft, Plus, Trash2, Edit2, CreditCard, Clock, CheckCircle, Calendar, X, Phone, Copy, Check, StickyNote, Cake, Save, FileText } from 'lucide-react';
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
  
  // Notes state
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<any>(null);
  const [notesSortOrder, setNotesSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Birthdays state
  const [showBirthdays, setShowBirthdays] = useState(false);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdayPhone, setBirthdayPhone] = useState('');
  const [birthdayNotes, setBirthdayNotes] = useState('');
  const [editingBirthday, setEditingBirthday] = useState<any>(null);
  const [birthdaySearchTerm, setBirthdaySearchTerm] = useState('');
  
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

  // Filtered and sorted birthdays
  const filteredBirthdays = useMemo(() => {
    return birthdays
      .filter(birthday => 
        birthday.name.toLowerCase().includes(birthdaySearchTerm.toLowerCase()) ||
        (birthday.phone && birthday.phone.includes(birthdaySearchTerm)) ||
        (birthday.notes && birthday.notes.toLowerCase().includes(birthdaySearchTerm.toLowerCase()))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [birthdays, birthdaySearchTerm]);

  // Sorted notes
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (notesSortOrder === 'newest') {
        return b.updatedAt - a.updatedAt;
      } else {
        return a.updatedAt - b.updatedAt;
      }
    });
  }, [notes, notesSortOrder]);

  const totals = useMemo(() => {
    return dayBookings.reduce((acc, curr) => ({
      total: acc.total + curr.totalAmount,
      advance: acc.advance + curr.advanceAmount,
      pending: acc.pending + curr.pendingAmount
    }), { total: 0, advance: 0, pending: 0 });
  }, [dayBookings]);

  // Load notes for the current date
  useEffect(() => {
    if (date && currentUser) {
      getNotesForDate(currentUser.id, date).then(setNotes).catch(console.error);
      getBirthdaysForDate(currentUser.id, date).then(setBirthdays).catch(console.error);
    }
  }, [date, currentUser, showNotes, showBirthdays]);

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

  // Notes handlers
  const handleOpenNotes = () => {
    setShowNotes(true);
    setEditingNote(null);
    setNewNoteContent('');
  };

  const handleSaveNote = async () => {
    if (!newNoteContent.trim() || !currentUser || !date) return;
    
    const now = Date.now();
    const note = {
      id: editingNote?.id || Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      date,
      content: newNoteContent.trim(),
      createdAt: editingNote?.createdAt || now,
      updatedAt: now
    };

    try {
      await saveNote(note);
      setNewNoteContent('');
      setEditingNote(null);
      // Reload notes
      const updatedNotes = await getNotesForDate(currentUser.id, date);
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNewNoteContent(note.content);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      // Reload notes
      if (currentUser && date) {
        const updatedNotes = await getNotesForDate(currentUser.id, date);
        setNotes(updatedNotes);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Birthday handlers
  const handleOpenBirthdays = () => {
    setShowBirthdays(true);
    setEditingBirthday(null);
    setBirthdayName('');
    setBirthdayPhone('');
    setBirthdayNotes('');
    setBirthdaySearchTerm('');
  };

  const handleSaveBirthday = async () => {
    if (!birthdayName.trim() || !currentUser || !date) return;
    
    const now = Date.now();
    const birthday = {
      id: editingBirthday?.id || Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      date,
      name: birthdayName.trim(),
      phone: birthdayPhone.trim() || undefined,
      notes: birthdayNotes.trim() || undefined,
      createdAt: editingBirthday?.createdAt || now,
      updatedAt: now
    };

    try {
      await saveBirthday(birthday);
      setBirthdayName('');
      setBirthdayPhone('');
      setBirthdayNotes('');
      setEditingBirthday(null);
      // Reload birthdays
      const updatedBirthdays = await getBirthdaysForDate(currentUser.id, date);
      setBirthdays(updatedBirthdays);
    } catch (error) {
      console.error('Failed to save birthday:', error);
    }
  };

  const handleEditBirthday = (birthday: any) => {
    setEditingBirthday(birthday);
    setBirthdayName(birthday.name);
    setBirthdayPhone(birthday.phone || '');
    setBirthdayNotes(birthday.notes || '');
  };

  const handleDeleteBirthday = async (birthdayId: string) => {
    try {
      await deleteBirthday(birthdayId);
      // Reload birthdays
      if (currentUser && date) {
        const updatedBirthdays = await getBirthdaysForDate(currentUser.id, date);
        setBirthdays(updatedBirthdays);
      }
    } catch (error) {
      console.error('Failed to delete birthday:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 max-w-6xl mx-auto">
      {/* Enhanced Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="group flex items-center gap-3 text-slate-600 hover:text-indigo-600 mb-8 transition-all duration-300 font-medium text-sm md:text-base px-4 py-2 rounded-full hover:bg-white/50 backdrop-blur-sm border border-transparent hover:border-indigo-100 shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
        <span className="group-hover:font-semibold">Back to Calendar</span>
      </button>

      {/* Enhanced Header Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex-shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-600 bg-clip-text text-transparent leading-tight">
                {formattedDate}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm md:text-base">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Daily overview & management
              </p>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex flex-wrap gap-3 lg:gap-2 xl:gap-3">
            <button 
              onClick={handleOpenNotes}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 md:gap-2.5 font-semibold hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <StickyNote className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
              <span className="relative z-10">Notes</span>
              {notes.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                  {notes.length}
                </span>
              )}
            </button>
            
            <button 
              onClick={handleOpenBirthdays}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 md:gap-2.5 font-semibold hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Cake className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
              <span className="relative z-10">Birthdays</span>
              {birthdays.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                  {birthdays.length}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => { setEditingBooking(null); setShowForm(true); }}
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 md:gap-2.5 font-semibold hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Plus className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
              <span className="relative z-10">New Booking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-indigo-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-28 h-28 md:w-32 md:h-32 bg-indigo-200/30 rounded-full -translate-y-14 md:-translate-y-16 translate-x-14 md:translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/80 rounded-2xl shadow-md">
                <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">₹{totals.total.toLocaleString()}</p>
            <p className="text-sm text-slate-600">All bookings</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-emerald-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-28 h-28 md:w-32 md:h-32 bg-emerald-200/30 rounded-full -translate-y-14 md:-translate-y-16 translate-x-14 md:translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/80 rounded-2xl shadow-md">
                <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Advance</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">₹{totals.advance.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Received payments</p>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-amber-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute top-0 right-0 w-28 h-28 md:w-32 md:h-32 bg-amber-200/30 rounded-full -translate-y-14 md:-translate-y-16 translate-x-14 md:translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/80 rounded-2xl shadow-md">
                <Clock className="w-6 h-6 md:w-7 md:h-7 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">₹{totals.pending.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Awaiting payment</p>
          </div>
        </div>
      </div>

      {/* Enhanced Bookings Section */}
      <div className="space-y-6 pb-12">
        {dayBookings.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center backdrop-blur-sm">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg border border-slate-100">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings scheduled</h3>
            <p className="text-slate-500 mb-4">Start your day by adding a new booking entry</p>
            <button 
              onClick={() => { setEditingBooking(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add First Booking
            </button>
          </div>
        ) : (
          dayBookings.map((booking, index) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className="group relative"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-4 md:p-6 lg:p-8">
                  <div className="flex flex-col gap-4">
                    {/* Header with Title and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-600 bg-clip-text text-transparent">
                          {booking.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
                            <Phone className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium text-indigo-700 text-sm md:text-base">{booking.clientMobile}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1.5 p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                        <button 
                          onClick={() => handleShareWhatsApp(booking)}
                          className="group/btn p-3.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Share via WhatsApp"
                        >
                          <WhatsAppIcon className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => handleCopyDetails(booking)}
                          className={`group/btn p-3.5 rounded-xl transition-all duration-200 hover:scale-110 ${
                            copiedId === booking.id 
                              ? 'text-emerald-600 bg-emerald-50' 
                              : 'text-indigo-600 hover:bg-indigo-50'
                          }`}
                          title="Copy Details"
                        >
                          {copiedId === booking.id ? (
                            <Check className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                          ) : (
                            <Copy className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleEditClick(booking)}
                          className="group/btn p-3.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Edit Booking"
                        >
                          <Edit2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => handleDelete(booking.id)}
                          className="group/btn p-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Description */}
                    {booking.description && (
                      <div className="p-3 md:p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl md:rounded-2xl border border-slate-100">
                        <p className="text-slate-700 leading-relaxed text-sm md:text-base">{booking.description}</p>
                      </div>
                    )}
                    
                    {/* Payment Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-4 rounded-xl md:rounded-2xl border border-blue-100">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-xl md:text-xl font-bold text-slate-900">₹{booking.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 md:p-4 rounded-xl md:rounded-2xl border border-emerald-100">
                        <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Advance</p>
                        <p className="text-xl md:text-xl font-bold text-slate-900">₹{booking.advanceAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-4 rounded-xl md:rounded-2xl border border-amber-100">
                        <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-1">Pending</p>
                        <p className="text-xl md:text-xl font-bold text-slate-900">₹{booking.pendingAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Enhanced Booking Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-gradient-to-br from-white to-indigo-50/30 rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-white/20"
            >
              {/* Enhanced Header */}
              <div className="sticky top-0 z-10 px-8 py-6 border-b border-slate-100/50 bg-white/80 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-600 bg-clip-text text-transparent">
                      {editingBooking ? 'Edit Booking' : 'New Booking'}
                    </h2>
                    <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formattedDate}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseForm} 
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-indigo-600 tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    Booking Title
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Event or Customer Name"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-semibold bg-white/50 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-indigo-600 tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    Client Mobile Number
                  </label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      required
                      value={clientMobile}
                      onChange={(e) => setClientMobile(e.target.value)}
                      placeholder="Mandatory mobile number"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-semibold bg-white/50 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-indigo-600 tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    Description
                  </label>
                  <div className="relative">
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details about this booking..."
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all h-28 text-sm font-semibold resize-none bg-white/50 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase text-indigo-600 tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      Total Amount
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold bg-gradient-to-br from-blue-50 to-indigo-50"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-600 font-bold">₹</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase text-indigo-600 tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      Advance Amount
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold bg-gradient-to-br from-emerald-50 to-green-50"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-6 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {editingBooking ? 'Update Booking' : 'Save Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notes Sidebar */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex"
            onClick={() => setShowNotes(false)}
          >
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", damping: 25 }}
              className="ml-auto w-full max-w-md bg-white h-full overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <StickyNote className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Notes</h2>
                      <p className="text-sm text-slate-500">{formattedDate}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotes(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Sort Controls */}
                <div className="flex items-center justify-between border-t border-emerald-100 pt-4">
                  <span className="text-sm text-slate-600 font-medium">{sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setNotesSortOrder(notesSortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-md"
                  >
                    {notesSortOrder === 'newest' ? (
                      <>
                        <Calendar className="w-4 h-4" />
                        Newest First
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 rotate-180" />
                        Oldest First
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {sortedNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No notes yet</p>
                    <p className="text-slate-400 text-sm mt-1">Add your first note for this date</p>
                  </div>
                ) : (
                  sortedNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-slate-400">
                          {new Date(note.updatedAt).toLocaleString()}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add/Edit Note */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <div className="space-y-3">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Add a new note..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none text-sm font-medium"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNewNoteContent('');
                        setEditingNote(null);
                      }}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={!newNoteContent.trim()}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingNote ? 'Update Note' : 'Save Note'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Birthdays Sidebar */}
      <AnimatePresence>
        {showBirthdays && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex"
            onClick={() => setShowBirthdays(false)}
          >
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", damping: 25 }}
              className="ml-auto w-full max-w-md bg-white h-full overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Cake className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Birthdays</h2>
                      <p className="text-sm text-slate-500">{formattedDate}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBirthdays(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="space-y-3 border-t border-purple-100 pt-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={birthdaySearchTerm}
                      onChange={(e) => setBirthdaySearchTerm(e.target.value)}
                      placeholder="🔍 Search birthdays..."
                      className="w-full px-4 py-3 pl-12 bg-purple-100 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium shadow-sm"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {birthdaySearchTerm && (
                      <button
                        onClick={() => setBirthdaySearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800 transition-colors bg-purple-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  {/* Search Results Counter */}
                  <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-purple-700 font-medium">
                      {birthdaySearchTerm ? (
                        <>🔍 Found {filteredBirthdays.length} of {birthdays.length} birthdays</>
                      ) : (
                        <>📋 {birthdays.length} birthday{birthdays.length !== 1 ? 's' : ''}</>
                      )}
                    </span>
                    {birthdays.length > 1 && !birthdaySearchTerm && (
                      <span className="text-xs text-purple-600 font-medium bg-purple-200 px-2 py-1 rounded-full">
                        🔤 Sorted A-Z
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Birthdays List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filteredBirthdays.length === 0 ? (
                  <div className="text-center py-12">
                    {birthdaySearchTerm ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-slate-500 font-medium">No birthdays found</p>
                        <p className="text-slate-400 text-sm mt-1">Try searching with different terms</p>
                      </>
                    ) : (
                      <>
                        <Cake className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No birthdays yet</p>
                        <p className="text-slate-400 text-sm mt-1">Add your first birthday for this date</p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredBirthdays.map((birthday) => (
                    <motion.div
                      key={birthday.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-600">
                              {birthday.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{birthday.name}</h4>
                            <p className="text-xs text-slate-400">
                              {new Date(birthday.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditBirthday(birthday)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBirthday(birthday.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {birthday.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <Phone className="w-4 h-4" />
                          <span>{birthday.phone}</span>
                        </div>
                      )}
                      {birthday.notes && (
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="whitespace-pre-wrap">{birthday.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add/Edit Birthday */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={birthdayName}
                    onChange={(e) => setBirthdayName(e.target.value)}
                    placeholder="Name *"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
                  />
                  <input
                    type="tel"
                    value={birthdayPhone}
                    onChange={(e) => setBirthdayPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
                  />
                  <textarea
                    value={birthdayNotes}
                    onChange={(e) => setBirthdayNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none text-sm font-medium"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setBirthdayName('');
                        setBirthdayPhone('');
                        setBirthdayNotes('');
                        setEditingBirthday(null);
                      }}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveBirthday}
                      disabled={!birthdayName.trim()}
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingBirthday ? 'Update Birthday' : 'Save Birthday'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
