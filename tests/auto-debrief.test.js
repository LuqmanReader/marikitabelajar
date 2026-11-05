// Run: node tests/auto-debrief.test.js
// Regression guard: the retired integration cannot call any AI service.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const sandbox={window:{},fetch(){throw new Error('Unexpected network call');}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../auto-debrief.js'),'utf8'),sandbox);
assert.equal(sandbox.window.LedgerPeerAutoDebrief.disabled,true);
assert.equal(sandbox.window.LedgerPeerAutoDebrief.start(),false);
const view=fs.readFileSync(path.join(__dirname,'../view.html'),'utf8');
const entry=fs.readFileSync(path.join(__dirname,'../attempt-entry.js'),'utf8');
assert.equal(view.includes('<script src="auto-debrief.js'),false);
assert.equal(entry.includes('meta.autoDebriefRequested=true'),false);
assert.equal(entry.includes("meta.file='view.html?id='+encodeURIComponent(id);"),true);
assert.equal(view.includes('debrief-workflow.js'),true);
console.log('Manual JSON debrief is primary; automatic Gemini integration is inactive.');
