
import { Mark, Student, User, UserRole, ClassRoom, SchoolRegistration } from '../types';
import { MOCK_STUDENTS, INITIAL_CLASSES, DEFAULT_SCHOOL_LOGO } from '../constants';

const MARKS_KEY = 'nursery_app_marks';
const USERS_KEY = 'nursery_app_users'; 
const CLASSES_KEY = 'nursery_app_classes';
const STUDENTS_KEY = 'nursery_app_students';
const CONFIG_KEY = 'nursery_app_config';
const REGISTRATION_KEY = 'nursery_app_registration';
const ALL_REGISTRATIONS_KEY = 'nursery_app_all_registrations';

// Initialize Data
const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const initialUsers: User[] = [
      { username: 'SUPERADMIN', name: 'System Super Admin', role: UserRole.SUPER_ADMIN, password: 'nasury2025' },
      { username: 'UMWARI', name: 'Teacher Umwari', role: UserRole.TEACHER, password: 'password' },
      { username: 'ADMIN', name: 'School Admin', role: UserRole.ADMIN, password: 'admin' }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }

  if (!localStorage.getItem(CLASSES_KEY)) {
    const initialClasses: ClassRoom[] = INITIAL_CLASSES.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      teacherUsername: name.includes('Nursery 1') ? 'UMWARI' : undefined
    }));
    localStorage.setItem(CLASSES_KEY, JSON.stringify(initialClasses));
  }

  if (!localStorage.getItem(STUDENTS_KEY)) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(MOCK_STUDENTS));
  }

  if (!localStorage.getItem(MARKS_KEY)) {
    localStorage.setItem(MARKS_KEY, JSON.stringify([]));
  }
};

initStorage();

// --- REGISTRATION MANAGEMENT ---
export const getRegistration = (): SchoolRegistration | null => {
  const stored = localStorage.getItem(REGISTRATION_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const getAllRegistrations = (): SchoolRegistration[] => {
  const stored = localStorage.getItem(ALL_REGISTRATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveRegistration = (reg: SchoolRegistration) => {
  localStorage.setItem(REGISTRATION_KEY, JSON.stringify(reg));
  
  const allRegs = getAllRegistrations();
  const existingIdx = allRegs.findIndex(r => r.id === reg.id);
  if (existingIdx > -1) {
    allRegs[existingIdx] = reg;
  } else {
    allRegs.push(reg);
  }
  localStorage.setItem(ALL_REGISTRATIONS_KEY, JSON.stringify(allRegs));
};

export const updateRegistrationStatus = (id: string, status: 'approved' | 'rejected') => {
  const allRegs = getAllRegistrations();
  const idx = allRegs.findIndex(r => r.id === id);
  if (idx > -1) {
    allRegs[idx].status = status;
    localStorage.setItem(ALL_REGISTRATIONS_KEY, JSON.stringify(allRegs));
    
    if (status === 'approved') {
      const reg = allRegs[idx];
      const users = getUsers();
      if (!users.find(u => u.username === reg.adminEmail)) {
        saveUser({
          username: reg.adminEmail,
          name: reg.adminName,
          role: UserRole.ADMIN,
          password: reg.adminPassword,
          schoolId: reg.id
        });
      }
      // Sync local registration if it's the current one
      const currentReg = getRegistration();
      if (currentReg && currentReg.id === id) {
        currentReg.status = 'approved';
        localStorage.setItem(REGISTRATION_KEY, JSON.stringify(currentReg));
      }
    }
  }
};

// --- DATABASE MANAGEMENT ---
export const exportDatabase = (): string => {
  const data = {
    users: getUsers(),
    classes: getClasses(),
    students: getAllStudents(),
    marks: getMarks(),
    config: localStorage.getItem(CONFIG_KEY) ? JSON.parse(localStorage.getItem(CONFIG_KEY)!) : {},
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(data, null, 2);
};

export const importDatabase = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.users || !data.classes || !data.students) return false;
    if(data.users) localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
    if(data.classes) localStorage.setItem(CLASSES_KEY, JSON.stringify(data.classes));
    if(data.students) localStorage.setItem(STUDENTS_KEY, JSON.stringify(data.students));
    if(data.marks) localStorage.setItem(MARKS_KEY, JSON.stringify(data.marks));
    if(data.config) localStorage.setItem(CONFIG_KEY, JSON.stringify(data.config));
    return true;
  } catch (e) {
    return false;
  }
};

// --- CONFIG ---
export const getSchoolLogo = (): string => {
  const config = localStorage.getItem(CONFIG_KEY);
  const stored = config ? JSON.parse(config).logoUrl : '';
  return stored || DEFAULT_SCHOOL_LOGO;
};

export const saveSchoolLogo = (logoUrl: string) => {
  const config = localStorage.getItem(CONFIG_KEY);
  const newConfig = config ? { ...JSON.parse(config), logoUrl } : { logoUrl };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
};

export const getSchoolConfig = () => {
  const config = localStorage.getItem(CONFIG_KEY);
  const defaults = {
    headmasterName: '',
    district: '',
    sector: '',
    cell: '',
    phone: '',
    motto: ''
  };
  return config ? { ...defaults, ...JSON.parse(config) } : defaults;
};

export const saveSchoolConfig = (data: any) => {
  const config = localStorage.getItem(CONFIG_KEY);
  const current = config ? JSON.parse(config) : {};
  const newConfig = { ...current, ...data };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
};

// Legacy shim for headmaster name
export const getHeadmasterName = () => getSchoolConfig().headmasterName;
export const saveHeadmasterName = (name: string) => saveSchoolConfig({ headmasterName: name });

// --- USERS ---
export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveUser = (user: User) => {
  const users = getUsers();
  if (users.find(u => u.username === user.username)) return;
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const updateUser = (currentUsername: string, data: any): { success: boolean, error?: string, user?: User } => {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === currentUsername);
  if (idx === -1) return { success: false, error: 'User not found' };

  const currentUser = users[idx];
  const updatedUser: User = {
    ...currentUser,
    name: data.name || currentUser.name,
    username: data.username || currentUser.username,
    password: data.password || currentUser.password
  };

  users[idx] = updatedUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true, user: updatedUser };
};

export const deleteUser = (username: string) => {
  let users = getUsers();
  users = users.filter(u => u.username !== username);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authenticate = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

// --- CLASSES ---
export const getClasses = (): ClassRoom[] => {
  const stored = localStorage.getItem(CLASSES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveClass = (newClass: ClassRoom) => {
  const classes = getClasses();
  if (classes.find(c => c.name === newClass.name)) return;
  classes.push(newClass);
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
};

export const updateClass = (updatedClass: ClassRoom) => {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === updatedClass.id);
  if (index !== -1) {
    classes[index] = updatedClass;
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
  }
};

export const renameClass = (classId: string, newName: string) => {
  const classes = getClasses();
  const cls = classes.find(c => c.id === classId);
  if (!cls) return;
  const oldName = cls.name;
  cls.name = newName;
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
  const students = getAllStudents();
  students.forEach(s => { if (s.className === oldName) s.className = newName; });
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const deleteClass = (id: string) => {
  let classes = getClasses();
  classes = classes.filter(c => c.id !== id);
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
};

export const getTeacherClasses = (username: string): ClassRoom[] => {
  return getClasses().filter(c => c.teacherUsername === username);
};

// --- STUDENTS ---
export const getAllStudents = (): Student[] => {
  const stored = localStorage.getItem(STUDENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getStudentsByClass = (className: string): Student[] => {
  return getAllStudents().filter(s => s.className === className);
};

export const saveStudent = (student: Student) => {
  const students = getAllStudents();
  students.push(student);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const updateStudent = (updatedStudent: Student) => {
  const students = getAllStudents();
  const index = students.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updatedStudent };
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }
};

export const deleteStudent = (id: string) => {
  let students = getAllStudents();
  students = students.filter(s => s.id !== id);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  let marks = getMarks();
  marks = marks.filter(m => m.studentId !== id);
  localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
};

// --- MARKS ---
export const getMarks = (): Mark[] => {
  const stored = localStorage.getItem(MARKS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getStudentMarks = (studentId: string, year: string, term: string): Mark[] => {
  const marks = getMarks();
  return marks.filter(m => m.studentId === studentId && m.year === year && m.term === term);
};

export const saveMarksBatch = (newMarks: Mark[]) => {
  let marks = getMarks();
  newMarks.forEach(nm => {
    marks = marks.filter(m => !(m.studentId === nm.studentId && m.subjectId === nm.subjectId && m.year === nm.year && m.term === nm.term));
    if (nm.score !== -1 && !isNaN(nm.score)) marks.push(nm);
  });
  localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
};
