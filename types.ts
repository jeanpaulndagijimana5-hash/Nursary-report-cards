export enum UserRole {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface User {
  username: string;
  role: UserRole;
  name: string;
  password?: string; // Only for internal storage simulation
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