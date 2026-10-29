/* LedgerPeer AI Tutor: dependency-free student-safe response renderer.
   AI text is always untrusted. Construct elements, never parse untrusted HTML. */
(function(){
"use strict";
const MATH_RE=/\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$/g;
const INLINE_RE=/LPMATHTOKEN\d+END|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|~~([^~\n]+)~~|\x60([^\x60\n]+)\x60|\*([^*\n]+)\*/g;
const isFence=l=>/^\s{0,3}(?:\x60{3}|~{3})/.test(l);
const isList=l=>/^\s{0,6}(?:[-*+]\s+|\d+[.)]\s+)/.test(l);
const isHeading=l=>/^\s{0,3}#{1,6}\s+/.test(l);
const isQuote=l=>/^\s{0,3}>\s?/.test(l);
function partText(s,p){if(s)p.appendChild(document.createTextNode(s));}
function plaintext(s,p){
 String(s).split("\n").forEach((segment,i)=>{if(i)p.appendChild(document.createElement("br"));partText(segment,p);});
}
function extractMath(text){
 const math=[];
 const chunks=String(text||"").split(/((?:^|\n)[ \t]*(?:\x60{3}|~{3})[\s\S]*?(?:^|\n)[ \t]*(?:\x60{3}|~{3})[^\n]*(?=\n|$))/gm);
 const output=chunks.map((chunk,i)=>{
  if(i%2===1)return chunk;
  return chunk.replace(MATH_RE,raw=>{
   const display=raw.startsWith("$$")||raw.startsWith("\\[");
   const tex=raw.slice(2,-2).trim();
   const id=math.push({tex,display})-1;
   return "LPMATHTOKEN"+id+"END";
  });
 }).join("");
 return {text:output,math};
}
function readableMath(tex){
 return String(tex||"").replace(/\\(?:text|mathrm|operatorname)\{([^{}]*)\}/g,"$1")
 .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,"($1) / ($2)")
 .replace(/\\(?:times|cdot)\b/g," × ").replace(/\\div\b/g," ÷ ")
 .replace(/\\approx\b/g," ≈ ").replace(/\\geq\b/g," ≥ ").replace(/\\leq\b/g," ≤ ")
 .replace(/\\%/g,"%").replace(/\\(?:left|right)\b/g,"").replace(/\\,/g," ").trim();
}
function mathNode(entry){
 const item=entry||{tex:"",display:false};
 const el=document.createElement(item.display?"div":"span");
 el.className="tutor-math"+(item.display?" tutor-math-display":"");
 el.setAttribute("aria-label",readableMath(item.tex));
 try{
  if(typeof window.katex?.render==="function"){
   window.katex.render(item.tex,el,{displayMode:item.display,throwOnError:false,trust:false,strict:"ignore",maxExpand:100,maxSize:10});
   return el;
  }
 }catch{}
 el.textContent=readableMath(item.tex);return el;
}
function inline(s,parent,math,depth=0){
 const text=String(s||"");
 if(depth>3){plaintext(text,parent);return;}
 const re=new RegExp(INLINE_RE.source,"g");let match,last=0;
 while((match=re.exec(text))){
  if(match.index>last)plaintext(text.slice(last,match.index),parent);
  let el;
  if(/^LPMATHTOKEN\d+END$/.test(match[0])){
   const index=Number(match[0].match(/\d+/)?.[0]);
   el=mathNode(math[index]);parent.appendChild(el);
  }else if(match[1]&&match[2]){
   el=document.createElement("a");el.textContent=match[1];
   try{
    const url=new URL(match[2]);
    if(url.protocol==="https:"||url.protocol==="http:"){
     el.href=url.href;el.rel="noopener noreferrer nofollow";el.target="_blank";
    }
   }catch{}
   parent.appendChild(el);
  }else if(match[3]||match[4]){
   el=document.createElement("strong");inline(match[3]||match[4],el,math,depth+1);parent.appendChild(el);
  }else if(match[5]){
   el=document.createElement("del");inline(match[5],el,math,depth+1);parent.appendChild(el);
  }else if(match[6]){
   el=document.createElement("code");el.textContent=match[6];parent.appendChild(el);
  }else if(match[7]){
   el=document.createElement("em");inline(match[7],el,math,depth+1);parent.appendChild(el);
  }else plaintext(match[0],parent);
  last=re.lastIndex;
 }
 if(last<text.length)plaintext(text.slice(last),parent);
}
function cells(line){
 let s=String(line).trim();
 if(s.startsWith("|"))s=s.slice(1);
 if(s.endsWith("|")&&!s.endsWith("\\|"))s=s.slice(0,-1);
 return s.split(/(?<!\\)\|/).map(x=>x.trim().replace(/\\\|/g,"|"));
}
function divider(line){
 return Boolean(line&&line.includes("|")&&cells(line).length>=2&&cells(line).every(x=>/^:?-{3,}:?$/.test(x)));
}
function table(lines,math){
 const headings=cells(lines[0]).slice(0,7);
 const region=document.createElement("div");region.className="tutor-table-scroll";
 region.tabIndex=0;region.setAttribute("role","region");region.setAttribute("aria-label","Study table; horizontally scrollable if necessary");
 const tab=document.createElement("table");
 const head=document.createElement("thead"),header=document.createElement("tr");
 headings.forEach(label=>{const th=document.createElement("th");th.scope="col";inline(label,th,math);header.appendChild(th);});
 head.appendChild(header);tab.appendChild(head);
 const body=document.createElement("tbody");
 for(const row of lines.slice(2,32)){
  const values=cells(row),tr=document.createElement("tr");
  headings.forEach((label,i)=>{
   const td=document.createElement("td");td.dataset.heading=label.replace(/\*/g,"").slice(0,100);
   inline(values[i]||"",td,math);tr.appendChild(td);
  });
  body.appendChild(tr);
 }
 tab.appendChild(body);region.appendChild(tab);return region;
}
function code(lines,language){
 const block=document.createElement("section");block.className="tutor-code-card";
 const tools=document.createElement("div");tools.className="tutor-code-toolbar";
 const name=document.createElement("span");name.textContent=language||"CODE";
 const copy=document.createElement("button");copy.type="button";copy.className="tutor-code-copy";
 copy.textContent="Copy code";copy.setAttribute("aria-label","Copy code block");
 const pre=document.createElement("pre"),child=document.createElement("code");child.textContent=lines.join("\n");
 pre.appendChild(child);tools.append(name,copy);block.append(tools,pre);
 copy.addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(child.textContent);copy.textContent="Copied ✓";}
  catch{copy.textContent="Select the code to copy";}
 });
 return block;
}
function blocks(raw,math){
 const lines=String(raw).replace(/\r/g,"").split("\n").slice(0,700);
 const root=document.createDocumentFragment();
 let i=0;
 while(i<lines.length){
  const l=lines[i];
  if(!l.trim()){i++;continue;}
  if(isFence(l)){
   const marker=l.trim().slice(0,3),language=l.trim().slice(3).trim().split(/\s+/)[0].slice(0,30);
   const rows=[];i++;
   while(i<lines.length&&!lines[i].trim().startsWith(marker)){rows.push(lines[i]);i++;}
   if(i<lines.length)i++;root.appendChild(code(rows,language));continue;
  }
  if(/^LPMATHTOKEN\d+END$/.test(l.trim())){
   root.appendChild(mathNode(math[Number(l.match(/\d+/)?.[0])]));
   i++;continue;
  }
  if(isHeading(l)){
   const m=/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(l);
   if(m){const h=document.createElement("h"+Math.min(m[1].length+1,5));inline(m[2],h,math);root.appendChild(h);}
   i++;continue;
  }
  if(i+1<lines.length&&l.includes("|")&&divider(lines[i+1])){
   const rows=[l,lines[i+1]];i+=2;
   while(i<lines.length&&lines[i].trim().includes("|")&&rows.length<32){rows.push(lines[i]);i++;}
   root.appendChild(table(rows,math));continue;
  }
  if(/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(l)){root.appendChild(document.createElement("hr"));i++;continue;}
  if(isQuote(l)){
   const q=[];while(i<lines.length&&isQuote(lines[i])){q.push(lines[i].replace(/^\s{0,3}>\s?/,""));i++;}
   const el=document.createElement("blockquote");inline(q.join("\n"),el,math);root.appendChild(el);continue;
  }
  if(isList(l)){
   const ordered=/^\s{0,6}\d+[.)]\s+/.test(l);
   const list=document.createElement(ordered?"ol":"ul");
   while(i<lines.length&&isList(lines[i])&&/^\s{0,6}\d+[.)]\s+/.test(lines[i])===ordered){
    const li=document.createElement("li");
    inline(lines[i].replace(/^\s{0,6}(?:[-*+]\s+|\d+[.)]\s+)/,""),li,math);i++;
    while(i<lines.length&&/^\s{3,}\S/.test(lines[i])&&!isList(lines[i])){
     li.appendChild(document.createElement("br"));inline(lines[i].trim(),li,math);i++;
    }
    list.appendChild(li);
   }
   root.appendChild(list);continue;
  }
  const paragraph=[];
  while(i<lines.length&&lines[i].trim()){
   const v=lines[i];
   if(paragraph.length&&(isFence(v)||isHeading(v)||isList(v)||isQuote(v)||/^LPMATHTOKEN\d+END$/.test(v.trim())||(i+1<lines.length&&v.includes("|")&&divider(lines[i+1]))))break;
   paragraph.push(v.trim());i++;
  }
  if(paragraph.length){
   const p=document.createElement("p");inline(paragraph.join("\n"),p,math);root.appendChild(p);
  }else i++;
 }
 return root;
}
function render(container,answer){
 const text=String(answer||"").slice(0,16000);
 try{
  const doc=extractMath(text);
  container.replaceChildren(blocks(doc.text,doc.math));
  container.classList.add("tutor-rendered");
 }catch(e){
  container.textContent=text;
  container.classList.remove("tutor-rendered");
 }
}
window.LedgerPeerTutorRenderer={render,extractMath,cells,readableMath};
})();