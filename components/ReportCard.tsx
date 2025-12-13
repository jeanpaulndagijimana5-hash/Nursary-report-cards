import React from 'react';
import { ReportCardData } from '../types';
import { getGrade } from '../constants';

interface ReportCardProps {
  data: ReportCardData;
  logoUrl?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({ data, logoUrl }) => {
  const { student, marks, year } = data;
  
  // Helper to get score for a specific subject name
  const getScore = (subjectName: string) => {
    const mark = marks.find(m => m.subjectName === subjectName);
    return mark ? mark.score : '';
  };

  const coreSubjects = [
    'NUMERACY',
    'LITERACY',
    'DISCOVERY OF THE WORLD',
    'CREATIVE ARTS AND CRAFT',
    'HEALTH AND PHYSICAL EDUCATION',
    'ORAL',
    'SOCIAL AND EMOTIONALLY DEVELOPMENT',
    'CONDUCT'
  ];
  
  // Logic for checkboxes based on decision string
  const decisionText = data.annualStats?.decision?.toLowerCase() || '';
  const isPromoted = decisionText.includes('promoted');
  const isRepeat = decisionText.includes('repeat');
  // 'Promoted elsewhere' is usually a manual decision in this context, or specific logic not yet defined.
  
  return (
    <div className="bg-white p-4 max-w-3xl mx-auto w-full text-black font-sans text-sm">
      {/* Outer Border */}
      <div className="border-4 border-black p-1">
        
        {/* Header Section */}
        <div className="border-b-2 border-black pb-2 mb-2">
           
           <div className="flex items-center justify-between mt-2 mb-2 gap-4">
              {/* Logo - Adjusted for landscape aspect ratio */}
              <div className="h-28 w-32 flex-shrink-0 flex items-center justify-center">
                 {logoUrl ? (
                   <img src={logoUrl} alt="School Logo" className="w-full h-full object-contain" />
                 ) : (
                   <div className="w-full h-full border border-black flex items-center justify-center bg-slate-100">
                      <span className="text-xs text-center text-slate-500">SCHOOL<br/>LOGO</span>
                   </div>
                 )}
              </div>

              {/* School Details */}
              <div className="text-center flex-1">
                 <h1 className="text-xl md:text-2xl font-extrabold text-green-700 uppercase leading-tight" style={{ fontFamily: 'serif' }}>
                    KAJEVUBA
                 </h1>
                 <h2 className="text-sm md:text-base font-bold text-green-700 uppercase leading-tight">
                    PARENTS' INITIATIVE
                 </h2>
                 <h2 className="text-lg md:text-xl font-bold text-green-700 uppercase leading-tight">
                    "IREMBO"
                 </h2>
                 <div className="text-xs font-bold text-green-800 mt-1">
                    RULINDO - NTARABANA
                 </div>
                 <div className="text-xs text-blue-800 font-bold">
                    E-mail: kpirembo@yahoo.com
                 </div>
                 <div className="text-xs text-blue-800 font-bold">
                    Tel: 0788889937
                 </div>
              </div>
           </div>

           {/* Student Details Fields */}
           <div className="mt-4 grid grid-cols-2 gap-4 font-bold text-sm uppercase">
              <div className="flex gap-2">
                 <span>Names:</span>
                 <span className="flex-1 border-b border-black border-dashed px-2">{student.name}</span>
              </div>
              <div className="flex gap-2">
                 <span>Class:</span>
                 <span className="flex-1 border-b border-black border-dashed px-2">{student.className}</span>
              </div>
           </div>
           
           {/* Academic Year Row */}
           <div className="mt-2 flex gap-2 font-bold text-sm uppercase">
              <span>Academic Year:</span>
              <span className="flex-1 border-b border-black border-dashed px-2">{year}</span>
           </div>
        </div>

        {/* Report Title */}
        <div className="border-2 border-black text-center font-bold uppercase py-1 mb-1 text-sm bg-slate-100">
           PERIODIC PROGRESS REPORT
        </div>

        {/* Grades Table */}
        <table className="w-full border-collapse border-2 border-black text-sm font-bold mb-4">
           <thead>
              <tr className="bg-white">
                 <th className="border border-black p-2 text-left w-3/4">COURSES</th>
                 <th className="border border-black p-2 text-center w-1/4">GRADE</th>
              </tr>
           </thead>
           <tbody>
              {/* Core Courses Header */}
              <tr>
                 <td className="border border-black p-2 bg-slate-100" colSpan={2}>CORE COURSES</td>
              </tr>

              {/* Subjects */}
              {coreSubjects.map(sub => {
                 const score = getScore(sub);
                 const gradeInfo = typeof score === 'number' ? getGrade(score) : null;
                 return (
                    <tr key={sub}>
                       <td className="border border-black p-2">{sub}</td>
                       <td className="border border-black p-0 h-10">
                          {gradeInfo ? (
                             <div className={`w-full h-full ${gradeInfo.color}`} style={{ minHeight: '2.5rem' }}></div>
                          ) : (
                             <div className="text-center text-slate-300 py-2">-</div>
                          )}
                       </td>
                    </tr>
                 );
              })}
           </tbody>
        </table>

        {/* Annual Stats & Promotion Box (End of Year Only) */}
        {data.annualStats && (
            <div className="border-x-2 border-t-2 border-b-0 border-black p-2 bg-slate-50">
               <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold uppercase">
                  <div>
                     <span className="underline mr-2">ANNUAL SUMMARY:</span>
                     <span>Total: {data.annualStats.totalScore}</span>
                     <span className="mx-2">|</span>
                     <span>Average: {data.annualStats.averageScore}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="underline">DECISION:</span>
                     <div className="border-2 border-black px-4 py-1 bg-white">
                        {data.annualStats.decision}
                     </div>
                  </div>
               </div>
            </div>
        )}

        {/* Footer Section */}
        <table className="w-full border-collapse border-2 border-black mt-0 text-sm font-bold">
           <tbody>
              {/* Key/Ranks Section */}
              <tr>
                 <td className="border border-black p-2 align-top" colSpan={2}>
                    <div className="flex flex-col gap-2">
                      <div className="uppercase underline mb-1">RANKS:</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-green-300 border border-green-900 inline-block print:bg-green-300"></span>
                          <span>90 - 100 (Excellent)</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-4 h-4 bg-blue-300 border border-blue-900 inline-block print:bg-blue-300"></span>
                           <span>70 - 89 (Very Good)</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-4 h-4 bg-yellow-300 border border-yellow-900 inline-block print:bg-yellow-300"></span>
                           <span>50 - 69 (Good)</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-4 h-4 bg-red-300 border border-red-900 inline-block print:bg-red-300"></span>
                           <span>0 - 49 (Fail)</span>
                        </div>
                      </div>
                    </div>
                 </td>
              </tr>
              
              {/* Teacher Signature */}
              <tr>
                 <td className="border border-black p-2 h-16 align-middle w-1/3">
                    Teacher's<br/>signature
                 </td>
                 <td className="border border-black p-2"></td>
              </tr>

              {/* Parent Signature */}
              <tr>
                 <td className="border border-black p-2 h-16 align-middle">
                    Parent's<br/>signature
                 </td>
                 <td className="border border-black p-2"></td>
              </tr>

              {/* Verdict of the Jury - ONLY SHOWN IN TERM 3 */}
              {data.term === 'Term 3' && (
              <tr>
                 <td className="border border-black p-2 align-middle bg-slate-50" colSpan={2}>
                    <div className="font-bold underline mb-3 text-xs uppercase">Verdict of the jury:</div>
                    <div className="flex flex-row flex-wrap justify-between items-center px-2 md:px-8 gap-4">
                        
                        {/* Promoted */}
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-black flex items-center justify-center text-lg leading-none bg-white">
                                {isPromoted ? '✓' : ''}
                            </div>
                            <span className="uppercase font-bold text-xs">Promoted</span>
                        </div>

                        {/* Advised to Repeat */}
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-black flex items-center justify-center text-lg leading-none bg-white">
                                {isRepeat ? '✓' : ''}
                            </div>
                            <span className="uppercase font-bold text-xs">Advised to repeat</span>
                        </div>

                        {/* Promoted Elsewhere */}
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-black flex items-center justify-center text-lg leading-none bg-white">
                                {/* Always empty for manual entry unless specific logic is added later */}
                            </div>
                            <span className="uppercase font-bold text-xs">Promoted elsewhere</span>
                        </div>

                    </div>
                 </td>
              </tr>
              )}

              {/* Headmaster */}
              <tr>
                 <td className="border border-black p-2 h-32 align-bottom" colSpan={2}>
                    <div className="flex justify-between items-end px-2">
                       <div>HEADMASTER</div>
                       <div className="text-right">
                          SIGNATURE<br/>AND STAMP
                       </div>
                    </div>
                 </td>
              </tr>
           </tbody>
        </table>

      </div>
    </div>
  );
};