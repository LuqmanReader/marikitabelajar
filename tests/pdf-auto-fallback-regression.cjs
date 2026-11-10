/* Universal fallback policy regression.
 * The page image remains authoritative; OCR candidates are hypotheses.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../pdf-reader-recovery.js'),'utf8'),sandbox);
const policy=sandbox.window.LedgerPeerPdfRecovery;
const clean={
 lines:['Question 20','Incorrect','Mark 0.00 out of 2.00',
  'Jay bought a smart TV but no record of the purchase was entered into his asset register.',
  'Could each of the following reasons explain the discrepancy?','Yes No',
  'The supplier invoice has not been received','No record was made when the asset was bought'],
 confidence:null
};
assert.equal(policy.retryReason(clean), '', 'No OCR confidence is not 0% confidence');
const corrupt={lines:['Inconect','Wark 000 auto 200','Jay bought a TV', 'Nose ee © ® © ®','hitps quizireview eamed retums'],confidence:61};
assert.equal(policy.retryReason(corrupt),'low_ocr_confidence');
const revived={lines:['Question 20','Incorrect','Mark 0.00 out of 2.00',
 'When carrying out a reconciliation Jay could not find a smart TV.',
 'Could each of these reasons explain the discrepancy?',
 'The supplier invoice has not yet been received',
 'No record was made when the asset was bought'],confidence:91};
const recovered=policy.choose(corrupt,revived);
assert.equal(recovered.source,'second');
assert.equal(recovered.improved,true);
assert.equal(recovered.chosen.lines[0],'Question 20');
const worse=policy.choose(revived,{lines:['something'],confidence:98});
assert.equal(worse.source,'first','Higher confidence must not justify losing source text');
const lost=policy.choose(revived,{lines:['Incorrect','Mark 0.00 out of 2.00','No record was made when the asset was bought'],confidence:99});
assert.equal(lost.source,'first','Question-number headings must be retained');
assert.equal(policy.retryReason({lines:['Incorrect','Mark 0.00 out of 2.00',
 'Question text about the physical register and asset sale is intact.'],confidence:null},
 {expectQuestionHeader:true}),'missing_question_heading');
const audited=policy.auditPage({number:10,lines:revived.lines,
 recovery:{reason:'recovered_question_boundaries',improved:true,
 attempts:[{method:'ocr-1.7'},{method:'ocr-2.7'}]}});
assert.equal(audited.retries,1);
assert.equal(audited.retryUsed,true);
const reader=fs.readFileSync(path.join(__dirname,'../pdf-attempt-reader.js'),'utf8');
assert(reader.includes('localOcr(page,i,1.7)'));
assert(reader.includes('await recover(page,i,recognized,false)'));
assert(reader.includes('scale:scale'));
assert(reader.includes('<details class="page-text"'), 'OCR must be hidden as a diagnostic, not displayed as a faithful page');
assert(reader.includes('original image</h2>'));
const ui=fs.readFileSync(path.join(__dirname,'../add-exam.html'),'utf8');
assert(ui.includes('pdf-reader-recovery.js?v=20261111-fallback1'));
console.log('PASS: page recovery, OCR retry, source preservation, no false low confidence, source-first HTML.');