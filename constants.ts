import { Student, Subject } from './types';

export const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026'];
export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

// Initial data for seeding
export const INITIAL_CLASSES = ['Nursery 1 A', 'Nursery 1 B', 'Nursery 2', 'Nursery 3'];

// Default Logo (SVG representation of KPII Logo)
export const DEFAULT_SCHOOL_LOGO = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Cdefs%3E%3Cstyle%3Etext%7Bfont-family:sans-serif;%7D%3C/style%3E%3C/defs%3E%3C!-- Tree Canopy/Rays --%3E%3Cg stroke='%23009E49' stroke-width='8' stroke-linecap='round'%3E%3Cpath d='M150,100 L150,40' /%3E%3Cpath d='M150,100 L110,50' /%3E%3Cpath d='M150,100 L190,50' /%3E%3Cpath d='M150,100 L80,70' /%3E%3Cpath d='M150,100 L220,70' /%3E%3C/g%3E%3C!-- Head --%3E%3Ccircle cx='150' cy='35' r='10' fill='%23009E49' /%3E%3C!-- Trunk --%3E%3Crect x='144' y='100' width='12' height='40' fill='%23009E49' /%3E%3C!-- Book Left (Blue) --%3E%3Cpath d='M50,100 L144,100 L144,150 L50,145 Z' fill='%230055A4' /%3E%3C!-- Book Right (White) --%3E%3Cpath d='M156,100 L250,100 L250,145 L156,150 Z' fill='white' stroke='%230055A4' stroke-width='2' /%3E%3C!-- Text --%3E%3Ctext x='150' y='170' font-weight='bold' font-size='20' text-anchor='middle' fill='%230055A4'%3EK.P.I.I%3C/text%3E%3Ctext x='150' y='185' font-style='italic' font-size='8' text-anchor='middle' fill='%230055A4'%3EQuality Education For a Brighter Future%3C/text%3E%3C/svg%3E";

// Subjects matching the provided image format
export const SUBJECTS: Subject[] = [
  { id: 'numeracy', name: 'NUMERACY' },
  { id: 'literacy', name: 'LITERACY' },
  { id: 'discovery_world', name: 'DISCOVERY OF THE WORLD' },
  { id: 'creative_arts', name: 'CREATIVE ARTS AND CRAFT' },
  { id: 'health_pe', name: 'HEALTH AND PHYSICAL EDUCATION' },
  { id: 'oral', name: 'ORAL' },
  { id: 'social_emotional', name: 'SOCIAL AND EMOTIONALLY DEVELOPMENT' },
  { id: 'conduct', name: 'CONDUCT' },
];

// Initial mock students
export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Aline Keza', className: 'Nursery 1 A' },
  { id: 's2', name: 'David Murenzi', className: 'Nursery 1 A' },
  { id: 's3', name: 'Sarah Uwase', className: 'Nursery 1 B' },
  { id: 's4', name: 'Kevin Mugisha', className: 'Nursery 2' },
  { id: 's5', name: 'Divine Teta', className: 'Nursery 2' },
  { id: 's6', name: 'Eric Ntwari', className: 'Nursery 3' },
];

export const getGrade = (score: number): { grade: string; color: string; label: string } => {
  // Green: 90-100 (Excellent)
  if (score >= 90) return { grade: 'A', color: 'bg-green-300 text-green-900 print:bg-green-300 print:text-green-900', label: 'Excellent' };
  // Blue: 70-89 (Very Good)
  if (score >= 70) return { grade: 'B', color: 'bg-blue-300 text-blue-900 print:bg-blue-300 print:text-blue-900', label: 'Very Good' };
  // Yellow: 50-69 (Good)
  if (score >= 50) return { grade: 'C', color: 'bg-yellow-300 text-yellow-900 print:bg-yellow-300 print:text-yellow-900', label: 'Good' };
  // Red: 0-49 (Fail)
  return { grade: 'D', color: 'bg-red-300 text-red-900 print:bg-red-300 print:text-red-900', label: 'Fail' };
};