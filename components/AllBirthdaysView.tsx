import React, { useState, useEffect, useMemo } from 'react';
import { User, Birthday } from '../types';
import { getAllBirthdaysForUser, saveBirthday, deleteBirthday } from '../services/indexedDBStorage';
import { Cake, Edit2, Trash2, X, Calendar, Phone, FileText, Plus, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AllBirthdaysViewProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

const AllBirthdaysView: React.FC<AllBirthdaysViewProps> = ({ currentUser, isOpen, onClose }) => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdayPhone, setBirthdayPhone] = useState('');
  const [birthdayNotes, setBirthdayNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showAddBirthday, setShowAddBirthday] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered and sorted birthdays
  const filteredBirthdays = useMemo(() => {
    return birthdays
      .filter(birthday => 
        birthday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (birthday.phone && birthday.phone.includes(searchTerm)) ||
        (birthday.notes && birthday.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        birthday.date.includes(searchTerm)
      )
      .sort((a, b) => {
        // Sort by date first, then by name
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.name.localeCompare(b.name);
      });
  }, [birthdays, searchTerm]);

  // Group birthdays by date
  const groupedBirthdays = useMemo(() => {
    const groups: { [key: string]: Birthday[] } = {};
    filteredBirthdays.forEach(birthday => {
      if (!groups[birthday.date]) {
        groups[birthday.date] = [];
      }
      groups[birthday.date].push(birthday);
    });
    return groups;
  }, [filteredBirthdays]);

  // Load all birthdays for the user
  useEffect(() => {
    if (isOpen && currentUser) {
      setLoading(true);
      getAllBirthdaysForUser(currentUser.id)
        .then(setBirthdays)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentUser]);


  const handleSaveBirthday = async () => {
    if (!birthdayName.trim() || !currentUser || !selectedDate) return;
    
    const now = Date.now();
    const birthday: Birthday = {
      id: editingBirthday?.id || Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      date: selectedDate,
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
      setSelectedDate('');
      setShowAddBirthday(false);
      // Reload birthdays
      const updatedBirthdays = await getAllBirthdaysForUser(currentUser.id);
      setBirthdays(updatedBirthdays);
    } catch (error) {
      console.error('Failed to save birthday:', error);
    }
  };

  const handleEditBirthday = (birthday: Birthday) => {
    setEditingBirthday(birthday);
    setBirthdayName(birthday.name);
    setBirthdayPhone(birthday.phone || '');
    setBirthdayNotes(birthday.notes || '');
    setSelectedDate(birthday.date);
    setShowAddBirthday(true);
  };

  const handleDeleteBirthday = async (birthdayId: string) => {
    try {
      await deleteBirthday(birthdayId);
      // Reload birthdays
      if (currentUser) {
        const updatedBirthdays = await getAllBirthdaysForUser(currentUser.id);
        setBirthdays(updatedBirthdays);
      }
    } catch (error) {
      console.error('Failed to delete birthday:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleAddNewBirthday = () => {
    setEditingBirthday(null);
    setBirthdayName('');
    setBirthdayPhone('');
    setBirthdayNotes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowAddBirthday(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: "spring", damping: 25 }}
          className="ml-auto w-full max-w-2xl bg-white h-full overflow-hidden flex flex-col"
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
                  <h2 className="text-xl font-bold text-slate-900">All Birthdays</h2>
                  <p className="text-sm text-slate-500">{birthdays.length} birthdays total</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Search birthdays by name, phone, notes, or date..."
                  className="w-full px-4 py-3 pl-12 bg-purple-100 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium shadow-sm"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800 transition-colors bg-purple-200 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              {/* Search Results Counter */}
              <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-purple-700 font-medium">
                  {searchTerm ? (
                    <>🔍 Found {filteredBirthdays.length} of {birthdays.length} birthdays</>
                  ) : (
                    <>📋 {birthdays.length} birthday{birthdays.length !== 1 ? 's' : ''}</>
                  )}
                </span>
                {!searchTerm && birthdays.length > 0 && (
                  <span className="text-xs text-purple-600 font-medium bg-purple-200 px-2 py-1 rounded-full">
                    📅 Sorted by date
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Add Birthday Button */}
          <div className="p-6 border-b border-slate-100 bg-white">
            <button
              onClick={handleAddNewBirthday}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Birthday
            </button>
          </div>

          {/* Add/Edit Birthday Form */}
          <AnimatePresence>
            {showAddBirthday && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 border-b border-slate-100 bg-slate-50"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Name *</label>
                    <input
                      type="text"
                      value={birthdayName}
                      onChange={(e) => setBirthdayName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Date *</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={birthdayPhone}
                      onChange={(e) => setBirthdayPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Notes</label>
                    <textarea
                      value={birthdayNotes}
                      onChange={(e) => setBirthdayNotes(e.target.value)}
                      placeholder="Enter notes (optional)"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none text-sm font-medium"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddBirthday(false);
                        setEditingBirthday(null);
                        setBirthdayName('');
                        setBirthdayPhone('');
                        setBirthdayNotes('');
                        setSelectedDate('');
                      }}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBirthday}
                      disabled={!birthdayName.trim() || !selectedDate}
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingBirthday ? 'Update Birthday' : 'Save Birthday'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Birthdays List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Loading birthdays...</p>
              </div>
            ) : Object.keys(groupedBirthdays).length === 0 ? (
              <div className="text-center py-12">
                {searchTerm ? (
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
                    <p className="text-slate-400 text-sm mt-1">Click "Add New Birthday" to get started</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {(Object.entries(groupedBirthdays) as [string, Birthday[]][]).map(([date, dateBirthdays]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 sticky top-0 bg-white py-2 border-b border-slate-100">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <h3 className="font-bold text-slate-900">{formatDate(date)}</h3>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {dateBirthdays.length} birthday{dateBirthdays.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-3 pl-6">
                      {dateBirthdays.map((birthday) => (
                        <motion.div
                          key={birthday.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-purple-600" />
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
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AllBirthdaysView;
