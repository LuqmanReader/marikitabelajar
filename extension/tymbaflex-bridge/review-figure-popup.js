/* Opt-in export of a completed review; no credentials or session data stored. */
(()=>{
 'use strict';
 const button=document.getElementById('exportReviewWithImages');
 const output=document.getElementById('figureExportStatus');
 if(!button||!output)return;
 button.addEventListener('click',async()=>{
  button.disabled=true;
  try{
   const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
   const url=new URL(tab?.url||'');
   if(url.protocol!=='https:'||!['ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com'].includes(url.hostname)
     ||url.pathname!=='/mod/quiz/review.php')
    throw Error('Open a finished ILE or Group B quiz Review page.');
   const r=await chrome.tabs.sendMessage(tab.id,{type:'LP_EXPORT_REVIEW_WITH_IMAGES'});
   if(!r?.ok)throw Error(r?.error||'The review could not be exported.');
   output.textContent='Saved '+r.questions+' questions with '+r.images_embedded+' embedded image(s). '+
    (r.images_missing?r.images_missing+' image(s) could not be recovered; attach those screenshots in LedgerPeer.':'All detectable image elements were embedded.')+
    ' Import the downloaded HTML through LedgerPeer Add Attempt.';
  }catch(e){output.textContent=e.message||'Review export failed. Reload the extension and review page.';}
  finally{button.disabled=false;}
 });
})();