/* Local-only repair for old OCR imports affected by lost decimal points.
   NO AI requests. Only updates recorded grades when original archived PDF text
   gives a complete, internally reconciled question set. Manual JSON is separate. */
(function(root){
'use strict';
var running=false;
function saved(id){try{return JSON.parse(localStorage.getItem('tymba_exam_data:'+id)||'[]');}catch(e){return [];}}
function attempts(){try{return JSON.parse(localStorage.getItem('tymba_custom_exams')||'[]');}catch(e){return [];}}
function note(message){
 var target=document.getElementById('ocrRepairNotice');
 if(!target){
   var host=document.getElementById('markSourceSummary')||document.getElementById('questionsHeading');
   if(!host)return;
   target=document.createElement('p');target.id='ocrRepairNotice';
   target.style.cssText='font:700 11px/1.5 ui-monospace,monospace;border-left:3px solid #111;padding:8px;margin:10px 0';
   host.insertAdjacentElement('afterend',target);
 }
 target.textContent=message;
}
function pagesFromConvertedHtml(html){
 var doc=new DOMParser().parseFromString(html,'text/html');
 return Array.from(doc.querySelectorAll('section.page')).map(function(section,index){
   var number=Number((section.id||'').replace(/^page-/,''))||index+1;
   var wrapper=section.querySelector('.page-text');
   var lines=wrapper?Array.from(wrapper.querySelectorAll('p')).map(function(p){return p.textContent.trim();}).filter(Boolean):[];
   if(!lines.length){
     var legacy=section.querySelector('details pre');
     if(legacy)lines=String(legacy.textContent||'').split(/\r?\n/).map(function(t){return t.trim();}).filter(Boolean);
   }
   return {number:number,lines:lines,ocrConfidence:null};
 }).filter(function(p){return p.lines.length;});
}
async function ensureParser(){
 if(root.LedgerPeerOcrParser)return;
 await new Promise(function(resolve,reject){
   var tag=document.createElement('script');
   tag.src='pdf-ocr-parser.js?v=20261110-q20-boundary1';
   tag.onload=function(){root.LedgerPeerOcrParser?resolve():reject(new Error('OCR repair parser not available'));};
   tag.onerror=function(){reject(new Error('Unable to load OCR repair parser'));};
   document.head.appendChild(tag);
 });
}
async function repair(){
 if(running)return false;
 var id=new URLSearchParams(location.search).get('id');
 if(!id)return false;
 var list=saved(id),all=attempts(),meta=all.find(function(x){return x&&x.id===id;});
 if(!meta||!meta.ocrUsed||!/^pdf/.test(meta.sourceType||'')||list.length<2||meta.ocrRepairVersion>=3)return false;
 var originalGraded=list.filter(function(q){return typeof q.is_correct==='boolean';}).length;
 if(originalGraded>=Math.ceil(list.length*.8))return false;
 if(!root.LedgerPeerPdfProof||typeof root.LedgerPeerPdfProof.getHtml!=='function')return false;
 running=true;
 try{
   if(root.PersonalHubAuth&&typeof root.PersonalHubAuth.ready==='function')await root.PersonalHubAuth.ready();
   var archive=await root.LedgerPeerPdfProof.getHtml(id);
   if(!archive)return false;
   var pages=pagesFromConvertedHtml(await archive.text());
   if(!pages.length)return false;
   await ensureParser();
   var extracted=root.LedgerPeerOcrParser.parse(pages);
   // Never automatically modify marks without an independently verified total.
   if(!extracted.reconciliation||!Array.isArray(extracted.questions)||extracted.questions.length!==list.length)return false;
   var fixes=extracted.questions;
   var verified=fixes.filter(function(q){return Number.isFinite(q.original_marks)&&Number.isFinite(q.original_max_marks)&&q.original_max_marks>0;}).length;
   if(verified<Math.ceil(fixes.length*.95)||verified<=originalGraded)return false;
   var lookup=new Map(list.map(function(q){return [Number(q.qno),q];}));
   var merged=fixes.map(function(q){
     var prior=lookup.get(Number(q.qno))||{},updated=Object.assign({},prior,q);
     ['reasoning','calculation','justification','focus','debrief','topic_reason','topic_status'].forEach(function(field){
       if(prior[field])updated[field]=prior[field];
     });
     if(prior.chapter&&prior.topic_origin==='manual'){updated.chapter=prior.chapter;updated.topic_origin='manual';}
     if(prior.your_answer&&prior.answer_capture_status==='captured'&&!prior.ocr_extracted){
       updated.your_answer=prior.your_answer;updated.answer_capture_status='captured';
     }
     return updated;
   });
   var rec=extracted.reconciliation;
   var nextMeta=Object.assign({},meta,{
     originalEarnedMarks:rec.originalEarned,originalPossibleMarks:rec.originalPossible,
     ocrReconciliation:rec,ocrRepairVersion:3,markCoverage:verified,
     correct:merged.filter(function(q){return q.is_correct===true;}).length,
     total:merged.filter(function(q){return typeof q.is_correct==='boolean';}).length,
     totalQuestions:merged.length
   });
   var previousQuestions=localStorage.getItem('tymba_exam_data:'+id),
       previousExams=localStorage.getItem('tymba_custom_exams');
   try{
     localStorage.setItem('tymba_exam_data:'+id,JSON.stringify(merged));
     localStorage.setItem('tymba_custom_exams',JSON.stringify(all.map(function(x){return x.id===id?nextMeta:x;})));
   }catch(err){
     if(previousQuestions!==null)localStorage.setItem('tymba_exam_data:'+id,previousQuestions);
     if(previousExams!==null)localStorage.setItem('tymba_custom_exams',previousExams);
     throw err;
   }
   note('Reconciled '+verified+' question marks from the original locally saved PDF evidence. Updating this review…');
   if(root.PersonalHubAuth&&typeof root.PersonalHubAuth.sync==='function'){
     try{await root.PersonalHubAuth.sync(true);}
     catch(e){note('Local marks repaired, but cloud backup is pending. The attempt remains saved on this device.');return true;}
   }
   location.replace('view.html?id='+encodeURIComponent(id));
   return true;
 }catch(error){note('Automatic source repair was unavailable. Saved answers and marks have not been changed.');return false;}
 finally{running=false;}
}
function init(){repair();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
root.LedgerPeerOcrSourceRepair={repair:repair,pagesFromConvertedHtml:pagesFromConvertedHtml};
})(window);
