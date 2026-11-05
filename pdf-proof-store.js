/* Local PDF evidence store. Keeps large page visuals out of JSON/AI prompts.
   IndexedDB is device-local and is not a cloud backup. */
(function(root){
'use strict';
var DB_NAME='ledgerpeer-pdf-evidence', STORE='pdfs';
function database(){
  return new Promise(function(resolve,reject){
    if(!root.indexedDB)return reject(new Error('This browser does not support IndexedDB.'));
    var request=root.indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=function(){var db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);};
    request.onerror=function(){reject(request.error||new Error('Unable to access PDF evidence storage.'));};
    request.onsuccess=function(){resolve(request.result);};
  });
}
function transaction(method,key,value){
  return database().then(function(db){
    return new Promise(function(resolve,reject){
      var tx=db.transaction(STORE,method==='put'||method==='delete'?'readwrite':'readonly');
      var store=tx.objectStore(STORE),request=method==='put'?store.put(value,key):method==='delete'?store.delete(key):store.get(key);
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
  remove:function(id){return transaction('delete',id);}
};
})(window);
