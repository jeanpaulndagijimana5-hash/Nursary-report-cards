
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
  getHeadmasterName,
  saveHeadmasterName,
  updateUser,
  deleteStudent,
  deleteClass,
  deleteUser,
  exportDatabase,
  importDatabase,
  getRegistration,
  saveRegistration,
  getAllRegistrations,
  updateRegistrationStatus
} from './services/storageService';
import { generateStudentSummary } from './services/geminiService';
import { ACADEMIC_YEARS, TERMS, SUBJECTS } from './constants';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { GradeBadge } from './components/GradeBadge';
import { ReportCard } from './components/ReportCard';

// Declare html2pdf for TypeScript
declare var html2pdf: any;

// --- PUBLIC COMPONENTS ---

const WelcomeLanding = ({ onStart, onStaffLogin }: { onStart: () => void, onStaffLogin: () => void }) => (
  <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
    
    <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-indigo-600 font-black text-5xl shadow-2xl mb-8 animate-bounce relative z-10">
      NC
    </div>
    
    <div className="relative z-10 max-w-2xl">
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
        NASURY REPORT <br/> 
        <span className="text-yellow-400">CARDS GENERATOR</span>
      </h1>
      <p className="text-indigo-100 text-lg md:text-xl font-medium mb-12 opacity-90">
        Professional grading and automated reporting for Rwandan nursery schools.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Button 
          onClick={onStart} 
          className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-black text-2xl px-16 py-6 rounded-[2rem] shadow-2xl transform transition-all hover:scale-105 active:scale-95"
        >
          REGISTER YOUR SCHOOL
        </Button>
        <Button 
          variant="secondary"
          onClick={onStaffLogin} 
          className="bg-white/10 border-white/20 hover:bg-white/20 text-white font-bold text-xl px-12 py-6 rounded-[2rem] shadow-2xl backdrop-blur-md"
        >
          STAFF LOGIN
        </Button>
      </div>
    </div>
  </div>
);

const RegistrationWizard = ({ onComplete, onCancel }: { onComplete: (reg: SchoolRegistration) => void, onCancel: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SchoolRegistration>>({
    id: `school-${Date.now()}`,
    status: 'pending',
    plan: 'term',
    schoolName: '', district: '', sector: '', phone: '', address: '',
    adminName: '', adminEmail: '', adminPassword: '',
    registrationDate: new Date().toISOString()
  });
  const [passConfirm, setPassConfirm] = useState('');
  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    if (step === 1 && (!formData.schoolName || !formData.district || !formData.phone)) {
      setError('Please fill in all school details'); return;
    }
    if (step === 2 && (!formData.adminName || !formData.adminEmail || !formData.adminPassword)) {
      setError('Please fill in all administrator details'); return;
    }
    if (step === 2 && formData.adminPassword !== passConfirm) {
      setError('Passwords do not match'); return;
    }
    setStep(s => s + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, paymentScreenshot: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-[3rem] shadow-2xl p-12 border-8 border-indigo-100">
        <div className="flex justify-between items-center mb-10">
           <div className="text-xs font-black text-indigo-300 uppercase tracking-widest">Step {step} of 4</div>
           <button onClick={onCancel} className="text-slate-400 hover:text-red-500 font-bold">Cancel</button>
        </div>
        
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-indigo-900">Registration</h2>
            <div className="space-y-4">
              <input placeholder="School Name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.schoolName || ''} onChange={e => setFormData({ ...formData, schoolName: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="District" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.district || ''} onChange={e => setFormData({ ...formData, district: e.target.value })} />
                <input placeholder="Phone" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            {error && <div className="text-red-500 font-bold">{error}</div>}
            <Button onClick={nextStep} className="w-full py-5 rounded-2xl text-xl text-white">Next Step</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-indigo-900">Administrator</h2>
            <div className="space-y-4">
              <input placeholder="Full Name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.adminName || ''} onChange={e => setFormData({ ...formData, adminName: e.target.value })} />
              <input placeholder="Email (Username)" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.adminEmail || ''} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
              <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={formData.adminPassword || ''} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} />
              <input type="password" placeholder="Confirm Password" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} />
            </div>
            {error && <div className="text-red-500 font-bold">{error}</div>}
            <Button onClick={nextStep} className="w-full py-5 rounded-2xl text-xl text-white">Continue</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-indigo-900">Choose Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button onClick={() => setFormData({ ...formData, plan: 'term' })} className={`p-8 rounded-3xl border-4 text-left transition-all ${formData.plan === 'term' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}>
                  <div className="text-3xl font-black">30,000 FRW</div>
                  <div className="text-slate-500 font-bold">Per Term</div>
               </button>
               <button onClick={() => setFormData({ ...formData, plan: 'year' })} className={`p-8 rounded-3xl border-4 text-left transition-all ${formData.plan === 'year' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}>
                  <div className="text-3xl font-black">90,000 FRW</div>
                  <div className="text-slate-500 font-bold">Per Year</div>
               </button>
            </div>
            <Button onClick={nextStep} className="w-full py-5 rounded-2xl text-xl text-white">Go to Payment</Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-indigo-900 text-center">Payment Verification</h2>
            <div className="bg-indigo-900 p-8 rounded-3xl text-white space-y-4">
               <div className="text-xs font-black uppercase tracking-widest text-indigo-300">Transfer To</div>
               <div className="text-xl font-black">MOMO: 0790509750</div>
               <div className="text-xl font-black">BANK: 419491172410131</div>
               <div className="text-sm font-bold opacity-70">Account: NDAGIJIMANA Jean Paul</div>
            </div>
            <div className="p-10 border-4 border-dashed border-indigo-100 rounded-3xl bg-indigo-50/30 flex flex-col items-center justify-center relative hover:bg-indigo-50 transition-colors">
               <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               <div className="text-indigo-600 font-black text-center">
                 {formData.paymentScreenshot ? "✅ Screenshot Uploaded" : "📸 Click to Upload Payment Receipt"}
               </div>
            </div>
            <Button onClick={() => onComplete(formData as SchoolRegistration)} className="w-full py-5 rounded-2xl text-xl text-white" disabled={!formData.paymentScreenshot}>Submit Registration</Button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUPER ADMIN DASHBOARD ---

const SuperAdminDashboard = () => {
  const [registrations, setRegistrations] = useState<SchoolRegistration[]>([]);
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadData = () => {
    setRegistrations(getAllRegistrations());
  };

  useEffect(() => {
    loadData();
    // Refresh periodically to catch new registrations
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApproval = (reg: SchoolRegistration) => {
    setApprovingId(reg.id);
    setTimeout(() => {
      updateRegistrationStatus(reg.id, 'approved');
      loadData();
      setApprovingId(null);
      alert(`Activation Successful! ${reg.schoolName} is now live.`);
    }, 1500);
  };

  const handleRejection = (reg: SchoolRegistration) => {
    if (confirm(`Reject ${reg.schoolName}?`)) {
      updateRegistrationStatus(reg.id, 'rejected');
      loadData();
    }
  };

  const pendingCount = registrations.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-l-[12px] border-indigo-600">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Schools</div>
          <div className="text-4xl font-black text-indigo-900">{registrations.length}</div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-l-[12px] border-yellow-400">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pending Review</div>
          <div className="text-4xl font-black text-yellow-500">{pendingCount}</div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-l-[12px] border-green-500">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Revenue</div>
          <div className="text-4xl font-black text-green-600">
            {registrations.filter(r => r.status === 'approved').reduce((acc, r) => acc + (r.plan === 'term' ? 30000 : 90000), 0).toLocaleString()} <span className="text-sm">FRW</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-indigo-50">
        <div className="p-8 border-b border-indigo-50 bg-indigo-50/20">
          <h2 className="text-2xl font-black text-indigo-900">Schools Pipeline</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-8">School Name</th>
                <th className="p-8">Admin / Plan</th>
                <th className="p-8">Payment Receipt</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {registrations.sort((a,b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()).map(reg => (
                <tr key={reg.id} className={`hover:bg-slate-50 transition-colors ${reg.status === 'pending' ? 'bg-yellow-50/20' : ''}`}>
                  <td className="p-8">
                    <div className="font-black text-slate-800 text-lg">{reg.schoolName}</div>
                    <div className="text-xs font-bold text-slate-400">{reg.district} &bull; {reg.phone}</div>
                  </td>
                  <td className="p-8">
                    <div className="font-bold text-indigo-600">{reg.adminEmail}</div>
                    <div className="text-[10px] font-black uppercase text-slate-300 mt-1">{reg.plan} plan</div>
                  </td>
                  <td className="p-8">
                    {reg.paymentScreenshot ? (
                      <button onClick={() => setViewScreenshot(reg.paymentScreenshot!)} className="text-indigo-500 font-black flex items-center gap-2 hover:underline">
                        <span className="text-xl">📸</span> View Proof
                      </button>
                    ) : <span className="text-slate-300 italic text-xs">No proof uploaded</span>}
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      reg.status === 'approved' ? 'bg-green-500 text-white' :
                      reg.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-indigo-900'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    {reg.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                         <Button size="sm" onClick={() => handleApproval(reg)} isLoading={approvingId === reg.id} className="bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100 text-white">Activate School</Button>
                         <Button size="sm" variant="danger" onClick={() => handleRejection(reg)}>Reject</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewScreenshot && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-8" onClick={() => setViewScreenshot(null)}>
           <div className="max-w-3xl bg-white p-4 rounded-[2rem]">
              <img src={viewScreenshot} className="max-h-[80vh] object-contain rounded-xl" alt="Payment Proof" />
           </div>
        </div>
      )}
    </div>
  );
};

// --- TEACHER DASHBOARD ---

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
    classes.sort((a,b) => a.name.localeCompare(b.name));
    setMyClasses(classes);
    if (classes.length > 0) setSelectedClass(classes[0].name);
  }, [user.username]);

  useEffect(() => {
    if (selectedClass) {
      setExistingMarks(getMarks());
      setPendingMarks({});
      setSaveMessage('');
    }
  }, [year, term, selectedClass, selectedSubject]);

  const students = selectedClass ? getStudentsByClass(selectedClass).sort((a,b) => a.name.localeCompare(b.name)) : [];

  const handleSave = () => {
    setIsSaving(true);
    const marksToSave = Object.keys(pendingMarks).map(sid => ({
      studentId: sid, subjectId: selectedSubject, year, term, score: pendingMarks[sid]
    }));
    if (marksToSave.length > 0) {
      saveMarksBatch(marksToSave);
      setExistingMarks(getMarks());
      setPendingMarks({});
      setSaveMessage('All marks saved! ✅');
    }
    setTimeout(() => setIsSaving(false), 500);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleMarkChange = (sid: string, val: string) => {
    const s = val === '' ? NaN : parseInt(val);
    if (!isNaN(s) && (s < 0 || s > 100)) return;
    setPendingMarks(prev => ({ ...prev, [sid]: isNaN(s) ? -1 : s }));
    setSaveMessage('Unsaved changes...');
  };

  const getDisplayScore = (sid: string) => {
    if (pendingMarks.hasOwnProperty(sid)) return pendingMarks[sid] === -1 ? '' : pendingMarks[sid].toString();
    const m = existingMarks.find(mark => mark.studentId === sid && mark.subjectId === selectedSubject && mark.year === year && mark.term === term);
    return m ? m.score.toString() : '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Academic Year</label>
          <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold">
            {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Term</label>
          <select value={term} onChange={e => setTerm(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold">
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">My Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold">
            {myClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold">
            {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
            <tr><th className="p-4">Student Name</th><th className="p-4 text-center">Score</th><th className="p-4">Grade</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(s => (
              <tr key={s.id}>
                <td className="p-4 font-black text-slate-700">{s.name}</td>
                <td className="p-4 text-center">
                  <input type="number" value={getDisplayScore(s.id)} onChange={e => handleMarkChange(s.id, e.target.value)} className="w-20 p-2 border-2 rounded-lg text-center font-bold outline-none focus:border-indigo-500" />
                </td>
                <td className="p-4"><GradeBadge score={parseInt(getDisplayScore(s.id))} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50 flex justify-between items-center">
          <div className="text-indigo-600 font-black">{saveMessage}</div>
          <Button onClick={handleSave} isLoading={isSaving} disabled={Object.keys(pendingMarks).length === 0} className="text-white">Save All</Button>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---

const AdminDashboardComponent = ({ 
  logoUrl, 
  onLogoUpdate, 
  headmasterName, 
  onHeadmasterUpdate 
}: { 
  logoUrl: string, 
  onLogoUpdate: (url: string) => void, 
  headmasterName: string, 
  onHeadmasterUpdate: (name: string) => void 
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'students' | 'management'>('reports');
  const [viewMode, setViewMode] = useState<'list' | 'report'>('list');
  const [year, setYear] = useState(ACADEMIC_YEARS[0]);
  const [term, setTerm] = useState(TERMS[0]);
  const [filterClass, setFilterClass] = useState('');
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  
  // Management State
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [newStudent, setNewStudent] = useState({ name: '', classId: '' });
  const [newClassName, setNewClassName] = useState('');
  const [newClassStreams, setNewClassStreams] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: UserRole.TEACHER });
  
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentClassId, setEditStudentClassId] = useState('');

  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');

  const loadData = () => {
    const clsList = getClasses();
    clsList.sort((a,b) => a.name.localeCompare(b.name));
    setClasses(clsList);
    
    const stds = getAllStudents();
    stds.sort((a,b) => a.name.localeCompare(b.name));
    setAllStudents(stds);
    
    setUsers(getUsers());
  };

  useEffect(loadData, []);

  const handleGenerateReport = (studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    const rawMarks = getStudentMarks(studentId, year, term);
    const enriched = rawMarks.map(m => ({
       ...m, 
       subjectName: SUBJECTS.find(sub => sub.id === m.subjectId)?.name || '' 
    }));

    // Calculate rank and stats
    const classStudents = getStudentsByClass(student.className);
    const studentsWithTotal = classStudents.map(s => {
      const sMarks = getStudentMarks(s.id, year, term);
      const total = sMarks
        .filter(m => m.subjectId !== 'conduct')
        .reduce((sum, m) => sum + m.score, 0);
      return { id: s.id, total };
    });
    studentsWithTotal.sort((a, b) => b.total - a.total);
    const rankIndex = studentsWithTotal.findIndex(s => s.id === studentId);
    const position = rankIndex !== -1 ? rankIndex + 1 : undefined;

    setReportData({ 
      student, 
      marks: enriched, 
      year, 
      term, 
      position, 
      totalStudents: classStudents.length 
    });
    setViewMode('report');
  };

  // Student Actions
  const handleCreateStudent = () => {
    if(!newStudent.name || !newStudent.classId) return;
    const cls = classes.find(c => c.id === newStudent.classId);
    if(cls) {
      saveStudent({ id: `s-${Date.now()}`, name: newStudent.name, className: cls.name });
      setNewStudent({ name: '', classId: '' });
      loadData();
    }
  };

  const handleUpdateStudent = () => {
    if (!editingStudentId || !editStudentName || !editStudentClassId) return;
    const cls = classes.find(c => c.id === editStudentClassId);
    if (cls) {
      updateStudent({ id: editingStudentId, name: editStudentName, className: cls.name });
      setEditingStudentId(null);
      loadData();
    }
  };

  // Class Actions
  const handleCreateClass = () => {
    if (!newClassName) return;
    const streams = newClassStreams.split(',').map(s => s.trim()).filter(s => s);
    if (streams.length > 0) {
      streams.forEach(stream => {
        const fullName = `${newClassName} ${stream}`;
        const id = fullName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        saveClass({ id, name: fullName, teacherUsername: newClassTeacher || undefined });
      });
    } else {
      const id = newClassName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      saveClass({ id, name: newClassName, teacherUsername: newClassTeacher || undefined });
    }
    setNewClassName(''); setNewClassStreams(''); setNewClassTeacher('');
    loadData();
  };

  const handleUpdateClass = () => {
    if(!editingClassId || !editClassName) return;
    renameClass(editingClassId, editClassName);
    setEditingClassId(null);
    loadData();
  };

  const handleAssignTeacher = (classId: string, teacherUsername: string) => {
    const cls = classes.find(c => c.id === classId);
    if (cls) {
      updateClass({ ...cls, teacherUsername });
      loadData();
    }
  };

  // User Actions
  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password) return;
    saveUser(newUser);
    setNewUser({ username: '', name: '', password: '', role: UserRole.TEACHER });
    loadData();
  };

  // Database actions
  const handleBackup = () => {
    const json = exportDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `nursery_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
           if (importDatabase(result)) {
             alert('Database restored! Page will reload.');
             window.location.reload();
           }
        }
      };
      reader.readAsText(file);
    }
  };

  if (viewMode === 'report' && reportData) {
    return (
      <div className="space-y-6 animate-in zoom-in duration-300">
        <Button variant="secondary" onClick={() => setViewMode('list')}>← Back</Button>
        <div className="flex justify-center"><ReportCard data={reportData} logoUrl={logoUrl} headmasterName={headmasterName} /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex gap-2 border-b border-indigo-100 mb-6 overflow-x-auto">
        {[
          { id: 'reports', label: 'Reports' },
          { id: 'students', label: 'Students' },
          { id: 'management', label: 'Settings' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as any)} 
            className={`px-6 py-2 font-black rounded-t-xl uppercase text-[10px] tracking-widest transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-indigo-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border border-indigo-50 shadow-sm">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Year</label>
                <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-2 border-2 rounded-lg bg-slate-50 font-bold outline-none focus:border-indigo-500">{ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Term</label>
                <select value={term} onChange={e => setTerm(e.target.value)} className="w-full p-2 border-2 rounded-lg bg-slate-50 font-bold outline-none focus:border-indigo-500">{TERMS.map(t => <option key={t} value={t}>{t}</option>)}</select>
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Class</label>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-2 border-2 rounded-lg bg-slate-50 font-bold outline-none focus:border-indigo-500">
                  <option value="">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
             </div>
           </div>
           <div className="bg-white rounded-xl shadow-sm border border-indigo-50 divide-y divide-indigo-50 overflow-hidden">
             {allStudents.filter(s => !filterClass || s.className === filterClass).map(s => (
               <div key={s.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                 <div><div className="font-black text-slate-700 text-lg">{s.name}</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.className}</div></div>
                 <Button size="sm" variant="secondary" onClick={() => handleGenerateReport(s.id)}>View Report</Button>
               </div>
             ))}
             {allStudents.filter(s => !filterClass || s.className === filterClass).length === 0 && (
               <div className="p-12 text-center text-slate-400 font-bold italic">No students found.</div>
             )}
           </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-indigo-50 shadow-sm space-y-4">
             <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Register New Student</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <input placeholder="Student Full Name" className="p-2 border-2 rounded-lg bg-slate-50 font-black outline-none focus:border-indigo-500" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                <select className="p-2 border-2 rounded-lg bg-slate-50 font-black outline-none focus:border-indigo-500" value={newStudent.classId} onChange={e => setNewStudent({...newStudent, classId: e.target.value})}>
                  <option value="">-- Select Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Button onClick={handleCreateStudent} className="text-white">Add Student</Button>
             </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-indigo-50 divide-y divide-slate-100">
            {allStudents.map(student => (
              <div key={student.id} className="p-4 flex items-center justify-between">
                {editingStudentId === student.id ? (
                  <div className="flex-1 flex gap-2">
                    <input className="flex-1 p-2 border-2 rounded-lg font-black outline-none focus:border-indigo-500" value={editStudentName} onChange={e => setEditStudentName(e.target.value)} />
                    <select className="p-2 border-2 rounded-lg bg-white font-black outline-none focus:border-indigo-500" value={editStudentClassId} onChange={e => setEditStudentClassId(e.target.value)}>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Button size="sm" onClick={handleUpdateStudent} className="text-white">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingStudentId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div><div className="font-black text-slate-700 text-lg">{student.name}</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.className}</div></div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingStudentId(student.id); setEditStudentName(student.name); setEditStudentClassId(classes.find(c => c.name === student.className)?.id || ''); }}>✏️ Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => { if(confirm(`Delete ${student.name}?`)) { deleteStudent(student.id); loadData(); } }}>🗑️ Delete</Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'management' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-indigo-50 shadow-sm space-y-4">
                <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">School Logo</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border rounded bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner p-1">
                    {logoUrl ? <img src={logoUrl} className="max-h-full max-w-full object-contain" /> : <span className="text-[8px] text-slate-400">NO LOGO</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if(f) { const r = new FileReader(); r.onloadend = () => { saveSchoolLogo(r.result as string); onLogoUpdate(r.result as string); }; r.readAsDataURL(f); }
                  }} className="text-[10px]" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-indigo-50 shadow-sm space-y-4">
                <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Headmaster Name</h3>
                <input value={headmasterName} onChange={e => { saveHeadmasterName(e.target.value); onHeadmasterUpdate(e.target.value); }} className="w-full p-2 border-2 rounded-lg font-black outline-none focus:border-indigo-500 bg-slate-50" placeholder="Full Name" />
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-indigo-50 shadow-sm space-y-6">
              <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest border-b pb-2">Class Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                 <input placeholder="Class (e.g. Nursery 1)" className="p-2 border-2 rounded-lg bg-white font-black outline-none focus:border-indigo-500" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
                 <input placeholder="Streams (e.g. A, B)" className="p-2 border-2 rounded-lg bg-white font-black outline-none focus:border-indigo-500" value={newClassStreams} onChange={e => setNewClassStreams(e.target.value)} />
                 <select className="p-2 border-2 rounded-lg bg-white font-black outline-none focus:border-indigo-500" value={newClassTeacher} onChange={e => setNewClassTeacher(e.target.value)}>
                    <option value="">-- No Teacher --</option>
                    {users.filter(u => u.role === UserRole.TEACHER).map(u => <option key={u.username} value={u.username}>{u.name}</option>)}
                 </select>
                 <Button onClick={handleCreateClass} className="text-white">Add Class(es)</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map(cls => (
                  <div key={cls.id} className="p-4 bg-slate-50 rounded-xl border-2 flex justify-between items-center transition-all hover:shadow-md hover:border-indigo-100">
                    {editingClassId === cls.id ? (
                      <div className="flex-1 flex gap-2">
                         <input className="p-1 border-2 rounded bg-white flex-1 font-black outline-none focus:border-indigo-500" value={editClassName} onChange={e => setEditClassName(e.target.value)} />
                         <Button size="sm" onClick={handleUpdateClass} className="text-white">Save</Button>
                         <Button size="sm" variant="ghost" onClick={() => setEditingClassId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="font-black text-slate-800 text-lg">{cls.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TEACHER:</span>
                            <select className="text-[10px] font-black uppercase p-1 border rounded-lg bg-white shadow-sm" value={cls.teacherUsername || ''} onChange={e => handleAssignTeacher(cls.id, e.target.value)}>
                              <option value="">Unassigned</option>
                              {users.filter(u => u.role === UserRole.TEACHER).map(u => <option key={u.username} value={u.username}>{u.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <Button size="sm" variant="ghost" onClick={() => { setEditingClassId(cls.id); setEditClassName(cls.name); }}>✏️</Button>
                           <Button size="sm" variant="danger" onClick={() => { if(confirm(`Delete class ${cls.name}?`)) { deleteClass(cls.id); loadData(); } }}>🗑️</Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-indigo-50 shadow-sm space-y-6">
              <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest border-b pb-2">Staff & Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <input placeholder="Full Name" className="p-2 border-2 rounded-lg bg-white font-black outline-none focus:border-indigo-500" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                 <input placeholder="Username" className="p-2 border-2 rounded-lg bg-white font-black outline-none focus:border-indigo-500" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                 <input placeholder="Password" type="password" className="p-2 border-2 rounded-lg bg-white font-black outline-none focus:border-indigo-500" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                 <Button onClick={handleCreateUser} className="text-white">Create Staff</Button>
              </div>
              <div className="divide-y divide-indigo-50">
                {users.map(u => (
                  <div key={u.username} className="py-3 flex justify-between items-center px-2">
                    <div><span className="font-black text-slate-700">{u.name}</span> <span className="text-[10px] text-slate-400 font-black uppercase ml-2 tracking-[0.2em]">({u.role})</span></div>
                    {u.username !== 'ADMIN' && u.username !== 'SUPERADMIN' && (
                      <Button size="sm" variant="ghost" onClick={() => { if(confirm('Delete user?')) { deleteUser(u.username); loadData(); } }}>🗑️</Button>
                    )}
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-indigo-50 shadow-sm space-y-4">
              <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Database Backup</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" onClick={handleBackup}>⬇️ Download Database</Button>
                <div className="relative">
                  <Button variant="ghost">📂 Restore from File</Button>
                  <input type="file" accept=".json" onChange={handleRestore} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'wizard' | 'pending' | 'login'>('landing');
  const [registration, setRegistration] = useState<SchoolRegistration | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [headmasterName, setHeadmasterName] = useState('');

  const refreshRegistration = () => {
    const reg = getRegistration();
    setRegistration(reg);
    if (reg) {
      if (reg.status === 'pending') setCurrentView('pending');
      else if (reg.status === 'rejected') setCurrentView('pending'); // Will show rejected message
      else setCurrentView('login');
    }
    setLogoUrl(getSchoolLogo());
    setHeadmasterName(getHeadmasterName());
  };

  useEffect(() => {
    refreshRegistration();
    // Poll for status updates
    const interval = setInterval(refreshRegistration, 5000);
    return () => clearInterval(interval);
  }, []);

  if (user) {
    return (
      <Layout 
        user={user} 
        onLogout={() => setUser(null)} 
        title={user.role === UserRole.SUPER_ADMIN ? 'System Administration' : user.role === UserRole.ADMIN ? 'School Dashboard' : 'Grading Dashboard'}
        onOpenProfile={() => {}}
        logoUrl={logoUrl}
      >
        {user.role === UserRole.SUPER_ADMIN && <SuperAdminDashboard />}
        {user.role === UserRole.ADMIN && (
          <AdminDashboardComponent 
            logoUrl={logoUrl} 
            onLogoUpdate={setLogoUrl} 
            headmasterName={headmasterName} 
            onHeadmasterUpdate={setHeadmasterName} 
          />
        )}
        {user.role === UserRole.TEACHER && <TeacherDashboard user={user} />}
      </Layout>
    );
  }

  switch(currentView) {
    case 'wizard': return <RegistrationWizard onComplete={(reg) => { saveRegistration(reg); setRegistration(reg); setCurrentView('pending'); }} onCancel={() => setCurrentView('landing')} />;
    case 'pending': 
      const isRejected = registration?.status === 'rejected';
      return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 text-center">
         <div className="bg-white max-w-md p-12 rounded-[3rem] shadow-2xl border-8 border-indigo-100 animate-in zoom-in duration-500">
           <div className="text-6xl mb-6">{isRejected ? '❌' : '⏳'}</div>
           <h1 className="text-2xl font-black text-indigo-900 mb-2">
             {isRejected ? 'Registration Rejected' : 'Registration Pending'}
           </h1>
           <p className="font-bold text-slate-500 mb-8 leading-relaxed">
             {isRejected 
               ? `Your registration for "${registration?.schoolName}" was not approved. Please contact support.`
               : `We are verifying your payment for "${registration?.schoolName}". You will be able to login once approved.`
             }
           </p>
           <div className="space-y-2">
             <Button variant="secondary" onClick={() => setCurrentView('landing')} className="w-full">Back to Home</Button>
             {!isRejected && <Button variant="ghost" onClick={() => setCurrentView('login')} className="w-full">Already Approved? Login</Button>}
           </div>
         </div>
      </div>
    );
    case 'login': return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-12 rounded-[3rem] shadow-2xl border-8 border-indigo-100 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 mx-auto mb-6 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-100">NC</div>
           <h2 className="text-2xl font-black text-indigo-900 mb-8">Portal Login</h2>
           <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const u = (e.target as any).u.value; const p = (e.target as any).p.value; const auth = authenticate(u,p); if(auth) setUser(auth); else alert('Invalid Credentials'); }}>
             <input name="u" placeholder="Username/Email" className="w-full p-4 border-2 rounded-2xl font-black bg-slate-50 focus:border-indigo-500 outline-none transition-all" />
             <input name="p" type="password" placeholder="Password" className="w-full p-4 border-2 rounded-2xl font-black bg-slate-50 focus:border-indigo-500 outline-none transition-all" />
             <Button type="submit" className="w-full py-4 rounded-2xl text-white">Enter Dashboard</Button>
           </form>
           <button onClick={() => setCurrentView('landing')} className="mt-8 text-indigo-400 font-black hover:underline tracking-tight">← Exit to Home</button>
        </div>
      </div>
    );
    default: return <WelcomeLanding onStart={() => setCurrentView('wizard')} onStaffLogin={() => setCurrentView('login')} />;
  }
};

export default App;
