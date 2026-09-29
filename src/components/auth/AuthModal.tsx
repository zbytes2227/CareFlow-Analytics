import React, { useState } from 'react';
import { useAuth } from '../../utils/authContext';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  Building, 
  AlertCircle, 
  Check, 
  KeyRound,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'director' | 'analyst' | 'admin' | 'nurse' | 'physician'>('analyst');
  const [department, setDepartment] = useState('General Medicine');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Login failed. Check your email and password.');
        } else {
          setSuccessMsg('Authentication successful! Welcome back.');
          setTimeout(() => onClose(), 600);
        }
      } else {
        const result = await register({
          name,
          email,
          password,
          role,
          department,
        });
        if (!result.success) {
          setError(result.error || 'Registration failed.');
        } else {
          setSuccessMsg('Account created and authenticated securely via JWT.');
          setTimeout(() => onClose(), 600);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Hospital Staff Authentication' : 'Create Staff Account'}
              </h3>
              <p className="text-xs text-slate-500">
                Secure JWT session with Bcrypt password encryption
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Login / Register */}
        <div className="flex border-b border-slate-200 my-4 text-xs">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 font-semibold text-center border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 font-semibold text-center border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register New Staff
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Demo Credentials Strip for fast evaluation */}
        {mode === 'login' && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Role Credentials (1-Click Fill):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('director@hospital.org')}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-mono transition-colors"
              >
                Director (Dr. Vance)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('analyst@hospital.org')}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-mono transition-colors"
              >
                Analyst (Marcus C.)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hospital.org')}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-mono transition-colors"
              >
                Admin (Operations)
              </button>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name &amp; Title
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="staff@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full py-1.5 px-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="director">Hospital Director</option>
                  <option value="analyst">Process Analyst</option>
                  <option value="admin">Operations Admin</option>
                  <option value="nurse">Nurse / Triage</option>
                  <option value="physician">Physician</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full py-1.5 px-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Radiology">Radiology</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In Securely' : 'Register Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Security verification stamp */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>MongoDB Role-Based Access Control</span>
          </span>
          <span className="font-mono">JWT RSA/HMAC Signed</span>
        </div>
      </div>
    </div>
  );
};
