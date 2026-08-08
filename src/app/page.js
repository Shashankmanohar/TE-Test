'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Layers, Award, FileQuestion, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentName, setStudentName] = useState('');

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
    }
  }, []);

  const handleAction = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
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
              <button onClick={handleAction} className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
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
              <button onClick={handleAction} className="text-emerald-600 hover:text-emerald-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
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
              <button onClick={handleAction} className="text-amber-600 hover:text-amber-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
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
              <button onClick={handleAction} className="text-purple-600 hover:text-purple-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Practice Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} Team Excellent Career Institute. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
