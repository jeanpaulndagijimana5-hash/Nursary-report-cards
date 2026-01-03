
import React from 'react';
import { ReportCardData } from '../types';
import { getGrade } from '../constants';
import { getSchoolConfig } from '../services/storageService';

interface ReportCardProps {
  data: ReportCardData;
  logoUrl?: string;
  headmasterName?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({ data, logoUrl, headmasterName }) => {
  const { student, marks, year, term } = data;
  const schoolConfig = getSchoolConfig();
  
  // Helper to get score for a specific subject name and term
  const getScoreByTerm = (subjectName: string, targetTerm: string) => {
    const mark = marks.find(m => m.subjectName === subjectName && m.term === targetTerm);
    return mark ? mark.score : null;
  };

  // Helper to calculate annual average for a subject
  const getAnnualAverage = (subjectName: string) => {
    const t1 = getScoreByTerm(subjectName, 'Term 1');
    const t2 = getScoreByTerm(subjectName, 'Term 2');
    const t3 = getScoreByTerm(subjectName, 'Term 3');
    const scores = [t1, t2, t3].filter((s): s is number => s !== null);
    if (scores.length === 0) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const coreSubjects = [
    'NUMERACY', 'LITERACY', 'DISCOVERY OF THE WORLD', 'CREATIVE ARTS AND CRAFT',
    'HEALTH AND PHYSICAL EDUCATION', 'ORAL', 'SOCIAL AND EMOTIONALLY DEVELOPMENT', 'CONDUCT'
  ];
  
  // Logic for checkboxes based on decision string
  const decisionText = data.annualStats?.decision?.toLowerCase() || '';
  const isPromoted = decisionText.includes('promoted');
  const isRepeat = decisionText.includes('repeat');
  
  const displayTerm = term.replace(/Term\s+/i, '');
  const isTerm3 = term === 'Term 3';
  
  return (
    <div className="bg-white p-4 max-w-3xl mx-auto w-full text-black font-sans text-sm">
      {/* Outer Border */}
      <div className="border-4 border-black p-1">
        
        {/* Header Section */}
        <div className="border-b-2 border-black pb-2 mb-2">
           <div className="flex items-center justify-between mt-2 mb-2 gap-4">
              {/* Address and Motto Container (Left) */}
              <div className="text-left flex-1 px-2">
                 <div className="flex flex-col gap-0.5 text-indigo-900 font-bold uppercase tracking-tight text-xs md:text-sm">
                    {schoolConfig.district && <div>District: {schoolConfig.district}</div>}
                    {schoolConfig.sector && <div>Sector: {schoolConfig.sector}</div>}
                    {schoolConfig.cell && <div>Cell: {schoolConfig.cell}</div>}
                    {schoolConfig.phone && <div className="text-blue-800">Tel: {schoolConfig.phone}</div>}
                 </div>
                 {schoolConfig.motto && (
                   <div className="text-lg md:text-xl font-black text-green-700 italic tracking-tight mt-2 leading-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                      "{schoolConfig.motto}"
                   </div>
                 )}
              </div>

              {/* Logo Container (Right) */}
              <div className="h-28 w-32 flex-shrink-0 flex items-center justify-center">
                 {logoUrl ? (
                   <img src={logoUrl} alt="School Logo" className="w-full h-full object-contain" />
                 ) : (
                   <div className="w-full h-full border border-black flex items-center justify-center bg-slate-100">
                      <span className="text-[10px] text-center text-slate-500 font-bold uppercase">SCHOOL<br/>LOGO</span>
                   </div>
                 )}
              </div>
           </div>

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
           
           <div className="mt-2 flex gap-2 font-bold text-sm uppercase">
              <span>Academic Year:</span>
              <span className="flex-1 border-b border-black border-dashed px-2">{year}</span>
           </div>

           <div className="mt-2 text-center font-bold text-sm uppercase">
              <span className="mr-2">Term:</span>
              <span className="inline-block border-b border-black border-dashed px-8 min-w-[150px]">{displayTerm}</span>
           </div>
        </div>

        <div className="border-2 border-black text-center font-bold uppercase py-1 mb-1 text-sm bg-slate-100">
           PERIODIC PROGRESS REPORT
        </div>

        {/* Grades Table */}
        <table className="w-full border-collapse border-2 border-black text-sm font-bold mb-2">
           <thead>
              <tr className="bg-white">
                 <th className="border border-black p-2 text-left uppercase">COURSES</th>
                 {isTerm3 ? (
                   <>
                     <th className="border border-black p-1 text-center text-[10px] w-12">T1</th>
                     <th className="border border-black p-1 text-center text-[10px] w-12">T2</th>
                     <th className="border border-black p-1 text-center text-[10px] w-12">T3</th>
                     <th className="border border-black p-1 text-center text-[10px] w-16">ANNUALLY</th>
                   </>
                 ) : (
                   <th className="border border-black p-2 text-center w-1/4 uppercase">GRADE</th>
                 )}
              </tr>
           </thead>
           <tbody>
              <tr>
                 <td className="border border-black p-2 bg-slate-100 uppercase" colSpan={isTerm3 ? 5 : 2}>CORE COURSES</td>
              </tr>

              {coreSubjects.map(sub => {
                 if (isTerm3) {
                    const g1 = getScoreByTerm(sub, 'Term 1') !== null ? getGrade(getScoreByTerm(sub, 'Term 1')!) : null;
                    const g2 = getScoreByTerm(sub, 'Term 2') !== null ? getGrade(getScoreByTerm(sub, 'Term 2')!) : null;
                    const g3 = getScoreByTerm(sub, 'Term 3') !== null ? getGrade(getScoreByTerm(sub, 'Term 3')!) : null;
                    const annualAvg = getAnnualAverage(sub);
                    const gAnnual = typeof annualAvg === 'number' ? getGrade(annualAvg) : null;
                    
                    return (
                       <tr key={sub}>
                          <td className="border border-black p-2 text-[11px] leading-tight">{sub}</td>
                          {[g1, g2, g3].map((g, idx) => (
                            <td key={idx} className="border border-black p-0 h-10 w-12">
                               {g ? <div className={`w-full h-full ${g.color}`} style={{ minHeight: '2.5rem' }}></div> : <div className="text-center text-slate-200 py-2">-</div>}
                            </td>
                          ))}
                          <td className="border border-black p-0 h-10 w-16 bg-slate-50">
                             {gAnnual ? <div className={`w-full h-full ${gAnnual.color}`} style={{ minHeight: '2.5rem' }}></div> : <div className="text-center text-slate-200 py-2">-</div>}
                          </td>
                       </tr>
                    );
                 } else {
                    const mark = marks.find(m => m.subjectName === sub);
                    const score = mark ? mark.score : null;
                    const gradeInfo = typeof score === 'number' ? getGrade(score) : null;
                    return (
                       <tr key={sub}>
                          <td className="border border-black p-2 text-[11px] leading-tight">{sub}</td>
                          <td className="border border-black p-0 h-10">
                             {gradeInfo ? <div className={`w-full h-full ${gradeInfo.color}`} style={{ minHeight: '2.5rem' }}></div> : <div className="text-center text-slate-200 py-2">-</div>}
                          </td>
                       </tr>
                    );
                 }
              })}
           </tbody>
        </table>

        {/* Footer section - Ranks, Decision, Signatures */}
        <div className="border-2 border-black">
           
           <div className="p-2 border-b border-black">
              <div className="flex flex-col gap-1">
                 <div className="uppercase underline mb-1 text-[11px] font-bold">RANKS KEY:</div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-bold">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-green-300 border border-black inline-block"></span>
                       <span>90-100: Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-blue-300 border border-black inline-block"></span>
                       <span>70-89: Very Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-yellow-300 border border-black inline-block"></span>
                       <span>50-69: Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-red-300 border border-black inline-block"></span>
                       <span>0-49: Fail</span>
                    </div>
                 </div>
              </div>
           </div>

           {isTerm3 && (
           <div className="p-2 border-b border-black bg-slate-50 flex items-center gap-6">
              <span className="font-bold underline text-xs uppercase">Verdict of the jury:</span>
              <div className="flex gap-4 text-[10px] font-bold uppercase">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-black flex items-center justify-center bg-white">{isPromoted ? '✓' : ''}</div> Promoted
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-black flex items-center justify-center bg-white">{isRepeat ? '✓' : ''}</div> Advised to repeat
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-black flex items-center justify-center bg-white"></div> Promoted elsewhere
                 </div>
              </div>
           </div>
           )}

           {/* Dynamic Signatures based on Term */}
           <div className="p-2 space-y-4">
              <div className="flex items-center gap-4">
                 <span className="uppercase font-bold text-[11px] w-40">Teacher's signature:</span>
                 {isTerm3 ? (
                    <div className="flex gap-2 flex-1 h-12">
                       <div className="border border-black flex-1 relative"><span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-bold uppercase">T1</span></div>
                       <div className="border border-black flex-1 relative"><span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-bold uppercase">T2</span></div>
                       <div className="border border-black flex-1 relative"><span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-bold uppercase">T3</span></div>
                    </div>
                 ) : (
                    <div className="border border-black flex-1 h-12 relative">
                       <span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-bold uppercase">{displayTerm}</span>
                    </div>
                 )}
              </div>
              <div className="flex items-center gap-4">
                 <span className="uppercase font-bold text-[11px] w-40">Parent's signature:</span>
                 {isTerm3 ? (
                    <div className="flex gap-2 flex-1 h-12">
                       <div className="border border-black flex-1 relative"><span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-bold uppercase">T1</span></div>
                       <div className="border border-black flex-1 relative"><span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-bold uppercase">T2</span></div>
                       <div className="border border-black flex-1 relative"><span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-bold uppercase">T3</span></div>
                    </div>
                 ) : (
                    <div className="border border-black flex-1 h-12 relative">
                       <span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-bold uppercase">{displayTerm}</span>
                    </div>
                 )}
              </div>
           </div>

           <div className="p-4 border-t border-black h-24 flex justify-between items-end">
              <div>
                 <div className="text-[10px] font-bold uppercase mb-4">HEADMASTER</div>
                 <div className="font-bold text-lg uppercase border-b border-black min-w-[200px]">{headmasterName || '........................................'}</div>
              </div>
              <div className="text-[9px] font-bold uppercase pb-1 opacity-20">Signature and Stamp</div>
           </div>
        </div>

      </div>
    </div>
  );
};
