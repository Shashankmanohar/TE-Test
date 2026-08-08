'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5000/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://te-app-backend.vercel.app/api');

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('studentId', data.user._id);
        localStorage.setItem('studentData', JSON.stringify(data.user));
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.replace(redirectUrl);
        } else {
          router.replace('/dashboard');
        }
      } else {
        setError(data.message || 'Authentication failed. Please verify details.');
      }
    } catch (err) {
      setError('Cannot connect to API server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4FA] flex items-center justify-center p-6 relative overflow-hidden font-sans text-gray-800">
      {/* Background Blurs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-2xl p-8 relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <img
            src="/Team-excellentlogo.svg"
            alt="Team Excellent Logo"
            className="h-16 object-contain mx-auto mb-1"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100/50 text-[#552479] text-[10px] font-black uppercase tracking-wider">
            Student CBT Assessment Portal
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Student Sign In</h2>
          <p className="text-xs text-gray-500 font-semibold">
            Use your enrolled Student ID & Date of Birth to enter the portal.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
              STUDENT ID / ROLL NO
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Roll Number or Student ID"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#552479] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
              PASSWORD (DATE OF BIRTH)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. 2006-05-15 or 15052006"
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#552479] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">
              Hint: Default DOB format is YYYY-MM-DD or DDMMYYYY. Demo roll is <strong>STU-2026-000013</strong> with password <strong>2006-05-15</strong>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#552479] text-white py-3 rounded-xl text-xs font-extrabold hover:bg-[#431b60] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/10 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Assessment Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-purple-50 pt-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold">
            Developed by Webflora Technologies for Team Excellent Career Institute
          </p>
        </div>
      </div>
    </div>
  );
}
