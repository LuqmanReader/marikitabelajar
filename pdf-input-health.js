/* PDF upload inspection and human-readable diagnostics.
   Never interprets a malformed PDF as a successfully extracted exam. */
(function(root){
'use strict';
function matches(bytes,index,token){
  if(index<0||index+token.length>bytes.length)return false;
  for(var i=0;i<token.length;i++)if(bytes[index+i]!==token.charCodeAt(i))return false;
  return true;
}
function first(bytes,token,maxOffset){
  var end=Math.min(bytes.length-token.length,Math.max(0,maxOffset));
  for(var i=0;i<=end;i++)if(matches(bytes,i,token))return i;
  return -1;
}
function last(bytes,token,maxTail){
  var begin=Math.max(0,bytes.length-maxTail);
  for(var i=bytes.length-token.length;i>=begin;i--)if(matches(bytes,i,token))return i;
  return -1;
}
function inspect(bytes,filename,mime){
  if(!(bytes instanceof Uint8Array))throw new TypeError('Expected file bytes.');
  var headerOffset=first(bytes,'%PDF-',1024);
  // Decode only a small prefix to distinguish an HTML export named .pdf from PDF bytes.
  var prefix='';
  for(var i=0;i<Math.min(bytes.length,512);i++){
    var c=bytes[i];prefix+=c>=32&&c<=126?String.fromCharCode(c):' ';
  }
  var html=/^\s*(?:<!doctype\s+html|<html\b|<head\b|<body\b|<main\b|<div\b|<section\b)/i.test(prefix);
  var expectedPdf=/\.pdf$/i.test(filename||'')||mime==='application/pdf';
  var kind=headerOffset>=0?'pdf':html?'html':'unknown';
  return {
    kind:kind,size:bytes.length,headerOffset:headerOffset,
    hasEof:last(bytes,'%%EOF',131072)>=0,
    hasStartXref:last(bytes,'startxref',131072)>=0,
    expectedPdf:expectedPdf
  };
}
function explain(error,info){
  var name=String(error&&error.name||''),raw=String(error&&error.message||error||'');
  if(name==='PasswordException'||/password.*(required|incorrect|protected)/i.test(raw))
    return 'This PDF is password-protected. Open it with its password, then export or print an unlocked copy before importing.';
  if(!info||info.kind!=='pdf')
    return 'The selected file is not a readable PDF. Download the original PDF again, or upload its actual HTML review export.';
  if(info.size<200)
    return 'This PDF is only '+info.size+' bytes and appears incomplete. Download the full file again.';
  if(name==='InvalidPDFException'||name==='MissingPDFException'||/invalid pdf structure|bad xref|invalid pdf|missing pdf/i.test(raw)){
    if(!info.hasEof)return 'PDF parsing failed and the end-of-file marker is missing. The download may be incomplete. Download it again; if it opens normally in Chrome, use Print → Save as PDF to create a repaired copy.';
    if(!info.hasStartXref)return 'PDF parsing failed and the cross-reference index is missing. Open it in a PDF viewer and Print → Save as PDF, then import the repaired copy.';
    return 'PDF.js could not read this file even after a second parsing attempt. Try opening it in Chrome and Print → Save as PDF, then import the new copy. LedgerPeer has not extracted or graded any questions from it.';
  }
  if(/network|worker|loading|fetch|cdn/i.test(raw))
    return 'The PDF reader could not load completely. Check your connection and choose Retry extraction; your selected file is retained.';
  return 'PDF reading failed: '+raw+'. You can retry extraction without reselecting the file.';
}
root.LedgerPeerPdfHealth={inspect:inspect,explain:explain};
})(window);
