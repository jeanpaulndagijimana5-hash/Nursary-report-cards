
export enum UserRole {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  username: string;
  role: UserRole;
  name: string;
  email?: string;
  password?: string; // Only for internal storage simulation
  schoolId?: string; // Links admin/teacher to a specific school
}

export interface ClassRoom {
  id: string;
  name: string;
  teacherUsername?: string; // The username of the assigned teacher
}

export interface Student {
  id: string;
  name: string;
  className: string;
  photoUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Mark {
  studentId: string;
  subjectId: string;
  year: string;
  term: string;
  score: number;
}

export interface GradeResult {
  grade: string;
  color: string;
  label: string;
}

export interface ReportCardData {
  student: Student;
  marks: (Mark & { subjectName: string })[];
  year: string;
  term: string;
  summary?: string;
  position?: number;
  totalStudents?: number;
  annualStats?: {
    totalScore: number;
    averageScore: string;
    decision: string;
  };
}

export interface SchoolRegistration {
  id: string;
  schoolName: string;
  district: string;
  sector: string;
  phone: string;
  address: string;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
  plan: 'term' | 'year';
  paymentScreenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
}