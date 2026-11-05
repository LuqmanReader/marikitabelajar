/* Universal document reader: reconstructs a page-oriented semantic text model
   irrespective of exam provider. Never invents marks or learner selections.
   Grade-specific adapters can be added separately from document conversion. */
(function(root){
'use strict';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
const headingPatterns=[
 /^(?:question|problem|item|exercise|task|ques(?:tion)?|q)\s*(?:no\.?|number|#)?\s*[:.#-]?\s*(\d{1,3})(?:\s*[:.)-]|\s+|$)/i,
 /^(\d{1,3})\s*[.)]\s+(?=\S)/ 
];
function questionHeading(line){
 line=clean(line);
 for(const re of headingPatterns){let m=line.match(re);if(m){let n=Number(m[1]);if(n>=1&&n<=300)return n;}}
 return null;
}
function gradeValue(line){
 let a=clean(line);
 let patterns=[
   /^(?:marks?|grade|points?|score)\s*(?:awarded|earned|received)?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:out\s+of|\/)\s*(\d+(?:\.\d+)?)(?:\s+(?:marks?|points?))?$/i,
   /^(?:awarded|earned|received)\s*(\d+(?:\.\d+)?)\s*(?:out\s+of|\/)\s*(\d+(?:\.\d+)?)(?:\s+(?:marks?|points?))?$/i,
   /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*(?:marks?|points?)$/i
 ];
 for(let p of patterns){let m=a.match(p);if(m){let n=Number(m[1]),d=Number(m[2]);if(d>0&&n>=0&&n<=d)return {earned:n,possible:d};}}
 return null;
}
function overallScore(pages){
 const matches=[],labels=/(?:final|overall|total|grade|result|score)/i;
 for(let page of pages.slice(0,3)){
   const lines=Array.isArray(page.lines)?page.lines:[];
   lines.forEach((line,i)=>{
     let m=clean(line).match(/(\d+(?:\.\d+)?)\s*(?:out\s+of|\/)\s*(\d+(?:\.\d+)?)/i);
     if(!m)return;
     let n=Number(m[1]),d=Number(m[2]);
     if(n<0||d<10||n>d)return;
     const neighborhood=lines.slice(Math.max(0,i-2),Math.min(lines.length,i+2)).join(' ');
     if(labels.test(neighborhood))matches.push({earned:n,possible:d,page:page.number||1});
   });
 }
 matches.sort((a,b)=>b.possible-a.possible);
 return matches[0]||null;
}
function htmlText(lines){
 if(!lines.length)return '<p class="lp-empty">No readable text recovered from this question. Open the source page.</p>';
 return lines.map(line=>'<p>'+esc(line)+'</p>').join('');
}
function parse(pages){
 if(!Array.isArray(pages)||!pages.length)throw new Error('No document pages available.');
 let blocks=[],current=null,allText=0,warnings=[],unheaded=0;
 pages.forEach(page=>{
   const lines=Array.isArray(page.lines)?page.lines:[];
   lines.forEach(line=>{
     let t=clean(line);if(!t)return;allText++;
     let id=questionHeading(t);
     if(id!==null){
       current={qno:id,lines:[t],pages:new Set([page.number]),grads:[],status:[],source:'generic'};
       blocks.push(current);
     }else if(current){
       current.lines.push(t);current.pages.add(page.number);
     }else unheaded++;
   });
 });
 let questions=[],reliableGrades=0,duplicates=new Set(),seen=new Set(),conflicts=0;
 blocks.forEach(b=>{
   if(seen.has(b.qno)){duplicates.add(b.qno);return;} seen.add(b.qno);
   let markRecords=b.lines.map(gradeValue).filter(Boolean),mark=markRecords.length===1?markRecords[0]:null;
   if(markRecords.length>1){conflicts++;warnings.push('Question '+b.qno+' has multiple possible marks; grading not assumed.');}
   let student=null,answer=null,answerCapture='not_captured';
   for(const line of b.lines){
     const sm=line.match(/^(?:your|student|learner|selected)\s+(?:answer|response|choice)\s*[:=-]\s*(.+)$/i);
     if(sm){student=sm[1];answerCapture='captured';}
     const am=line.match(/^(?:correct answer|answer key|model answer|expected answer)\s*[:=-]\s*(.+)$/i);
     if(am)answer=am[1];
   }
   // A question-level percentage may not be the exam mark. Mark remains untrusted
   // without an overall source-grade reconciliation.
   if(mark)reliableGrades++;
   questions.push({
     qno:b.qno,qtext:htmlText(b.lines),options:[],
     your_answer:student?esc(student):null,correct_answer:answer||'',
     is_correct:null,source_result:'unverified',original_marks:null,original_max_marks:null,
     provisional_marks:mark?mark.earned:null,provisional_max_marks:mark?mark.possible:null,
     source_pdf_pages:Array.from(b.pages).sort((x,y)=>x-y),
     source_format:'pdf',document_reconstruction:true,
     answer_capture_status:answerCapture,visual_verification_required:true,
     debrief:'',fb_is_custom:false
   });
 });
 const sum=questions.reduce((n,q)=>n+(q.provisional_marks||0),0),
       total=questions.reduce((n,q)=>n+(q.provisional_max_marks||0),0),
       original=overallScore(pages);
 const unique=questions.length===blocks.length;
 // Grade *only* complete, unambiguous, uniquely numbered sets whose totals
 // match the original. If not, conversion remains available but no scores are asserted.
 const verified=unique&&original&&reliableGrades===questions.length&&questions.length>0&&
   Math.abs(sum-original.earned)<.01&&Math.abs(total-original.possible)<.01&&!conflicts;
 if(verified)questions.forEach(q=>{
   q.original_marks=q.provisional_marks;
   q.original_max_marks=q.provisional_max_marks;
   q.is_correct=q.original_marks===q.original_max_marks;
   q.source_result=q.original_marks===q.original_max_marks?'correct':q.original_marks===0?'incorrect':'partially_correct';
 });
 if(duplicates.size)warnings.push('Duplicate question numbers: '+[...duplicates].join(', ')+'. Original page images should be checked.');
 if(!blocks.length)warnings.push('No identifiable question numbers. PDF conversion is available, but graded exam import is not.');
 if(!verified)warnings.push('No verified grade reconciliation for this document. Any visible question scores are provisional and excluded from saved exam grading.');
 if(!allText)warnings.push('No selectable or OCR text was recovered. HTML will preserve the page images.');
 if(unheaded)warnings.push('Text outside identifiable questions is preserved in the document page view, not assigned to a question.');
 warnings.push('Question boundaries, multi-column layouts, charts and tables may need source verification.');
 return {
   questions,warnings,graded:!!verified,
   reconciliation:verified?{source:'generic-reconciled',questions:questions.length,originalEarned:original.earned,originalPossible:original.possible,extractedEarned:sum,extractedPossible:total}:null,
   document:{type:'pdf',pages:pages.length,textLines:allText,unassignedLines:unheaded,questionsDetected:blocks.length,questionNumbersUnique:unique,verifiedGrade:!!verified}
 };
}
root.LedgerPeerUniversalDocument={parse,questionHeading,gradeValue,overallScore};
})(window);
