/* LedgerPeer PDF text-layout evidence.
   Reads PDF.js selectable text items with their original coordinates.
   This is NOT image or chart vision: vectors, bars and embedded images are not decoded.
   Rows/columns are heuristic reading aids, never verified graphical measurements. */
(function(root){
 'use strict';
 function tidy(x){return String(x==null?'':x).replace(/\s+/g,' ').trim();}
 function extract(content){
  const items=Array.isArray(content&&content.items)?content.items:[];
  const positioned=[],fallback=[];
  for(let i=0;i<items.length;i++){
   const item=items[i];
   const text=tidy(item.str);
   if(!text)continue;
   const tr=item.transform;
   if(!Array.isArray(tr)||tr.length<6||!Number.isFinite(Number(tr[4]))||!Number.isFinite(Number(tr[5]))){
    fallback.push({index:i,text});continue;
   }
   positioned.push({index:i,text,x:Math.round(Number(tr[4])*10)/10,
    y:Math.round(Number(tr[5])*10)/10,
    w:Number.isFinite(Number(item.width))?Math.max(0,Number(item.width)):0,
    height:Number.isFinite(Number(item.height))?Math.max(0,Number(item.height)):0,
    eol:!!item.hasEOL});
  }
  if(!positioned.length)return {text:items.map(x=>(x.str||'')+(x.hasEOL?'\n':' ')).join('').trim(),rows:[],method:'sequence'};
  const all=positioned.slice().sort((a,b)=>b.y-a.y||a.x-b.x||a.index-b.index);
  const rows=[];
  for(const token of all){
   const last=rows[rows.length-1];
   const tolerance=Math.min(4,Math.max(1.4,(token.height||10)*0.25));
   if(last&&Math.abs(last.y-token.y)<=tolerance){
    last.tokens.push(token);
    last.y=last.tokens.reduce((sum,x)=>sum+x.y,0)/last.tokens.length;
   }else rows.push({y:token.y,tokens:[token]});
  }
  const output=rows.map(row=>{
   row.tokens.sort((a,b)=>a.x-b.x||a.index-b.index);
   const parts=[],cells=[];
   let previous=null;
   for(const token of row.tokens){
    let sep='';
    if(previous){
     const gap=token.x-(previous.x+previous.w);
     if(gap>26)sep='  |  ';
     else if(gap>2.5)sep=' ';
     else if(/[a-z\d]$/i.test(previous.text)&&/^[a-z\d]/i.test(token.text))sep=' ';
     else if(previous.eol)sep=' ';
    }
    parts.push(sep+token.text);
    cells.push({text:token.text,x:token.x});
    previous=token;
   }
   return {y:Math.round(row.y*10)/10,text:tidy(parts.join('')),cells};
  }).filter(row=>row.text);
  const filtered=output.slice(0,1200);
  return {text:filtered.map(r=>r.text).join('\n'),rows:filtered,method:'pdf-text-coordinate-layout'};
 }
 function selectRows(rows,qno){
  if(!Array.isArray(rows)||!rows.length)return [];
  const starts=rows.map((r,i)=>{
   const match=String(r.text||'').match(/^Question\s+(\d{1,3})\b/i);
   return match?{i,qno:Number(match[1])}:null;
  }).filter(Boolean);
  const anchor=starts.find(x=>x.qno===Number(qno));
  if(!anchor)return [];
  const next=starts.find(x=>x.i>anchor.i);
  const end=next?next.i:Math.min(rows.length,anchor.i+45);
  return rows.slice(anchor.i,end).slice(0,45).map(row=>({
   text:row.text.slice(0,260),
   cells:(row.cells||[]).slice(0,12).map(cell=>({text:tidy(cell.text).slice(0,90),x:cell.x}))
  }));
 }
 function compactEvidence(q){
  const rows=Array.isArray(q.pdf_layout_rows)?q.pdf_layout_rows:[];
  if(!rows.length)return null;
  const text=String(q.qtext||'')+' '+String(q.information||'');
  const requiresShape=/\b(?:chart|graph|table|diagram|figure|shown below|exhibit)\b/i.test(text);
  if(!requiresShape)return null;
  const candidate=rows.filter(r=>{
   const cells=Array.isArray(r.cells)?r.cells:[];
   return cells.length>=2&&cells.some(c=>/\d/.test(c.text));
  }).slice(0,7);
  if(!candidate.length)return {type:'pdf_text_positions',note:'Question refers to a visual, but encoded values/labels could not be isolated. Do not infer graphical measures.'};
  return {type:'pdf_text_positions',note:'Text positions are from the PDF text layer; labels/axis ticks do not establish bar heights or chart geometry.',
   rows:candidate.map(row=>({text:row.text.slice(0,170),
    tokens:row.cells.slice(0,8).map(c=>[c.text,Math.round(c.x)])}))};
 }
 root.LedgerPeerPdfLayout={extract,selectRows,compactEvidence};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.LedgerPeerPdfLayout;
})(typeof window!=='undefined'?window:globalThis);
