/* LedgerPeer OCR exam adapter v2.
 * Detect complete question blocks instead of treating every "Mark" as a question.
 * Reconcile decimal-loss OCR (2.00 -> 200), keep clear statuses independently,
 * and never invent learner-selected answers or visual information.
 */
(function(root){
'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
function number(str){var n=Number(String(str||'').replace(/,/g,''));return Number.isFinite(n)?n:null;}
function grade(line){
 var m=clean(line).match(/\b(?:mark(?:s|ed|e)?|mar|wark|points?|score)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(?:out\s*(?:of)?|auto|0\s*of|\/|from)\s*(\d+(?:[.,]\d+)?)/i);
 if(!m)return null;
 var earned=number(m[1]),possible=number(m[2]);
 if(earned===null||possible===null||possible<=0||earned<0)return null;
 // OCR may turn 4.00 into 400 against an explicit 10.00 maximum.
 // Retain this possibility only when a /100 scaled mark fits the maximum.
 if(earned>possible&&!(!/[.,]/.test(m[1])&&earned>=100&&earned%100===0&&earned/100<=possible))return null;
 return {earned,possible,earnedToken:m[1],possibleToken:m[2]};
}
function questionNumber(s){
 var m=clean(s).match(/^(?:question|ques(?:tion)?|problem|item|q)\s*(?:no\.?\s*)?#?\s*(\d{1,3})(?:\s*[:.):-]|\s+|(?=[A-Z])|$)/i);
 var n=m?Number(m[1]):null;
 return n>0&&n<=300?n:null;
}
function status(str){
 // Common TYMBAFlex screenshot OCR distortions: "Inconect", "Incorect" and "Corect".
 // Only accept these whole status labels; do not infer a grade from question wording.
 var m=clean(str).replace(/^question\s*\d{1,3}\s*/i,'').match(/^(partially\s+correct|incorrect|inconect|incorect|correct|corect|comet|unanswered|not\s+answered)(?:[.,! ]|$)/i);
 if(!m)return null;
 var label=m[1].toLowerCase().replace(/\s+/g,'_');
 if(label==='inconect'||label==='incorect')return 'incorrect';
 if(label==='corect'||label==='comet')return 'correct';
 return label;
}
function overall(pages){
 var lines=(pages[0]&&pages[0].lines||[]).map(clean),first=lines.findIndex(l=>questionNumber(l)!==null);
 if(first<0)first=Math.min(lines.length,35);
 var limit=lines.slice(0,first);
 for(var i=0;i<limit.length;i++){
   if(!/\b(?:overall\s+(?:grade|score)|final\s+(?:grade|score)|grade|total\s+(?:score|marks))\b/i.test(limit[i]))continue;
   // Do not use a question's Mark field as the exam-grade header.
   if(/\bquestion\s*\d+\b/i.test(limit[i]))continue;
   var text=limit.slice(i,i+3).join(' ');
   var m=text.match(/(?:grade|score|marks)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(?:out\s*of|\/)\s*(\d+(?:[.,]\d+)?)/i);
   if(m)return {earned:number(m[1]),possible:number(m[2]),earnedToken:m[1],possibleToken:m[2]};
 }
 return null;
}
function sourceAnswer(lines){
 for(var i=0;i<lines.length;i++){
   var t=clean(lines[i]);
   var m=t.match(/^(?:the\s+)?correct\s+answers?\s*(?:are|is)\s*:?\s*(.*)$/i);
   if(!m)continue;
   var out=clean(m[1]);if(!out&&lines[i+1])out=clean(lines[i+1]);
   if(!out||/^(?:https?:\/\/|question\s*\d+|your answer is)/i.test(out))return '';
   if(lines[i+2]&&/^debit:/i.test(out)&&/^credit:/i.test(clean(lines[i+2])))out+=' '+clean(lines[i+2]);
   return out.slice(0,850);
 }
 return '';
}
function variants(tok){
 var n=number(tok);if(n===null)return [];
 var choices=[{v:n,scale:1}];
 if(!/[.,]/.test(tok)&&n>=10&&n%10===0)choices.push({v:n/10,scale:10});
 if(!/[.,]/.test(tok)&&n>=100&&n%100===0)choices.push({v:n/100,scale:100});
 return choices;
}
function bestOverall(summary,totalPossible,totalEarned){
 if(!summary)return null;
 var e=variants(summary.earnedToken),p=variants(summary.possibleToken),opts=[];
 e.forEach(function(a){p.forEach(function(b){
   if(b.v>=1&&a.v<=b.v)opts.push({earned:a.v,possible:b.v,scaleEarned:a.scale,scalePossible:b.scale,delta:Math.abs(b.v-totalPossible)+Math.abs(a.v-totalEarned)});
 });});
 opts.sort(function(a,b){return a.delta-b.delta||a.scalePossible-b.scalePossible});
 return opts[0]||null;
}
function parse(pages){
 if(!Array.isArray(pages)||!pages.length)throw new Error('OCR produced no pages.');
 var blocks=[],block=null,lowConfidence=[],warnings=[],ignoredHeaders=0;
 pages.forEach(function(page){
   var lines=Array.isArray(page.lines)?page.lines:[];
   if(Number.isFinite(page.ocrConfidence)&&page.ocrConfidence<65)lowConfidence.push(page.number);
   for(var i=0;i<lines.length;i++){
     var text=clean(lines[i]);if(!text)continue;
     var n=questionNumber(text);
     if(n!==null){
       // Repeated running headers or question citations must not become new items.
        // A heading with an OCR-distorted status/mark line still starts a new question.
        // Never absorb it into the preceding answer block (Q19 -> Q20 regression).
        var following=lines.slice(i+1,i+8).some(function(x){return status(x)!==null||grade(x)!==null;});
        var anchors=root.LedgerPeerPdfLayout&&page.layout?
          root.LedgerPeerPdfLayout.candidateAnchors(page):[];
        var spatial=anchors.some(function(a){return a.qno===n});
        var sequential=block?n===block.n+1:n===1;
        var bodyEvidence=lines.slice(i+1,i+8).some(function(x){
          return clean(x).split(/\s+/).length>=4&&
            questionNumber(x)===null&&!/^https?:/i.test(x);
        });
        if(!following&&!(spatial&&sequential&&bodyEvidence)){
          ignoredHeaders++;if(block){block.text.push({text,page:page.number});block.pages.add(page.number);}continue;
        }
       if(block&&block.n===n&&block.pages.has(page.number)){block.text.push({text,page:page.number});continue;}
       block={n,text:[],pages:new Set([page.number]),heading:text};
       blocks.push(block);
     }else if(block){
       block.text.push({text,page:page.number});block.pages.add(page.number);
     }
   }
 });
 if(!blocks.length)throw new Error('OCR found no independently numbered question panels.');
 var seen=new Set(),duplicate=[],raw=[],maxExplicit=[];
 blocks.forEach(function(b){
   if(seen.has(b.n)){duplicate.push(b.n);return;}seen.add(b.n);
   var lines=b.text.map(function(x){return x.text;});
   var first=lines.slice(0,8),marks=first.map(grade).filter(Boolean),mark=marks[0]||null;
   var ss=status(b.heading);
   if(!ss)for(var k=0;k<first.length&&k<5;k++){ss=status(first[k]);if(ss)break;}
   if(mark&&/[.,]/.test(mark.possibleToken))maxExplicit.push(mark.possible);
   raw.push({n:b.n,lines,mark,ss,pages:Array.from(b.pages).sort(function(a,b){return a-b}),heading:b.heading});
 });
 if(duplicate.length)warnings.push('Duplicate question headings were excluded: '+Array.from(new Set(duplicate)).join(', ')+'.');
 var reference=null;
 if(maxExplicit.length){
   var freq={};maxExplicit.forEach(function(x){freq[x]=(freq[x]||0)+1;});
   reference=Number(Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];})[0]);
 }
 var summary=overall(pages);
 var guessPossibleTotal=raw.length*reference,hasReference=Number.isFinite(reference)&&reference>0;
 function marksFor(item){
   var m=item.mark;if(!m)return null;
   var pv=variants(m.possibleToken),ev=variants(m.earnedToken),target=hasReference?reference:(summary&&summary.possible>=1?summary.possible/raw.length:Math.min(5,m.possible));
   // Exact tokens retain their decimals. A missing decimal in '200' may
   // represent '2.00', but infer scaling only when the candidate fits the
   // document's other clear mark denominations.
   var p=pv.slice().sort(function(a,b){return Math.abs(a.v-target)-Math.abs(b.v-target)||a.scale-b.scale})[0];
   if(!p)return null;
   var e=ev.filter(function(x){return x.v<=p.v+1e-6}).sort(function(a,b){
     var expected=item.ss==='correct'?p.v:item.ss==='incorrect'?0:item.ss==='partially_correct'?p.v/2:Math.min(p.v,m.earned);
     return Math.abs(a.v-expected)-Math.abs(b.v-expected)||a.scale-b.scale;
   })[0];
   if(!e)return null;
   return {earned:e.v,possible:p.v,uncertain:(!hasReference&&!summary&&p.scale!==1)};
 }
 var entries=raw.map(function(q){return Object.assign({},q,{markValue:marksFor(q)});});
 var got=entries.filter(function(x){return x.markValue;});
 var sum=got.reduce(function(a,q){return a+q.markValue.earned;},0),
     total=got.reduce(function(a,q){return a+q.markValue.possible;},0);
 sum=Math.round(sum*100)/100;total=Math.round(total*100)/100;
 var overallBest=bestOverall(summary,total,sum),reconciled=!!(overallBest&&got.length===raw.length&&
    Math.abs(overallBest.earned-sum)<.011&&Math.abs(overallBest.possible-total)<.011);
 var questions=entries.map(function(q){
   var gradeVal=q.markValue,ss=q.ss;
   var consistent=!!gradeVal&&(
      !ss||ss==='correct'&&Math.abs(gradeVal.earned-gradeVal.possible)<.001||
      ss==='incorrect'&&gradeVal.earned<gradeVal.possible||
      ss==='partially_correct'&&gradeVal.earned>0&&gradeVal.earned<gradeVal.possible||
      (ss==='not_answered'||ss==='unanswered')&&gradeVal.earned===0
   );
   if(gradeVal&&!consistent)warnings.push('Q'+q.n+': OCR status and marks disagree; marks withheld.');
   var outcome=ss==='correct'?true:ss==='incorrect'||ss==='partially_correct'||ss==='unanswered'||ss==='not_answered'?false:
        consistent?Math.abs(gradeVal.earned-gradeVal.possible)<.001:null;
   if(!consistent&&gradeVal)outcome=null;
   var text=q.lines.slice();
   // Remove only the grade/state header, never the answer or a diagram description.
   while(text.length&&(/^\s*(?:correct|incorrect|partially correct|not answered|unanswered)\s*$/i.test(text[0])||grade(text[0])))text.shift();
   text=text.filter(function(t){return !/^https?:\/\/.*(?:attempt|review\.php)/i.test(t)&&!(/^\s*\d+\s*\/\s*\d+\s*$/.test(t));});
   var ans=sourceAnswer(text);
   var correctFeedback=text.some(function(x){return /^your answer is correct\b/i.test(x);});
   var chosen=null;
   for(var j=0;j<text.length;j++){
     var selected=text[j].match(/^(?:your|student|selected)\s+(?:answer|response|choice)\s*[:=]\s*(.+)$/i);
     if(selected){chosen=clean(selected[1]);break;}
   }
   if(!chosen&&outcome===true&&correctFeedback&&ans)chosen=ans;
   var body=text.filter(function(line){return !/^your answer is (?:correct|incorrect|partially correct)\b/i.test(line);}).join('\n');
   if(!body.trim())body='[Question wording not extracted; open the original PDF page.]';
   return {
     qno:q.n,source_pdf_pages:q.pages,source_format:'pdf',ocr_extracted:true,
     qtext:'<p>'+esc(body).replace(/\n/g,'</p><p>')+'</p>',
     options:[],your_answer:chosen?esc(chosen):null,correct_answer:ans,
     is_correct:outcome,source_result:ss|| (outcome===true?'correct':outcome===false?'incorrect':'unverified'),
     original_marks:consistent&&!gradeVal.uncertain?gradeVal.earned:null,
     original_max_marks:consistent&&!gradeVal.uncertain?gradeVal.possible:null,
     provisional_marks:gradeVal&&gradeVal.earned,provisional_max_marks:gradeVal&&gradeVal.possible,
     debrief:'',fb_is_custom:false,
     answer_capture_status:chosen?'captured':'not_captured',
     visual_verification_required:true,
     ocr_confidence:pages.find(function(p){return p.number===q.pages[0]})?.ocrConfidence||null,
     needs_visual_check:/\b(chart|diagram|figure|graph|table|shown below)\b/i.test(body)
   };
 });
 if(!reconciled)warnings.push('Overall score not fully reconciled. Reliable question-level results remain available; unsupported marks are not invented.');
 if(lowConfidence.length)warnings.push('Low-confidence OCR page(s): '+lowConfidence.join(', ')+'.');
 var unknown=questions.filter(function(q){return q.is_correct===null;}).length;
 if(unknown)warnings.push(unknown+' question(s) have uncertain grades and remain unscored.');
 var unanswered=questions.filter(function(q){return q.source_result==='not_answered'||q.source_result==='unanswered';}).length;
 var unresolved=questions.filter(function(q){return !q.your_answer&&q.source_result!=='not_answered'&&q.source_result!=='unanswered';}).length;
 if(unresolved)warnings.push(unresolved+' question(s) have no proven selected-answer evidence. They may be unanswered or visually unreadable; do not assume either.');
 if(unanswered)warnings.push(unanswered+' question(s) are explicitly marked unanswered in the original review.');
 if(ignoredHeaders)warnings.push(ignoredHeaders+' ungraded question references were ignored.');
 return {questions,warnings,reconciliation:reconciled?
     {questions:questions.length,originalEarned:overallBest.earned,originalPossible:overallBest.possible,
      extractedEarned:sum,extractedPossible:total,source:'ocr-reconciled'}:null,
   partialGrading:!!got.length,extractionConfidence:{questionCount:questions.length,
     statusCount:questions.filter(function(q){return q.source_result!=='unverified';}).length,
     marksCount:questions.filter(function(q){return q.original_marks!==null;}).length,
     sourceGrade:summary&&{earned:summary.earned,possible:summary.possible}}};
}
root.LedgerPeerOcrParser={parse,grade,questionNumber,overall};
})(window);