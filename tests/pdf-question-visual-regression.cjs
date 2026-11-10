/* Crop coordinates and source-image integrity regression. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
var draw=null,appended=0;
const fakeDoc={createElement(tag){
 assert.equal(tag,'canvas');appended++;
 return {width:0,height:0,
  getContext(){return {drawImage(){draw=Array.from(arguments)}}},
  toDataURL(kind,quality){assert.equal(kind,'image/jpeg');assert.equal(quality,.83);return 'data:image/jpeg;base64,VISUAL';}
 };
}};
const sandbox={window:{document:fakeDoc}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../pdf-question-visual.js'),'utf8'),sandbox);
const tool=sandbox.window.LedgerPeerPdfVisual;
const region={page:10,x:170,y:100,w:200,h:150,hasAnchor:true};
const box=tool.cropRect(region,1200,1500,2,1.7);
assert.ok(box.x>=0&&box.y>=0&&box.w>=200&&box.h>=150);
assert.ok(box.x+box.w<=1200&&box.y+box.h<=1500);
assert.equal(tool.cropRect({x:0,y:0,w:0,h:0},1200,1500,2,1.7),null);
const canvas={width:1200,height:1500};
assert.equal(tool.crop(canvas,region,2),'data:image/jpeg;base64,VISUAL');
assert.equal(appended,1);
assert.equal(draw[0],canvas);
assert.deepEqual(Array.from(draw.slice(1,5)),[box.x,box.y,box.w,box.h]);
assert.equal(draw[7],box.w);
assert.equal(draw[8],box.h);
console.log('PASS: original per-question source crop preserves viewport projection and image bounds.');