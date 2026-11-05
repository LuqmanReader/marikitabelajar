/* Provider-independent HTML exam review fallback.
   Prefers semantic text, validates marks conservatively, and never guesses
   checked radio buttons or overwrites source grading. */
(function(root){
'use strict';
function textLines(html){
  var doc=new DOMParser().parseFromString(html,'text/html');
  if(!doc||!doc.body)throw new Error('This HTML document does not contain a readable body.');
  doc.querySelectorAll('script,style,noscript,template,iframe,object,embed,nav,footer').forEach(function(el){el.remove();});
  var source=doc.body.innerHTML;
  // Keep line boundaries without inserting untrusted HTML into the app.
  source=source.replace(/<br\s*\/?>/gi,'\n').replace(/<\/(?:p|div|article|section|li|h[1-6]|tr|table|fieldset|legend|label)>/gi,'\n');
  var flattened=new DOMParser().parseFromString('<body>'+source+'</body>','text/html').body.textContent||'';
  return flattened.split(/\r?\n/).map(function(s){return s.replace(/\s+/g,' ').trim();}).filter(Boolean);
}
function parse(html){
  if(typeof html!=='string'||!/<(?:!doctype|html|body|div|section|article)\b/i.test(html))throw new Error('This is not an HTML document.');
  var lines=textLines(html);
  if(!root.LedgerPeerUniversalDocument)throw new Error('Universal document parser is unavailable. Refresh the page.');
  var result=root.LedgerPeerUniversalDocument.parse([{number:1,lines:lines}]);
  result.warnings.push('Generic HTML importer: source button states and embedded figures are not interpreted automatically. Upload a structured marked-review export if exact answer choices are required.');
  return result;
}
root.LedgerPeerUniversalHtml={parse,textLines};
})(window);
