(function(){
  const PASS_KEY='ph_auth_hash_v1';
  const SESSION_KEY='ph_unlocked_v1';
  window.PersonalHubAuth={
    passKey:PASS_KEY, sessionKey:SESSION_KEY,
    async hash(text){
      const data=new TextEncoder().encode(text);
      const digest=await crypto.subtle.digest('SHA-256',data);
      return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
    },
    hasPassword(){return !!localStorage.getItem(PASS_KEY)},
    isUnlocked(){return sessionStorage.getItem(SESSION_KEY)==='yes'},
    async setPassword(password){localStorage.setItem(PASS_KEY,await this.hash(password));sessionStorage.setItem(SESSION_KEY,'yes')},
    async unlock(password){const ok=(await this.hash(password))===localStorage.getItem(PASS_KEY);if(ok)sessionStorage.setItem(SESSION_KEY,'yes');return ok},
    lock(){sessionStorage.removeItem(SESSION_KEY);location.href='index.html'},
    guard(){if(!this.hasPassword()||!this.isUnlocked()){location.replace('index.html');return false}return true},
    addLockButton(){
      if(!this.isUnlocked()||document.getElementById('phLockButton'))return;
      const b=document.createElement('button');b.id='phLockButton';b.textContent='LOCK';b.type='button';
      b.setAttribute('aria-label','Lock Personal Hub');
      b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:99999;border:3px solid #111;background:#E63B2E;color:#fff;padding:10px 14px;font:900 12px ui-monospace,Menlo,Consolas,monospace;box-shadow:4px 4px 0 #111;cursor:pointer;text-transform:uppercase';
      b.onclick=()=>this.lock();document.body.appendChild(b);
    }
  };
})();
