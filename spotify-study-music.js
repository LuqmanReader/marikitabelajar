/* LedgerPeer Study Music — one-file Spotify embed, no API keys or login integration.
   Add <script defer src="spotify-study-music.js"></script> to selected pages.
   Playback is user-controlled. Navigation between HTML pages reloads the embed.
*/
(() => {
  'use strict';
  if (window.__ledgerpeerSpotifyWidgetLoaded) return;
  window.__ledgerpeerSpotifyWidgetLoaded = true;

  const PLAYLISTS = Object.freeze({
    deep: {label:'Deep Focus', id:'37i9dQZF1DWZeKCadgRdKQ'},
    classical: {label:'Classical Focus', id:'37i9dQZF1EIh0DVYYciu11'},
    lofi: {label:'lofi beats', id:'37i9dQZF1DWWQRwui0ExPn'},
    piano: {label:'Peaceful Piano', id:'2CjqpIIpT2yriVzOqBIdiP'}
  });
  const KEY = 'ledgerpeer.spotify.playlist.v1';
  const readSaved = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
  const save = (data) => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage optional */ } };
  const spotifyPlaylist = (id) => `https://open.spotify.com/playlist/${id}`;
  const spotifyEmbed = (id) => `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
  // Only accept genuine, public Spotify playlist links; never embed arbitrary URLs.
  function parsePlaylist(input) {
    try {
      const u = new URL(input.trim());
      if (u.protocol !== 'https:' || u.hostname !== 'open.spotify.com') return null;
      const m = u.pathname.match(/^\/(?:intl-[a-z]{2}\/)?playlist\/([a-zA-Z0-9]{22})\/?$/);
      return m ? m[1] : null;
    } catch { return null; }
  }

  function init() {
    if (document.getElementById('ledgerpeer-spotify-host')) return;
    const host = document.createElement('div');
    host.id = 'ledgerpeer-spotify-host';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;';
    const shadow = host.attachShadow({mode:'open'});
    shadow.innerHTML = `
      <style>
        *, *::before, *::after {box-sizing:border-box}
        :host{--lp-ink:#111;--lp-yellow:#ffcf24;--lp-green:#36d98b;--lp-paper:#fff7e4;--lp-blue:#2956ff; color:var(--lp-ink);font-family:ui-monospace,'Space Mono',Menlo,Consolas,monospace}
        [hidden]{display:none!important}
        button,select,input,a{font:inherit}
        button{cursor:pointer}
        .launcher{position:fixed;left:clamp(12px,2vw,28px);bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:1;background:var(--lp-yellow);color:#111;border:3px solid #111;box-shadow:4px 4px 0 #111;padding:11px 16px;min-height:48px;display:flex;align-items:center;gap:9px;font-size:12px;font-weight:900;letter-spacing:.02em;pointer-events:auto;transition:transform .2s ease,box-shadow .2s ease}
        .launcher:hover{transform:translateY(-3px);box-shadow:5px 7px 0 #111}
        .launcher:focus-visible,.x:focus-visible,select:focus-visible,input:focus-visible,.custom-toggle:focus-visible,.use:focus-visible,a:focus-visible{outline:3px solid var(--lp-blue);outline-offset:3px}
        .dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--lp-green);border:1px solid #111}
        .panel{position:fixed;left:clamp(12px,2vw,28px);bottom:calc(76px + env(safe-area-inset-bottom,0px));width:min(380px,calc(100vw - 26px));max-height:min(650px,calc(100dvh - 105px));overflow-y:auto;background:var(--lp-paper);border:3px solid #111;box-shadow:7px 7px 0 #111;pointer-events:auto;animation:up .25s cubic-bezier(.2,.75,.2,1) both}
        .head{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--lp-green);border-bottom:3px solid #111;padding:12px 13px}
        .head strong{font:900 14px/1.2 system-ui,Arial,sans-serif;letter-spacing:.015em}
        .x{background:#fff;border:2px solid #111;font-weight:900;min-width:34px;min-height:32px}
        .body{padding:15px}
        .eyebrow{font-size:10px;letter-spacing:.08em;font-weight:900;margin:0 0 9px}
        select,input{width:100%;background:#fff;color:#111;border:2px solid #111;border-radius:0;min-height:40px;padding:8px 10px;font-size:12px}
        .spotify-frame{display:block;margin-top:13px;border-radius:12px;border:0;width:100%;height:260px;background:#232323}
        .custom-toggle{display:inline-block;margin-top:12px;background:none;color:#1a46ca;padding:3px 0;border:0;text-decoration:underline;font-size:11px;font-weight:800}
        .custom-box{margin-top:9px;padding:9px;background:#fff;border:2px dashed #111}
        .custom-box label{display:block;font-size:10px;font-weight:900;margin-bottom:7px}
        .custom-box .use{margin-top:8px;padding:9px 12px;border:2px solid #111;background:var(--lp-yellow);font-size:11px;font-weight:900}
        .status{display:block;min-height:0;font-size:11px;margin-top:5px;color:#b22}
        .foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:13px;font-size:10px;line-height:1.45}
        .foot a{color:var(--lp-blue);text-decoration:underline;font-weight:900}
        .foot span{color:#444;max-width:205px}
        @keyframes up{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
        @media (max-width:400px){.body{padding:11px}.spotify-frame{height:220px}.panel{bottom:calc(72px + env(safe-area-inset-bottom,0px))}}
        @media (prefers-reduced-motion:reduce){.panel{animation:none}.launcher{transition:none}}
      </style>
      <button class="launcher" type="button" aria-label="Open Study Music" aria-expanded="false" aria-controls="lp-spotify-panel"><span class="dot" aria-hidden="true"></span><span>♫ STUDY MUSIC</span></button>
      <section class="panel" id="lp-spotify-panel" role="region" aria-label="Spotify study music player" hidden>
        <div class="head"><strong>♫ STUDY MUSIC · SPOTIFY</strong><button class="x" type="button" aria-label="Close Spotify player">×</button></div>
        <div class="body">
          <p class="eyebrow">PICK YOUR STUDY SOUNDTRACK</p>
          <select aria-label="Study music playlist">
            <option value="deep">Deep Focus</option>
            <option value="classical">Classical Focus</option>
            <option value="lofi">lofi beats</option>
            <option value="piano">Peaceful Piano</option>
            <option value="custom">My playlist</option>
          </select>
          <div class="player-slot"></div>
          <button type="button" class="custom-toggle" aria-expanded="false">＋ Use my own playlist</button>
          <div class="custom-box" hidden>
            <label for="lp-spotify-custom-url">PASTE YOUR SPOTIFY PLAYLIST LINK</label>
            <input id="lp-spotify-custom-url" type="url" inputmode="url" autocomplete="url" placeholder="https://open.spotify.com/playlist/..." />
            <button type="button" class="use">USE PLAYLIST</button>
            <span class="status" role="status" aria-live="polite"></span>
          </div>
          <div class="foot"><span>Tap play yourself. Switching pages reloads this player.</span><a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer">OPEN SPOTIFY ↗</a></div>
        </div>
      </section>`;
    document.body.appendChild(host);

    const el = (q) => shadow.querySelector(q);
    const launcher=el('.launcher'), panel=el('.panel'), close=el('.x'), select=el('select');
    const slot=el('.player-slot'), footLink=el('.foot a'), customToggle=el('.custom-toggle');
    const customBox=el('.custom-box'), customInput=el('input'), status=el('.status');
    const use=el('.use');
    let id=PLAYLISTS.deep.id, currentKey='deep', framedId=null;
    const existing=readSaved();
    if (existing && Object.hasOwn(existing, 'type')) {
      if (existing.type==='preset' && PLAYLISTS[existing.key]) {
        currentKey=existing.key;id=PLAYLISTS[currentKey].id;
      } else if (existing.type==='custom' && /^[a-zA-Z0-9]{22}$/.test(existing.id||'')) {
        currentKey='custom';id=existing.id;
      }
    }
    select.value=currentKey;
    footLink.href=spotifyPlaylist(id);
    function mountPlayer() {
      if (framedId===id) return;
      slot.replaceChildren();
      const iframe=document.createElement('iframe');
      iframe.className='spotify-frame';
      iframe.title='Spotify study playlist';
      iframe.src=spotifyEmbed(id);
      iframe.loading='lazy';
      iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      slot.appendChild(iframe);
      framedId=id;
    }
    function openPanel(open) {
      panel.hidden=!open;
      launcher.setAttribute('aria-expanded', String(open));
      launcher.setAttribute('aria-label',open?'Hide Study Music':'Open Study Music');
      if (open) mountPlayer();
    }
    launcher.addEventListener('click',()=>openPanel(panel.hidden));
    close.addEventListener('click',()=>{openPanel(false);launcher.focus();});
    select.addEventListener('change',()=>{
      const next=select.value;
      if(next==='custom'){
        customBox.hidden=false;customToggle.setAttribute('aria-expanded','true');
        if(currentKey!=='custom'){select.value=currentKey;}
        customInput.focus();return;
      }
      currentKey=next;id=PLAYLISTS[next].id;
      save({type:'preset',key:next});
      footLink.href=spotifyPlaylist(id);
      mountPlayer();
      status.textContent='';
    });
    customToggle.addEventListener('click',()=>{
      customBox.hidden=!customBox.hidden;
      customToggle.setAttribute('aria-expanded', String(!customBox.hidden));
      if(!customBox.hidden)customInput.focus();
    });
    use.addEventListener('click',()=>{
      const parsed=parsePlaylist(customInput.value);
      if(!parsed){status.textContent='Please paste a public open.spotify.com playlist link.';return;}
      id=parsed;currentKey='custom';select.value='custom';
      save({type:'custom',id});
      footLink.href=spotifyPlaylist(id);
      status.textContent='Playlist loaded! Press play in the Spotify player.';
      mountPlayer();
    });
    customInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();use.click();}});

    // The homepage contains the public login as well as #hubView. Show only after sign-in.
    const hubView=document.getElementById('hubView');
    if(hubView){
      function syncSignedIn(){
        const signedIn=!hubView.hidden;
        launcher.hidden=!signedIn;
        if(!signedIn && !panel.hidden)openPanel(false);
      }
      syncSignedIn();
      new MutationObserver(syncSignedIn).observe(hubView,{attributes:true,attributeFilter:['hidden','style','class']});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
