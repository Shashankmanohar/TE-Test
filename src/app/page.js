'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Layers, Award, FileQuestion, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5000/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://te-app-backend.vercel.app/api');

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [publicTests, setPublicTests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const studentDataStr = localStorage.getItem('studentData');
    if (token && studentDataStr) {
      setIsLoggedIn(true);
      try {
        const studentData = JSON.parse(studentDataStr);
        setStudentName(studentData.name || 'Student');
      } catch (e) {
        console.error('Error parsing student data', e);
      }
    } else {
      const fetchPublicTests = async () => {
        try {
          const res = await fetch(`${API_BASE}/student/tests`);
          const data = await res.json();
          if (data.success && Array.isArray(data.tests)) {
            setPublicTests(data.tests);
          }
        } catch (e) {
          console.error('Error fetching public tests', e);
        }
      };
      fetchPublicTests();
    }
  }, [isLoggedIn]);

  const handleAction = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleCategoryClick = (category) => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      setSelectedCategory(category);
    }
  };

  const getFilteredCategoryTests = () => {
    if (!selectedCategory) return [];
    return publicTests.filter(t => t.category === selectedCategory);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setStudentName('');
  };

  return (
    <div className="relative min-h-screen bg-white bg-grid-pattern text-gray-900 overflow-x-hidden flex flex-col justify-between">
      
      {/* Background Decorative Outline Shapes & Floating Dots */}
      <div className="absolute left-8 md:left-24 top-40 w-24 h-24 md:w-32 md:h-32 border border-purple-100 rounded-full pointer-events-none"></div>
      <div className="absolute right-8 md:right-32 top-1/2 -translate-y-1/2 w-32 h-40 md:w-44 md:h-52 border border-purple-100 rounded-2xl rotate-12 pointer-events-none"></div>
      <div className="absolute left-[10%] top-[20%] w-2.5 h-2.5 rounded-full bg-amber-200/80 pointer-events-none"></div>
      <div className="absolute left-[20%] top-[60%] w-1.5 h-1.5 rounded-full bg-purple-400 pointer-events-none"></div>
      <div className="absolute right-[22%] top-[68%] w-1.5 h-1.5 rounded-full bg-purple-400 pointer-events-none"></div>

      {/* Header / Navigation Bar */}
      <header className="relative w-full border-b border-gray-50 bg-white/80 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo container matching screenshot styling */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm w-28 md:w-32 flex items-center justify-center">
              <img 
                src="/Team-excellentlogo.svg" 
                alt="Team Excellent Logo" 
                className="h-10 md:h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-700">
            <span className="bg-purple-50 text-[#572C7A] px-4 py-2 rounded-full cursor-pointer">
              HOME
            </span>
            <span onClick={handleAction} className="hover:text-[#572C7A] px-4 py-2 rounded-full transition-colors cursor-pointer">
              BOARD
            </span>
            <span onClick={handleAction} className="hover:text-[#572C7A] px-4 py-2 rounded-full transition-colors cursor-pointer">
              NCERT
            </span>
            <span onClick={handleAction} className="hover:text-[#572C7A] px-4 py-2 rounded-full transition-colors cursor-pointer">
              PYQ
            </span>
            <span onClick={handleAction} className="hover:text-[#572C7A] px-4 py-2 rounded-full transition-colors cursor-pointer">
              AITS
            </span>
          </nav>

          {/* Auth CTA Button */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                  Hi, {studentName.split(' ')[0]}
                </span>
                <button 
                  onClick={handleAction}
                  className="bg-[#572C7A] hover:bg-[#431f60] text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 shadow-sm"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="border border-gray-200 hover:border-red-200 hover:text-red-600 text-gray-500 text-xs px-3 py-2.5 rounded-full transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAction}
                className="bg-[#572C7A] hover:bg-[#431f60] text-white text-xs md:text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-sm"
              >
                Login to Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="relative flex-1 flex flex-col items-center justify-center z-10">
        <div className="max-w-4xl mx-auto text-center pt-16 pb-12 px-6 flex flex-col items-center">
          
          {/* Subtitle capsule pill */}
          <div className="inline-flex items-center gap-2 bg-purple-50/80 border border-purple-100 px-4 py-1.5 rounded-full text-xs font-extrabold text-[#572C7A] tracking-wider mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#572C7A] animate-pulse"></span>
            ONLINE PRACTICE PLATFORM
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            AITS Online Examination <br className="hidden sm:inline" />
            <span className="text-[#572C7A]">Practice Centre</span>
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed mb-10">
            Prepare for India's toughest exams with real CBT-simulation mock tests. 
            Practice JEE, NEET, Board & NCERT — anytime, anywhere.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
            <button 
              onClick={handleAction} 
              className="w-full sm:w-auto bg-[#572C7A] hover:bg-[#431f60] text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start Practice Now'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAction}
              className="w-full sm:w-auto bg-white border border-gray-200 hover:border-purple-300 text-gray-700 hover:text-[#572C7A] px-8 py-3.5 rounded-full font-semibold transition-all duration-300 text-sm md:text-base"
            >
              Explore Batches
            </button>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-3 gap-4 sm:gap-12 md:gap-16 mt-16 border-t border-b border-gray-100 py-8 w-full max-w-3xl">
            <div className="text-center">
              <div className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#572C7A]">50+</div>
              <div className="text-[9px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase mt-1.5">Mock Papers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#572C7A]">4</div>
              <div className="text-[9px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase mt-1.5">Exam Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#572C7A]">3</div>
              <div className="text-[9px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase mt-1.5">Languages</div>
            </div>
          </div>

        </div>
      </main>

      {/* Public Mock Tests Section with Premium Marketing Design */}
      {!isLoggedIn && (
        <section className="relative w-full py-16 z-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden shadow-2xl border border-purple-500/20">
            {/* Visual glow blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Full Marketing Copy */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  ⚡ INSTANT DEMO • NO REGISTRATION
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Experience India's Best <br className="hidden sm:inline" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-purple-300 to-indigo-200">
                    CBT Test Simulator
                  </span> Free!
                </h2>

                <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed max-w-xl">
                  Try our state-of-the-art Computer Based Test (CBT) prep environment replica. Instantly practice with official exam patterns, active question navigation panels, color-coded legends, and subject toggles.
                </p>

                {/* Key value propositions list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-200 text-sm font-semibold pt-2">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Real JEE/NEET CBT UI Replica</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Automatic Negative Marking</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Detailed Scorecards on Submit</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Fully Mobile & Desktop Friendly</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Guest Tests List */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-center lg:text-left mb-2">
                  <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-widest block">
                    CHOOSE A LIVE PAPER TO ATTEMPT
                  </span>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {publicTests.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
                      <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full flex items-center justify-center mx-auto">
                        <Layers className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-300">No Live Mock Exams Scheduled</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                        There are no guest-attempt tests active in the database. Admin can activate and categorize live exams in the dashboard.
                      </p>
                    </div>
                  ) : (
                    publicTests.map((t) => (
                      <div 
                        key={t._id} 
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300 group flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-black text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded border border-purple-800 uppercase tracking-wider">
                              {t.subject}
                            </span>
                            {t.category && t.category !== 'None' && (
                              <span className="text-[9px] font-black text-amber-300 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-800 uppercase tracking-wider">
                                {t.category === 'JEE' && 'JEE'}
                                {t.category === 'NEET' && 'NEET'}
                                {t.category === 'Boards' && 'Boards'}
                                {t.category === 'NCERT' && 'NCERT'}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white truncate">{t.title}</h4>
                          <div className="flex gap-3 text-[10px] text-slate-400 font-semibold">
                            <span>{t.durationMinutes} Mins</span>
                            <span>•</span>
                            <span>{t.totalMarks} Marks</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => router.push(`/test/${t._id}`)}
                          className="bg-white hover:bg-amber-400 text-slate-900 hover:text-slate-950 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all duration-300 shrink-0 flex items-center gap-1 group-hover:gap-1.5 cursor-pointer"
                        >
                          Attempt <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category cards section at the bottom */}
      <section className="relative w-full bg-gray-50/50 border-t border-gray-50/80 py-16 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* JEE Prep Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">IIT-JEE Main & Adv</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Full syllabus mock tests designed with negative marking and JEE test patterns.
                </p>
              </div>
              <button onClick={() => handleCategoryClick('JEE')} className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer">
                Practice Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* NEET Prep Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">NEET Medical</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Comprehensive Biology, Physics, and Chemistry practice papers aligned with NEET syllabus.
                </p>
              </div>
              <button onClick={() => handleCategoryClick('NEET')} className="text-emerald-600 hover:text-emerald-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer">
                Practice Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Board Exams Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Board Examinations</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Class 11th and 12th state and CBSE board chapter-wise preparation tests.
                </p>
              </div>
              <button onClick={() => handleCategoryClick('Boards')} className="text-amber-600 hover:text-amber-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer">
                Practice Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* PYQ Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <FileQuestion className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">NCERT & PYQs</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Access standard NCERT exercises and previous years' question banks with solutions.
                </p>
              </div>
              <button onClick={() => handleCategoryClick('NCERT')} className="text-purple-600 hover:text-purple-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer">
                Practice Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Category Tests Modal Overlay */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-purple-100 w-full max-w-lg rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-[#572C7A] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 uppercase tracking-wider">
                  {selectedCategory === 'JEE' && 'IIT-JEE Prep Category'}
                  {selectedCategory === 'NEET' && 'NEET Medical Category'}
                  {selectedCategory === 'Boards' && 'Board Exams Category'}
                  {selectedCategory === 'NCERT' && 'NCERT & PYQ Category'}
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-2">
                  {selectedCategory === 'JEE' && 'IIT-JEE Mock Exams'}
                  {selectedCategory === 'NEET' && 'NEET Practice Papers'}
                  {selectedCategory === 'Boards' && 'Class 11 & 12 Board Papers'}
                  {selectedCategory === 'NCERT' && 'NCERT & Previous Year Papers'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List area */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {getFilteredCategoryTests().length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-purple-50 border border-purple-100 text-[#572C7A] rounded-full flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-900">No Public Mock Exams Live</p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                      There are no guest-attempt tests launched for this category yet. You can sign in to attempt batch-locked exams.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedCategory(null);
                      router.push('/login');
                    }}
                    className="bg-[#572C7A] hover:bg-[#431f60] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Go to Student Login
                  </button>
                </div>
              ) : (
                getFilteredCategoryTests().map((t) => (
                  <div 
                    key={t._id} 
                    className="bg-purple-50/20 border border-purple-100 rounded-2xl p-5 hover:border-purple-300 hover:bg-purple-50/40 transition-all duration-300 flex items-center justify-between gap-4 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <span className="text-[9px] font-black text-[#572C7A] bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase">
                        {t.subject}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 truncate">{t.title}</h4>
                      <div className="flex gap-2 text-[10px] text-gray-500 font-semibold">
                        <span>{t.durationMinutes} Mins</span>
                        <span>•</span>
                        <span>{t.totalMarks} Marks</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        router.push(`/test/${t._id}`);
                      }}
                      className="bg-[#572C7A] hover:bg-[#431f60] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1 group-hover:gap-1.5 cursor-pointer shrink-0"
                    >
                      Attempt <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-semibold">
              <span>CBT Exam Simulator V1.0</span>
              <span>Team Excellent</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} Team Excellent Career Institute. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
