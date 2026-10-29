/* Runs on authenticated TYMBAFlex pages. Extracts only whitelisted course metadata. */
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
 if(message?.type!=='LP_READ_VISIBLE_TYMBA')return;
 try{
  const data=window.TymbaBridgeParser?.fromDocument(document,location.href);
  respond(data||null);
 }catch{respond(null);}
});