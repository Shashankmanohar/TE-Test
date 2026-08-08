'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, User, Award, CheckCircle2, XCircle, Clock, Calendar, BookOpen, Layers,
  ChevronRight, Sparkles, Phone, CreditCard, CalendarCheck, ShieldCheck, X, FileQuestion
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'results'
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected result for detail modal
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultQuestions, setResultQuestions] = useState([]);
  const [loadingResultDetails, setLoadingResultDetails] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const studentDataStr = localStorage.getItem('studentData');
    const studentId = localStorage.getItem('studentId');

    if (!token || !studentDataStr || !studentId) {
      router.replace('/login');
      return;
    }

    const parsedStudent = JSON.parse(studentDataStr);
    setStudent(parsedStudent);

    const loadDashboardData = async () => {
      try {
        // Fetch tests
        const testsRes = await fetch(`http://localhost:5000/api/student/tests?studentId=${studentId}`);
        const testsData = await testsRes.json();
        if (testsData.success) {
          setTests(testsData.tests);
        }

        // Fetch results
        const resultsRes = await fetch(`http://localhost:5000/api/student/results?studentId=${studentId}`);
        const resultsData = await resultsRes.json();
        if (resultsData.success) {
          setResults(resultsData.results);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/login');
  };

  const handleViewResultDetails = async (result) => {
    setSelectedResult(result);
    setLoadingResultDetails(true);
    setResultQuestions([]);
    try {
      const res = await fetch(`http://localhost:5000/api/student/tests/${result.testId}/questions`);
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setResultQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResultDetails(false);
    }
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#552479] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500">Loading student profile & test records...</p>
        </div>
      </div>
    );
  }

  // Check if a test has been attempted
  const isTestAttempted = (testId) => {
    return results.some(r => r.testId === testId);
  };

  const getTestResult = (testId) => {
    return results.find(r => r.testId === testId);
  };

  if (selectedResult) {
    return (
      <div className="min-h-screen bg-[#F7F6FA] text-gray-800 font-sans pb-16">
        {/* Navbar */}
        <nav className="bg-[#552479] text-white py-3 px-6 md:px-12 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white px-3.5 py-1.5 rounded-2xl flex items-center justify-center shadow-md shadow-black/5">
              <img src="/Team-excellentlogo.svg" alt="Team Excellent Logo" className="h-10 md:h-12 object-contain" />
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
            <div>
              <h1 className="font-extrabold text-sm md:text-base tracking-wider uppercase leading-none">CBT Student Portal</h1>
              <p className="text-[9px] text-purple-250 font-bold mt-1 uppercase tracking-widest leading-none">Team Excellent Career Institute</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedResult(null)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 border border-white/10 transition-all shadow-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </nav>

        {/* Detailed Results Page Content */}
        <main className="max-w-4xl mx-auto px-6 md:px-12 mt-8 space-y-6">
          <div className="bg-white rounded-3xl border border-purple-100/40 p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Header Info */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="bg-purple-100/60 text-[#552479] text-[9px] font-black px-2.5 py-0.5 rounded uppercase leading-none">
                  Detailed Exam Analysis Report
                </span>
                <h3 className="font-black text-xl text-gray-900 mt-2">{selectedResult.testTitle}</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">Candidate: {student.name} • Roll: {student.rollNo}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="bg-gray-100 text-gray-650 hover:bg-gray-200 font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Score Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#552479] via-[#682FD1] to-[#7932aa] text-white shadow flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  INSTANT PERFORMANCE REPORT
                </span>
                <h4 className="text-3xl font-black">{selectedResult.marksObtained} / {selectedResult.totalMarks} Marks</h4>
                <p className="text-xs text-purple-100 font-semibold">Percentage: {selectedResult.percentage}% • Accuracy Rate: {selectedResult.accuracyPercentage}%</p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs font-bold">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                <span className="block text-lg font-black">{selectedResult.correctCount}</span> Correct
              </div>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                <span className="block text-lg font-black">{selectedResult.wrongCount}</span> Wrong
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-600">
                <span className="block text-lg font-black">{selectedResult.unattemptedCount}</span> Unattempted
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
                <span className="block text-lg font-black">{selectedResult.timeAnalysisMinutes}m</span> Duration
              </div>
            </div>

            {/* Subject Wise Score Breakup */}
            {selectedResult.subjectWiseAnalysis && Object.keys(selectedResult.subjectWiseAnalysis).length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Subject Wise Score Breakup
                </h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(selectedResult.subjectWiseAnalysis).map(([subject, info]) => (
                    <div key={subject} className="bg-purple-50/50 border border-purple-100/30 px-4.5 py-2.5 rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-gray-700">
                      <span>{subject}</span>
                      <span className="text-[#552479] font-black">{info.marksObtained} / {info.totalMarks} M</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question Review Section */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4 text-[#552479]" /> Question-by-Question Assessment Review
              </h4>

              {loadingResultDetails ? (
                <div className="py-6 text-center text-xs font-bold text-purple-600 animate-pulse">
                  Loading examination question keys...
                </div>
              ) : (
                <div className="space-y-5">
                  {resultQuestions.map((q, idx) => {
                    const studAns = selectedResult.answers?.find(a => a.questionId === q._id);
                    const selected = studAns ? studAns.selectedOption : '';
                    const isCorrect = studAns ? studAns.isCorrect : false;

                    let attemptStatusText = '';
                    let attemptStatusBg = '';

                    if (!selected) {
                      attemptStatusText = 'UNATTEMPTED';
                      attemptStatusBg = 'bg-gray-100 text-gray-600';
                    } else if (isCorrect) {
                      attemptStatusText = 'CORRECT';
                      attemptStatusBg = 'bg-emerald-100 text-emerald-800';
                    } else {
                      attemptStatusText = 'WRONG';
                      attemptStatusBg = 'bg-rose-100 text-rose-800';
                    }

                    return (
                      <div key={q._id} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#552479] text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg">
                              Q {idx + 1}
                            </span>
                            <span className="text-[10px] bg-purple-100 text-[#552479] px-2.5 py-0.5 rounded-lg font-bold">
                              {q.subject}
                            </span>
                          </div>
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${attemptStatusBg}`}>
                            {attemptStatusText}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-gray-900 leading-relaxed">{q.questionText}</p>

                        {q.imageUrl && (
                          <div className="border border-gray-200 rounded-2xl p-2 bg-white max-w-sm">
                            <img src={q.imageUrl} alt={`Question ${idx + 1} Diagram`} className="max-h-32 object-contain" />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          {['A', 'B', 'C', 'D'].map((opt, oIdx) => {
                            const isCorrectAns = q.correctAnswer === opt;
                            const isSelected = selected === opt;
                            
                            let optBg = 'bg-white text-gray-600 border-gray-200';
                            if (isCorrectAns) {
                              optBg = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black';
                            } else if (isSelected) {
                              optBg = 'bg-rose-50 text-rose-800 border-rose-300 font-black';
                            }

                            return (
                              <div key={opt} className={`p-3 rounded-xl border font-semibold ${optBg} leading-snug`}>
                                <span className="mr-1 text-purple-700 font-black">{opt}:</span> {q.options[oIdx]}
                                {isCorrectAns && ' (Correct Key)'}
                                {isSelected && !isCorrectAns && ' (Your Choice)'}
                              </div>
                            );
                          })}
                        </div>

                        {q.solutionText && (
                          <div className="text-[11px] bg-purple-50/30 p-3 rounded-xl text-gray-600 font-semibold border border-purple-100/50 leading-relaxed">
                            <span className="font-extrabold text-[#552479] block mb-0.5">Explanation:</span>
                            {q.solutionText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6FA] text-gray-800 font-sans pb-16">
      {/* Navbar */}
      <nav className="bg-[#552479] text-white py-3 px-6 md:px-12 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white px-3.5 py-1.5 rounded-2xl flex items-center justify-center shadow-md shadow-black/5">
            <img src="/Team-excellentlogo.svg" alt="Team Excellent Logo" className="h-10 md:h-12 object-contain" />
          </div>
          <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
          <div>
            <h1 className="font-extrabold text-sm md:text-base tracking-wider uppercase leading-none">CBT Student Portal</h1>
            <p className="text-[9px] text-purple-250 font-bold mt-1 uppercase tracking-widest leading-none">Team Excellent Career Institute</p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 border border-white/10 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 mt-8 space-y-8">
        
        {/* Student Profile Banner Card */}
        <div className="bg-white rounded-[26px] border border-purple-100/60 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          {student.avatar && !student.avatar.includes('unsplash.com') ? (
            <img
              src={student.avatar}
              alt="Student Avatar"
              className="w-24 h-24 rounded-3xl object-cover border-4 border-purple-100 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-purple-50 border-4 border-purple-100 flex items-center justify-center text-[#552479] font-black text-2xl shrink-0 shadow-sm">
              {getInitials(student.name)}
            </div>
          )}

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="inline-flex gap-2">
                <span className="bg-[#552479]/10 text-[#552479] text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wide">
                  {student.course}
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wide">
                  Batch: {student.batch}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mt-1">{student.name}</h2>
              <p className="text-xs text-gray-500 font-semibold">Roll Number: {student.rollNo} • Class: {student.class}</p>
            </div>

            {/* Quick Metadata Logs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
              <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/20 flex items-center gap-2.5">
                <CalendarCheck className="w-4.5 h-4.5 text-[#552479]" />
                <div>
                  <span className="block text-[9px] text-gray-400 font-extrabold uppercase leading-none">ATTENDANCE</span>
                  <span className="text-xs font-black text-gray-900">{student.attendancePercentage || 94.5}%</span>
                </div>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/20 flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-[#552479]" />
                <div>
                  <span className="block text-[9px] text-gray-400 font-extrabold uppercase leading-none">MOBILE</span>
                  <span className="text-xs font-black text-gray-900 truncate max-w-[100px] block">{student.mobile}</span>
                </div>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/20 flex items-center gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-[#552479]" />
                <div>
                  <span className="block text-[9px] text-gray-400 font-extrabold uppercase leading-none">ROLE</span>
                  <span className="text-xs font-black text-gray-900">{student.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex gap-3 bg-white p-1.5 rounded-2xl border border-purple-100/30 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tests'
                ? 'bg-[#552479] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-purple-50/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Active CBT Exams</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'results'
                ? 'bg-[#552479] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-purple-50/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>CBT Performance Log ({results.length})</span>
          </button>
        </div>

        {/* ========================================================== */}
        {/* TAB 1: ACTIVE CBT EXAMS */}
        {activeTab === 'tests' && (
          <div className="bg-white rounded-3xl border border-purple-100/40 p-6 md:p-8 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-black text-gray-900">Assigned Online Tests</h3>
              <p className="text-xs text-gray-500">CBT simulated examinations mapped specifically to your coaching batch.</p>
            </div>

            {tests.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-sm font-bold text-gray-600">No CBT tests assigned to your batch.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => {
                  const attempted = isTestAttempted(test._id);
                  const attemptResult = getTestResult(test._id);
                  return (
                    <div
                      key={test._id}
                      className="border border-purple-100/60 rounded-2xl p-5 bg-[#FAF9FC] flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-[#552479] bg-purple-100/60 px-2 py-0.5 rounded">
                            {test.subject}
                          </span>
                          {attempted && (
                            <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-gray-900 mt-3.5 pr-2">{test.title}</h4>
                        <div className="mt-4 space-y-2 text-xs font-semibold text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>{test.durationMinutes} Minutes Exam</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            <span>{test.totalMarks} Maximum Marks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span>Exam Date: {test.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-purple-100/60 pt-3">
                        {attempted ? (
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-600">
                              Score: <strong className="text-[#552479] font-black">{attemptResult.marksObtained}</strong>/{attemptResult.totalMarks}
                            </span>
                            <button
                              onClick={() => handleViewResultDetails(attemptResult)}
                              className="text-xs font-extrabold text-[#552479] hover:underline"
                            >
                              View Report →
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => router.push(`/test/${test._id}`)}
                            className="w-full bg-[#552479] text-white hover:bg-[#431b60] py-2 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>Attempt Examination</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: CBT RESULTS LOG */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-3xl border border-purple-100/40 p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-gray-900">Your Exam Scorecards</h3>
              <p className="text-xs text-gray-500">Historical performance breakdown for completed exams.</p>
            </div>

            {results.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Award className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-sm font-bold text-gray-600">You have not completed any examinations yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-100/40">
                {results.map((res) => (
                  <div
                    key={res._id}
                    onClick={() => handleViewResultDetails(res)}
                    className="py-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-purple-50/20 px-3 -mx-3 rounded-2xl transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-[#552479] text-[9px] font-black px-2 py-0.5 rounded uppercase">
                          {res.subject || 'Mock Exam'}
                        </span>
                        <span className="text-[10px] text-gray-450 font-bold">{res.submittedAt ? new Date(res.submittedAt).toLocaleDateString() : ''}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-gray-900">{res.testTitle}</h4>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end text-xs">
                      <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <span className="block text-[9px] font-extrabold text-emerald-500 leading-none">MARKS</span>
                        <span className="font-black text-sm text-emerald-700">{res.marksObtained}/{res.totalMarks}</span>
                      </div>
                      
                      <div className="px-3 py-1 bg-indigo-50 border border-indigo-150 rounded-xl">
                        <span className="block text-[9px] font-extrabold text-indigo-500 leading-none">ACCURACY</span>
                        <span className="font-black text-sm text-indigo-700">{res.accuracyPercentage}%</span>
                      </div>

                      <div className="px-3 py-1 bg-white border border-purple-100 rounded-xl">
                        <span className="block text-[9px] font-extrabold text-gray-400 leading-none">BATCH RANK</span>
                        <span className="font-black text-sm text-[#552479]">Rank #{res.batchRank || 1}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 inline-block ml-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
