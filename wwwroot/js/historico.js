'use strict';

(function(){
  const PACIENTES_KEY = 'pacientes';
  const CONSULTAS_KEY = 'consultas';
  const ANAMNESES_KEY = 'anamneses';

  const els = {};
  const state = { pacienteId: null, query: '' };

  function load(key){
    try{ const raw = localStorage.getItem(key); const arr = raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch{return []}
  }
  function loadPacientes(){ return load(PACIENTES_KEY); }
  function loadConsultas(){ return load(CONSULTAS_KEY); }
  function loadAnamneses(){ return load(ANAMNESES_KEY); }

  function getQueryParam(name){ const p=new URLSearchParams(location.search); return p.get(name); }

  function populatePacientesDatalist(){
    if(!els.pacientesList) return;
    const pacientes = loadPacientes();
    els.pacientesList.innerHTML = '';
    pacientes.forEach(p=>{ const o=document.createElement('option'); o.value=p.nome; els.pacientesList.appendChild(o); });
  }

  function findPacienteByTyped(typed){
    const pacientes = loadPacientes();
    let match = pacientes.find(p=> p.id===typed);
    if(!match){
      const q = String(typed||'').toLowerCase();
      match = pacientes.find(p=> p.nome && p.nome.toLowerCase()===q)
           || pacientes.find(p=> p.nome && p.nome.toLowerCase().startsWith(q))
           || pacientes.find(p=> p.nome && p.nome.toLowerCase().includes(q));
    }
    return match;
  }

  function formatDate(d){ if(!d) return ''; try{ const [y,m,dd]=String(d).split('-').map(Number); return new Date(y,(m||1)-1,dd||1).toLocaleDateString('pt-BR'); }catch{return d} }

  function resumoFrom(m){
    const base = [m.queixa, m.historico, m.sinais, m.exames, m.hipoteses, m.plano].filter(Boolean).join(' • ');
    const s = base.trim(); if(s.length<=140) return s; return s.slice(0,137)+'...';
  }

  function render(){
    if(!state.pacienteId) return;
    const q = state.query.trim().toLowerCase();

    const consultas = loadConsultas()
      .filter(c=> c.pacienteId===state.pacienteId)
      .sort((a,b)=>{
        const ad = new Date(a.data+'T'+(a.hora||'00:00')).getTime();
        const bd = new Date(b.data+'T'+(b.hora||'00:00')).getTime();
        return bd - ad;
      })
      .filter(c=> !q || [c.data,c.hora,c.tipo,c.status].filter(Boolean).some(v=> String(v).toLowerCase().includes(q)));

    const anamneses = loadAnamneses()
      .filter(r=> r.pacienteId===state.pacienteId)
      .sort((a,b)=> String(b.data||'').localeCompare(String(a.data||'')))
      .filter(r=> !q || resumoFrom(r).toLowerCase().includes(q));

    const tbc = els.tabelaConsultasPac.querySelector('tbody');
    const tba = els.tabelaAnamnesesPac.querySelector('tbody');

    tbc.innerHTML = consultas.map(c=>`
      <tr>
        <td>${formatDate(c.data)}</td>
        <td>${c.hora||''}</td>
        <td>${c.tipo||''}</td>
        <td>${c.status||''}</td>
      </tr>`).join('') || '<tr><td colspan="4">Sem consultas registradas.</td></tr>';

    tba.innerHTML = anamneses.map(r=>`
      <tr>
        <td>${formatDate(r.data)}</td>
        <td>${resumoFrom(r)}</td>
      </tr>`).join('') || '<tr><td colspan="2">Sem anamneses registradas.</td></tr>';
  }

  function setPacienteTitleById(pid){
    const p = loadPacientes().find(x=>x.id===pid);
    if(p && els.tituloPaciente){ els.tituloPaciente.textContent = 'Histórico — '+p.nome; }
    if(els.linkAnamnese){ els.linkAnamnese.href = 'anamnese.html?pacienteId=' + (p?p.id:''); }
  }

  function init(){
    els.selectCard = document.getElementById('selectCard');
    els.listCard = document.getElementById('listCard');
    els.pacienteSearch = document.getElementById('pacienteSearch');
    els.pacientesList = document.getElementById('pacientesList');
    els.btnEscolher = document.getElementById('btnEscolher');
    els.tituloPaciente = document.getElementById('tituloPaciente');
    els.busca = document.getElementById('busca');
    els.tabelaConsultasPac = document.getElementById('tabelaConsultasPac');
    els.tabelaAnamnesesPac = document.getElementById('tabelaAnamnesesPac');
    els.linkAnamnese = document.getElementById('linkAnamnese');

    populatePacientesDatalist();

    state.pacienteId = getQueryParam('pacienteId');
    if(state.pacienteId){
      if(els.selectCard) els.selectCard.style.display='none';
      if(els.listCard) els.listCard.style.display='block';
      setPacienteTitleById(state.pacienteId);
      render();
    }

    if(els.btnEscolher){
      els.btnEscolher.addEventListener('click', function(){
        const typed = (els.pacienteSearch && els.pacienteSearch.value || '').trim();
        const match = findPacienteByTyped(typed);
        if(!match){ alert('Selecione um paciente (digite e escolha da lista).'); return; }
        state.pacienteId = match.id;
        try{ const url = new URL(location.href); url.searchParams.set('pacienteId', match.id); history.replaceState(null,'',url.toString()); }catch{}
        if(els.selectCard) els.selectCard.style.display='none';
        if(els.listCard) els.listCard.style.display='block';
        setPacienteTitleById(state.pacienteId);
        render();
      });
    }

    if(els.busca){ els.busca.addEventListener('input', function(){ state.query = this.value; render(); }); }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
