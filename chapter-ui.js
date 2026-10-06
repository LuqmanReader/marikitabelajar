(function(root){
  'use strict';
  var M=root.ChapterAnalysis;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function plain(s){var d=document.createElement('div');d.innerHTML=s||'';return (d.textContent||'').replace(/\s+/g,' ').trim();}
  function coverage(s){return s.tagged+' tagged answers · '+s.untagged+' awaiting chapter tags'+(s.unscored?' · '+s.unscored+' unscored':'')+(s.unavailable?' · '+s.unavailable+' unavailable exam records':'');}
  function count(b){return b.total?Math.round(b.correct/b.total*100)+'% ('+b.correct+'/'+b.total+')':'Not attempted';}
  function color(x){return x.level==='Strong'?'#1F6B39':x.level==='Needs Work'?'#E63B2E':x.level==='Developing'?'#9a7400':'#777';}
  function mountEditor(el,data,meta,storage,onSave){
    var names=M.catalog(storage,meta.subject);data.forEach(function(q){if(q.chapter&&names.indexOf(q.chapter)<0)names.push(q.chapter);});
    var sum=M.summary(data);
    el.innerHTML='<h3>Chapter tags</h3><p class="chapter-note">'+coverage({tagged:sum.coverage.tagged,untagged:sum.coverage.untagged,unscored:sum.coverage.unscored})+'. Tag correct and incorrect questions. These tags update the chapter graph and strengths/weaknesses automatically.</p>'+
      '<details><summary>Set this subject’s chapter list</summary><p>Use your textbook’s actual names or numbers, one per line. Example: Chapter 4 · Accruals and prepayments. This is a reusable suggestion list; saving it does not retag existing questions.</p><textarea id="chapterCatalog" rows="5">'+esc(names.join('\n'))+'</textarea><button type="button" id="saveChapterCatalog" class="btn secondary">Save chapter list</button></details>'+
      '<datalist id="chapterNames">'+names.map(function(n){return '<option value="'+esc(n)+'"></option>';}).join('')+'</datalist>'+
      '<div class="chapter-tools"><input id="bulkChapter" list="chapterNames" placeholder="Chapter for selected questions"><button type="button" id="applyBulkChapter" class="btn secondary">Apply to selected</button></div>'+
      '<div class="chapter-table-scroll"><table class="chapter-table"><thead><tr><th><input type="checkbox" id="selectAllChapters" aria-label="Select all questions"></th><th>Question / result</th><th>Chapter</th></tr></thead><tbody>'+data.map(function(q,i){return '<tr><td><input class="chapter-pick" data-index="'+i+'" type="checkbox" aria-label="Select question '+esc(q.qno)+'"></td><td><strong>Q'+esc(q.qno)+' · '+(q.is_correct===true?'Correct':q.is_correct===false?'Incorrect':'Unscored')+'</strong><br>'+esc(plain(q.qtext).slice(0,110)||'Question text missing')+'</td><td><input class="chapter-value" data-index="'+i+'" list="chapterNames" value="'+esc(q.chapter||'')+'" placeholder="Unassigned" aria-label="Chapter for question '+esc(q.qno)+'"></td></tr>';}).join('')+'</tbody></table></div>'+
      '<button type="button" id="saveQuestionChapters" class="btn secondary">Save question chapters</button><p id="chapterEditMsg" role="status"></p>';
    function message(s){el.querySelector('#chapterEditMsg').textContent=s;}
    el.querySelector('#selectAllChapters').addEventListener('change',function(){var checked=this.checked;el.querySelectorAll('.chapter-pick').forEach(function(p){p.checked=checked;});});
    el.querySelector('#applyBulkChapter').addEventListener('click',function(){try{var name=M.label(el.querySelector('#bulkChapter').value), n=0;el.querySelectorAll('.chapter-pick:checked').forEach(function(p){el.querySelector('.chapter-value[data-index="'+p.dataset.index+'"]').value=name;n++;});message(n?'Applied to '+n+' questions. Save question chapters to confirm.':'Select questions first.');}catch(e){message(e.message);}});
    el.querySelector('#saveChapterCatalog').addEventListener('click',function(){try{var list=M.saveCatalog(storage,meta.subject,el.querySelector('#chapterCatalog').value.split('\n'));el.querySelector('#chapterNames').innerHTML=list.map(function(n){return '<option value="'+esc(n)+'"></option>';}).join('');message('Chapter list saved.');}catch(e){message(e.message);}});
    el.querySelector('#saveQuestionChapters').addEventListener('click',function(){try{var patch=data.map(function(q,i){return {qno:q.qno,chapter:el.querySelector('.chapter-value[data-index="'+i+'"]').value};});onSave(M.merge(data,patch));}catch(e){message('Could not save: '+e.message);}});
  }
  function graphHtml(s){
    if(!s.chapters.length)return '<p class="chapter-note">No chapter results yet. Open a saved test, copy its GPT prompt, import the returned chapter tags, or assign them manually.</p>';
    return '<div class="chapter-legend"><span style="color:#1D3FA0">■ Progress Test</span> <span style="color:#E63B2E">■ Mock Test</span></div>'+s.chapters.map(function(x){
      return '<div class="chapter-graph-row"><strong>'+esc(x.chapter)+'</strong><span>Overall '+x.pct+'% · '+x.correct+'/'+x.total+' · '+x.level+'</span>'+['progress','mock'].map(function(type){var b=x[type],pct=b.total?b.correct/b.total*100:0;return '<div class="chapter-bar-row"><span>'+ (type==='progress'?'Progress':'Mock')+'</span><div class="chapter-track" role="img" aria-label="'+esc(x.chapter)+' '+type+' '+count(b)+'">'+(b.total?'<div style="width:'+pct+'%;background:'+(type==='progress'?'#1D3FA0':'#E63B2E')+'"></div>':'')+'</div><span>'+count(b)+'</span></div>';}).join('')+'</div>';
    }).join('');
  }
  function boxHtml(x,cls){return '<div class="sw-item '+cls+'"><div class="t-name">'+esc(x.chapter)+'<br><span style="color:#555;font-weight:600;">'+x.correct+'/'+x.total+' correct · '+x.attempts+' test attempts</span></div><div class="t-pct">'+x.pct+'%</div></div>';}
  function lineChart(points){
    if(!points.length)return '<p class="chapter-note">No tagged, scored answers in this selection yet. Import an AI response or assign topic tags to start the line.</p>';
    var W=800,H=310,L=52,R=25,T=20,B=50, pw=W-L-R,ph=H-T-B;
    function x(i){return points.length===1?L+pw/2:L+i/(points.length-1)*pw;}
    function y(p){return T+ph-p/100*ph;}
    var svg='<div class="flow-chart-scroll"><svg role="img" aria-label="Topic accuracy by attempt, oldest to newest" viewBox="0 0 '+W+' '+H+'">';
    [0,25,50,75,100].forEach(function(v){svg+='<line x1="'+L+'" y1="'+y(v)+'" x2="'+(W-R)+'" y2="'+y(v)+'" stroke="#ddd"/><text x="'+(L-9)+'" y="'+(y(v)+4)+'" text-anchor="end" font-size="11">'+v+'%</text>';});
    var skip=Math.max(1,Math.ceil(points.length/12));
    points.forEach(function(p,i){if(i%skip===0||i===points.length-1)svg+='<text x="'+x(i)+'" y="'+(H-27)+'" text-anchor="middle" font-size="11">'+(i+1)+'</text>';});
    [['set','#1f6b39',''],['pre','#1d3fa0',''],['mock','#e63b2e','8 5']].forEach(function(series){
      var rows=points.map(function(p,i){return {p:p,i:i};}).filter(function(o){return o.p.type===series[0]||(series[0]==='pre'&&o.p.type==='progress');});
      var path=rows.map(function(o,i){return (i?'L':'M')+x(o.i).toFixed(1)+','+y(o.p.pct).toFixed(1);}).join(' ');
      if(rows.length>1)svg+='<path data-series="'+series[0]+'" d="'+path+'" fill="none" stroke="'+series[1]+'" stroke-width="3" stroke-dasharray="'+series[2]+'"/>';
      rows.forEach(function(o){svg+='<circle data-attempt-id="'+esc(o.p.id)+'" cx="'+x(o.i)+'" cy="'+y(o.p.pct)+'" r="5" fill="'+series[1]+'" stroke="#111" stroke-width="1.5"><title>'+esc(o.p.title)+' · '+o.p.correct+'/'+o.p.total+' · '+o.p.pct+'%</title></circle>';});
    });
    svg+='<text x="'+(W/2)+'" y="'+(H-5)+'" text-anchor="middle" font-size="12">Attempt order · oldest → newest</text></svg></div>';
    svg+='<p class="chapter-note">On a small screen, swipe sideways across the graph to see every point.</p><div class="flow-legend"><span style="color:#1f6b39">● Chapter sets</span><span style="color:#1d3fa0">● Progress Tests</span><span style="color:#e63b2e">● Mock Tests · dashed</span></div>';
    if(points.length===1)svg+='<p class="chapter-note">Your first point is recorded. Another attempt of this type will extend the line.</p>';
    svg+='<details><summary>View the plotted attempts</summary><div class="flow-table-scroll"><table class="flow-rank-table"><thead><tr><th>Order</th><th>Attempt</th><th>Date</th><th>Topic accuracy</th></tr></thead><tbody>'+points.map(function(p,i){var d=new Date(p.date);return '<tr><td>'+(i+1)+'</td><td><a href="view.html?id='+encodeURIComponent(p.id)+'">'+esc(p.title)+'</a></td><td>'+(Number.isFinite(d.getTime())?esc(d.toLocaleDateString()):'Date unavailable')+'</td><td>'+p.pct+'% ('+p.correct+'/'+p.total+')</td></tr>';}).join('')+'</tbody></table></div></details>';
    return svg;
  }
  function mountDashboard(graph,boxes,mastery,exams,storage){
    var subjects=Array.from(new Set(exams.map(function(e){return e.subject;})));
    if(!subjects.length){
      graph.innerHTML='<p class="chapter-note">No active attempts. Add a set, Progress Test or Mock Test to start your analysis.</p>';
      boxes.innerHTML='<div class="chart-panel">Your strengths and practice priorities will appear after topic tags are saved.</div>';
      mastery.innerHTML='<div class="chart-panel">No ranked topics yet.</div>';return;
    }
    graph.innerHTML='<div class="flow-controls"><label>Subject<select id="chapterSubject">'+subjects.map(function(s,i){return '<option value="'+i+'">'+esc(s)+'</option>';}).join('')+'</select></label><label>Attempt type<select id="chapterType"><option value="all">All types</option><option value="set">Chapter sets</option><option value="pre">Progress Tests</option><option value="mock">Mock Tests</option></select></label><label>Topic / chapter<select id="chapterTopic"></select></label></div><p class="chapter-note">Each point is the accuracy for that attempt. Retakes add a new point. Topic ranking combines all active answers in the selected subject and attempt type; it uses correct ÷ total, not an average of percentages.</p><div id="chapterGraphContent"></div><div id="setCoverage"></div>';
    var sub=graph.querySelector('#chapterSubject'),type=graph.querySelector('#chapterType'),topic=graph.querySelector('#chapterTopic');
    function selection(){return exams.filter(function(e){return e.subject===subjects[Number(sub.value)]&&(type.value==='all'||e.testType===type.value);});}
    function drawLine(){
      var chosen=selection(),subject=subjects[Number(sub.value)], points=M.trend(chosen,storage,subject,topic.value);
      graph.querySelector('#chapterGraphContent').innerHTML=lineChart(points);
    }
    function drawAll(){
      var chosen=selection(), subject=subjects[Number(sub.value)], s=M.aggregate(chosen,storage)[0]||{subject:subject,chapters:[],tagged:0,untagged:0,unscored:0,unavailable:0};
      var previous=topic.value;
      topic.innerHTML='<option value="">All tagged topics</option>'+s.chapters.map(function(r){return '<option value="'+esc(r.chapter)+'">'+esc(r.chapter)+'</option>';}).join('');
      if(s.chapters.some(function(r){return r.chapter===previous;}))topic.value=previous;
      mastery.innerHTML='<div class="sw-subject">'+esc(subject)+'</div><p class="chapter-note">'+coverage(s)+'. Strongest topic at the top. Click a topic to see its line.</p>'+
        (s.chapters.length?'<div class="chart-panel flow-table-scroll"><table class="flow-rank-table"><thead><tr><th>Rank</th><th>Topic / chapter</th><th>Accuracy</th><th>Evidence</th><th>Status</th></tr></thead><tbody>'+s.chapters.map(function(r,i){return '<tr data-level="'+r.level+'"><td>'+(i+1)+'</td><td><button type="button" data-topic-index="'+i+'">'+esc(r.chapter)+'</button></td><td><strong>'+r.pct+'%</strong></td><td>'+r.correct+'/'+r.total+' correct<small>'+r.attempts+' attempt'+(r.attempts===1?'':'s')+'</small></td><td>'+r.level+'</td></tr>';}).join('')+'</tbody></table></div>':'<div class="chart-panel">No topics ranked for this selection. Open an attempt and paste the AI response, or edit its topic tags.</div>');
      mastery.querySelectorAll('[data-topic-index]').forEach(function(button){button.addEventListener('click',function(){topic.value=s.chapters[Number(button.dataset.topicIndex)].chapter;drawLine();graph.scrollIntoView({behavior:'smooth',block:'start'});});});
      var weak=s.chapters.filter(function(r){return r.level==='Needs Work';}).reverse(),strong=s.chapters.filter(function(r){return r.level==='Strong';}),developing=s.chapters.filter(function(r){return r.level==='Developing';}),thin=s.chapters.filter(function(r){return r.level==='More evidence needed';});
      function focus(r){return r.focus.length?'<p class="flow-focus"><strong>Practise next:</strong> '+esc(r.focus[r.focus.length-1])+'</p>':'';}
      boxes.innerHTML='<div class="sw-subject">'+esc(subject)+'</div><div class="sw-grid"><div><div class="sw-col-label strong">What you do well · 80%+</div>'+(strong.length?strong.map(function(r){return boxHtml(r,'strong');}).join(''):'<p>No topics have enough strong results yet.</p>')+'</div><div><div class="sw-col-label weak">What to work on · below 60%</div>'+(weak.length?weak.map(function(r){return boxHtml(r,'weak')+focus(r);}).join(''):'<p>No topics meet the needs-work threshold.</p>')+'</div></div>'+
        (developing.length?'<p class="chapter-note"><strong>Developing:</strong> '+developing.map(function(r){return esc(r.chapter)+' · '+r.pct+'%';}).join('; ')+'</p>':'')+
        (thin.length?'<p class="chapter-note"><strong>More evidence needed (fewer than 3 answers):</strong> '+thin.map(function(r){return esc(r.chapter)+' · '+r.correct+'/'+r.total;}).join('; ')+'</p>':'')+
        '<p class="chapter-note">These are indicators from your recorded answers. Reviewing an explanation does not change your original result.</p>';
      var sets=M.setCoverage(chosen,subject);
      graph.querySelector('#setCoverage').innerHTML=sets.length?'<h3 style="font-size:14px;margin-top:20px;">Set coverage</h3>'+sets.map(function(g){return '<p class="chapter-note"><strong>'+esc(g.chapter)+'</strong> · '+g.completed+(g.planned?' / '+g.planned:'')+' distinct sets attempted · '+g.attempts+' total attempts'+(!g.planned?' · total available sets not set':'')+'</p>';}).join(''):'';
      drawLine();
    }
    sub.addEventListener('change',drawAll);type.addEventListener('change',drawAll);topic.addEventListener('change',drawLine);drawAll();
  }
  root.ChapterUI={mountEditor:mountEditor,mountDashboard:mountDashboard,escape:esc};
})(window);
