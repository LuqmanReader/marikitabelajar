// Safe, shared chapter renderer. All teaching text is inserted as text, never HTML.
(function(root){'use strict';
root.appendFiaTeaching=function(parent,paper,key){
 const data=root.LedgerFiaGuides;if(!data)return false;
 const [book,id]=key.split(':'),c=data.books[book]?.chapters.find(x=>x.id===id);if(!c)return false;
 const n=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el};
 const section=n('section');section.className='fia-expanded-teaching';section.append(n('h3','EXPANDED TEACHING: '+c.title),n('p','Related chapter for '+paper+'. Shared teaching can include material beyond this particular syllabus heading.'));
 const a=n('a','Open in the chapter reader →');a.href='fia-study.html?paper='+encodeURIComponent(paper)+'&chapter='+encodeURIComponent(key);section.append(a);
 let target=section,list=null;
 for(const line of c.text.split('\n')){
  if(!line.trim())continue;
  if(line.startsWith('## ')){target=section;list=null;section.append(n('h4',line.slice(3)))}
  else if(line.startsWith('### Answer')){target=n('details');target.className='fia-inline-answer';target.append(n('summary','Show explained answer'));section.append(target);list=null}
  else if(line.startsWith('- ')){if(!list){list=n('ul');target.append(list)}list.append(n('li',line.slice(2)))}
  else{list=null;target.append(n('p',line))}
 }
 parent.append(section);return true;
};
})(window);
