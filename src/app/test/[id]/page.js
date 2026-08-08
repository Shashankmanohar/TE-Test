'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { User, Clock, CheckCircle, HelpCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://te-app-backend.vercel.app/api';

export default function TestSimulator({ params }) {
  const router = useRouter();
  const { id: testId } = use(params);

  // States
  const [student, setStudent] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Exam Attempt States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qId: selectedOption }
  const [statusMap, setStatusMap] = useState({}); // { qId: 'visited' | 'answered' | 'marked' | 'answered_marked' }
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [activeSubject, setActiveSubject] = useState('ALL'); // 'ALL' | 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Load profile and test questions
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const studentDataStr = localStorage.getItem('studentData');
    const studentId = localStorage.getItem('studentId');

    if (!token || !studentDataStr || !studentId) {
      sessionStorage.setItem('redirectAfterLogin', `/test/${testId}`);
      router.replace('/login');
      return;
    }

    setStudent(JSON.parse(studentDataStr));

    const loadTestData = async () => {
      try {
        const res = await fetch(`${API_BASE}/student/tests/${testId}/questions`);
        const data = await res.json();
        if (data.success) {
          setTest(data.test);
          setQuestions(data.questions);
          setTimeRemaining((data.test.durationMinutes || 180) * 60);

          // Initialize states
          const initialStatus = {};
          data.questions.forEach((q, idx) => {
            initialStatus[q._id] = idx === 0 ? 'visited' : 'not_visited';
          });
          setStatusMap(initialStatus);
        } else {
          setError(data.message || 'Failed to load test questions.');
        }
      } catch (err) {
        setError('Connection error. Could not load test papers.');
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, [testId, router]);

  // Countdown timer
  useEffect(() => {
    if (loading || error || timeRemaining <= 0 || showSubmitConfirm || submitting || !isExamStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, error, timeRemaining, showSubmitConfirm, submitting, isExamStarted]);

  // Dynamic subjects list based on loaded questions
  const getSubjects = () => {
    const subs = new Set();
    questions.forEach(q => {
      if (q.subject) subs.add(q.subject);
    });
    return ['ALL', ...Array.from(subs)];
  };

  // Filtered questions based on clicked subject
  const getFilteredQuestions = () => {
    if (activeSubject === 'ALL') return questions;
    return questions.filter(q => q.subject === activeSubject);
  };

  // Maps global index to filtered index
  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = filteredQuestions[currentIndex];

  // Global index of current question in complete questions list
  const getGlobalIndex = () => {
    if (!currentQuestion) return 0;
    return questions.findIndex(q => q._id === currentQuestion._id);
  };

  // Format time remaining into HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Legend Counter
  const getLegendCounts = () => {
    let notVisited = 0;
    let notAnswered = 0;
    let answered = 0;
    let marked = 0;
    let answeredMarked = 0;

    questions.forEach(q => {
      const status = statusMap[q._id] || 'not_visited';
      const ans = selectedAnswers[q._id];

      if (status === 'not_visited') notVisited++;
      else if (status === 'visited') notAnswered++;
      else if (status === 'answered') answered++;
      else if (status === 'marked') marked++;
      else if (status === 'answered_marked') answeredMarked++;
    });

    return { notVisited, notAnswered, answered, marked, answeredMarked };
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      const nextQ = filteredQuestions[currentIndex + 1];
      // Mark next question as visited if not visited or answered
      updateStatus(nextQ._id, 'visited');
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const selectOption = (opt) => {
    if (!currentQuestion) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion._id]: opt }));
  };

  const clearResponse = () => {
    if (!currentQuestion) return;
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion._id];
      return copy;
    });
    // Revert status to visited (not answered)
    updateStatus(currentQuestion._id, 'visited');
  };

  const updateStatus = (qId, type) => {
    setStatusMap(prev => {
      const current = prev[qId];
      // Keep answered or marked flags unless explicity cleared
      if (type === 'visited' && (current === 'answered' || current === 'marked' || current === 'answered_marked')) {
        return prev;
      }
      return { ...prev, [qId]: type };
    });
  };

  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    const selection = selectedAnswers[currentQuestion._id];
    if (selection) {
      updateStatus(currentQuestion._id, 'answered');
    } else {
      updateStatus(currentQuestion._id, 'visited'); // not answered
    }
    handleNext();
  };

  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;
    const selection = selectedAnswers[currentQuestion._id];
    if (selection) {
      updateStatus(currentQuestion._id, 'answered_marked');
    } else {
      updateStatus(currentQuestion._id, 'marked');
    }
    handleNext();
  };

  const triggerAutoSubmit = () => {
    alert('Time limit reached! Submitting your responses automatically.');
    submitTestAnswers();
  };

  const submitTestAnswers = async () => {
    setSubmitting(true);
    setError('');

    const formattedAnswers = Object.keys(selectedAnswers).map(qId => ({
      questionId: qId,
      selectedOption: selectedAnswers[qId]
    }));

    const durationMins = test.durationMinutes || 180;
    const timeTaken = Math.max(1, Math.round((durationMins * 60 - timeRemaining) / 60));

    try {
      const res = await fetch(`${API_BASE}/student/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student._id,
          answers: formattedAnswers,
          timeTakenMinutes: timeTaken
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Test submitted successfully! Your score: ${data.result.marksObtained}/${data.result.totalMarks}`);
        router.replace('/dashboard');
      } else {
        setError(data.message || 'Submission failed.');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Connection failure. Please retry submitting.');
      setSubmitting(false);
    }
  };

  const startExam = async () => {
    if (!agreed) {
      alert('Please read the instructions and check the declaration box to begin the exam.');
      return;
    }

    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not supported:', err);
    }

    setIsExamStarted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#552479] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500">Entering Examination Hall... Preparing CBT Engine.</p>
        </div>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-100 text-center space-y-4 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-black text-gray-900">Entrance Blocked</h3>
          <p className="text-xs text-gray-500 font-semibold">{error}</p>
          <button
            onClick={() => router.replace('/dashboard')}
            className="w-full bg-[#552479] text-white py-2.5 rounded-xl text-xs font-bold shadow hover:bg-[#431b60]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-gray-800 font-sans flex flex-col justify-between">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <img src="/Team-excellentlogo.svg" alt="Team Excellent Logo" className="h-9 object-contain" />
            <div>
              <h2 className="font-extrabold text-gray-900 text-sm md:text-base">{test?.title}</h2>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase">JEE CBT Online Instructions Portal</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="block text-[8px] font-extrabold text-gray-400 uppercase">SUBJECT</span>
            <span className="font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{test?.subject || 'JEE Advanced'}</span>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
          
          {/* Left Column: Instructions Scroll Area */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-200 p-6 flex flex-col shadow-sm overflow-hidden">
            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3 uppercase tracking-wide">
              General Instructions - Please Read Carefully
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4 text-xs text-gray-600 font-semibold leading-relaxed">
              <div>
                <h4 className="font-black text-gray-900 mb-1">1. General Outline</h4>
                <p>The total duration of this examination is <strong className="text-gray-950 font-black">{test?.durationMinutes || 180} minutes</strong>. The clock will be set by the server and the remaining time will be displayed in the countdown timer at the top right of your screen. Upon expiry, your responses will be submitted automatically.</p>
              </div>

              <div>
                <h4 className="font-black text-gray-900 mb-1">2. Question Palette Indicators</h4>
                <p>The Question Palette on the right side of the screen shows the status of each question using one of the following colors/symbols:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-gray-200 border border-gray-300 flex items-center justify-center font-black text-gray-700 text-[8px]">01</span>
                    <span><strong>Not Visited</strong>: You have not visited the question yet.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-white text-[8px]">02</span>
                    <span><strong>Not Answered</strong>: You visited but did not answer.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-500 border border-emerald-600 flex items-center justify-center font-black text-white text-[8px]">03</span>
                    <span><strong>Answered</strong>: You have answered the question.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#4C3BC9] border border-[#3C2BB9] flex items-center justify-center font-black text-white text-[8px]">04</span>
                    <span><strong>Marked for Review</strong>: Flagged for later check.</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-black text-gray-900 mb-1">3. Navigating & Answering Questions</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Click on a question number in the Question Palette to jump to that question directly.</li>
                  <li>Select your answer by clicking on one of the radio buttons (A, B, C, D).</li>
                  <li>Click <strong>SAVE & NEXT</strong> to save your response and move to the next question.</li>
                  <li>Click <strong>CLEAR RESPONSE</strong> if you wish to deselect your chosen answer.</li>
                  <li>Click <strong>MARK FOR REVIEW & NEXT</strong> to save a draft review flag and move on.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-gray-900 mb-1">4. Exam Lockdown Policy</h4>
                <p>Entering the exam will lock the browser in <strong>fullscreen mode</strong>. Exiting fullscreen mode or switching tabs during the exam may disqualify your attempt. Ensure a stable internet connection before beginning.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Profile & Start Card */}
          <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 justify-between">
            
            {/* Candidate Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                {student?.avatar ? (
                  <img src={student.avatar} alt="Student" className="w-14 h-14 rounded-2xl object-cover border border-purple-200" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#552479] font-black text-xl shrink-0">
                    {getInitials(student?.name)}
                  </div>
                )}
                <div className="text-xs">
                  <span className="block text-[8px] font-extrabold text-gray-400 uppercase">STUDENT PROFILE</span>
                  <h4 className="font-black text-gray-950 text-sm mt-0.5 leading-none">{student?.name}</h4>
                  <p className="font-bold text-[#552479] mt-1">{student?.rollNo}</p>
                </div>
              </div>

              {/* Language choice selection */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-gray-500 font-bold uppercase text-[9px] tracking-wide">Choose default language:</label>
                <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#552479] text-gray-700">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Gujarati</option>
                </select>
              </div>
            </div>

            {/* Declaration & Start Button Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5 flex-1 flex flex-col justify-between mt-1">
              <div className="space-y-4 text-xs font-semibold text-gray-600 leading-relaxed">
                <h4 className="font-black text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wide">Declaration Agreement</h4>
                
                <label className="flex gap-3 items-start cursor-pointer hover:text-gray-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded text-[#552479] focus:ring-[#552479] border-gray-300 mt-0.5 shrink-0 accent-[#552479]"
                  />
                  <span>
                    I declare that I have read and understood all the instructions. The computer equipment allotted to me is in good working order. I agree that in case of any hardware failure, I will immediately report it to the invigilator. I will attempt this test honestly.
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={startExam}
                className="w-full bg-[#552479] hover:bg-[#431b60] text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-purple-100 uppercase tracking-widest transition-all mt-4"
              >
                I am ready to begin
              </button>
            </div>

          </div>

        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-3 text-center text-[10px] text-gray-400 font-extrabold uppercase shrink-0">
          Developed by Webflora Technologies for Team Excellent Career Institute
        </footer>

      </div>
    );
  }

  const legend = getLegendCounts();
  const globalIndex = getGlobalIndex();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col justify-between select-none">
      
      {/* Top Header Panel */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <img src="/Team-excellentlogo.svg" alt="Team Excellent Logo" className="h-10 object-contain" />
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-sm md:text-base leading-none">{test?.title}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[8px] font-black uppercase text-emerald-600 border border-emerald-100">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span> Live Exam
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">
              JEE Advanced Mock Exam Simulation
            </p>
          </div>
        </div>

        {/* Candidate Profile Info and Timer */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-right hidden sm:flex">
            <div>
              <span className="block text-[8px] text-slate-400 font-extrabold leading-none tracking-wide">CANDIDATE</span>
              <span className="text-xs font-black text-slate-900 block mt-0.5">{student?.name}</span>
            </div>
            {student?.avatar ? (
              <img
                src={student.avatar}
                alt="Avatar"
                className="w-9 h-9 rounded-2xl object-cover border border-purple-200 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#552479] font-black text-xs shrink-0 shadow-sm">
                {getInitials(student?.name)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-2 rounded-2xl shadow-sm">
            <Clock className="w-4 h-4 shrink-0 text-rose-500" />
            <div className="text-left">
              <span className="block text-[8px] font-extrabold uppercase leading-none text-rose-500 tracking-wider">TIME REMAINING</span>
              <span className="text-xs font-black tracking-wider leading-none block mt-0.5">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main CBT Screen */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative z-10">
        
        {/* Left Side: Question Display Column */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-slate-200">
          
          {/* Subjects Navigation Tab Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex gap-2 overflow-x-auto shrink-0 scrollbar-thin">
            {getSubjects().map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setActiveSubject(sub);
                  setCurrentIndex(0);
                }}
                className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all border shrink-0 ${
                  activeSubject === sub
                    ? 'bg-[#552479] text-white border-[#552479] shadow-md shadow-purple-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100/70 hover:text-slate-800'
                }`}
              >
                {sub === 'ALL' ? 'ALL SUBJECTS' : sub.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Active Question Panel */}
          {currentQuestion ? (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin">
              
              {/* Question Index and Subject Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="bg-[#552479] text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm shadow-purple-100">
                  Question {globalIndex + 1}
                </span>
                <span className="text-xs font-black uppercase text-[#552479] bg-purple-50 px-3.5 py-1 rounded-xl border border-purple-100/50 tracking-wider">
                  {currentQuestion.subject || 'General'}
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-5 text-sm font-semibold text-slate-800 leading-relaxed">
                <p className="whitespace-pre-line text-slate-900 leading-relaxed font-bold">{currentQuestion.questionText}</p>
                
                {/* Image Diagram Display if present */}
                {currentQuestion.imageUrl && (
                  <div className="border border-purple-100 rounded-3xl p-4 bg-purple-50/5 flex justify-center max-w-lg shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question Diagram"
                      className="max-h-64 object-contain rounded-2xl"
                    />
                  </div>
                )}
              </div>

              {/* Option Radio Buttons Container */}
              <div className="space-y-3.5 max-w-3xl pt-2">
                {['A', 'B', 'C', 'D'].map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQuestion._id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => selectOption(opt)}
                      className={`w-full text-left p-4.5 rounded-2xl border transition-all text-xs font-extrabold flex items-center gap-4 group relative overflow-hidden ${
                        isSelected
                          ? 'bg-purple-50/20 border-[#552479] text-[#552479] shadow-sm border-l-4'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50/70 hover:border-slate-300'
                      }`}
                    >
                      {/* Left highlight strip for selected option */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#552479]"></div>
                      )}
                      
                      <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-[#552479] border-[#552479] text-white shadow'
                          : 'bg-slate-50 border-slate-300 text-slate-500 group-hover:border-purple-400 group-hover:text-[#552479]'
                      }`}>
                        {opt}
                      </div>
                      <span className="flex-1 leading-relaxed text-slate-800">{currentQuestion.options[oIdx]}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-extrabold text-sm">
              No questions found.
            </div>
          )}

        </div>

        {/* Right Side: CBT Status / Question Palette Control Panel */}
        <aside className="w-full lg:w-80 bg-slate-50 flex flex-col min-h-0 overflow-y-auto lg:overflow-visible shrink-0 border-t lg:border-t-0 lg:border-b-0 border-slate-200">
          
          {/* Exam Info Metadata */}
          <div className="p-4 bg-white border-b border-slate-200 hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#552479]">
                <User className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase leading-none tracking-wide">CANDIDATE CARD</span>
                <h4 className="font-black text-slate-850 mt-0.5">{student?.name}</h4>
                <p className="text-[10px] text-purple-700 font-bold leading-none mt-1">{student?.rollNo}</p>
              </div>
            </div>
          </div>

          {/* Status Legends Summary Box */}
          <div className="p-4.5 bg-white border-b border-slate-200 grid grid-cols-2 gap-2.5 text-[9px] font-extrabold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-600 text-[8px]">
                {legend.notVisited}
              </span>
              <span>Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-white text-[8px]">
                {legend.notAnswered}
              </span>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-emerald-500 border border-emerald-600 flex items-center justify-center font-black text-white text-[8px]">
                {legend.answered}
              </span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-[#4C3BC9] border border-[#3C2BB9] flex items-center justify-center font-black text-white text-[8px]">
                {legend.marked}
              </span>
              <span>Marked Review</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 pt-0.5">
              <div className="relative">
                <span className="w-5 h-5 rounded-lg bg-[#4C3BC9] border border-[#3C2BB9] flex items-center justify-center font-black text-white text-[8px]">
                  {legend.answeredMarked}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
              </div>
              <span>Answered & Marked Review</span>
            </div>
          </div>

          {/* Palette Questions Grid */}
          <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-4">
              Question Palette (Subject Filtered)
            </h4>

            <div className="grid grid-cols-5 gap-2.5">
              {filteredQuestions.map((q, idx) => {
                const globalIdx = questions.findIndex(item => item._id === q._id);
                const isSelected = currentIndex === idx;
                const status = statusMap[q._id] || 'not_visited';
                const hasAnswer = selectedAnswers[q._id];

                let cellBg = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
                let indicatorDot = null;

                if (status === 'visited') {
                  cellBg = 'bg-orange-500 text-white border-orange-600';
                } else if (status === 'answered') {
                  cellBg = 'bg-emerald-500 text-white border-emerald-600';
                } else if (status === 'marked') {
                  cellBg = 'bg-[#4C3BC9] text-white border-[#3C2BB9]';
                } else if (status === 'answered_marked') {
                  cellBg = 'bg-[#4C3BC9] text-white border-[#3C2BB9]';
                  indicatorDot = 'bg-emerald-450';
                }

                return (
                  <button
                    key={q._id}
                    onClick={() => {
                      updateStatus(q._id, 'visited');
                      setCurrentIndex(idx);
                    }}
                    className={`h-9.5 rounded-xl border font-black text-[11px] transition-all relative flex items-center justify-center shadow-sm cursor-pointer ${cellBg} ${
                      isSelected ? 'ring-2 ring-purple-600 ring-offset-2 scale-105 shadow-md' : 'hover:opacity-90'
                    }`}
                  >
                    <span>{(globalIdx + 1).toString().padStart(2, '0')}</span>
                    {indicatorDot && (
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </aside>

      </div>

      {/* Bottom Button Bar */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shrink-0 shadow-md relative z-20">
        
        {/* Question actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSaveAndNext}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-650 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black tracking-wider shadow-sm transition-all"
          >
            SAVE & NEXT
          </button>
          
          <button
            onClick={handleMarkForReviewAndNext}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-655 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black tracking-wider shadow-sm transition-all"
          >
            MARK FOR REVIEW & NEXT
          </button>

          <button
            onClick={clearResponse}
            className="bg-white hover:bg-slate-55 text-slate-600 border border-slate-250 px-5 py-2.5 rounded-2xl text-[11px] font-black tracking-wider shadow-sm transition-all"
          >
            CLEAR RESPONSE
          </button>
        </div>

        {/* Navigation & Submit actions */}
        <div className="flex gap-2 items-center">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="bg-slate-50 border border-slate-250 hover:bg-slate-100 disabled:opacity-40 text-slate-700 px-4.5 py-2.5 rounded-2xl text-[11px] font-black transition-all"
          >
            &lt;&lt; BACK
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === filteredQuestions.length - 1}
            className="bg-slate-50 border border-slate-250 hover:bg-slate-100 disabled:opacity-40 text-slate-700 px-4.5 py-2.5 rounded-2xl text-[11px] font-black transition-all"
          >
            NEXT &gt;&gt;
          </button>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="bg-gradient-to-r from-rose-600 to-red-650 hover:from-rose-700 hover:to-red-700 text-white px-6 py-2.5 rounded-2xl text-[11px] font-black shadow-lg shadow-rose-100 transition-all uppercase tracking-widest ml-4"
          >
            SUBMIT EXAM
          </button>
        </div>

      </footer>

      {/* Submit Confirmation Dialog Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-center text-rose-600 mx-auto animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">Are you ready to submit?</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Confirming submission will finalize your answers and close the test. You will not be able to return to this exam session.
              </p>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-3.5 p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-650 border border-slate-100 text-left">
              <div>Total Questions: <strong className="text-slate-900 font-black">{questions.length}</strong></div>
              <div>Attempted: <strong className="text-emerald-600 font-black">{Object.keys(selectedAnswers).length}</strong></div>
              <div>Unattempted: <strong className="text-rose-650 font-black">{questions.length - Object.keys(selectedAnswers).length}</strong></div>
              <div>Remaining Time: <strong className="text-rose-550 font-black">{formatTime(timeRemaining)}</strong></div>
            </div>

            <div className="flex gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={submitting}
                className="flex-1 p-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl font-black text-slate-500 uppercase tracking-wider transition-all"
              >
                Resume Exam
              </button>
              <button
                type="button"
                onClick={submitTestAnswers}
                disabled={submitting}
                className="flex-1 p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 uppercase tracking-wider transition-all"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>Submit Exam</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
