// Run: node tests/auto-debrief.test.js
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
async function main(){
 const saved={
  'tymba_custom_exams':JSON.stringify([{id:'a1',subject:'FA2',testType:'pre',testNumber:1}]),
  'tymba_exam_data:a1':JSON.stringify([{qno:1,is_correct:false,qtext:'2+2',options:[],your_answer:'3',correct_answer:'4'},
   {qno:2,is_correct:true,qtext:'3+3',options:[],your_answer:'6',correct_answer:'6'}])
 };
 let calls=0,syncs=0;
 const storage={getItem:k=>saved[k]||null,setItem:(k,v)=>{saved[k]=v}};
 const auth={ready:async()=>true,sync:async()=>{syncs++;return true;},getClient:()=>({
  auth:{getSession:async()=>({data:{session:{access_token:'mock'}}})},
  functions:{invoke:async(name,{body})=>{
   assert.equal(name,'analyze-attempt');calls++;assert.equal(body.subject,'FA2');
   return {data:{questions:body.qnos.map(qno=>({qno,chapter:'Arithmetic',
    reasoning:'Explanation',calculation:'Formula',justification:'Answer verification',focus:'Next exercise'}))}};
  }}
 })};
 const context={
  window:{PersonalHubAuth:auth,LedgerSyllabus:{resolve:()=>({topics:['Arithmetic']})}},
  localStorage:storage,location:{search:'?id=a1&autodebrief=1',replace:()=>{}},
  document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null},
  ExamModel:{normalize:x=>x},RevisionFlow:{
   signature:()=>'test-signature',
   review:(response,old)=>({count:response.questions.length,questions:old.map(q=>{
    const incoming=response.questions.find(z=>z.qno===q.qno);return incoming?{...q,...incoming}:q;
   })}),save:(store,k,value)=>store.setItem(k,JSON.stringify(value))
  },URLSearchParams,console
 };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../auto-debrief.js'),'utf8'),context);
 await context.window.LedgerPeerAutoDebrief.start(true);
 const result=JSON.parse(saved['tymba_exam_data:a1']);
 assert.equal(calls,1);assert.equal(syncs,2);
 assert.ok(result.every(q=>q.reasoning&&q.justification));
 assert.deepEqual(result.map(q=>q.is_correct),[false,true]);
 assert.deepEqual(result.map(q=>q.correct_answer),['4','6']);
 console.log('Automated debrief: authenticated request, saved feedback and original marks preserved.');
}
main().catch(err=>{console.error(err);process.exitCode=1;});
