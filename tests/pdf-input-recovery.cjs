// Run: node tests/pdf-input-recovery.cjs
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context={Uint8Array,console};context.window=context;
for(const name of ['pdf-input-health.js','pdf-attempt-reader.js']){
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),context,{filename:name});
}
function bytes(s){return Uint8Array.from([...s].map(c=>c.charCodeAt(0)));}
const health=context.LedgerPeerPdfHealth;
const complete=bytes('%PDF-1.7\n1 0 obj\n<<>>\nendobj\nstartxref\n9\n%%EOF\n');
const damaged=bytes('%PDF-1.4\n'+'broken-entry'.repeat(40));
const detected=health.inspect(complete,'test.pdf','application/pdf');
assert.equal(detected.kind,'pdf');
assert.equal(detected.headerOffset,0);
assert.equal(detected.hasEof,true);
assert.equal(detected.hasStartXref,true);
assert.equal(health.inspect(bytes('   %PDF-1.7\n%%EOF'), 'test.pdf','').headerOffset,3);
assert.equal(health.inspect(bytes('<!doctype html><html><body>Exam</body></html>'),'wrong.pdf','application/pdf').kind,'html');
assert.match(health.explain({name:'InvalidPDFException',message:'Invalid PDF structure'},health.inspect(damaged,'damaged.pdf','application/pdf')),/end-of-file marker is missing/);
assert.match(health.explain({name:'PasswordException',message:'Password required'},detected),/password-protected/);
const invalid=Object.assign(new Error('Invalid PDF structure'),{name:'InvalidPDFException'});
const password=Object.assign(new Error('Password required'),{name:'PasswordException'});
(async()=>{
  let calls=0;
  context.pdfjsLib={
    GlobalWorkerOptions:{},
    getDocument(){
      calls++;
      if(calls===1)return {promise:Promise.reject(invalid),destroy:async()=>{}};
      return {promise:Promise.resolve({numPages:3,destroy:async()=>{}}),destroy:async()=>{}};
    }
  };
  assert.equal((await context.LedgerPeerPdfReader.openDocument(complete)).numPages,3);
  assert.equal(calls,2,'must attempt exactly one fallback');
  calls=0;
  context.pdfjsLib.getDocument=()=>{calls++;return {promise:Promise.reject(invalid),destroy:async()=>{}};};
  await assert.rejects(context.LedgerPeerPdfReader.openDocument(damaged),/end-of-file marker is missing/);
  assert.equal(calls,2,'malformed PDF must not cause infinite retries');
  calls=0;
  context.pdfjsLib.getDocument=()=>{calls++;return {promise:Promise.reject(password),destroy:async()=>{}};};
  await assert.rejects(context.LedgerPeerPdfReader.openDocument(complete),/password-protected/);
  assert.equal(calls,1,'password errors must not be retried');
  // The front-end wiring should keep the existing manual JSON debrief and
  // show recoverable diagnostics, rather than silently saving bad results.
  const entry=fs.readFileSync(path.join(__dirname,'..','attempt-entry.js'),'utf8');
  const html=fs.readFileSync(path.join(__dirname,'..','add-exam.html'),'utf8');
  assert.match(entry,/pendingReparse/);
  assert.match(entry,/\$\('parseAttempt'\)\.hidden=false/);
  assert.match(html,/id="pdfDiagnostics"/);
  assert.match(html,/pdf-input-health\.js/);
  assert.match(html,/Save attempt &amp; open JSON debrief/);
  console.log('PDF input recovery regression: PASS (signature, HTML, EOF, retry, password, diagnostics, workflow)');
})().catch(e=>{console.error(e);process.exitCode=1;});
