
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getStoredUsers, saveUser } from '../services/storage';
import { LogIn, UserPlus, Shield, User as UserIcon, Calendar, CheckCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = getStoredUsers();

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password');
      }
    } else {
      if (users.some(u => u.email === email)) {
        setError('Email already exists');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password,
        name,
        role
      };
      saveUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col md:flex-row items-center justify-center p-6 md:p-0">
      {/* Branding Side */}
      <div className="md:w-1/2 flex flex-col items-center justify-center text-white space-y-8 p-12 hidden md:flex">
        <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-xl border border-white/20">
          <Calendar className="w-16 h-16" />
        </div>
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-black mb-4 tracking-tight">BookMaster</h1>
          <p className="text-indigo-100 text-lg font-medium opacity-90">Streamline your scheduling and financial tracking with our calendar-first management platform.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <Feature icon={<CheckCircle className="w-4 h-4" />} text="Payment Tracking" />
          <Feature icon={<CheckCircle className="w-4 h-4" />} text="Revenue Analytics" />
          <Feature icon={<CheckCircle className="w-4 h-4" />} text="Role-based Access" />
          <Feature icon={<CheckCircle className="w-4 h-4" />} text="Smart Calendar" />
        </div>
      </div>

      {/* Form Side */}
      <div className="md:w-1/2 w-full max-w-lg">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 mx-auto">
          <div className="text-center mb-10">
            <div className="md:hidden bg-indigo-100 p-4 rounded-2xl inline-block mb-4">
              <Calendar className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-500 mt-3 font-medium">{isLogin ? 'Enter your details to manage your bookings' : 'Join us to start tracking your events'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300" 
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300" 
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300" 
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Account Type</label>
                <div className="flex gap-4">
                  <RoleOption 
                    active={role === UserRole.USER} 
                    onClick={() => setRole(UserRole.USER)} 
                    icon={<UserIcon className="w-4 h-4" />}
                    label="User" 
                  />
                  <RoleOption 
                    active={role === UserRole.ADMIN} 
                    onClick={() => setRole(UserRole.ADMIN)} 
                    icon={<Shield className="w-4 h-4" />}
                    label="Admin" 
                  />
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm font-bold text-center py-3 bg-red-50 rounded-2xl border border-red-100">{error}</p>}

            <button 
              type="submit" 
              className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:translate-y-0.5"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-indigo-600 font-black hover:text-indigo-800 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? <><UserPlus className="w-4 h-4" /> New here? Create account</> : <><LogIn className="w-4 h-4" /> Already have an account? Sign in</>}
            </button>
          </div>

          <div className="mt-8 p-5 bg-slate-50/50 rounded-3xl border border-slate-100">
             <p className="text-[10px] text-slate-400 text-center uppercase tracking-[0.2em] font-black mb-4">Quick Demo Access</p>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setEmail('admin@system.com'); setPassword('password123'); setIsLogin(true); }}
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 bg-white py-2 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-95"
                >
                  Admin: admin@system.com
                </button>
                <button 
                  onClick={() => { setEmail('user@example.com'); setPassword('password123'); setIsLogin(true); }}
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 bg-white py-2 rounded-xl shadow-sm border border-slate-100 transition-all active:scale-95"
                >
                  User: user@example.com
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-indigo-100 text-sm font-semibold">
    <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">{icon}</div>
    {text}
  </div>
);

const RoleOption: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all ${
      active 
        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'
    }`}
  >
    {icon}
    <span className="font-black text-sm uppercase tracking-wide">{label}</span>
  </button>
);

export default AuthView;
