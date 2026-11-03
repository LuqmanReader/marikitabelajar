/* User-triggered, self-contained export from a finished Moodle review page.
 * No bypass, credential collection, analytics calls, or server upload.
 * Resolves visible question figures from the student's authenticated page,
 * embeds them as data URLs, and downloads a single HTML file for LedgerPeer.
 */
(()=>{
 'use strict';
 const HOSTS=new Set(['ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com','flex.tymbaedu.com']);
 const MAX_IMAGE_BYTES=3500000,MAX_TOTAL_BYTES=18000000;
 function validSource(){
  return location.protocol==='https:'&&HOSTS.has(location.hostname)&&location.pathname==='/mod/quiz/review.php';
 }
 function asDataUrl(blob){
  return new Promise((resolve,reject)=>{
   const reader=new FileReader();reader.onload=()=>resolve(reader.result);
   reader.onerror=()=>reject(new Error('Cannot read image'));reader.readAsDataURL(blob);
  });
 }
 function safeMime(type){return /^image\/(?:png|jpeg|gif|webp)$/i.test(type||'');}
 async function encodeImage(original){
  const raw=original.currentSrc||original.getAttribute('src')||original.getAttribute('data-src')||'';
  if(/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(raw)&&raw.length<MAX_IMAGE_BYTES*1.5)return raw;
  let url;
  try{url=new URL(raw,document.baseURI);}catch{return null;}
  // The extension never fetches any remote host outside the current review
  // origin, including image URLs embedded in untrusted question HTML.
  if(url.protocol!=='https:'||url.origin!==location.origin)return null;
  try{
   const response=await fetch(url.href,{credentials:'same-origin',redirect:'follow'});
   if(!response.ok||!safeMime(response.headers.get('content-type')?.split(';')[0]))return null;
   const blob=await response.blob();if(blob.size>MAX_IMAGE_BYTES)return null;
   return await asDataUrl(blob);
  }catch{return null;}
 }
 function encodeCanvas(original){
  try{
   const data=original.toDataURL('image/png');
   return data.startsWith('data:image/png;base64,')?data:null;
  }catch{return null;}
 }
 function filteredClone(original){
  const clone=original.cloneNode(true);
  clone.querySelectorAll('form').forEach(n=>n.replaceWith(...Array.from(n.childNodes)));
  clone.querySelectorAll('script,style,iframe,object,embed,button,input[type="hidden"]').forEach(n=>n.remove());
  // Retain only educational content and answer checkbox/radio states.
  // Preserve checked flags on cloned radios/checkboxes.
  clone.querySelectorAll('input').forEach(n=>{
   if(n.checked)n.setAttribute('checked','checked');else n.removeAttribute('checked');
   if(n.type==='text'||n.type==='number')n.setAttribute('value',n.value||'');
   n.removeAttribute('name');n.removeAttribute('id');n.removeAttribute('autocomplete');
  });
  clone.querySelectorAll('textarea').forEach(n=>{n.textContent=n.value||n.textContent;});
  clone.querySelectorAll('select').forEach(n=>[...n.options].forEach(o=>{
   if(o.selected)o.setAttribute('selected','selected');else o.removeAttribute('selected');
  }));
  clone.querySelectorAll('*').forEach(n=>{
   [...n.attributes].forEach(a=>{
    if(/^on/i.test(a.name)||['nonce','action','formaction','integrity'].includes(a.name.toLowerCase()))n.removeAttribute(a.name);
   });
  });
  return clone;
 }
 async function exportReview(){
  if(!validSource())throw Error('Open a finished ILE or Group B quiz Review page first.');
  const originals=[...document.querySelectorAll('div.que')];
  if(!originals.length)throw Error('No reviewed Moodle questions were found.');
  const cloned=originals.map(filteredClone);
  let embedded=0,missing=0,total=0;
  for(let i=0;i<originals.length;i++){
   const srcImgs=[...originals[i].querySelectorAll('img')];
   const destImgs=[...cloned[i].querySelectorAll('img')];
   for(let j=0;j<Math.min(srcImgs.length,destImgs.length);j++){
    const img=destImgs[j];img.removeAttribute('srcset');img.removeAttribute('data-src');
    const data=await encodeImage(srcImgs[j]);
    if(data&&total+data.length<=MAX_TOTAL_BYTES){
     img.setAttribute('src',data);img.setAttribute('alt',img.getAttribute('alt')||'Original question image');
     total+=data.length;embedded++;
    }else{
     img.replaceWith(document.createTextNode('[Image unavailable in this export — attach a screenshot of the original question.]'));
     missing++;
    }
   }
   const oldCanvases=[...originals[i].querySelectorAll('canvas')];
   const newCanvases=[...cloned[i].querySelectorAll('canvas')];
   for(let j=0;j<Math.min(oldCanvases.length,newCanvases.length);j++){
    const data=encodeCanvas(oldCanvases[j]);
    if(data&&total+data.length<=MAX_TOTAL_BYTES){
     const image=document.createElement('img');image.src=data;image.alt='Original question canvas figure';
     newCanvases[j].replaceWith(image);total+=data.length;embedded++;
    }else{newCanvases[j].replaceWith(document.createTextNode('[Image unavailable in this export — attach a screenshot of the original question.]'));missing++;}
   }
  }
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><title>LedgerPeer completed attempt review</title></head><body>'+
    '<main>'+cloned.map(n=>n.outerHTML).join('\n')+'</main></body></html>';
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  const href=URL.createObjectURL(blob),link=document.createElement('a');
  const id=new URL(location.href).searchParams.get('attempt')||'review';
  link.href=href;link.download='ledgerpeer-tymbaflex-review-'+id+'-with-images.html';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(href),60000);
  return {ok:true,questions:cloned.length,images_embedded:embedded,images_missing:missing};
 }
 if(typeof chrome!=='undefined'&&chrome.runtime?.onMessage){
  chrome.runtime.onMessage.addListener((message,sender,reply)=>{
   if(message?.type!=='LP_EXPORT_REVIEW_WITH_IMAGES')return;
   exportReview().then(reply).catch(err=>reply({ok:false,error:err.message||String(err)}));
   return true;
  });
 }
 window.LedgerPeerReviewFigureExport={exportReview};
})();