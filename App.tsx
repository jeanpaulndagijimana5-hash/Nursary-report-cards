import React, { useState, useEffect } from 'react';
import { User, UserRole, Mark, ReportCardData, ClassRoom, Student } from './types';
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
  getTeacherClasses,
  saveStudent,
  getSchoolLogo,
  saveSchoolLogo,
  updateUser,
  deleteStudent,
  deleteClass,
  deleteUser
} from './services/storageService';
import { generateStudentSummary } from './services/geminiService';
import { ACADEMIC_YEARS, TERMS, SUBJECTS } from './constants';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { GradeBadge } from './components/GradeBadge';
import { ReportCard } from './components/ReportCard';

// Declare html2pdf for TypeScript
declare var html2pdf: any;

// PROFILE MODAL COMPONENT
const ProfileModal = ({ 
  user, 
  onClose, 
  onUpdate 
}: { 
  user: User, 
  onClose: () => void, 
  onUpdate: (data: { name: string, username: string, password?: string }) => Promise<string | undefined> 
}) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name || !username) {
      setError('Name and Username are required');
      return;
    }

    const err = await onUpdate({ name, username, password: password || undefined });
    if (err) {
      setError(err);
    } else {
      setSuccess('Profile updated successfully!');
      setTimeout(onClose, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Display Name</label>
             <input className="w-full p-2 border rounded-lg" value={name} onChange={e => setName(e.target.value)} />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Username</label>
             <input className="w-full p-2 border rounded-lg" value={username} onChange={e => setUsername(e.target.value)} />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">New Password</label>
             <input 
               type="password" 
               className="w-full p-2 border rounded-lg" 
               value={password} 
               onChange={e => setPassword(e.target.value)} 
               placeholder="Leave blank to keep current"
             />
           </div>
           
           {error && <div className="text-red-500 text-sm">{error}</div>}
           {success && <div className="text-green-500 text-sm">{success}</div>}
           
           <div className="flex gap-2 justify-end pt-2">
             <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
             <Button type="submit">Save Changes</Button>
           </div>
        </form>
      </div>
    </div>
  );
};

// LOGIN COMPONENT
const LoginScreen = ({ onLogin }: { onLogin: (u: string, p: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-indigo-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-indigo-200">NC</div>
          <h1 className="text-2xl font-bold text-indigo-900">Nursery Cards</h1>
          <p className="text-slate-500 mt-2">Staff Access Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
          <div className="pt-2">
            <Button type="submit" className="w-full justify-center py-3 text-lg">Login to System</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// TEACHER DASHBOARD
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

// ADMIN DASHBOARD
const AdminDashboard = ({ logoUrl, onLogoUpdate }: { logoUrl: string, onLogoUpdate: (url: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'students' | 'management'>('reports');
  const [viewMode, setViewMode] = useState<'list' | 'report' | 'bulk_report'>('list');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [year, setYear] = useState(ACADEMIC_YEARS[0]);
  const [term, setTerm] = useState(TERMS[0]);
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [bulkReports, setBulkReports] = useState<ReportCardData[]>([]);
  
  // Selection States
  const [filterClass, setFilterClass] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [generatingAI, setGeneratingAI] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Management State
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  
  const [newClassName, setNewClassName] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState(''); 
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: UserRole.TEACHER });
  const [newStudent, setNewStudent] = useState({ name: '', classId: '' });

  // Load data helper
  const loadManagementData = () => {
    setClasses(getClasses());
    setUsers(getUsers());
    setAllStudents(getAllStudents());
  };

  useEffect(() => {
    loadManagementData();
  }, [activeTab, viewMode]);

  useEffect(() => {
    // Clear selection when class filter changes
    setSelectedIds(new Set());
  }, [filterClass]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    const filtered = allStudents.filter(s => !filterClass || s.className === classes.find(c => c.id === filterClass)?.name);
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(filtered.map(s => s.id));
      setSelectedIds(newSet);
    }
  };

  // Helper to generate a single report object
  const generateReportData = (studentId: string): ReportCardData | null => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return null;

    const rawMarks = getStudentMarks(studentId, year, term);
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

    const enrichedMarks = rawMarks.map(m => ({
      ...m,
      subjectName: SUBJECTS.find(s => s.id === m.subjectId)?.name || 'Unknown'
    }));

    // ANNUAL STATS LOGIC
    let annualStats = undefined;
    if (term === 'Term 3') {
       // Get all marks for this student for the whole academic year (excluding conduct for average)
       const allYearMarks = getMarks().filter(m => 
          m.studentId === studentId && 
          m.year === year && 
          m.subjectId !== 'conduct'
       );
       
       const totalScore = allYearMarks.reduce((sum, m) => sum + m.score, 0);
       const count = allYearMarks.length;
       const averageScore = count > 0 ? (totalScore / count).toFixed(1) : '0';
       
       // Calculate Promotion
       let decision = 'To Repeat Class';
       const avgNum = parseFloat(averageScore);
       
       let nextClass = 'Next Level';
       const cls = student.className.toLowerCase();
       if (cls.includes('nursery 1')) nextClass = 'Nursery 2';
       else if (cls.includes('nursery 2')) nextClass = 'Nursery 3';
       else if (cls.includes('nursery 3')) nextClass = 'Primary 1';
       
       // Pass mark assumption 50%
       if (avgNum >= 50) {
          decision = `Promoted to ${nextClass}`;
       }
       
       annualStats = {
          totalScore,
          averageScore,
          decision
       };
    }

    return {
      student,
      marks: enrichedMarks,
      year,
      term,
      position,
      totalStudents: classStudents.length,
      annualStats
    };
  };

  const handleGenerateReport = (studentId: string) => {
    const data = generateReportData(studentId);
    if (data) {
      setReportData(data);
      setSelectedStudentId(studentId);
      setViewMode('report');
    }
  };

  const handleGenerateBulk = () => {
    const reports = Array.from(selectedIds)
      .map(id => generateReportData(id))
      .filter(Boolean) as ReportCardData[];
    
    setBulkReports(reports);
    setViewMode('bulk_report');
  };

  const handleAiSummary = async () => {
    if (!reportData) return;
    setGeneratingAI(true);
    const summary = await generateStudentSummary(reportData.student, reportData.marks, reportData.term);
    setReportData(prev => prev ? ({ ...prev, summary }) : null);
    setGeneratingAI(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;
    setIsDownloading(true);
    const element = document.getElementById('report-card-container');
    const opt = {
      margin: 0.2, // Smaller margin for better fit
      filename: `${reportData.student.name}_${reportData.term}_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        saveSchoolLogo(base64);
        onLogoUpdate(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- MANAGEMENT LOGIC ---
  const handleCreateClass = () => {
    if (!newClassName) return;
    saveClass({
      id: newClassName.toLowerCase().replace(/\s/g, '-'),
      name: newClassName,
      teacherUsername: newClassTeacher || undefined
    });
    setNewClassName('');
    setNewClassTeacher('');
    loadManagementData();
  };

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password) return;
    saveUser(newUser);
    setNewUser({ username: '', name: '', password: '', role: UserRole.TEACHER });
    loadManagementData();
  };

  const handleCreateStudent = () => {
    if(!newStudent.name || !newStudent.classId) return;
    const cls = classes.find(c => c.id === newStudent.classId);
    if(cls) {
      saveStudent({
        id: `s-${Date.now()}`,
        name: newStudent.name,
        className: cls.name
      });
      setNewStudent({ name: '', classId: '' });
      loadManagementData();
      alert('Student Added Successfully');
    }
  };

  const handleAssignTeacher = (classId: string, teacherUsername: string) => {
    const cls = classes.find(c => c.id === classId);
    if (cls) {
      updateClass({ ...cls, teacherUsername });
      loadManagementData();
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student and their marks? This cannot be undone.')) {
      deleteStudent(id);
      loadManagementData();
    }
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      deleteClass(id);
      loadManagementData();
    }
  };

  const handleDeleteUser = (username: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(username);
      loadManagementData();
    }
  };

  // --- RENDER VIEWS ---

  if (viewMode === 'report' && reportData) {
    return (
      <div className="flex flex-col gap-6">
        <div className="print:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            ← Back to List
          </Button>
          <div className="flex gap-3">
             <Button variant="secondary" onClick={handleAiSummary} isLoading={generatingAI} disabled={!!reportData.summary}>
                {reportData.summary ? 'Summary Generated' : '✨ Generate AI Summary'}
             </Button>
             <Button variant="secondary" onClick={handleDownloadPDF} isLoading={isDownloading}>
                ⬇️ Download PDF
             </Button>
             <Button onClick={handlePrint}>
                🖨️ Print
             </Button>
          </div>
        </div>
        <div className="flex justify-center bg-gray-500/10 p-4 overflow-x-auto">
          <div id="report-card-container" className="bg-white print:m-0 shadow-lg">
            <ReportCard data={reportData} logoUrl={logoUrl} />
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'bulk_report') {
    return (
      <div className="flex flex-col gap-6">
        <div className="print:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-indigo-50 sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <Button variant="secondary" onClick={() => setViewMode('list')}>
               ← Back to List
             </Button>
             <div className="font-bold text-indigo-900">{bulkReports.length} Reports Generated</div>
          </div>
          <Button onClick={handlePrint}>
             🖨️ Print All
          </Button>
        </div>
        <div className="flex flex-col items-center gap-8 print:block print:gap-0 bg-gray-500/10 p-8 print:p-0 print:bg-white">
          {bulkReports.map((data, index) => (
             <div 
               key={data.student.id} 
               className="bg-white shadow-lg print:shadow-none print:w-full max-w-3xl w-full"
               style={{ breakAfter: 'page' }}
             >
               <ReportCard data={data} logoUrl={logoUrl} />
             </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredStudents = allStudents.filter(s => 
     !filterClass || s.className === classes.find(c => c.id === filterClass)?.name
  );

  return (
    <div className="space-y-6">
      {/* Admin Tabs */}
      <div className="flex space-x-2 border-b border-indigo-200 pb-1 print:hidden">
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-indigo-50'}`}
        >
          Reports
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-indigo-50'}`}
        >
          Students
        </button>
        <button 
          onClick={() => setActiveTab('management')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeTab === 'management' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-indigo-50'}`}
        >
          Classes & Teachers
        </button>
      </div>

      {activeTab === 'reports' && (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Year</label>
              <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50">
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Term</label>
              <select value={term} onChange={e => setTerm(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50">
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Filter Class</label>
               <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50">
                  <option value="">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-indigo-50">
            <div className="p-4 border-b border-indigo-50 flex justify-between items-center">
               <div className="font-bold text-indigo-900">Student Directory ({filteredStudents.length})</div>
               <div className="flex gap-2">
                 <Button 
                   size="sm" 
                   variant="secondary" 
                   onClick={selectAll}
                   disabled={filteredStudents.length === 0}
                 >
                   {selectedIds.size === filteredStudents.length && filteredStudents.length > 0 ? 'Deselect All' : 'Select All'}
                 </Button>
                 {selectedIds.size > 0 && (
                   <Button size="sm" onClick={handleGenerateBulk}>
                      Generate Reports ({selectedIds.size})
                   </Button>
                 )}
               </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredStudents.map(student => (
                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-indigo-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedIds.has(student.id)}
                      onChange={() => toggleSelection(student.id)}
                    />
                    <div>
                      <div className="font-bold text-slate-700">{student.name}</div>
                      <div className="text-sm text-slate-500">{student.className}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleGenerateReport(student.id)}>
                    View Single
                  </Button>
                </div>
              ))}
              {filteredStudents.length === 0 && <div className="p-6 text-center text-slate-400">No students found matching filters.</div>}
            </div>
          </div>
        </>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Add Student Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 space-y-4">
             <h3 className="text-lg font-bold text-indigo-900 border-b pb-2">Register New Student</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Student Name</label>
                   <input 
                     placeholder="e.g. Jean Paul" 
                     className="w-full p-2 border rounded-lg"
                     value={newStudent.name}
                     onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assign Class</label>
                   <select 
                     className="w-full p-2 border rounded-lg bg-white"
                     value={newStudent.classId}
                     onChange={e => setNewStudent({...newStudent, classId: e.target.value})}
                   >
                      <option value="">-- Select Class --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <Button onClick={handleCreateStudent} disabled={!newStudent.name || !newStudent.classId}>
                  + Add Student
                </Button>
             </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-sm border border-indigo-50">
            <div className="p-4 border-b border-indigo-50 font-bold text-indigo-900">Registered Students</div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {allStudents.map(student => (
                <div key={student.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {student.name.substring(0,2).toUpperCase()}
                     </div>
                     <div>
                        <div className="font-bold text-slate-700">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.className}</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-400 font-mono">{student.id}</div>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteStudent(student.id)}>
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* School Configuration */}
          <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-indigo-50 space-y-4">
             <h3 className="text-lg font-bold text-indigo-900 border-b pb-2">School Configuration</h3>
             <div className="flex items-start gap-6">
               <div className="flex-1">
                 <label className="block text-sm font-bold text-slate-700 mb-2">School Logo</label>
                 <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 overflow-hidden">
                       {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <span className="text-xs text-slate-400">No Logo</span>}
                    </div>
                    <div>
                       <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100
                        "/>
                       <p className="text-xs text-slate-400 mt-1">Upload a PNG or JPG. Max 1MB recommended.</p>
                    </div>
                 </div>
               </div>
             </div>
          </div>

          {/* Class Management */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 space-y-6">
            <h3 className="text-lg font-bold text-indigo-900 border-b pb-2">Class Management</h3>
            
            <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
               <label className="text-xs font-bold text-slate-500 uppercase">Create New Class</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Class Name" 
                   className="flex-1 p-2 border rounded text-sm"
                   value={newClassName}
                   onChange={(e) => setNewClassName(e.target.value)}
                 />
                 <select
                    className="p-2 border rounded text-sm bg-white"
                    value={newClassTeacher}
                    onChange={(e) => setNewClassTeacher(e.target.value)}
                 >
                    <option value="">-- Assign Teacher --</option>
                    {users.filter(u => u.role === UserRole.TEACHER).map(u => (
                       <option key={u.username} value={u.username}>{u.name}</option>
                    ))}
                 </select>
                 <Button size="sm" onClick={handleCreateClass} disabled={!newClassName}>Add</Button>
               </div>
            </div>

            <div className="space-y-3">
              {classes.map(cls => (
                <div key={cls.id} className="p-3 bg-slate-50 rounded border border-slate-100 flex flex-col gap-2">
                   <div className="flex justify-between items-center font-bold text-slate-700">
                      <span>{cls.name}</span>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteClass(cls.id)}>🗑️</Button>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-slate-500 uppercase">Assigned Teacher:</span>
                     <select 
                       className="text-sm p-1 border rounded bg-white flex-1"
                       value={cls.teacherUsername || ''}
                       onChange={(e) => handleAssignTeacher(cls.id, e.target.value)}
                     >
                       <option value="">-- Unassigned --</option>
                       {users.filter(u => u.role === UserRole.TEACHER).map(u => (
                         <option key={u.username} value={u.username}>{u.name}</option>
                       ))}
                     </select>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Management */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 space-y-6">
            <h3 className="text-lg font-bold text-indigo-900 border-b pb-2">Staff Management</h3>
            
            <div className="space-y-2 bg-indigo-50 p-4 rounded-lg">
              <h4 className="text-sm font-bold text-indigo-800">Add New Teacher</h4>
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full p-2 border rounded text-sm"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="flex-1 p-2 border rounded text-sm"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Password" 
                  className="flex-1 p-2 border rounded text-sm"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleCreateUser} disabled={!newUser.username || !newUser.password}>Create User</Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-400 uppercase">Existing Users</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {users.map(u => (
                  <div key={u.username} className="p-2 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-700">{u.name}</div>
                      <div className="text-xs text-slate-400">@{u.username} • {u.role}</div>
                    </div>
                    {u.username !== 'ADMIN' && (
                      <Button size="sm" variant="danger" onClick={() => handleDeleteUser(u.username)}>🗑️</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Load config on mount
    setSchoolLogo(getSchoolLogo());
  }, []);

  const handleLogin = (u: string, p: string) => {
    const authUser = authenticate(u, p);
    if (authUser) {
      setUser(authUser);
    } else {
      alert('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUpdateProfile = async (data: { name: string, username: string, password?: string }) => {
    if (!user) return 'Not logged in';
    
    const result = updateUser(user.username, data);
    
    if (result.success && result.user) {
      setUser(result.user);
      return undefined;
    } else {
      return result.error || 'Update failed';
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout 
        user={user} 
        onLogout={handleLogout} 
        title={user.role === UserRole.ADMIN ? 'Administration Portal' : 'My Classroom'}
        onOpenProfile={() => setShowProfile(true)}
      >
        {user.role === UserRole.ADMIN ? (
          <AdminDashboard logoUrl={schoolLogo} onLogoUpdate={setSchoolLogo} />
        ) : (
          <TeacherDashboard user={user} />
        )}
      </Layout>
      {showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onUpdate={handleUpdateProfile}
        />
      )}
    </>
  );
};

export default App;