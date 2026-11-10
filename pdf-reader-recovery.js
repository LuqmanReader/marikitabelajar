/* LedgerPeer automatic page recovery.
 * Compare independent readers using observable page evidence, not a grade guess.
 * Never treat absent selected text as an unanswered question.
 */
(function(root){
'use strict';
function clean(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
function summarize(candidate){
  var lines=(candidate&&candidate.lines||[]).map(clean).filter(Boolean);
  var joined=lines.join(' '),letters=(joined.match(/[A-Za-z]/g)||[]).length;
  var anchors=lines.filter(function(line){
    return /^(?:question|q\.?)\s*\d{1,3}\s*[:.)-]?\s*$/i.test(line);
  }).length;
  var grades=lines.filter(function(line){
    return /^(?:correct|incorrect|inconect|incorect|corect|comet|partially\s+correct|not\s+answered|unanswered)$/i.test(line)
      ||/\b(?:mark|wark|score)\b[\s:]*\d+[\s.,/\d]*(?:out\s*(?:of)?|auto|\/)/i.test(line);
  }).length;
  var badGlyphs=(joined.match(/[�©®§□■◊]/g)||[]).length;
  var malformed=(joined.match(/\b(?:hitps|tymbaedu\.commod|quizireview|eamed|retums|corect|inconect|wark)\b/gi)||[]).length;
  var symbols=(joined.match(/[A-Za-z0-9]/g)||[]).length;
  var confidence=Number(candidate&&candidate.confidence);
  var hasConfidence=Number.isFinite(confidence)&&confidence>=0&&confidence<=100;
  var words=joined.split(/\s+/).filter(Boolean);
  var score=anchors*35+Math.min(grades,anchors*2+2)*7+
    Math.min(30,letters/35)+Math.min(22,words.length/6)-
    Math.min(30,badGlyphs*1.2)-Math.min(25,malformed*2);
  if(hasConfidence)score+=(confidence-65)*.22;
  if(symbols===0)score-=45;
  return {score:Math.round(score*100)/100,anchors:anchors,grades:grades,words:words.length,
    badGlyphs:badGlyphs,malformed:malformed,confidence:hasConfidence?confidence:null};
}
function retryReason(candidate,context){
  context=context||{};
  var stats=summarize(candidate);
  if(!stats.words)return 'empty_page';
  if(stats.confidence!==null&&stats.confidence<78)return 'low_ocr_confidence';
  if(stats.words>25&&stats.badGlyphs>=7)return 'damaged_text_glyphs';
  if(stats.words>25&&stats.malformed>=4)return 'many_ocr_distortions';
  if(context.expectQuestionHeader===true&&stats.anchors===0&&stats.words>20)return 'missing_question_heading';
  return '';
}
function choose(first,second,options){
  options=options||{};
  var a=summarize(first),b=summarize(second);
  var reason='',winner='first';
  if(!second||!Array.isArray(second.lines)||!second.lines.length)return {
    chosen:first,source:'first',first:a,second:second?b:null,
    reason:'retry_produced_no_text',improved:false};
  // Additional question headings count most strongly because a missing
  // heading can erase a whole exam item. A change in grade cannot prove that.
  var aWords=a.words,bWords=b.words;
  var substantialLoss=aWords>=18&&bWords<aWords*.58;
  var lowAnchorRisk=b.anchors<a.anchors;
  var improvement=b.score-a.score;
  if(!substantialLoss&&!lowAnchorRisk&&
    (b.anchors>a.anchors&&bWords>=Math.max(6,aWords*.55)||improvement>=13)){
    winner='second';reason=b.anchors>a.anchors?'recovered_question_boundaries':'higher_evidence_quality';
  }else if(substantialLoss)reason='retry_lost_substantial_text';
  else if(lowAnchorRisk)reason='retry_lost_question_boundaries';
  else reason='original_evidence_preferred';
  return {chosen:winner==='second'?second:first,source:winner,
    first:a,second:b,reason:reason,improved:winner==='second'};
}
function auditPage(page){
  var evidence=page&&page.recovery||null;
  var lineStats=summarize({lines:page&&page.lines,confidence:page&&page.ocrConfidence});
  var candidates=evidence&&Array.isArray(evidence.attempts)?evidence.attempts:[];
  return {page:page&&page.number||null,
    evidenceSource:page&&page.layout&&page.layout.source||'text',
    lines:lineStats.words,questionHeadings:lineStats.anchors,
    retries:candidates.length>1?candidates.length-1:0,
    retryUsed:!!(evidence&&evidence.improved),
    requiresOriginalVisual:!!(page&&page.originalVisualRequired)||
      !!(lineStats.words<5)||(lineStats.badGlyphs>=8),
    quality:evidence&&evidence.reason||'initial_read'};
}
root.LedgerPeerPdfRecovery={summarize:summarize,retryReason:retryReason,choose:choose,auditPage:auditPage};
})(window);