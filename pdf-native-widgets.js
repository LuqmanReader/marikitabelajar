/* Native AcroForm answer evidence. Only actual PDF widget values may establish
 * unanswered input states; ordinary printed/scanned marks require visual proof.
 */
(function(root){
'use strict';
function clean(s){return String(s==null?'':s).trim();}
function widgets(annotations,viewport,pageNumber){
  return (annotations||[]).map(function(a){
    if(a.subtype!=='Widget'&&!a.fieldType)return null;
    var r=a.rect||a.rectangle;
    if(!Array.isArray(r)||r.length!==4)return null;
    var px=viewport&&typeof viewport.convertToViewportRectangle==='function'?
      viewport.convertToViewportRectangle(r):r;
    var x=Math.min(px[0],px[2]),y=Math.min(px[1],px[3]);
    var value=clean(a.fieldValue),option=clean(a.buttonValue);
    var type=clean(a.fieldType)||'unknown',isButton=type==='Btn';
    var filled=isButton?!!value&&value!=='Off'&&(!option||value===option):
      !!value&&value!=='Off';
    return {page:pageNumber,x:x,y:y,w:Math.abs(px[2]-px[0]),h:Math.abs(px[3]-px[1]),
      fieldName:clean(a.fieldName),value:value,option:option,type:type,
      filled:filled,radioButton:!!a.radioButton,checkBox:!!a.checkBox,
      provenance:'native-pdf-widget'};
  }).filter(Boolean);
}
function attach(questions,pages){
  if(!Array.isArray(questions)||!Array.isArray(pages))return;
  questions.forEach(function(q){
    var regions=Array.isArray(q.source_regions)?q.source_regions:[];
    var captured=[];
    pages.forEach(function(page){
      (page.widgets||[]).forEach(function(widget){
        var inRegion=regions.some(function(r){
          var cx=widget.x+widget.w/2,cy=widget.y+widget.h/2;
          return r.page===widget.page&&cx>=r.x-10&&cx<=r.x+r.w+10&&cy>=r.y-10&&cy<=r.y+r.h+10;
        });
        if(inRegion)captured.push(widget);
      });
    });
    if(!captured.length)return;
    q.native_widgets=captured.map(function(w){
      return {page:w.page,fieldName:w.fieldName,type:w.type,filled:w.filled,
        selectedValue:w.filled?(w.option||w.value):null};
    });
    var selected=captured.filter(function(w){return w.filled});
    if(!selected.length){
      // This is a real empty input state from the PDF's form data.
      if(!q.your_answer){
        q.answer_state='unanswered';
        q.answer_state_evidence='native-pdf-widgets-empty';
      }
      return;
    }
    if(q.answer_capture_status==='captured'&&q.your_answer)return;
    var values=selected.map(function(w){return w.option||w.value}).filter(Boolean);
    if(values.length){
      q.your_answer=values.join(' | ');
      q.answer_capture_status='captured';
      q.answer_capture_method='native-pdf-form';
      q.answer_state='answered';
      q.answer_state_evidence='native-pdf-widget-values';
    }
  });
}
root.LedgerPeerPdfWidgets={widgets:widgets,attach:attach};
})(window);