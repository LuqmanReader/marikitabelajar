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
      if(own(q,'chapter')||own(q,'topic')){
        item.chapter=root.ChapterAnalysis.label(own(q,'chapter')?q.chapter:q.topic);
        // Enforce an exact topic list only if the student explicitly saved one.
        // Descriptive AI tags are valid when no custom topic catalog exists.
        var allowed=[];
        try{
          var savedCatalog=JSON.parse(localStorage.getItem('personal_hub_chapters_v1')||'{}');
          if(savedCatalog&&Array.isArray(savedCatalog[meta.subject]))
            allowed=savedCatalog[meta.subject].map(root.ChapterAnalysis.label).filter(Boolean);
        }catch(e){}
        if(item.chapter&&allowed.length){
          var matched=allowed.find(function(name){return name.toLowerCase()===item.chapter.toLowerCase();});
          if(!matched)throw new Error('Q'+n+': unknown topic "'+item.chapter+'". Use an exact name from your saved Topic Catalog.');
          item.chapter=matched;
        }
      }
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
  // One request = topic classification and tutor feedback. Graphs, rankings, and
  // strengths/weaknesses are derived from the ORIGINAL marked answers in LedgerPeer.
  function prompt(meta,questions,catalog,signatureSource){
    var type=meta.testType==='set'?'Chapter Set':meta.testType==='pre'?'Progress Test':'Mock Test';
    var example={
      schema:'personal-hub-debrief-v2',
      exam_id:meta.id,
      attempt_signature:signature(signatureSource||questions),
      questions:[{
        qno:questions[0].qno,
        chapter:catalog.length?catalog[0]:'Primary topic name',
        reasoning:'Explain the concept and how to solve the question.',
        calculation:'Show working and formulas, or Not applicable.',
        justification:'Why the recorded correct answer is supported; identify the mistake if wrong.',
        focus:'One specific thing to practise next.'
      }]
    };
    var payload=questions.map(function(q){
      var item={
        qno:q.qno,
        result:q.is_correct===true?'correct':q.is_correct===false?'incorrect':'unscored',
        chapter:q.chapter||'',
        question:plain(q.qtext),
        options:(q.options||[]).map(function(o){return {text:plain(o.text),chosen:!!o.checked};}),
        my_answer:plain(q.your_answer||''),
        correct_answer:plain(q.correct_answer||''),
        original_marks:q.original_marks==null?null:q.original_marks,
        original_max_marks:q.original_max_marks==null?null:q.original_max_marks,
        pdf_page:q.pdf_page||null
      };
      if(q.source_feedback){var sourceNote=plain(q.source_feedback);if(sourceNote&&sourceNote!==item.question)item.source_feedback=sourceNote.slice(0,800);}
      if(q.source_result)item.source_grade=String(q.source_result);
      if(/<img\b/i.test(q.qtext||'')||(q.options||[]).some(function(o){return /<img\b/i.test(o.text||'');}))item.image_not_in_text_export=true;
      return item;
    });
    var instruction=[
      'Act as my FIA/ACCA exam debrief tutor for '+meta.subject+' ('+type+').',
      'For EVERY numbered question: (1) choose one specific primary topic, (2) explain the reasoning, (3) show calculations or say Not applicable, (4) justify the recorded answer and explain my mistake if relevant, (5) suggest one practice focus.',
      'TOPIC CLASSIFICATION: For EVERY question, assign exactly ONE specific primary topic. If an allowed topic list is supplied, use the exact supplied spelling. Do not invent generic categories or chapter numbers. If the source genuinely lacks enough content to classify, use chapter "" and explain why.',
      'The PDF is an attempt-review export, often made of screenshots. Cross-check the ATTACHED ORIGINAL PDF for questions, images, tables, correct answers and grading. OCR QUESTION DATA is a guide, not proof for complex figures. If no PDF is attached, never invent missing figures; explicitly flag uncertain or unreadable questions.',
      'Respect all recorded marks and grading. Never alter question number, score, original recorded correct answer or the marking decision. Some learner-selected choices were not captured by OCR. Never invent a learner choice or diagnose its specific mistake unless visible in the source.',
      'Explain EVERY question, including correct ones, in full teaching detail. Give concept, calculations with steps where applicable, justification of the answer, and a specific practice focus. For uncertain source content, state the limitation in the relevant explanation instead of guessing.',
      'Return ONLY one COMPLETE valid JSON object with every requested question exactly once. No Markdown fences or extra prose. All feedback fields must be strings; calculation must be "Not applicable" if none. If you cannot fit a complete response, return a valid partial JSON for the questions you finished (never malformed/truncated JSON). LedgerPeer will prepare a continuation request for missing questions.',
      'Do not calculate scores, topic percentages, strengths, weaknesses or graphs. LedgerPeer calculates those from the ORIGINAL marks.',
      '',
      'RESPONSE SHAPE (illustrative example first item only; use the ACTUAL matching topic for each question rather than repeating its example topic):',
      JSON.stringify(example,null,2),
      '',
      'ATTEMPT: '+meta.title,
      'SET CHAPTER: '+(meta.setChapter||'Not applicable'),
      'ALLOWED TOPICS (broad suggestions from LedgerPeer, not verified textbook chapter numbers): '+(catalog.length?JSON.stringify(catalog):'No supplied topic list: use consistent descriptive primary topics'),
      'QUESTION DATA:',
      JSON.stringify(payload)
    ];
    return instruction.join('\n');
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
