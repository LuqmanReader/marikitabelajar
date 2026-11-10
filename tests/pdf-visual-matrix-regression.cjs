/* Synthetic marked-PDF matrix layout based on FA2 Q20.
 * No real student screenshot is distributed with this test. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const w={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../pdf-matrix-evidence.js'),'utf8'),w);
const matrix=w.window.LedgerPeerPdfMatrixEvidence;
const width=1100,height=600,rgba=new Uint8ClampedArray(width*height*4);
function dot(x,y,c){
 if(x<0||y<0||x>=width||y>=height)return;
 let i=(y*width+x)*4;rgba[i]=c[0];rgba[i+1]=c[1];rgba[i+2]=c[2];rgba[i+3]=255;
}
for(let y=0;y<height;y++)for(let x=0;x<width;x++)dot(x,y,[204,230,234]);
function radio(x,y,selected){
 const v=selected?[198,204,204]:[232,240,241];
 for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)dot(x+dx,y+dy,v);
}
function circle(x,y,colour){
 for(let dy=-11;dy<=11;dy++)for(let dx=-11;dx<=11;dx++){
  const d=Math.hypot(dx,dy);
  if(d>=7.5&&d<=9.5)dot(x+dx,y+dy,colour);
 }
}
radio(756,343,false);radio(824,343,true);
radio(756,388,true);radio(824,388,false);
circle(778,343,[19,145,32]);circle(846,343,[208,42,36]);circle(896,343,[208,42,36]);
circle(778,388,[19,145,32]);circle(896,388,[19,145,32]);
const canvas={width,height,getContext(){return {getImageData(){return {data:rgba,width,height}}};}};
const words=[
 ['Question',105,161,78,20],['19',187,161,18,20],
 ['Question',105,182,78,20],['20',187,182,18,20],
 ['Yes',748,286,28,19],['No',813,286,24,19],
 ["The supplier's invoice has not yet been received",302,332,430,19],
 ['No record was made when the asset was bought',302,378,412,19],
 ['Question',105,529,78,20],['21',187,529,18,20]
];
const heading=['level','page_num','block_num','par_num','line_num','word_num','left','top','width','height','conf','text'].join('\t');
const tsv=[heading,...words.map((v,i)=>[5,1,1,1,i+1,1,v[1],v[2],v[3],v[4],96,v[0]].join('\t'))].join('\n');
const observations=matrix.scan(canvas,tsv,10);
assert.equal(observations.length,1);
const ob=observations[0];
assert.equal(ob.qno,20);
assert.equal(ob.rows.length,2);
assert.equal(ob.complete,true);
assert.equal(ob.rows[0].selected,'No');
assert.equal(ob.rows[0].correct,'Yes');
assert.equal(ob.rows[0].is_correct,false);
assert.equal(ob.rows[1].selected,'Yes');
assert.equal(ob.rows[1].correct,'Yes');
assert.equal(ob.rows[1].is_correct,true);
const questions=[
 {qno:19,source_pdf_pages:[10],your_answer:'58000',correct_answer:'39600'},
 {qno:20,source_pdf_pages:[10],your_answer:null,correct_answer:'',original_marks:0,original_max_marks:2,answer_capture_status:'not_captured'}
];
matrix.apply(questions,observations,[]);
assert.equal(questions[0].your_answer,'58000');
assert.equal(questions[1].answer_capture_status,'captured');
assert.match(questions[1].your_answer,/invoice.*: No/);
assert.match(questions[1].correct_answer,/invoice.*: Yes/);
assert.equal(questions[1].original_marks,0);
assert.equal(questions[1].original_max_marks,2);
assert.equal(questions[1].matrix_answers[1].is_correct,true);
// Ambiguous radios must never be invented as selected answers.
radio(824,343,false);
const ambiguous=matrix.scan(canvas,tsv,10);
assert.equal(ambiguous[0].complete,false);
const missing={qno:20,source_pdf_pages:[10],your_answer:null,correct_answer:'',answer_capture_status:'not_captured'};
matrix.apply([missing],ambiguous,[]);
assert.equal(missing.answer_capture_status,'review');
assert.equal(missing.your_answer,null);
assert.equal(missing.matrix_answers[0].selected,null);
console.log('PASS: FA2 Q20 visual matrix: chosen No/Yes, correct Yes/Yes, 0/2 unchanged; ambiguous radio remains unverified.');