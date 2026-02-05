import React, { useState, useEffect, useMemo } from 'react';
import { User, Note } from '../../shared/types';
import { getAllNotesForUser, saveNote, deleteNote } from '../../shared/services/indexedDBStorage';
import { StickyNote, Edit2, Trash2, X, Calendar, FileText, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AllNotesViewProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

const AllNotesView: React.FC<AllNotesViewProps> = ({ currentUser, isOpen, onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'date'>('newest');

  // Sorted notes
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.updatedAt - a.updatedAt;
      } else if (sortOrder === 'oldest') {
        return a.updatedAt - b.updatedAt;
      } else {
        // Sort by date first, then by updated time
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return b.updatedAt - a.updatedAt;
      }
    });
  }, [notes, sortOrder]);

  // Group notes by date
  const groupedNotes = useMemo(() => {
    const groups: { [key: string]: Note[] } = {};
    sortedNotes.forEach(note => {
      if (!groups[note.date]) {
        groups[note.date] = [];
      }
      groups[note.date].push(note);
    });
    return groups;
  }, [sortedNotes]);

  // Load all notes for the user
  useEffect(() => {
    if (isOpen && currentUser) {
      setLoading(true);
      getAllNotesForUser(currentUser.id)
        .then(setNotes)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentUser]);


  const handleSaveNote = async () => {
    if (!newNoteContent.trim() || !currentUser || !selectedDate) return;
    
    const now = Date.now();
    const note: Note = {
      id: editingNote?.id || Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      date: selectedDate,
      content: newNoteContent.trim(),
      createdAt: editingNote?.createdAt || now,
      updatedAt: now
    };

    try {
      await saveNote(note);
      setNewNoteContent('');
      setEditingNote(null);
      setSelectedDate('');
      setShowAddNote(false);
      // Reload notes
      const updatedNotes = await getAllNotesForUser(currentUser.id);
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNoteContent(note.content);
    setSelectedDate(note.date);
    setShowAddNote(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      // Reload notes
      if (currentUser) {
        const updatedNotes = await getAllNotesForUser(currentUser.id);
        setNotes(updatedNotes);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
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

  const handleAddNewNote = () => {
    setEditingNote(null);
    setNewNoteContent('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowAddNote(true);
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
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <StickyNote className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">All Notes</h2>
                  <p className="text-sm text-slate-500">{notes.length} notes total</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center justify-between border-t border-emerald-100 pt-4">
              <span className="text-sm text-slate-600 font-medium">{sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOrder('newest')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all ${
                    sortOrder === 'newest' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Newest
                </button>
                <button
                  onClick={() => setSortOrder('oldest')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all ${
                    sortOrder === 'oldest' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 rotate-180" />
                  Oldest
                </button>
                <button
                  onClick={() => setSortOrder('date')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all ${
                    sortOrder === 'date' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  By Date
                </button>
              </div>
            </div>
          </div>

          {/* Add Note Button */}
          <div className="p-6 border-b border-slate-100 bg-white">
            <button
              onClick={handleAddNewNote}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Note
            </button>
          </div>

          {/* Add/Edit Note Form */}
          <AnimatePresence>
            {showAddNote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 border-b border-slate-100 bg-slate-50"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Note Content</label>
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Enter your note..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none text-sm font-medium"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddNote(false);
                        setEditingNote(null);
                        setNewNoteContent('');
                        setSelectedDate('');
                      }}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={!newNoteContent.trim() || !selectedDate}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingNote ? 'Update Note' : 'Save Note'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Loading notes...</p>
              </div>
            ) : Object.keys(groupedNotes).length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No notes yet</p>
                <p className="text-slate-400 text-sm mt-1">Click "Add New Note" to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(Object.entries(groupedNotes) as [string, Note[]][]).map(([date, dateNotes]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 sticky top-0 bg-white py-2 border-b border-slate-100">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <h3 className="font-bold text-slate-900">{formatDate(date)}</h3>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {dateNotes.length} note{dateNotes.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-3 pl-6">
                      {dateNotes.map((note) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all"
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

export default AllNotesView;
