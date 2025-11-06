'use strict';

(function(){
  const STORAGE_KEY='anamneses';
  const PACIENTES_KEY='pacientes';

  const els={};
  const state={ query:'', sortBy:'data', sortDir:'desc', pacienteId:null };

  function getQueryParam(name){
    const p=new URLSearchParams(location.search); return p.get(name);
  }

  function setPacienteTitleById(pid){
    const p = findPaciente(pid);
    if(p){
      const t = document.getElementById('pacienteTitulo');
      if(t) t.textContent = `Anamnese — ${p.nome}`;
    }
  }

  function populatePacientesDatalist(datalistEl){
    const pacientes = loadPacientes();
    datalistEl.innerHTML = '';
    pacientes.forEach(p=>{
      const opt = document.createElement('option');
      opt.value = p.nome;
      datalistEl.appendChild(opt);
    });
  }

  function loadAll(){
    try{ const raw=localStorage.getItem(STORAGE_KEY); const arr= raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch{return []}
  }
  function saveAll(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  function uid(){ return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

  function loadPacientes(){
    try{ const raw=localStorage.getItem(PACIENTES_KEY); const arr= raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch{return []}
  }

  function findPaciente(id){ return loadPacientes().find(p=>p.id===id); }

  function parseDateValue(d){
    if(!d) return 0; try{ const [y,m,dd]=d.split('-').map(Number); return new Date(y,(m||1)-1,dd||1).getTime(); }catch{return 0}
  }

  function formatDate(d){ if(!d) return ''; try{ const [y,m,dd]=d.split('-').map(Number); return new Date(y,(m||1)-1,dd||1).toLocaleDateString('pt-BR'); }catch{return d} }

  function escapeHtml(s){ return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

  function resumoFrom(model){
    const base = [model.queixa, model.historico, model.sinais, model.exames, model.hipoteses, model.plano]
      .filter(Boolean).join(' • ');
    const s = base.trim();
    if(s.length<=140) return s;
    return s.slice(0,137)+'...';
  }

  function render(){
    const tbody = els.tbody;
    const q = state.query.trim().toLowerCase();
    const list = loadAll()
      .filter(r=> r.pacienteId===state.pacienteId)
      .filter(r=> !q || [r.queixa,r.historico,r.sinais,r.exames,r.hipoteses,r.plano]
        .filter(Boolean).some(v=> String(v).toLowerCase().includes(q)))
      .sort((a,b)=>{
        const dir = state.sortDir==='asc'?1:-1;
        let va, vb;
        if(state.sortBy==='data'){ va=parseDateValue(a.data); vb=parseDateValue(b.data); }
        else { va=String(a[state.sortBy]??'').toLowerCase(); vb=String(b[state.sortBy]??'').toLowerCase(); }
        if(va<vb) return -1*dir; if(va>vb) return 1*dir; return 0;
      });

    tbody.innerHTML = list.map(r=>`
      <tr>
        <td>${formatDate(r.data)}</td>
        <td>${escapeHtml(resumoFrom(r))}</td>
        <td>
          <a href="#" class="acao" data-action="editar/visualizar" data-id="${r.id}">Editar/Visualizar</a>
          <a href="#" class="acao" data-action="excluir" data-id="${r.id}">Excluir</a>
        </td>
      </tr>`).join('') || '<tr><td colspan="3">Nenhuma anamnese encontrada.</td></tr>';
  }

  function clearForm(){
    els.form.reset();
    els.anamneseId.value='';
    els.btnCancelar.style.display='none';
    els.btnSalvar.textContent='Salvar';
  }

  function fillForm(m){
    els.anamneseId.value=m.id||'';
    els.data.value=m.data||'';
    els.queixa.value=m.queixa||'';
    els.historico.value=m.historico||'';
    els.sinais.value=m.sinais||'';
    els.exames.value=m.exames||'';
    els.hipoteses.value=m.hipoteses||'';
    els.plano.value=m.plano||'';
    els.btnCancelar.style.display='inline-block';
    els.btnSalvar.textContent='Atualizar';
  }

  function handleSubmit(e){
    e.preventDefault();
    const model={
      id: els.anamneseId.value || uid(),
      pacienteId: state.pacienteId,
      data: els.data.value,
      queixa: els.queixa.value.trim(),
      historico: els.historico.value.trim(),
      sinais: els.sinais.value.trim(),
      exames: els.exames.value.trim(),
      hipoteses: els.hipoteses.value.trim(),
      plano: els.plano.value.trim(),
      createdAt: Date.now(),
    };
    if(!model.data || !model.queixa){ alert('Informe a Data e a Queixa principal.'); return; }

    const list=loadAll();
    const idx=list.findIndex(x=>x.id===model.id);
    if(idx>=0) list[idx]=model; else list.push(model);
    saveAll(list);
    clearForm();
    render();
  }

  function handleTableClick(e){
    const a=e.target.closest('a[data-action]'); if(!a) return; e.preventDefault();
    const id=a.getAttribute('data-id'); const action=a.getAttribute('data-action');
    const list=loadAll(); const item=list.find(x=>x.id===id);
    if(action==='editar/visualizar'){ if(item) fillForm(item); return; }
    if(action==='excluir'){
      if(!confirm('Excluir esta anamnese?')) return;
      saveAll(list.filter(x=>x.id!==id)); render(); return;
    }
  }

  function handleSort(e){
    const th=e.target.closest('th[data-col]'); if(!th) return;
    const col=th.getAttribute('data-col');
    if(state.sortBy===col) state.sortDir= state.sortDir==='asc'?'desc':'asc';
    else { state.sortBy=col; state.sortDir='asc'; }
    render();
  }

  function init(){
    state.pacienteId = getQueryParam('pacienteId');
    // Elementos de UI
    els.form=document.getElementById('anamneseForm');
    els.anamneseId=document.getElementById('anamneseId');
    els.data=document.getElementById('data');
    els.queixa=document.getElementById('queixa');
    els.historico=document.getElementById('historico');
    els.sinais=document.getElementById('sinais');
    els.exames=document.getElementById('exames');
    els.hipoteses=document.getElementById('hipoteses');
    els.plano=document.getElementById('plano');

    els.btnSalvar=document.getElementById('btnSalvar');
    els.btnCancelar=document.getElementById('btnCancelar');

    els.busca=document.getElementById('busca');
    els.tabela=document.getElementById('tabelaAnamneses');
    els.tbody=els.tabela.querySelector('tbody');
    els.thead=els.tabela.querySelector('thead');

    // Cards de seleção/formulário/lista
    els.cardSelecao = document.getElementById('selecaoPacienteCard');
    els.cardForm = document.getElementById('formCard');
    els.cardList = document.getElementById('listCard');
    els.selectPacienteSearch = document.getElementById('selectPacienteSearch');
    els.pacientesList = document.getElementById('pacientesList');
    els.btnEscolherPaciente = document.getElementById('btnEscolherPaciente');

    function showSelecao(){
      if(els.cardSelecao) els.cardSelecao.style.display='block';
      if(els.cardForm) els.cardForm.style.display='none';
      if(els.cardList) els.cardList.style.display='none';
    }
    function showFormList(){
      if(els.cardSelecao) els.cardSelecao.style.display='none';
      if(els.cardForm) els.cardForm.style.display='block';
      if(els.cardList) els.cardList.style.display='block';
    }

    if(!state.pacienteId){
      const pacientes = loadPacientes();
      if(!pacientes.length){
        alert('Cadastre um paciente primeiro.');
        location.href='pacientes.html';
        return;
      }
      if(els.pacientesList){ populatePacientesDatalist(els.pacientesList); }
      if(els.btnEscolherPaciente){
        els.btnEscolherPaciente.addEventListener('click', function(){
          const typed = (els.selectPacienteSearch && els.selectPacienteSearch.value || '').trim();
          const pacientes = loadPacientes();
          let match = pacientes.find(p=> p.id===typed);
          if(!match){
            const q = typed.toLowerCase();
            match = pacientes.find(p=> p.nome.toLowerCase()===q)
                 || pacientes.find(p=> p.nome.toLowerCase().startsWith(q))
                 || pacientes.find(p=> p.nome.toLowerCase().includes(q));
          }
          if(!match){ alert('Selecione um paciente (digite e escolha da lista).'); return; }
          state.pacienteId = match.id;
          try { const url = new URL(location.href); url.searchParams.set('pacienteId', match.id); history.replaceState(null, '', url.toString()); } catch {}
          setPacienteTitleById(match.id);
          showFormList();
          render();
        });
      }
      showSelecao();
    } else {
      setPacienteTitleById(state.pacienteId);
      showFormList();
    }

    els.form.addEventListener('submit', handleSubmit);
    els.btnCancelar.addEventListener('click', clearForm);
    els.busca.addEventListener('input', function(){ state.query=this.value; render(); });
    els.tbody.addEventListener('click', handleTableClick);
    els.thead.addEventListener('click', handleSort);

    render();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
