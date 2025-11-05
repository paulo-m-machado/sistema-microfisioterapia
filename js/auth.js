'use strict';

(function(){
  const AUTH_KEY='auth_session';
  const PIN='chacon';

  function getPage(){
    const p = (location.pathname.split('/').pop()||'').toLowerCase();
    return p || 'index.html';
  }

  function isLoginPage(){ return getPage()==='login.html'; }

  function getSession(){
    try{ const raw=localStorage.getItem(AUTH_KEY); return raw?JSON.parse(raw):null; }catch{ return null; }
  }
  function setSession(s){ localStorage.setItem(AUTH_KEY, JSON.stringify(s)); }
  function clearSession(){ localStorage.removeItem(AUTH_KEY); }
  function isLoggedIn(){ const s=getSession(); return !!(s&&s.loggedIn); }

  function toHex(buffer){
    return Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function sha256(str){
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return toHex(buf);
  }

  async function login(pin){
    if ((pin||'').trim() === PIN) { setSession({loggedIn:true, ts: Date.now()}); return true; }
    return false;
  }

  function logout(){ clearSession(); location.href='login.html'; }

  function requireAuth(){ if(!isLoginPage() && !isLoggedIn()){ location.href='login.html'; } }

  function setupAuthUi(){
    const a = document.getElementById('authAction');
    if(!a) return;
    if(isLoggedIn()){
      a.textContent='Sair';
      a.href='#';
      a.setAttribute('aria-label','Sair da aplicação');
      a.addEventListener('click', function(e){
        e.preventDefault();
        if(confirm('Deseja realmente sair?')) logout();
      });
    } else {
      a.textContent='Login';
      a.href='login.html';
    }
  }

  function attachLoginForm(){
    if(!isLoginPage()) return;
    const form=document.getElementById('loginForm');
    if(!form) return;
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const pin = document.getElementById('pin').value;
      const ok = await login(pin);
      if(ok){ location.href='index.html'; }
      else { alert('PIN inválido.'); }
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){ requireAuth(); setupAuthUi(); attachLoginForm(); });
  } else { requireAuth(); setupAuthUi(); attachLoginForm(); }
})();
