(function(root){
  'use strict';
  var own=function(o,k){return Object.prototype.hasOwnProperty.call(o,k);};
  var fields=['reasoning','calculation','justification','focus'];
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function plain(html){
    if(typeof document!=='undefined'){
      var doc=new DOMParser().parseFromString(String(html||''),'text/html');
      doc.querySelectorAll('script,style').forEach(function(el){el.remove();});
      doc.querySelectorAll('br,p,tr,li').forEach(function(el){el.appendChild(doc.createTextNode('\n'));});
      return doc.body.textContent.trim();
    }
    return String(html||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  }
  function sanitize(html){
    var doc=new DOMParser().parseFromString(String(html||''),'text/html');
    doc.querySelectorAll('script,style,iframe,object,embed,form').forEach(function(n){n.remove();});
    var allowed=['P','STRONG','B','EM','I','UL','OL','LI','BR','TABLE','TBODY','THEAD','TR','TD','TH','CODE','PRE','SPAN','DIV','SUP','SUB','IMG'];
    Array.from(doc.body.querySelectorAll('*')).reverse().forEach(function(n){
      if(!allowed.includes(n.tagName)){n.replaceWith.apply(n,Array.from(n.childNodes));return;}
      var src=n.tagName==='IMG'?n.getAttribute('src'):null;
      Array.from(n.attributes).forEach(function(a){n.removeAttribute(a.name);});
      if(src){
        if(/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(src)){n.setAttribute('src',src);n.setAttribute('alt','Question image');}
        else n.replaceWith(doc.createTextNode('[Image unavailable in this export — consult the original question.]'));
      }
    });
    return doc.body.innerHTML;
  }
  function signature(questions){
    var text=JSON.stringify(questions.map(function(q){return [q.qno,q.is_correct,q.qtext,q.options,q.your_answer,q.correct_answer];})), hash=2166136261;
    for(var i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16);
  }
  function parse(raw){
    var text=String(raw||'').replace(/^\uFEFF/,'').trim();
    if(text.startsWith('```')){var m=text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);if(!m)throw new Error('Paste one complete AI response block.');text=m[1];}
    try{return JSON.parse(text);}catch(e){throw new Error('The response is incomplete or not valid JSON. Copy the whole AI response block, or choose its downloaded JSON file.');}
  }
  function textField(value,name){if(typeof value!=='string'||value.length>24000)throw new Error(name+' must be text (up to 24,000 characters).');return value.trim();}
  function review(raw,questions,meta){
    var data=typeof raw==='string'?parse(raw):raw, warnings=[];
    if(!data||typeof data!=='object')throw new Error('Expected an AI response object or question array.');
    if(data.exam_id!=null&&data.exam_id!==meta.id)throw new Error('This AI response belongs to another attempt. Copy the prompt from this attempt again.');
    if(data.attempt_signature!=null&&data.attempt_signature!==signature(questions))throw new Error('This response was made for a different question set.');
    if(!Array.isArray(data)&&data.schema&&data.schema!=='personal-hub-debrief-v2')throw new Error('This response format is not supported. Use Copy AI request on this page.');
    var incoming=Array.isArray(data)?data:data.questions;
    if(!Array.isArray(incoming)||!incoming.length)throw new Error('No question feedback was found in the response.');
    var known=new Map(questions.map(function(q){return [String(q.qno),q];})), seen=new Set(), accepted=[];
    incoming.forEach(function(q){
      if(!q||q.qno==null)throw new Error('Every feedback item needs its original question number.');
      var n=String(q.qno), original=known.get(n);
      if(!original)throw new Error('Question '+n+' does not belong to this attempt.');
      if(seen.has(n))throw new Error('Duplicate feedback for question '+n+'.');seen.add(n);
      var item={qno:original.qno};
      if(own(q,'chapter')||own(q,'topic'))item.chapter=root.ChapterAnalysis.label(own(q,'chapter')?q.chapter:q.topic);
      fields.forEach(function(k){if(own(q,k))item[k]=textField(q[k],k);});
      if(own(q,'debrief'))item.debrief=textField(q.debrief,'debrief');
      ['is_correct','qtext','options','your_answer','correct_answer'].forEach(function(k){
        if(own(q,k)&&JSON.stringify(q[k])!==JSON.stringify(original[k]))warnings.push('Q'+n+': a changed answer or mark was ignored.');
      });
      if(Object.keys(item).length===1)throw new Error('Q'+n+' contains no feedback or topic tag.');
      accepted.push(item);
    });
    if(!data.exam_id)warnings.push('Legacy response: no attempt ID supplied. Check the question preview before saving.');
    if(incoming.length<questions.length)warnings.push('Partial response: '+incoming.length+' of '+questions.length+' questions supplied. Other questions will keep their saved feedback.');
    var merged=root.ChapterAnalysis.merge(questions,accepted);
    merged.forEach(function(q){var change=accepted.find(function(p){return String(p.qno)===String(q.qno);});if(change)fields.forEach(function(k){if(own(change,k))q[k]=change[k];});});
    var coverage=root.ChapterAnalysis.summary(merged).coverage;
    if(coverage.untagged)warnings.push(coverage.untagged+' scored questions still need a topic tag. They will not count toward topic accuracy.');
    var missing=merged.filter(function(q){return q.is_correct===false&&!hasFeedback(q);}).length;
    if(missing)warnings.push(missing+' incorrect questions still need an explanation.');
    return {questions:merged,count:accepted.length,warnings:Array.from(new Set(warnings)),coverage:coverage,changed:accepted};
  }
  function hasFeedback(q){return fields.slice(0,3).some(function(k){return typeof q[k]==='string'&&q[k].trim();})||!!(q.debrief&&q.debrief.trim());}
  function feedback(q){
    if(fields.slice(0,3).some(function(k){return q[k]&&q[k].trim();})){
      return [['reasoning','Reasoning'],['calculation','Calculation'],['justification','Justification']].map(function(p){return '<section class="feedback-part"><h4>'+p[1]+'</h4><div>'+esc(q[p[0]]||'Not provided yet.').replace(/\n/g,'<br>')+'</div></section>';}).join('')+(q.focus?'<div class="focus-note"><strong>Practise next:</strong> '+esc(q.focus)+'</div>':'');
    }
    return q.debrief?sanitize(q.debrief):'<p>Answer review is ready. Import the AI response to add reasoning, calculation and justification.</p>';
  }
  function prompt(meta,questions,catalog){
    var type=meta.testType==='set'?'Set':meta.testType==='pre'?'Progress Test':'Mock Test';
    var header='Help me review this '+type+' attempt for '+meta.subject+'.\n'+
      'Return ONE JSON response block using the exact format below. Do not generate website code.\n'+
      'For EVERY question, assign its primary topic/chapter and explain the reasoning, calculation steps (or "Not applicable"), and why the correct answer is justified. Explain my mistake where relevant, and give a short practice focus.\n'+
      'Use the supplied chapter names exactly when appropriate. Keep existing tags unless clearly wrong. If no list is supplied, use consistent descriptive names without inventing textbook chapter numbers. If the question is empty or cannot be classified, use an empty chapter.\n'+
      'Report missing images or suspect answer keys in the explanation. Never change the original answer or mark. Results are binary full-credit accuracy, not a marks-weighted percentage.\n'+
      'Also provide topic_rankings, highest accuracy first, calculated from the original results of all tagged questions. The website will verify its own ranking from question-level results. Use plain text in all explanation fields. Escape newlines and quotation marks for valid JSON.\n\n'+
      'RESPONSE FORMAT (include every question, not only the example):\n'+JSON.stringify({schema:'personal-hub-debrief-v2',exam_id:meta.id,attempt_signature:signature(questions),questions:[{qno:questions[0].qno,chapter:'Exact topic name',reasoning:'Explanation',calculation:'Steps or Not applicable',justification:'Why this answer; why my choice was wrong if applicable',focus:'One action to practise'}],topic_rankings:[{chapter:'Exact topic name',correct:0,total:1}]},null,2)+
      '\n\nATTEMPT\n'+meta.title+'\n'+(meta.setChapter?'Set chapter: '+meta.setChapter+'\n':'')+
      'Chapter list: '+(catalog.length?catalog.join(' | '):'Not supplied')+'\n\nQUESTIONS\n';
    return header+questions.map(function(q){
      var options=(q.options||[]).map(function(o,i){return (i+1)+'. '+plain(o.text)+(o.checked?' [MY CHOICE]':'');}).join('\n');
      return 'QUESTION '+q.qno+'\nResult: '+(q.is_correct===true?'Correct':q.is_correct===false?'Incorrect':'Unscored')+'\nCurrent chapter: '+(q.chapter||'Unassigned')+'\n'+plain(q.qtext)+'\n'+options+'\nMy answer: '+plain(q.your_answer||'Not captured; see choices above')+'\nCorrect answer: '+plain(q.correct_answer||'Not captured')+'\n';
    }).join('\n---\n\n');
  }
  function save(storage,key,value){
    var encoded=JSON.stringify(value);storage.setItem(key,encoded);
    if(storage.getItem(key)!==encoded)throw new Error('Your browser could not save this update.');
  }
  function download(name,content,type){
    var url=URL.createObjectURL(new Blob([content],{type:type||'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  root.RevisionFlow={escape:esc,plain:plain,sanitize:sanitize,signature:signature,parse:parse,review:review,hasFeedback:hasFeedback,feedback:feedback,prompt:prompt,save:save,download:download};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.RevisionFlow;
})(typeof window!=='undefined'?window:globalThis);
