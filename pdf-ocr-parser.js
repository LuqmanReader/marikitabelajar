/* Conservative OCR mark parser. Never treats image OCR as verified answer selection.
   Grade records are numbered sequentially only when their totals reconcile to the source. */
(function(root){
'use strict';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function clean(s){return String(s||'').replace(/[ \t]+/g,' ').trim();}
function grade(line){
 var m=String(line||'').match(/^\s*[‘'“"(\s]*Mark\s*:?\s*([\d,.]+)\s*(?:out\s*of|\/)\s*([\d,.]+)\s*[.)]?\s*$/i);
 if(!m)return null;
 var earned=Number(m[1].replace(/,/g,'')),possible=Number(m[2].replace(/,/g,''));
 return Number.isFinite(earned)&&Number.isFinite(possible)&&possible>0&&earned>=0&&earned<=possible?{earned:earned,possible:possible}:null;
}
function status(line){
 var m=String(line||'').match(/^\s*[‘'“"(\s]*(partially\s+correct|incorrect|correct|not\s+answered|unanswered)\s*[.)]?\s*$/i);
 return m?m[1].replace(/\s+/g,'_').toLowerCase():null;
}
function numberNear(lines,markIndex){
 var start=Math.max(0,markIndex-7),heading=null,headIndex=-1;
 for(var i=start;i<markIndex;i++){
   var m=String(lines[i]).match(/(?:^|[‘'“"\s])(?:question|quest(?:ion)?\s*no\.?)\s*[:.#-]?\s*(\d{1,3})(?:\D|$)/i);
   if(m){heading=Number(m[1]);headIndex=i;}
 }
 return {heading:heading,headIndex:headIndex};
}
function mainScore(pages){
 if(!pages.length)return null;
 var raw=pages[0].lines.join('\n'),m=[...raw.matchAll(/([\d,]+(?:\.\d+)?)\s*out\s*of\s*([\d,]+(?:\.\d+)?)/gi)]
   .map(function(x){return {earned:Number(x[1].replace(/,/g,'')),possible:Number(x[2].replace(/,/g,''))};})
   .filter(function(x){return x.possible>=10&&x.earned>=0&&x.earned<=x.possible;})
   .sort(function(a,b){return b.possible-a.possible;});
 return m.length?m[0]:null;
}
function nextBeginning(lines,markIndex){
 var start=Math.max(0,markIndex-9),stateIndex=-1;
 for(var i=start;i<markIndex;i++)if(status(lines[i]))stateIndex=i;
 if(stateIndex===-1)return Math.max(start,markIndex-3);
 for(var j=Math.max(start,stateIndex-4);j<stateIndex;j++)
   if(/\bquest(?:ion)?\b|^[‘'“"\s]*q(?:uestion)?\s*\d{1,3}\b/i.test(lines[j]))return j;
 return Math.max(start,stateIndex-2);
}
function answerFrom(lines){
 var out='';
 for(var i=0;i<lines.length;i++){
   var m=String(lines[i]).match(/^\s*[‘'“"\s]*(?:the\s+)?correct\s+answers?\s+(?:are|is)\s*:?\s*(.*)$/i);
   if(!m)continue;
   out=clean(m[1]||'');
   if(!out&&i+1<lines.length)out=clean(lines[i+1]);
   break;
 }
 if(/^https?:\/\/|^question\s*\d+/i.test(out))return '';
 return out.slice(0,450);
}
function parse(pages){
 if(!Array.isArray(pages)||!pages.length)throw new Error('OCR produced no pages.');
 var flat=[],warnings=[],recognized=0,lowConfidence=[];
 pages.forEach(function(page){
   var lines=Array.isArray(page.lines)?page.lines:[];
   if(Number.isFinite(page.ocrConfidence)&&page.ocrConfidence<65&&lines.some(function(x){return /Question|Mark/i.test(x);}))lowConfidence.push(page.number);
   var marks=[];
   lines.forEach(function(line,i){var g=grade(line);if(g)marks.push({index:i,earned:g.earned,possible:g.possible});});
   marks.forEach(function(rec,j){
     var head=numberNear(lines,rec.index);
     var begin=rec.index+1,end=j+1<marks.length?nextBeginning(lines,marks[j+1].index):lines.length;
     var body=lines.slice(begin,Math.max(begin,end));
     // Drop browser-print footer (URL/page number), not the question data.
     var footer=body.findIndex(function(x){return /^\s*(?:https?:\/\/|www\.)/i.test(x)||/^\s*\d+\s*\/\s*\d+\s*$/.test(x);});
     if(footer>=0)body=body.slice(0,footer);
     var statusFound=null;
     for(var k=Math.max(0,rec.index-6);k<rec.index;k++){var candidate=status(lines[k]);if(candidate)statusFound=candidate;}
     flat.push({page:page.number,earned:rec.earned,possible:rec.possible,header:head.heading,status:statusFound,lines:body,confidence:page.ocrConfidence});
   });
 });
 if(!flat.length)throw new Error('OCR could not identify marked question records. Do not import this PDF as graded data.');
 if(flat.length>300)throw new Error('OCR found too many grading records; confirm the original marked attempt.');
 var overall=mainScore(pages),sum=flat.reduce(function(a,q){return a+q.earned;},0),max=flat.reduce(function(a,q){return a+q.possible;},0);
 sum=Math.round(sum*100)/100;max=Math.round(max*100)/100;
 if(!overall)throw new Error('OCR found individual marks but could not verify the overall grade. Use a marked HTML export or a clearer PDF.');
 if(Math.abs(overall.earned-sum)>0.011||Math.abs(overall.possible-max)>0.011)
   throw new Error('OCR grade reconciliation failed: extracted '+sum+'/'+max+' but original header says '+overall.earned+'/'+overall.possible+'. Import blocked to prevent inaccurate marks.');
 var missingHeads=[],conflicts=[],questions=flat.map(function(item,i){
   var n=i+1;
   if(item.header!==null){
     recognized++;
     if(item.header!==n){conflicts.push('Q'+n+': OCR heading appears as Question '+item.header+'; page '+item.page);}
   }else missingHeads.push(n);
   var inferred=item.earned>=item.possible,partial=item.earned>0&&item.earned<item.possible;
   if(item.status==='correct'&&!inferred||item.status==='incorrect'&&inferred||item.status==='partially_correct'&&!partial)
     conflicts.push('Q'+n+': OCR status and numeric mark disagree on page '+item.page+'.');
   var body=item.lines.map(clean).filter(Boolean);
   var chartLike=body.some(function(line){return /\b(chart|graph|figure|diagram|shown below|illustration|table)\b/i.test(line);});
   return {
     qno:n,is_correct:inferred,source_result:partial?'partially_correct':inferred?'correct':'incorrect',
     qtext:'<p>'+esc(body.join('\n')).replace(/\n/g,'</p><p>')+'</p>',
     options:[],your_answer:null,
     correct_answer:answerFrom(body),
     debrief:'',original_marks:item.earned,original_max_marks:item.possible,
     source_pdf_pages:[item.page],source_format:'pdf',visual_verification_required:true,
     answer_capture_status:'not_captured',
     ocr_extracted:true,ocr_confidence:typeof item.confidence==='number'?item.confidence:null,
     needs_visual_check:chartLike,
     fb_is_custom:false
   };
 });
 if(conflicts.length)throw new Error('OCR question alignment is uncertain: '+conflicts.slice(0,3).join(' ')+' Import blocked; original PDF must be verified.');
 warnings.push('OCR source: exam grades reconciled '+sum+'/'+max+' across '+flat.length+' graded questions. Answer selections, OCR text and figures remain unverified.');
 if(missingHeads.length)warnings.push('Question headings not reliably read for '+missingHeads.length+' questions. Sequential positions were used ONLY because all extracted marks reconcile with the original overall grade.');
 if(lowConfidence.length)warnings.push('Low-confidence OCR pages: '+lowConfidence.join(', ')+'. Review the PDF originals carefully.');
 warnings.push('PDF OCR does not reliably identify selected radio buttons or handwritten marks; no learner answer choice was invented.');
 return {questions:questions,warnings:warnings,reconciliation:{questions:flat.length,originalEarned:overall.earned,originalPossible:overall.possible,extractedEarned:sum,extractedPossible:max,headingsRecognized:recognized,lowConfidencePages:lowConfidence,source:'ocr'}};
}
root.LedgerPeerOcrParser={parse:parse,grade:grade};
})(window);
