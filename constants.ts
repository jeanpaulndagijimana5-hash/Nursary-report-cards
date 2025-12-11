import { Student, Subject } from './types';

export const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026'];
export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

// Initial data for seeding
export const INITIAL_CLASSES = ['Nursery 1', 'Nursery 2', 'Nursery 3'];

// Subjects matching the provided image format
export const SUBJECTS: Subject[] = [
  { id: 'conduct', name: 'CONDUCT' },
  { id: 'numeracy', name: 'NUMERACY' },
  { id: 'literacy', name: 'LITERACY' },
  { id: 'social', name: 'SOCIAL' },
  { id: 'emotional', name: 'EMOTIONAL' },
  { id: 'science', name: 'SCIENCE' },
  { id: 'social_studies', name: 'SOCIAL STUDIES' },
  { id: 'french', name: 'FRENCH' },
];

// Initial mock students
export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Aline Keza', className: 'Nursery 1' },
  { id: 's2', name: 'David Murenzi', className: 'Nursery 1' },
  { id: 's3', name: 'Sarah Uwase', className: 'Nursery 1' },
  { id: 's4', name: 'Kevin Mugisha', className: 'Nursery 2' },
  { id: 's5', name: 'Divine Teta', className: 'Nursery 2' },
  { id: 's6', name: 'Eric Ntwari', className: 'Nursery 3' },
];

export const getGrade = (score: number): { grade: string; color: string; label: string } => {
  // Green: 90-100 (Excellent)
  if (score >= 90) return { grade: 'A', color: 'bg-green-300 text-green-900 print:bg-green-300 print:text-green-900', label: 'Excellent' };
  // Yellow: 70-89 (Very Good) - covering the "80-70" request range logic
  if (score >= 70) return { grade: 'B', color: 'bg-yellow-300 text-yellow-900 print:bg-yellow-300 print:text-yellow-900', label: 'Very Good' };
  // Pink: 60-69 (Good)
  if (score >= 60) return { grade: 'C', color: 'bg-pink-300 text-pink-900 print:bg-pink-300 print:text-pink-900', label: 'Good' };
  // Red: 0-59 (Fail)
  return { grade: 'D', color: 'bg-red-300 text-red-900 print:bg-red-300 print:text-red-900', label: 'Fail' };
};