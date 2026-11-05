/* Local PDF evidence store. Keeps large page visuals out of JSON/AI prompts.
   IndexedDB is device-local and is not a cloud backup. */
(function(root){
'use strict';
var DB_NAME='ledgerpeer-pdf-evidence', STORE='pdfs', HTML_STORE='converted-html';
function database(){
  return new Promise(function(resolve,reject){
    if(!root.indexedDB)return reject(new Error('This browser does not support IndexedDB.'));
    var request=root.indexedDB.open(DB_NAME,2);
    request.onupgradeneeded=function(){var db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);if(!db.objectStoreNames.contains(HTML_STORE))db.createObjectStore(HTML_STORE);};
    request.onerror=function(){reject(request.error||new Error('Unable to access PDF evidence storage.'));};
    request.onsuccess=function(){resolve(request.result);};
  });
}
function transaction(method,key,value,targetStore){
  return database().then(function(db){
    return new Promise(function(resolve,reject){
      var chosen=targetStore||STORE,tx=db.transaction(chosen,method==='put'||method==='delete'?'readwrite':'readonly');
      var store=tx.objectStore(chosen),request=method==='put'?store.put(value,key):method==='delete'?store.delete(key):store.get(key);
      request.onerror=function(){reject(request.error||new Error('PDF evidence transaction failed.'));};
      tx.oncomplete=function(){resolve(method==='get'?request.result||null:true);db.close();};
      tx.onerror=function(){reject(tx.error||new Error('PDF evidence storage failed.'));db.close();};
      tx.onabort=function(){reject(tx.error||new Error('PDF evidence storage was aborted.'));db.close();};
    });
  });
}
root.LedgerPeerPdfProof={
  put:function(id,file){if(!file||file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name||''))return Promise.reject(new Error('An original PDF file is required.'));return transaction('put',id,new Blob([file],{type:'application/pdf'}));},
  get:function(id){return transaction('get',id);},
  remove:function(id){return transaction('delete',id);},
  putHtml:function(id,file){if(!file)return Promise.reject(new Error('Converted HTML file is required.'));return transaction('put',id,new Blob([file],{type:'text/html'}),HTML_STORE);},
  getHtml:function(id){return transaction('get',id,null,HTML_STORE);},
  removeHtml:function(id){return transaction('delete',id,null,HTML_STORE);}
};
})(window);
