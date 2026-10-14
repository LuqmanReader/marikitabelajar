/* LedgerPeer marker-aware PDF answer recovery for TYMBAFlex screenshot exports.
   Uses colored tick/cross markers and Tesseract TSV position data.
   Never assumes that a missing red/green marker proves what the student chose. */
(function(root){
 "use strict";
 function wordsFromTsv(tsv) {
  if(typeof tsv!=="string")return [];
  const rows=tsv.split(/\r?\n/), words=[];
  for(let i=1;i<rows.length;i++){
   const v=rows[i].split("\t");
   if(v.length<12||v[0]!=="5")continue;
   const x=+v[6],y=+v[7],w=+v[8],h=+v[9],t=v.slice(11).join("\t").trim();
   if(!t||![x,y,w,h].every(Number.isFinite)||!w||!h)continue;
   words.push({x,y,w,h,t,group:v.slice(1,5).join(":"),mid:y+h/2});
  }
  return words;
 }
 function questionAnchors(words, questions) {
  const expected=new Set(questions.map(q=>q.qno));
  const anchors=[];
  for(let i=0;i<words.length;i++){
   const a=words[i];
   if(!/^question[:.]?$/i.test(a.t))continue;
   const b=words.filter(w=>w.x>=a.x+a.w-3&&w.x<a.x+a.w+85&&Math.abs(w.mid-a.mid)<16)
    .sort((u,v)=>u.x-v.x)[0];
   if(!b)continue;
   const n=Number(b.t.replace(/[^\d]/g,""));
   if(expected.has(n)&&!anchors.some(v=>v.qno===n))anchors.push({qno:n,y:a.y});
  }
  return anchors.sort((a,b)=>a.y-b.y);
 }
 function colorMarkers(canvas) {
  const w=canvas.width,h=canvas.height,ctx=canvas.getContext("2d",{willReadFrequently:true});
  const data=ctx.getImageData(0,0,w,h).data;
  const markers=[];
  // Use actual red/green glyph pixels, rather than trusting the OCR of an icon.
  for(const color of ["incorrect","correct"]){
   const seen=new Uint8Array(w*h);
   function match(index){
    const k=index*4,r=data[k],g=data[k+1],b=data[k+2];
    return color==="incorrect"
      ? r>140&&r>g*1.65&&r>b*1.55&&g<145
      : g>65&&g>r*1.35&&g>b*1.16;
   }
   for(let y=48;y<h-40;y++)for(let x=35;x<w-35;x++){
    const origin=y*w+x;if(seen[origin]||!match(origin))continue;
    seen[origin]=1;
    const queue=[origin];let head=0,minX=x,maxX=x,minY=y,maxY=y,count=0;
    while(head<queue.length&&count<400){
     const p=queue[head++],cx=p%w,cy=(p/w)|0;count++;
     if(cx<minX)minX=cx;if(cx>maxX)maxX=cx;
     if(cy<minY)minY=cy;if(cy>maxY)maxY=cy;
     for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;
      const nx=cx+dx,ny=cy+dy;
      if(nx<35||nx>=w-35||ny<48||ny>=h-40)continue;
      const k=ny*w+nx;if(seen[k]||!match(k))continue;
      seen[k]=1;queue.push(k);
     }
    }
    const bw=maxX-minX+1,bh=maxY-minY+1;
    if(count>=25&&count<=230&&bw>=10&&bw<=38&&bh>=10&&bh<=38&&bw/bh>=0.7&&bw/bh<=1.4)
     markers.push({x:minX,y:minY,w:bw,h:bh,color,mid:minY+bh/2});
   }
  }
  return markers;
 }
 function markedLine(words,marker){
  // The answer's final word sits immediately to the left of the status icon.
  const left=words.filter(w=>w.x+w.w<=marker.x+5&&w.x+w.w>=marker.x-85
     &&Math.abs(w.mid-marker.mid)<=13
     &&!/^[@✓✗×]$/.test(w.t))
    .sort((a,b)=>b.x+b.w-(a.x+a.w));
  if(!left.length)return null;
  const end=left[0];
  const row=words.filter(w=>w.group===end.group&&Math.abs(w.mid-end.mid)<=12
     &&w.x<=end.x+end.w+1&&w.x>=35
     &&!/^[@✓✗×]$/.test(w.t))
    .sort((a,b)=>a.x-b.x);
  const answer=row.map(w=>w.t).join(" ").trim();
  // Exclude header/footer or an OCR artifact rather than claiming we captured it.
  return answer&&answer.length<=420&&!/^the correct answer/i.test(answer)?answer:null;
 }
 function capture(canvas,tsv,questions){
  if(!tsv||!questions.length)return;
  const words=wordsFromTsv(tsv),anchors=questionAnchors(words,questions);
  if(!words.length||!anchors.length)return;
  const markers=colorMarkers(canvas);
  // Multiple-response questions may have several selected lines, including
  // both red and green markers. Preserve all; never stop after the first answer.
  const found=new Map();
  for(const mark of markers.sort((a,b)=>a.mid-b.mid)){
   const owner=anchors.filter(a=>a.y<mark.mid-12).at(-1);
   if(!owner)continue;
   const next=anchors.find(a=>a.y>owner.y);
   if(next&&mark.mid>=next.y-5)continue;
   const q=questions.find(q=>q.qno===owner.qno);
   if(!q)continue;
   const answer=markedLine(words,mark);
   if(!answer)continue;
   const key=q.qno,entries=found.get(key)||[];
   if(!entries.some(e=>e.answer===answer))entries.push({answer,marker:mark.color,y:mark.mid});
   found.set(key,entries);
  }
  for(const q of questions){
   const entries=found.get(q.qno)||[];
   if(!entries.length)continue;
   q.your_answer=entries.map(e=>e.answer).join(" | ");
   q.selected_answers=entries.map(e=>e.answer);
   q.answer_markers=entries.map(e=>e.marker);
   q.answer_capture="colored-marker-ocr";
   q.answer_capture_status="review";
  }
 }
 function attachInformation(questions,pages){
  const ordered=questions.slice().sort((a,b)=>a.qno-b.qno);
  for(const p of pages){
   const raw=String(p.text||"").replace(/\r/g,"");
   const re=/^\s*Information\s*$/gim;let m;
   while((m=re.exec(raw))){
    let chunk=raw.slice(re.lastIndex);
    // Context stops at the NEXT question, not the previous question's answer.
    const stop=chunk.search(/^\s*(?:Question\s+\d{1,3}\b|https?:\/\/|(?:\d{1,2}\/\d{1,2}\/\d{2,4}.*TYMBAFlex))\s*/im);
    if(stop>=0)chunk=chunk.slice(0,stop);
    chunk=chunk.replace(/^\s*\d+\s*\/\s*\d+\s*$/gm,"").trim();
    if(!chunk||chunk.length<18)continue;
    const before=raw.slice(0,m.index);
    const prior=[...before.matchAll(/^\s*Question\s+(\d{1,3})\b/gim)].at(-1);
    const priorNo=prior?+prior[1]:0;
    const explicit=chunk.match(/\bquestions?\s*(\d{1,3})\s*(?:and|&|to|-)\s*(\d{1,3})\b/i);
    const nums=explicit?[Number(explicit[1]),Number(explicit[2])]:null;
    let targets=[];
    if(nums&&nums[1]>=nums[0]&&nums[1]-nums[0]<=5)
     targets=ordered.filter(q=>q.qno>=nums[0]&&q.qno<=nums[1]);
    else if(nums)targets=ordered.filter(q=>nums.includes(q.qno));
    else {
     const countMatch=chunk.match(/\b(?:following|next|relates?\s+to|for)\b[\s\S]{0,80}?\b(two|three|four|2|3|4)\s+questions\b/i)||chunk.match(/\b(two|three|four|2|3|4)\s+questions\b/i);
     const countWord=countMatch&&countMatch[1]&&countMatch[1].toLowerCase();
     const qty=countWord=== "four"||countWord==="4"?4:countWord==="three"||countWord==="3"?3:countWord==="two"||countWord==="2"?2:1;
     targets=ordered.filter(q=>q.qno>priorNo).slice(0,qty);
    }
    for(const q of targets){
     if(q.information&&q.information.includes(chunk))continue;
     q.information=(q.information?q.information+"\n\n":"")+chunk;
     q.qtext="INFORMATION FOR THIS QUESTION:\n"+chunk+"\n\n"+q.qtext;
    }
   }
  }
 }
 root.LedgerPeerPdfMarkers={capture,attachInformation,wordsFromTsv,colorMarkers};
})(window);
