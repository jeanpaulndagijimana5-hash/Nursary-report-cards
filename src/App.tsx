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
  renameClass,
  getTeacherClasses,
  saveStudent,
  updateStudent,
  getSchoolLogo,
  saveSchoolLogo,
  getHeadmasterName,
  saveHeadmasterName,
  updateUser,
  deleteStudent,
  deleteClass,
  deleteUser,
  exportDatabase,
  importDatabase
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
  