'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../tutor-answer-renderer.js'),'utf8');
class DomNode{
 constructor(tag,text=''){this.tag=tag;this._text=text;this.children=[];this.attrs={};this.dataset={};this.events={};this.className='';this.classList={add:className=>{this.className=(this.className+' '+className).trim();}};}
 appendChild(node){if(node.tag==='#fragment')this.children.push(...node.children);else this.children.push(node);return node;}
 append(...nodes){nodes.forEach(node=>this.appendChild(node));}
 replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes);}
 set textContent(value){this._text=String(value||'');this.children=[];}
 get textContent(){return this._text+this.children.map(node=>node.textContent).join('');}
 setAttribute(k,v){this.attrs[k]=String(v);}
 addEventListener(event,handler){this.events[event]=handler;}
}
const document={
 createElement:tag=>new DomNode(tag),
 createTextNode:text=>new DomNode('#text',text),
 createDocumentFragment:()=>new DomNode('#fragment')
};
const win={};
vm.runInNewContext(source,{window:win,document,URL,navigator:{clipboard:{writeText:async()=>{}}}});
const render=win.LedgerPeerTutorRenderer;
assert.ok(render,'Renderer must export its API');
function walk(root){
 const arr=[];
 (function scan(n){arr.push(n);for(const child of n.children)scan(child)})(root);
 return arr;
}
function tags(root,tag){return walk(root).filter(n=>n.tag===tag);}
function display(source){
 const root=document.createElement('div');
 render.render(root,source);return root;
}
const ticks=String.fromCharCode(96).repeat(3);
const content=[
 '### Common mistakes',
 '',
 'Explain **net credit sales**, not *total sales*.',
 '',
 '| Mistake | Why wrong | How to fix |',
 '|:---|---|---:|',
 '| Total sales | Includes cash sales | Credit sales only |',
 '| No average balances | Distorts days | (Opening + Closing) / 2 |',
 '',
 '1. Find **opening** balance.',
 '2. Find closing balance.',
 '',
 ticks+'js',
 'const example = "<img src=x onerror=alert(1)>";',
 'console.log(example);',
 ticks,
 '',
 '\\[',
 '\\frac{\\text{Revenue}}{2} = 120',
 '\\]',
 '',
 'A safe <img src=x onerror=alert(1)> tag.'
].join('\n');
const root=display(content);
assert.ok(tags(root,'h4').length===1,'### heading should become a heading, not show ###');
assert.equal(tags(root,'table').length,1,'Markdown table should become a semantic table');
assert.equal(tags(root,'th').length,3,'Proper table headings should be created');
assert.equal(tags(root,'td').length,6,'Table body must contain three columns');
assert.equal(tags(root,'ol').length,1,'Numbered instructions should become a list');
assert.equal(tags(root,'strong').length>=2,'Bold terms should be emphasized');
assert.equal(tags(root,'em').length,1,'Italics should be emphasized');
assert.equal(tags(root,'pre').length,1,'Fenced code should become a code block');
assert.equal(tags(root,'button').length,1,'Code blocks should have a copy button');
assert.ok(tags(root,'code').some(n=>n.textContent.includes('<img src=x')),'Code examples must remain literal');
assert.equal(tags(root,'img').length,0,'Untrusted tags must never become DOM elements');
assert.ok(root.textContent.includes('<img src=x onerror=alert(1)>'),'Untrusted HTML is displayed as plain text');
assert.ok(walk(root).some(n=>n.className.includes('tutor-math-display')),'Display equations need a readable math panel');
assert.ok(root.textContent.includes('Revenue'),'Math should remain readable when math CDN is unavailable');
assert.ok(!root.textContent.includes('\\frac'),'Fallback should simplify raw fraction commands');
assert.ok(walk(root).some(n=>n.className.includes('tutor-table-scroll')),'Table should be wrapped in scrollable region');
assert.ok(tags(root,'td').some(n=>n.dataset.heading==='Why wrong'),'Table cells must retain mobile labels');
const odd=display('# Heading\n\nHello <script>alert("bad")</script>.\n\nA [safe source](https://example.com) and [javascript](javascript:alert(1)).');
assert.equal(tags(odd,'script').length,0,'Scripts must never become elements');
assert.equal(tags(odd,'a').length,1,'Only safe HTTP(S) links should become anchors');
assert.equal(tags(odd,'a')[0].target,'_blank');
assert.equal(tags(odd,'a')[0].rel,'noopener noreferrer nofollow');
const plain=display('**Bold** and '+ticks+'js\nx=1;\n'+ticks);
assert.ok(tags(plain,'strong').length===1,'Bold Markdown works without external scripts');
const latex=render.extractMath('Result: \\(\\frac{6}{3}\\) and $$x^2$$.');
assert.equal(latex.math.length,2,'Inline and display mathematical notation must survive parsing');
const cc=render.cells('| FA2 | Cash \\| Revenue |');
assert.equal(cc.length,2,'Escaped table delimiters must remain inside cells');
const js=fs.readFileSync(path.join(__dirname,'../ai-tutor.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../ai-tutor.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../ai-tutor.css'),'utf8');
assert.ok(html.includes('tutor-answer-renderer.js?v=20261029a'),'Tutor must load the first-party renderer');
assert.ok(html.indexOf('tutor-answer-renderer.js')<html.indexOf('ai-tutor.js?v=groq6'),'Renderer loads before chat UI');
assert.ok(js.includes('window.LedgerPeerTutorRenderer.render(bubble,content)'),'AI responses use the safe renderer');
assert.ok(css.includes('.tutor-table-scroll td::before'),'Mobile tables need visible column labels');
assert.ok(css.includes('.tutor-code-copy'),'Code copy button should be visually apparent');
assert.ok(css.includes('.tutor-math-display'),'Accounting equations should be displayed as cards');
console.log('PASS: AI Tutor renders readable headings, tables, numbered steps, code, math and safe untrusted HTML without third-party Markdown dependencies.');
