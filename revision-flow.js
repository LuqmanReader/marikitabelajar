(function(root){
  'use strict';
  var own=function(o,k){return Object.prototype.hasOwnProperty.call(o,k);};
  var fields=['reasoning','calculation','justification','focus','topic_reason','topic_status'];
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function plain(html){
    if(typeof document!=='undefined'){
      var doc=new DOMParser().parseFromString(String(html||''),'text/html');
      doc.querySelectorAll('script,style').forEach(function(el){el.remove();});
        doc.querySelectorAll('img,svg,canvas').forEach(function(el){el.replaceWith(doc.createTextNode('[Question figure present — attach the original image for visual analysis]'));});
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
      if(n.tagName==='IMG'){
        // Preserve embedded figures and safe HTTPS image references from the source review.
        // HTML exports frequently retain image URLs, not the actual pixels. The review
        // page offers a local screenshot attachment when a remote image cannot load.
        if(src&&src.length<=1800000&&(/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(src)||/^https:\/\/[^\s"'<>]+$/i.test(src))){
          n.setAttribute('src',src);
          n.setAttribute('alt','Question figure');
          n.setAttribute('loading','lazy');
          n.setAttribute('referrerpolicy','no-referrer');
        } else n.replaceWith(doc.createTextNode('[Image unavailable in this export — attach a screenshot of the original question.]'));
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
  function resolveApprovedTopic(input,allowed,paperCode){
    const raw=String(input||'').trim(),code=String(paperCode||'').trim();
    if(!raw)return '';
    const normalize=s=>String(s).normalize('NFKC').replace(new RegExp('^'+code+'\\s+(?=[A-Z]\\d+\\b)','i'),'').replace(/[·:–—._-]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
    const clean=normalize(raw);
    return allowed.find(name=>normalize(name)===clean)
      ||(allowed.filter(name=>name.split('·').slice(1).join('·').trim().toLowerCase()===clean).length===1
          ?allowed.find(name=>name.split('·').slice(1).join('·').trim().toLowerCase()===clean):'')
      ||(allowed.filter(name=>name.match(/^[A-Z]\d+/)&&name.match(/^[A-Z]\d+/)[0].toLowerCase()===clean).length===1
          ?allowed.find(name=>name.match(/^[A-Z]\d+/)&&name.match(/^[A-Z]\d+/)[0].toLowerCase()===clean):'');
  }
  function review(raw,questions,meta){
    var data=typeof raw==='string'?parse(raw):raw, warnings=[];
    if(!data||typeof data!=='object')throw new Error('Expected an AI response object or question array.');
    if(data.exam_id!=null&&data.exam_id!==meta.id)throw new Error('This AI response belongs to another attempt. Copy the prompt from this attempt again.');
    if(data.attempt_signature!=null&&data.attempt_signature!==signature(questions))throw new Error('This response was made for a different question set.');
    if(!Array.isArray(data)&&data.schema&&data.schema!=='personal-hub-debrief-v2')throw new Error('This response format is not supported. Use Copy AI request on this page.');
    if(data.paper&&root.SubjectCatalog&&root.SubjectCatalog.canonical(data.paper)!==root.SubjectCatalog.canonical(meta.subject))throw new Error('This response was classified for '+data.paper+', not '+meta.subject+'. Regenerate the request for the selected paper.');
    if(data.paper_code&&root.LedgerSyllabus&&data.paper_code!==root.LedgerSyllabus.code(meta.subject))throw new Error('This response belongs to a different ACCA paper ('+data.paper_code+').');
    var incoming=Array.isArray(data)?data:data.questions;
    if(!Array.isArray(incoming)||!incoming.length)throw new Error('No question feedback was found in the response.');
    var known=new Map(questions.map(function(q){return [String(q.qno),q];})), seen=new Set(), accepted=[];
    incoming.forEach(function(q){
      if(!q||q.qno==null)throw new Error('Every feedback item needs its original question number.');
      var n=String(q.qno), original=known.get(n);
      if(!original)throw new Error('Question '+n+' does not belong to this attempt.');
      if(seen.has(n))throw new Error('Duplicate feedback for question '+n+'.');seen.add(n);
      var item={qno:original.qno};
      if(own(q,'chapter')||own(q,'topic')){
        item.chapter=root.ChapterAnalysis.label(own(q,'chapter')?q.chapter:q.topic);
        // The source of truth is the published or student-confirmed ACCA syllabus for THIS paper.
        var resolved=root.LedgerSyllabus&&root.LedgerSyllabus.resolve(localStorage,meta.subject);
        var allowed=resolved&&resolved.topics||[];
        if(!allowed.length)throw new Error('The ACCA syllabus for '+meta.subject+' has not been configured. Use Set Up Syllabus on this attempt before importing.');
        if(item.chapter){
          var matched=resolveApprovedTopic(item.chapter,allowed,root.LedgerSyllabus&&root.LedgerSyllabus.code(meta.subject));
          if(!matched)throw new Error('Q'+n+': "'+item.chapter+'" is not in the approved syllabus for '+meta.subject+'. Choose an exact syllabus heading or leave blank with topic_status "outside" or "unreadable".');
          item.chapter=matched;
        }
      }
      if(own(q,'topic_status')){
        if(!['matched','related','outside','unreadable'].includes(q.topic_status))throw new Error('Q'+n+': topic_status must be matched, related, outside, or unreadable.');
        if((q.topic_status==='matched'||q.topic_status==='related')&&!item.chapter)throw new Error('Q'+n+': matched/related questions need an official syllabus label.');
        if((q.topic_status==='outside'||q.topic_status==='unreadable')&&item.chapter)throw new Error('Q'+n+': outside/unreadable questions must have chapter "".');
      }
      fields.forEach(function(k){if(own(q,k))item[k]=textField(q[k],k);});
      if(own(q,'debrief'))item.debrief=textField(q.debrief,'debrief');
      if(own(q,'forecast'))item.forecast=textField(q.forecast,'forecast');
      if(own(q,'evidence_status')){
        if(!['supported','tentative','insufficient'].includes(q.evidence_status))
          throw new Error('Q'+n+': evidence_status must be supported, tentative or insufficient.');
        item.evidence_status=q.evidence_status;
      }
      if(own(item,'forecast')&&!own(item,'evidence_status')){
        item.evidence_status='tentative';
        warnings.push('Q'+n+': forecast had no evidence label; downgraded to tentative.');
      }
      if(item.evidence_status==='insufficient'&&own(item,'forecast')&&item.forecast.toLowerCase()!=='unavailable'){
        item.forecast='Unavailable';
        warnings.push('Q'+n+': unsupported forecast withheld because evidence is insufficient.');
      }
      ['is_correct','qtext','options','your_answer','correct_answer'].forEach(function(k){
        if(own(q,k)&&JSON.stringify(q[k])!==JSON.stringify(original[k]))warnings.push('Q'+n+': a changed answer or mark was ignored.');
      });
      if(Object.keys(item).length===1)throw new Error('Q'+n+' contains no feedback or topic tag.');
      accepted.push(item);
    });
    if(!data.exam_id)warnings.push('Legacy response: no attempt ID supplied. Check the question preview before saving.');
    if(incoming.length<questions.length)warnings.push('Partial response: '+incoming.length+' of '+questions.length+' questions supplied. Other questions will keep their saved feedback.');
    var merged=root.ChapterAnalysis.merge(questions,accepted);
    merged.forEach(function(q){var change=accepted.find(function(p){return String(p.qno)===String(q.qno);});if(change){fields.forEach(function(k){if(own(change,k))q[k]=change[k];});if(own(change,'forecast'))q.forecast=change.forecast;if(own(change,'evidence_status'))q.evidence_status=change.evidence_status;if(own(change,'chapter')&&change.chapter){q.topic_origin='ai-debrief';q.topic_evidence='';}}});
    var coverage=root.ChapterAnalysis.summary(merged,meta.subject).coverage;
    if(coverage.untagged)warnings.push(coverage.untagged+' scored questions still need a topic tag. They will not count toward topic accuracy.');
    var missing=merged.filter(function(q){return q.is_correct===false&&!hasFeedback(q);}).length;
    if(missing)warnings.push(missing+' incorrect questions still need an explanation.');
    return {questions:merged,count:accepted.length,warnings:Array.from(new Set(warnings)),coverage:coverage,changed:accepted};
  }
  function hasFeedback(q){return fields.slice(0,3).some(function(k){return typeof q[k]==='string'&&q[k].trim();})||!!(q.debrief&&q.debrief.trim());}
  function feedback(q){
    if(fields.slice(0,3).some(function(k){return q[k]&&q[k].trim();})){
      return (q.topic_reason?'<section class="feedback-part"><h4>Why this ACCA syllabus topic?</h4><div>'+esc(q.topic_reason).replace(/\n/g,'<br>')+'</div></section>':'')+[ ['reasoning','Reasoning'],['calculation','Calculation'],['justification','Justification']].map(function(p){return '<section class="feedback-part"><h4>'+p[1]+'</h4><div>'+esc(q[p[0]]||'Not provided yet.').replace(/\n/g,'<br>')+'</div></section>';}).join('')+(q.forecast?'<section class="feedback-part"><h4>Forecast · '+esc(q.evidence_status||'unverified')+'</h4><div>'+esc(q.forecast).replace(/\n/g,'<br>')+'</div></section>':'')+(q.focus?'<div class="focus-note"><strong>Practise next:</strong> '+esc(q.focus)+'</div>':'');
    }
    return q.debrief?sanitize(q.debrief):'<p>Answer review is ready. Import the AI response to add reasoning, calculation and justification.</p>';
  }
  // One request = topic classification and tutor feedback. Graphs, rankings, and
  // strengths/weaknesses are derived from the ORIGINAL marked answers in LedgerPeer.
  // Compact prompt. The caller passes a small batch of questions rather than the full exam.
  // Preserve the complete source wording for each selected question; do not silently truncate.
  function prompt(meta,questions,catalog,signatureSource){
    if(root.LedgerPeerPromptInjector&&typeof root.LedgerPeerPromptInjector.build==='function')
      return root.LedgerPeerPromptInjector.build(meta,questions,catalog,signatureSource);
    if(!Array.isArray(catalog)||!catalog.length)throw new Error('Configure the verified syllabus for '+meta.subject+' first.');
    if(!questions.length)throw new Error('No questions selected for the debrief.');
    const source=root.LedgerSyllabus?root.LedgerSyllabus.resolve(localStorage,meta.subject):{};
    const reference=root.LedgerOfficialExamRegistry&&root.LedgerOfficialExamRegistry.get(meta.subject);
    const code=root.LedgerSyllabus?root.LedgerSyllabus.code(meta.subject):'';
    const payload=questions.map(q=>({
      qno:q.qno,
      question:plain(q.qtext),
      information:plain(q.information||'')||undefined,
      options:(q.options||[]).map(o=>({text:plain(o.text),chosen:!!o.checked})),
      student_answer:plain(q.your_answer||'')||null,
      recorded_answer:plain(q.correct_answer||'')||null,
      original_grade:q.source_result||(q.is_correct===true?'correct':q.is_correct===false?'incorrect':'unverified'),
      marks:q.original_marks==null?null:q.original_marks,
      max_marks:q.original_max_marks==null?null:q.original_max_marks,
      pdf_page:q.pdf_page||null,
      visual_review_required:!!q.visual_review_required||/<img\b|\[Image unavailable/i.test(q.qtext||'')||/\b(?:graph|chart|diagram|figure|table)\b/i.test(plain(q.qtext)),
      answer_capture_status:q.answer_capture_status||'not_captured'
    }));
    const responseShape={
      schema:'personal-hub-debrief-v2',exam_id:meta.id,paper:meta.subject,paper_code:code,
      attempt_signature:signature(signatureSource||questions),
      questions:[{qno:questions[0].qno,chapter:'EXACT approved syllabus label or empty',
        topic_status:'matched',topic_reason:'Short evidence for mapping',
        reasoning:'Explain concept and approach',calculation:'Steps and formula or Not applicable',
        justification:'Why answer works; explain the error or uncertainty',focus:'One practice priority'}]
    };
    return [
      'LEDGERPEER · FIA/ACCA EXAM DEBRIEF (small batch; return JSON only)',
      'Paper: '+meta.subject+' ('+code+'). Exam: '+(meta.testType==='set'?'Chapter Set':meta.testType==='pre'?'Progress Test':'Mock Test')+' '+meta.testNumber+'.',
      'Syllabus edition: '+(source.version||'not specified')+'. Variant: '+(reference&&reference.variant||'not specified')+'.',
      'Allowed topic headings (use EXACT label only): '+JSON.stringify(catalog),
      'Task: For each of the '+questions.length+' questions, give concise but complete reasoning, full numbered workings for calculations, justification, one revision focus, and brief topic evidence.',
      'Topic status: matched or related with an exact listed chapter; outside or unreadable with chapter "". Never force a topic or invent a chapter.',
      'Treat the ORIGINAL marks, student answers and recorded answer key as source records, not as AI-generated grading. If the key seems wrong, flag the dispute in justification with workings; never silently alter the original marks.',
      'PDF and reconstructed HTML refer to the SAME original file: agreement is not independent verification. HTML may omit figures. For any visual question, check the attached ORIGINAL PDF page if provided; otherwise explicitly state that visual evidence is missing and do not guess.',
      'Never invent a missing learner-selected answer, figure, chart value or explanation. Keep explanations proportionate to question complexity.',
      'Return a single valid JSON object with this schema (substitute real answers and real topics): '+JSON.stringify(responseShape),
      'Do not copy question text or marks into your output. Do not return scores, graphs, Markdown or additional prose.',
      'QUESTIONS: '+JSON.stringify(payload)
    ].join('\n');
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
