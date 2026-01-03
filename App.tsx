
import React, { useState, useEffect } from 'react';
import { User, UserRole, Mark, ReportCardData, ClassRoom, Student, SchoolRegistration } from './types';
import { 
  authenticate, 
  getStudentsByClass, 
  getMarks, 
  saveMarksBatch, 
  getAllStudents, 
  getStudentMarks, 
  getClasses,
  getUsers,
  saveUser,
  saveClass,
  updateClass,
  renameClass,
  getTeacherClasses,
  saveStudent,
  updateStudent,
  getSchoolLogo,
  saveSchoolLogo,
  getSchoolConfig,
  saveSchoolConfig,
  updateUser,
  deleteStudent,
  deleteClass,
  deleteUser,
  exportDatabase,
  importDatabase,
  getRegistration,
  saveRegistration
} from './services/storageService';
import { generateStudentSummary } from './services/geminiService';
import { ACADEMIC_YEARS, TERMS, SUBJECTS } from './constants';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { GradeBadge } from './components/GradeBadge';
import { ReportCard } from './components/ReportCard';

// Declare html2pdf for TypeScript
declare var html2pdf: any;

// --- REGISTRATION FLOW COMPONENTS ---

const WelcomeLanding = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
    
    <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-indigo-600 font-black text-5xl shadow-2xl mb-8 animate-bounce relative z-10">
      NC
    </div>
    
    <div className="relative z-10 max-w-2xl">
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
        WELCOME TO <br/> 
        <span className="text-yellow-400">NASURY REPORT CARDS</span> <br/>
        GENERATOR
      </h1>
      <p className="text-indigo-100 text-lg md:text-xl font-medium mb-12 opacity-90">
        Professional grading and reporting system designed specifically for nursery schools.
      </p>
      
      <Button 
        onClick={onStart} 
        className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-black text-2xl px-16 py-6 rounded-[2rem] shadow-2xl transform transition-all hover:scale-105 active:scale-95"
      >
        GET STARTED
      </Button>
    </div>
    
    <div className="mt-16 text-indigo-200 font-bold tracking-widest text-xs uppercase">
      Trusted by 50+ Schools in Rwanda
    </div>
  </div>
);

const RegistrationWizard = ({ onComplete }: { onComplete: (reg: SchoolRegistration) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SchoolRegistration>>({
    status: 'pending',
    plan: 'term',
    schoolName: '',
    district: '',
    sector: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [passConfirm, setPassConfirm] = useState('');
  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    // Simple validation per step
    if (step === 1) {
      if (!formData.schoolName || !formData.district || !formData.sector || !formData.phone) {
        setError('Please fill in all school details');
        return;
      }
    }
    if (step === 2) {
      if (!formData.adminName || !formData.adminEmail || !formData.adminPassword) {
        setError('Please fill in all administrator details');
        return;
      }
      if (formData.adminPassword !== passConfirm) {
        setError('Passwords do not match');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, paymentScreenshot: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = () => {
    if (!formData.paymentScreenshot) {
      setError('Please upload your payment screenshot to proceed');
      return;
    }
    onComplete(formData as SchoolRegistration);
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-[3rem] shadow-2xl p-8 md:p-12 border-8 border-indigo-100 relative overflow-hidden transition-all duration-500">
        {/* Progress Header */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
           <div 
            className="h-full bg-indigo-600 transition-all duration-500" 
            style={{ width: `${(step / 4) * 100}%` }}
           />
        </div>

        <div className="flex justify-between items-center mb-10">
           <div className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">Step {step} of 4</div>
           {step > 1 && (
             <button onClick={prevStep} className="text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors">← Back</button>
           )}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-indigo-900">Register your school</h2>
              <p className="text-slate-500 font-medium mt-1">Tell us about your institution</p>
            </div>
            
            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Official School Name</label>
                <input 
                  placeholder="e.g. Bright Future Nursery School" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700 transition-all focus:bg-white"
                  value={formData.schoolName}
                  onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">District</label>
                  <input 
                    placeholder="District" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700 transition-all focus:bg-white"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Sector</label>
                  <input 
                    placeholder="Sector" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700 transition-all focus:bg-white"
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Phone Number</label>
                <input 
                  placeholder="e.g. 0780000000" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700 transition-all focus:bg-white"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Full Address</label>
                <input 
                  placeholder="123 Education Street, Kigali City" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700 transition-all focus:bg-white"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl border border-red-100">{error}</div>}
            <Button onClick={nextStep} className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-indigo-100 mt-4">Next Step</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-indigo-900">Administrator Account</h2>
              <p className="text-slate-500 font-medium mt-1">Create your school's master login</p>
            </div>
            
            <div className="space-y-4">
              <input 
                placeholder="Administrator Full Name" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700"
                value={formData.adminName}
                onChange={e => setFormData({ ...formData, adminName: e.target.value })}
              />
              <input 
                type="email"
                placeholder="Email Address" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700"
                value={formData.adminEmail}
                onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
              />
              <input 
                type="password"
                placeholder="Password" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700"
                value={formData.adminPassword}
                onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
              />
              <input 
                type="password"
                placeholder="Confirm Password" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700"
                value={passConfirm}
                onChange={e => setPassConfirm(e.target.value)}
              />
            </div>
            {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl border border-red-100">{error}</div>}
            <Button onClick={nextStep} className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-indigo-100 mt-4">Create Account</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-indigo-900">Select Plan</h2>
              <p className="text-slate-500 font-medium mt-1">Choose a subscription that fits your needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setFormData({ ...formData, plan: 'term' })}
                className={`group p-8 rounded-[2.5rem] border-4 transition-all text-left flex flex-col justify-between h-56 relative overflow-hidden ${formData.plan === 'term' ? 'border-indigo-600 bg-indigo-50 shadow-2xl scale-105' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
              >
                <div className={`text-[10px] font-black uppercase tracking-widest mb-4 ${formData.plan === 'term' ? 'text-indigo-600' : 'text-slate-400'}`}>Term Plan</div>
                <div className="text-4xl font-black text-slate-800">30,000 <span className="text-lg">FRW</span></div>
                <div className="text-sm font-bold text-slate-500">Per Academic Term</div>
                <div className={`absolute -right-4 -bottom-4 text-6xl opacity-10 ${formData.plan === 'term' ? 'text-indigo-600' : 'text-slate-200'}`}>🗓️</div>
              </button>
              
              <button 
                onClick={() => setFormData({ ...formData, plan: 'year' })}
                className={`group p-8 rounded-[2.5rem] border-4 transition-all text-left flex flex-col justify-between h-56 relative overflow-hidden ${formData.plan === 'year' ? 'border-indigo-600 bg-indigo-50 shadow-2xl scale-105' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className={`text-[10px] font-black uppercase tracking-widest ${formData.plan === 'year' ? 'text-indigo-600' : 'text-slate-400'}`}>Yearly Plan</div>
                  <span className="bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase shadow-lg shadow-green-100">Save 25%</span>
                </div>
                <div className="text-4xl font-black text-slate-800">90,000 <span className="text-lg">FRW</span></div>
                <div className="text-sm font-bold text-slate-500">Full Academic Year</div>
                <div className={`absolute -right-4 -bottom-4 text-6xl opacity-10 ${formData.plan === 'year' ? 'text-indigo-600' : 'text-slate-200'}`}>✨</div>
              </button>
            </div>
            
            <Button onClick={nextStep} className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-indigo-100 mt-4">Continue to Payment</Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-black text-indigo-900">Complete Payment</h2>
              <p className="text-slate-500 font-medium mt-1">Activate your school account</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-20 text-6xl rotate-12">💳</div>
               
               <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg">📱</div>
                <div>
                  <div className="text-[10px] font-black uppercase text-indigo-200 tracking-[0.2em] mb-1">MOMO NUMBER</div>
                  <div className="text-2xl font-black tracking-tighter">0780509750</div>
                  <div className="text-[10px] font-bold text-indigo-300">Name: NASURY ADMIN</div>
                </div>
              </div>
              
              <div className="h-px bg-white/10"></div>
              
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20">🏦</div>
                <div>
                  <div className="text-[10px] font-black uppercase text-indigo-200 tracking-[0.2em] mb-1">BPR BANK</div>
                  <div className="text-2xl font-black tracking-tighter">419491172410131</div>
                  <div className="text-[10px] font-bold text-indigo-300">Acc: Nasury Gen Systems</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Upload Payment Screenshot</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full p-10 rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center transition-all ${formData.paymentScreenshot ? 'border-green-400 bg-green-50' : 'border-indigo-100 bg-indigo-50/30 group-hover:border-indigo-300'}`}>
                  {formData.paymentScreenshot ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">✅</div>
                      <div className="text-green-600 font-bold">Screenshot Uploaded</div>
                      <button className="text-xs text-green-400 underline mt-1">Change photo</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <div className="text-indigo-400 font-bold">Click or drag to upload</div>
                      <div className="text-[10px] text-indigo-300 uppercase mt-1">PNG, JPG up to 5MB</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl border border-red-100">{error}</div>}
            
            <Button onClick={handleFinish} className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-indigo-100">Submit for Approval</Button>
            <p className="text-center text-[10px] text-slate-400 font-medium">By clicking submit, you agree to our Terms of Service</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PendingApproval = ({ registration }: { registration: SchoolRegistration }) => (
  <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
    <div className="bg-white max-lg w-full rounded-[3rem] shadow-2xl p-12 text-center border-8 border-indigo-100">
      <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-pulse">
        ⏳
      </div>
      <h2 className="text-3xl font-black text-indigo-900 mb-4">Registration Pending</h2>
      <p className="text-slate-600 font-medium text-lg leading-relaxed mb-8">
        Thank you, <span className="text-indigo-600 font-bold">{registration.adminName}</span>! Your application for <span className="text-indigo-600 font-bold">{registration.schoolName}</span> has been received.
      </p>
      <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 text-left mb-8">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status Checklist</div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm font-bold text-green-600">
             <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</div> Form Received
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-green-600">
             <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</div> Payment Uploaded
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
             <div className="w-5 h-5 bg-slate-200 rounded-full"></div> Admin Verification
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-400 font-medium italic">
        Verification usually takes 2-4 hours. You will be able to log in once approved.
      </p>
      <div className="mt-8">
         <Button variant="secondary" onClick={() => window.location.reload()} className="rounded-xl w-full">Check Status</Button>
      </div>
    </div>
  </div>
);

// --- TEACHER DASHBOARD COMPONENT ---
const TeacherDashboard = ({ user }: { user: User }) => {
  const [year, setYear] = useState(ACADEMIC_YEARS[0]);
  const [term, setTerm] = useState(TERMS[0]);
  const [myClasses, setMyClasses] = useState<ClassRoom[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id);
  
  const [pendingMarks, setPendingMarks] = useState<Record<string, number>>({});
  const [existingMarks, setExistingMarks] = useState<Mark[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const classes = getTeacherClasses(user.username);
    // Sort classes alphabetically
    classes.sort((a,b) => a.name.localeCompare(b.name));
    setMyClasses(classes);
    if (classes.length > 0) {
      setSelectedClass(classes[0].name);
    }
  }, [user.username]);

  useEffect(() => {
    if (selectedClass) {
      const stored = getMarks();
      setExistingMarks(stored);
      setPendingMarks({});
      setSaveMessage('');
    }
  }, [year, term, selectedClass, selectedSubject]);

  const students = selectedClass ? getStudentsByClass(selectedClass) : [];
  // Sort students alphabetically
  students.sort((a,b) => a.name.localeCompare(b.name));

  const handleMarkChange = (studentId: string, scoreStr: string) => {
    const score = scoreStr === '' ? NaN : parseInt(scoreStr);
    if (!isNaN(score) && (score < 0 || score > 100)) return;

    setPendingMarks(prev => ({
      ...prev,
      [studentId]: isNaN(score) ? -1 : score 
    }));
    setSaveMessage('Unsaved changes...');
  };

  const getDisplayScore = (studentId: string): string => {
    if (pendingMarks.hasOwnProperty(studentId)) {
      const val = pendingMarks[studentId];
      return val === -1 ? '' : val.toString();
    }
    const m = existingMarks.find(
      mark => mark.studentId === studentId && 
              mark.subjectId === selectedSubject && 
              mark.year === year && 
              mark.term === term
    );
    return m ? m.score.toString() : '';
  };

  const handleSave = () => {
    setIsSaving(true);
    const marksToSave: Mark[] = [];
    Object.keys(pendingMarks).forEach(studentId => {
      const score = pendingMarks[studentId];
      // Include all changes, even -1 (which signifies deletion in storageService)
      marksToSave.push({
         studentId,
         subjectId: selectedSubject,
         year,
         term,
         score
       });
    });

    if (marksToSave.length > 0) {
      saveMarksBatch(marksToSave);
      setExistingMarks(getMarks());
      setPendingMarks({});
      setSaveMessage('All marks saved successfully! ✅');
    } else {
      setSaveMessage('No changes to save.');
    }
    
    setTimeout(() => setIsSaving(false), 500);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDownloadExcel = () => {
    // Get all marks for the current context
    const allMarks = getMarks().filter(m => m.year === year && m.term === term);
    
    // Prepare Headers
    const headers = ['Student Name', 'Class', ...SUBJECTS.map(s => s.name), 'TOTAL', 'AVERAGE'];
    
    // Prepare Rows
    const rows = students.map(student => {
      const studentMarks = allMarks.filter(m => m.studentId === student.id);
      let total = 0;
      let count = 0;

      const subjectValues = SUBJECTS.map(sub => {
        const mark = studentMarks.find(m => m.subjectId === sub.id);
        if (mark) {
          total += mark.score;
          count++;
          return mark.score;
        }
        return '';
      });

      const average = count > 0 ? (total / count).toFixed(1) : '';

      // Escape commas in names if necessary
      return [
        student.name, 
        student.className, 
        ...subjectValues, 
        total, 
        average
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedClass}_${term}_${year}_Summative.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (myClasses.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-indigo-100">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-slate-700">No Classes Assigned</h3>
        <p className="text-slate-500 mt-2">You have not been assigned to any classes yet.<br/>Please contact the Administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Academic Year</label>
          <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700">
            {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Term</label>
          <select value={term} onChange={e => setTerm(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700">
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">My Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700">
            {myClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700">
            {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden">
        <div className="p-4 border-b border-indigo-50 bg-indigo-50/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-indigo-900">Student List - {selectedClass}</h2>
            <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
               Subject: <span className="font-bold text-indigo-600">{SUBJECTS.find(s => s.id === selectedSubject)?.name}</span>
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDownloadExcel}>
            📊 Download Excel Report
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
                <th className="p-4 w-16">#</th>
                <th className="p-4">Student Name</th>
                <th className="p-4 w-48 text-center">Score (0-100)</th>
                <th className="p-4 w-48 text-left">Grade Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => {
                const scoreVal = getDisplayScore(student.id);
                const numScore = scoreVal ? parseInt(scoreVal) : NaN;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-4 font-medium text-slate-700">{student.name}</td>
                    <td className="p-4 flex justify-center items-center gap-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={scoreVal}
                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                        className="w-24 text-center p-2 rounded border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-bold text-slate-700"
                        placeholder="-"
                      />
                      {scoreVal !== '' && (
                        <button 
                          onClick={() => handleMarkChange(student.id, '')}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete Mark"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {!isNaN(numScore) && <GradeBadge score={numScore} showLabel size="sm" />}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">No students found in this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-indigo-50 flex items-center justify-between sticky bottom-0">
          <div className="text-indigo-600 font-medium animate-pulse">{saveMessage}</div>
          <Button onClick={handleSave} isLoading={isSaving} disabled={Object.keys(pendingMarks).length === 0}>
             💾 Save Marks
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [registration, setRegistration] = useState<SchoolRegistration | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [schoolInfo, setSchoolInfo] = useState<any>({
    headmasterName: '',
    district: '',
    sector: '',
    cell: '',
    phone: '',
    motto: ''
  });
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const reg = getRegistration();
    setRegistration(reg);
    setLogoUrl(getSchoolLogo());
    setSchoolInfo(getSchoolConfig());
  }, []);

  const handleStartRegistration = () => setShowWizard(true);

  const handleCompleteRegistration = (reg: SchoolRegistration) => {
    saveRegistration(reg);
    setRegistration(reg);
    setShowWizard(false);
    // In a real app, this would be stored on a server.
    // We'll let them "wait" for approval.
  };

  const handleLogin = (u: string, p: string) => {
    const authUser = authenticate(u, p);
    if (authUser) { setUser(authUser); return true; } 
    return false;
  };

  const handleLogout = () => { setUser(null); };

  const handleProfileUpdate = async (data: any) => {
    if (!user) return 'No user';
    const result = updateUser(user.username, data);
    if (result.success && result.user) { setUser(result.user); return undefined; }
    return result.error;
  };

  const handleSchoolConfigUpdate = (data: any) => {
    const newInfo = { ...schoolInfo, ...data };
    setSchoolInfo(newInfo);
    saveSchoolConfig(newInfo);
  };

  // Logic flow
  if (!registration && !showWizard) {
    return <WelcomeLanding onStart={handleStartRegistration} />;
  }

  if (showWizard) {
    return <RegistrationWizard onComplete={handleCompleteRegistration} />;
  }

  if (registration && registration.status === 'pending') {
    // For DEMO purposes: If they have registration, let's auto-approve for now or stay pending
    // To see the app, user should change status manually in localStorage if needed
    // But per instructions: wait for approval.
    // Let's add a hidden way to "Approve" for testing
    return (
      <div className="relative">
        <PendingApproval registration={registration} />
        <button 
          onClick={() => {
            const newReg = { ...registration, status: 'approved' as const };
            saveRegistration(newReg);
            setRegistration(newReg);
          }}
          className="fixed bottom-4 right-4 text-[8px] text-slate-300 opacity-20"
        >
          (Dev: Bypass Approval)
        </button>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} logoUrl={logoUrl} />;
  }

  return (
    <>
      <Layout 
        user={user} 
        onLogout={handleLogout} 
        title={user.role === UserRole.ADMIN ? 'Administration' : 'Teacher Dashboard'}
        onOpenProfile={() => setShowProfile(true)}
        logoUrl={logoUrl}
      >
        {user.role === UserRole.ADMIN ? (
          <AdminDashboard 
             logoUrl={logoUrl} 
             onLogoUpdate={setLogoUrl}
             schoolInfo={schoolInfo}
             onSchoolConfigUpdate={handleSchoolConfigUpdate}
          />
        ) : (
          <TeacherDashboard user={user} />
        )}
      </Layout>
      
      {showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onUpdate={handleProfileUpdate} 
        />
      )}
    </>
  );
};

// MODALS AND DASHBOARD COMPONENTS ARE DEFINED BELOW OR IMPORTED
// (Including them within App.tsx to ensure full file content as requested)

const AdminDashboard = ({ 
  logoUrl, 
  onLogoUpdate,
  schoolInfo,
  onSchoolConfigUpdate 
}: { 
  logoUrl: string, 
  onLogoUpdate: (url: string) => void,
  schoolInfo: any,
  onSchoolConfigUpdate: (data: any) => void
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'students' | 'management'>('reports');
  const [viewMode, setViewMode] = useState<'list' | 'report' | 'bulk_report'>('list');
  const [year, setYear] = useState(ACADEMIC_YEARS[0]);
  const [term, setTerm] = useState(TERMS[0]);
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [bulkReports, setBulkReports] = useState<ReportCardData[]>([]);
  const [verdict, setVerdict] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatingAI, setGeneratingAI] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Management State
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassStreams, setNewClassStreams] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState(''); 
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: UserRole.TEACHER });
  const [newStudent, setNewStudent] = useState({ name: '', classId: '' });
  
  const loadManagementData = () => {
    const cls = getClasses();
    cls.sort((a,b) => a.name.localeCompare(b.name));
    setClasses(cls);
    setUsers(getUsers());
    const stds = getAllStudents();
    stds.sort((a,b) => a.name.localeCompare(b.name));
    setAllStudents(stds);
  };

  useEffect(() => { loadManagementData(); }, [activeTab, viewMode]);
  useEffect(() => { setSelectedIds(new Set()); }, [filterClass]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    const filtered = allStudents.filter(s => !filterClass || s.className === classes.find(c => c.id === filterClass)?.name);
    if (selectedIds.size === filtered.length && filtered.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(s => s.id)));
  };

  const generateReportData = (studentId: string): ReportCardData | null => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return null;
    let rawMarks = getStudentMarks(studentId, year, term);
    if (term === 'Term 3') {
       const t1 = getStudentMarks(studentId, year, 'Term 1');
       const t2 = getStudentMarks(studentId, year, 'Term 2');
       rawMarks = [...t1, ...t2, ...rawMarks];
    }
    const enrichedMarks = rawMarks.map(m => ({ ...m, subjectName: SUBJECTS.find(s => s.id === m.subjectId)?.name || 'Unknown' }));
    let annualStats = undefined;
    if (term === 'Term 3') {
       const allYearMarks = getMarks().filter(m => m.studentId === studentId && m.year === year && m.subjectId !== 'conduct');
       const totalScore = allYearMarks.reduce((sum, m) => sum + m.score, 0);
       const averageScore = allYearMarks.length > 0 ? (totalScore / allYearMarks.length).toFixed(1) : '0';
       annualStats = { totalScore, averageScore, decision: verdict };
    }
    return { student, marks: enrichedMarks, year, term, annualStats };
  };

  const handleGenerateReport = (studentId: string) => {
    const data = generateReportData(studentId);
    if (data) {
      setReportData(data);
      setVerdict(data.annualStats?.decision || '');
      setViewMode('report');
    }
  };

  const handleGenerateBulk = () => {
    const reports = Array.from(selectedIds).map(id => generateReportData(id)).filter(Boolean) as ReportCardData[];
    setBulkReports(reports);
    setViewMode('bulk_report');
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;
    setIsDownloading(true);
    const element = document.getElementById('report-card-container');
    const opt = { margin: 0, filename: `${reportData.student.name}_Report.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
    html2pdf().set(opt).from(element).save().then(() => setIsDownloading(false));
  };

  const handleCreateClass = () => {
    if (!newClassName) return;
    const streams = newClassStreams.split(',').map(s => s.trim()).filter(s => s);
    if (streams.length > 0) {
      streams.forEach(stream => {
        const fullName = `${newClassName} ${stream}`;
        saveClass({ id: fullName.toLowerCase().replace(/\s+/g, '-'), name: fullName, teacherUsername: newClassTeacher || undefined });
      });
    } else {
      saveClass({ id: newClassName.toLowerCase().replace(/\s+/g, '-'), name: newClassName, teacherUsername: newClassTeacher || undefined });
    }
    setNewClassName(''); setNewClassStreams(''); loadManagementData();
  };

  const handleCreateStudent = () => {
    if (!newStudent.name || !newStudent.classId) return;
    const cls = classes.find(c => c.id === newStudent.classId);
    if (cls) {
      saveStudent({ id: `s-${Date.now()}`, name: newStudent.name, className: cls.name });
      setNewStudent({ name: '', classId: '' }); loadManagementData();
    }
  };

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password) return;
    saveUser(newUser);
    setNewUser({ username: '', name: '', password: '', role: UserRole.TEACHER });
    loadManagementData();
  };

  if (activeTab === 'reports' && viewMode === 'report' && reportData) {
    return (
      <div className="flex flex-col gap-8">
        <div className="print:hidden flex flex-wrap items-center justify-between bg-white p-6 rounded-[2rem] shadow-xl border border-indigo-50 gap-4">
          <Button variant="secondary" onClick={() => setViewMode('list')} className="rounded-xl px-6">← Directory</Button>
          <div className="flex gap-3">
             <Button variant="secondary" onClick={async () => {
                setGeneratingAI(true);
                const summary = await generateStudentSummary(reportData.student, reportData.marks, reportData.term);
                setReportData({ ...reportData, summary });
                setGeneratingAI(false);
             }} isLoading={generatingAI} disabled={!!reportData.summary} className="rounded-xl">✨ AI Summary</Button>
             <Button variant="secondary" onClick={handleDownloadPDF} isLoading={isDownloading} className="rounded-xl">⬇️ PDF</Button>
             <Button onClick={() => window.print()} className="rounded-xl px-8 shadow-lg shadow-indigo-100">🖨️ Print</Button>
          </div>
        </div>
        <div className="flex justify-center bg-slate-100 p-8 rounded-[3rem] overflow-x-auto">
          <div id="report-card-container" className="bg-white shadow-2xl p-0">
            <ReportCard data={reportData} logoUrl={logoUrl} headmasterName={schoolInfo.headmasterName} />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'reports' && viewMode === 'bulk_report') {
    return (
      <div className="flex flex-col gap-8">
        <div className="print:hidden flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-xl border border-indigo-50 sticky top-4 z-50">
          <Button variant="secondary" onClick={() => setViewMode('list')} className="rounded-xl">← Cancel Bulk</Button>
          <Button onClick={() => window.print()} className="rounded-xl px-10 shadow-xl shadow-indigo-100">🖨️ Print All</Button>
        </div>
        <div className="flex flex-col items-center gap-12 print:block bg-slate-100 p-12 print:p-0 print:bg-white rounded-[4rem]">
          {bulkReports.map(data => (
             <div key={data.student.id} className="bg-white shadow-2xl mb-12 print:mb-0 print:shadow-none" style={{ breakAfter: 'page' }}>
               <ReportCard data={data} logoUrl={logoUrl} headmasterName={schoolInfo.headmasterName} />
             </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex space-x-2 border-b-2 border-indigo-100 print:hidden overflow-x-auto">
        {['reports', 'students', 'management'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t as any)} 
            className={`px-8 py-4 font-bold text-sm uppercase tracking-widest rounded-t-[1.5rem] transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'reports' && (
        <>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-indigo-50 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Year</label>
              <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none focus:border-indigo-300">
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Term</label>
              <select value={term} onChange={e => setTerm(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none focus:border-indigo-300">
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Class filter</label>
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none focus:border-indigo-300">
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/30 border border-indigo-50 overflow-hidden">
            <div className="p-8 border-b border-indigo-50 bg-indigo-50/20 flex justify-between items-center">
              <h2 className="font-extrabold text-indigo-900 text-2xl">Students Directory</h2>
              <div className="flex gap-3">
                <Button size="sm" variant="secondary" onClick={selectAll} className="rounded-xl">Select All</Button>
                {selectedIds.size > 0 && (
                  <Button size="sm" onClick={handleGenerateBulk} className="rounded-xl shadow-lg shadow-indigo-100 px-6">Generate Reports ({selectedIds.size})</Button>
                )}
              </div>
            </div>
            <div className="divide-y divide-indigo-50 max-h-[500px] overflow-y-auto">
              {allStudents.filter(s => !filterClass || s.className === classes.find(c => c.id === filterClass)?.name).sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                <div key={s.id} className="p-6 flex items-center justify-between hover:bg-indigo-50/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <input type="checkbox" className="w-6 h-6 rounded-lg border-2 border-indigo-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer" checked={selectedIds.has(s.id)} onChange={() => toggleSelection(s.id)} />
                    <div>
                      <div className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-800 transition-colors">{s.name}</div>
                      <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{s.className}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleGenerateReport(s.id)} className="rounded-xl px-6">View Report</Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'students' && (
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-4 border-indigo-50 space-y-8">
             <h3 className="text-2xl font-black text-indigo-900 flex items-center gap-3">Enroll New Student</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                <div>
                   <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 ml-1">Student Full Name</label>
                   <input placeholder="Enter names..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-400 outline-none transition-all font-bold text-slate-700" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 ml-1">Classroom</label>
                   <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold text-slate-700" value={newStudent.classId} onChange={e => setNewStudent({...newStudent, classId: e.target.value})}>
                    <option value="">Select Room...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <Button onClick={handleCreateStudent} className="py-4 text-lg rounded-2xl shadow-xl shadow-indigo-100">Enroll Student</Button>
             </div>
          </div>
          <div className="bg-white rounded-[2rem] shadow-xl border border-indigo-50 overflow-hidden">
             <div className="p-8 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/10">
                <h4 className="font-black text-indigo-900 text-xl tracking-tight">Active Students</h4>
                <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">{allStudents.length} Registered</div>
             </div>
             <div className="divide-y divide-indigo-50 max-h-[400px] overflow-y-auto">
                {allStudents.map(student => (
                  <div key={student.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div>
                        <div className="font-bold text-slate-800 text-lg">{student.name}</div>
                        <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{student.className}</div>
                     </div>
                     <Button size="sm" variant="danger" onClick={() => { if(confirm('Delete student?')) { deleteStudent(student.id); loadManagementData(); } }} className="rounded-xl px-4 opacity-40 hover:opacity-100">Delete</Button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-indigo-50 space-y-8 col-span-2">
             <h3 className="text-2xl font-black text-indigo-900 flex items-center gap-3">School Settings</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                 <label className="block text-sm font-black text-indigo-900 uppercase tracking-wider">Official Identity</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <input placeholder="District" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700" value={schoolInfo.district} onChange={e => onSchoolConfigUpdate({ district: e.target.value })} />
                   <input placeholder="Sector" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700" value={schoolInfo.sector} onChange={e => onSchoolConfigUpdate({ sector: e.target.value })} />
                   <input placeholder="Cell" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700" value={schoolInfo.cell} onChange={e => onSchoolConfigUpdate({ cell: e.target.value })} />
                   <input placeholder="Telephone Number" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700" value={schoolInfo.phone} onChange={e => onSchoolConfigUpdate({ phone: e.target.value })} />
                   <input placeholder="Headmaster Name" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700" value={schoolInfo.headmasterName} onChange={e => onSchoolConfigUpdate({ headmasterName: e.target.value })} />
                 </div>
                 <input placeholder="School Motto" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-400" value={schoolInfo.motto} onChange={e => onSchoolConfigUpdate({ motto: e.target.value })} />
               </div>
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <h4 className="font-bold text-indigo-900 mb-4">Official Logo</h4>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 border-2 border-dashed border-indigo-200 rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-inner">
                       {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <span className="text-[10px] text-slate-300 font-bold">No Logo</span>}
                    </div>
                    <input type="file" onChange={e => {
                       const file = e.target.files?.[0];
                       if(file) {
                          const reader = new FileReader();
                          reader.onloadend = () => { onLogoUpdate(reader.result as string); saveSchoolLogo(reader.result as string); };
                          reader.readAsDataURL(file);
                       }
                    }} className="text-xs file:bg-indigo-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-xl file:cursor-pointer" />
                  </div>
               </div>
             </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-indigo-50 space-y-6">
            <h3 className="text-xl font-black text-indigo-900 border-b-2 border-indigo-50 pb-4">Room Management</h3>
            <div className="space-y-4 bg-indigo-50/30 p-6 rounded-3xl border border-indigo-50">
              <input placeholder="Class Name (e.g. Nursery 1)" className="w-full p-3 border-2 border-white rounded-xl font-bold text-sm bg-white outline-none" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
              <input placeholder="Streams (e.g. A, B, C)" className="w-full p-3 border-2 border-white rounded-xl font-bold text-sm bg-white outline-none" value={newClassStreams} onChange={e => setNewClassStreams(e.target.value)} />
              <Button onClick={handleCreateClass} className="w-full rounded-xl">Add Rooms</Button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {classes.map(cls => (
                <div key={cls.id} className="p-4 border-2 border-slate-50 rounded-2xl flex items-center justify-between bg-white shadow-sm hover:border-indigo-100 transition-colors">
                  <div className="font-black text-slate-700">{cls.name}</div>
                  <button onClick={() => { if(confirm('Delete class?')) { deleteClass(cls.id); loadManagementData(); } }} className="text-red-300 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-indigo-50 space-y-6">
            <h3 className="text-xl font-black text-indigo-900 border-b-2 border-indigo-50 pb-4">Staff Directory</h3>
            <div className="space-y-4 bg-indigo-50/30 p-6 rounded-3xl border border-indigo-50">
              <input placeholder="Full Name" className="w-full p-3 border-2 border-white rounded-xl font-bold text-sm bg-white outline-none" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Username" className="w-full p-3 border-2 border-white rounded-xl font-bold text-sm bg-white outline-none" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                <input placeholder="Password" type="password" className="w-full p-3 border-2 border-white rounded-xl font-bold text-sm bg-white outline-none" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <Button onClick={handleCreateUser} className="w-full rounded-xl">Add Staff</Button>
            </div>
            <div className="divide-y divide-indigo-50">
              {users.map(u => (
                <div key={u.username} className="py-4 flex justify-between items-center group">
                  <div className="font-bold text-slate-700">{u.name} <span className="text-[10px] text-indigo-400">@{u.username}</span></div>
                  {u.username !== 'ADMIN' && <button onClick={() => { if(confirm('Delete user?')) { deleteUser(u.username); loadManagementData(); } }} className="opacity-0 group-hover:opacity-100 transition-all text-red-300 hover:text-red-500">Delete</button>}
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 bg-indigo-900 p-10 rounded-[2.5rem] shadow-2xl flex items-center gap-8 justify-between border-8 border-indigo-800">
             <div className="text-white">
                <h4 className="text-2xl font-black mb-2">Database Backup</h4>
                <p className="text-indigo-300 font-medium">Download your school records for safe keeping.</p>
             </div>
             <Button variant="secondary" onClick={() => {
                const json = exportDatabase();
                const blob = new Blob([json], { type: 'application/json' });
                const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
                link.download = `NC_Backup_${new Date().toISOString().split('T')[0]}.json`; link.click();
             }} className="rounded-2xl px-8 shadow-xl">Download Records</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// PROFILE MODAL
const ProfileModal = ({ 
  user, 
  onClose, 
  onUpdate 
}: { 
  user: User, 
  onClose: () => void, 
  onUpdate: (data: any) => Promise<string | undefined> 
}) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = await onUpdate({ name, username, password: password || undefined });
    if (err) setError(err); else onClose();
  };

  return (
    <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 border-8 border-indigo-100">
        <h2 className="text-2xl font-black text-indigo-900 mb-6">Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
           <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
           <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
           <input type="password" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 font-bold" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password (optional)" />
           {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
           <div className="flex gap-3 justify-end pt-4">
             <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
             <Button type="submit">Save Changes</Button>
           </div>
        </form>
      </div>
    </div>
  );
};

// LOGIN SCREEN
const LoginScreen = ({ onLogin, logoUrl }: { onLogin: (u: string, p: string) => boolean, logoUrl?: string }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(username, password)) setError('Invalid credentials');
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border-8 border-indigo-100 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-3xl shadow-xl flex items-center justify-center p-2 border border-slate-50">
          {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl">NC</div>}
        </div>
        <h1 className="text-2xl font-black text-indigo-900 mb-2">School Portal</h1>
        <p className="text-slate-400 font-medium mb-8 uppercase tracking-widest text-[10px]">Staff Access Only</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 outline-none font-bold" placeholder="Username" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 outline-none font-bold" placeholder="Password" />
          {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">{error}</div>}
          <Button type="submit" className="w-full py-4 text-lg rounded-2xl shadow-xl shadow-indigo-100">Login</Button>
        </form>
      </div>
    </div>
  );
};

export default App;
