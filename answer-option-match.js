/* Exact answer-key matching for single and multiple response reviews.
   Never highlight an option just because its wording is a substring of another. */
(function(root){
 'use strict';
 function plain(value){
  var raw=String(value==null?'':value);
  if(root.RevisionFlow&&typeof root.RevisionFlow.plain==='function')return root.RevisionFlow.plain(raw);
  return raw.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&');
 }
 function normalize(value){return plain(value).normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();}
 function inKey(option,correctAnswer){
  const text=normalize(option);
  const key=normalize(correctAnswer).replace(/^the correct answers?\s+(?:is|are)\s*:\s*/,'');
  if(!text||!key)return false;
  if(text===key)return true;
  // Several Moodle review answers are a comma-separated list of *full*
  // option texts. Boundaries matter: "Component bar chart" must NOT match
  // "Percentage component bar chart".
  const separators=[', ','; ',' | ',' and ','\n'];
  for(const separator of separators){
   if(key.startsWith(text+separator)||key.endsWith(separator+text)||key.includes(separator+text+separator))return true;
  }
  return false;
 }
 function optionClass(option,question){
  const correct=inKey(option.text,question.correct_answer);
  if(option.checked)return correct||question.is_correct===true?'chosen-correct':'chosen-wrong';
  return correct?'right-unchosen':'plain';
 }
 root.LedgerAnswerMatch={inKey,optionClass,normalize};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.LedgerAnswerMatch;
})(typeof window!=='undefined'?window:globalThis);
