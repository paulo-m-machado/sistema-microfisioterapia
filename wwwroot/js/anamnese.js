'use strict';

(function(){
  const STORAGE_KEY = 'anamneses';
  const PACIENTES_KEY = 'pacientes';

  const els = {};
  const state = { 
    query: '', 
    sortBy: 'data', 
    sortDir: 'desc', 
    pacienteId: null,
    currentPaciente: null,
    isEditing: false
  };

  // Inicialização da data atual
  function initCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getQueryParam(name) {
    const p = new URLSearchParams(location.search);
    return p.get(name);
  }

  function setPacienteTitleById(pid) {
    const p = findPaciente(pid);
    if (p) {
      state.currentPaciente = p;
      const t = document.getElementById('pacienteTitulo');
      if (t) t.textContent = `Anamnese — ${p.nome}`;
      
      // Atualizar título na lista também
      const titleEl = document.getElementById('pacienteTituloLista');
      if (titleEl) titleEl.textContent = `Histórico de anamneses - ${p.nome}`;
    }
  }

  function populatePacientesDatalist(datalistEl) {
    const pacientes = loadPacientes();
    datalistEl.innerHTML = '';
    
    pacientes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nome;
      opt.dataset.id = p.id;
      datalistEl.appendChild(opt);
    });

    // Configurar autocompletar
    if (els.selectPacienteSearch) {
      $(els.selectPacienteSearch).autocomplete({
        source: pacientes.map(p => ({
          label: p.nome,
          value: p.nome,
          id: p.id
        })),
        select: function(event, ui) {
          state.pacienteId = ui.item.id;
          state.currentPaciente = pacientes.find(p => p.id === ui.item.id);
        }
      });
    }
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

  function render() {
    if (!els.tbody) return;
    
    const q = state.query.trim().toLowerCase();
    const list = loadAll()
      .filter(r => r.pacienteId === state.pacienteId)
      .filter(r => !q || [r.queixa, r.historico, r.sinais, r.exames, r.hipoteses, r.plano]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q)))
      .sort((a, b) => {
        const dir = state.sortDir === 'asc' ? 1 : -1;
        let va, vb;
        if (state.sortBy === 'data') { 
          va = parseDateValue(a.data); 
          vb = parseDateValue(b.data); 
        } else { 
          va = String(a[state.sortBy] ?? '').toLowerCase(); 
          vb = String(b[state.sortBy] ?? '').toLowerCase(); 
        }
        if (va < vb) return -1 * dir; 
        if (va > vb) return 1 * dir; 
        return 0;
      });

    // Atualizar contador
    const countEl = document.getElementById('anamenesesCount');
    if (countEl) {
      countEl.textContent = list.length;
    }

    // Renderizar tabela
    els.tbody.innerHTML = list.length > 0 ? list.map(r => `
      <tr>
        <td>${formatDate(r.data)}</td>
        <td>
          <div class="fw-bold">${escapeHtml(r.queixa?.substring(0, 60) || 'Sem queixa registrada')}${r.queixa?.length > 60 ? '...' : ''}</div>
          <small class="text-muted">${escapeHtml(resumoFrom(r).substring(0, 100))}${resumoFrom(r).length > 100 ? '...' : ''}</small>
        </td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" data-action="editar/visualizar" data-id="${r.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="excluir" data-id="${r.id}" title="Excluir">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>`).join('') : `
      <tr>
        <td colspan="3" class="text-center py-4">
          <div class="text-muted">
            <i class="fas fa-clipboard-list fa-2x mb-2"></i>
            <p class="mb-0">Nenhuma anamnese encontrada</p>
          </div>
        </td>
      </tr>`;
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
      if(els.cardSelecao) els.cardSelecao.style.display='none';
      if(els.cardForm) els.cardForm.style.display='block';
      if(els.cardList) els.cardList.style.display='block';
    }

    // Função auxiliar para exibir alertas
    function showAlert(message, type = 'info') {
      // Remover alertas existentes
      const existingAlert = document.querySelector('.alert-dismissible');
      if (existingAlert) {
        existingAlert.remove();
      }
      
      const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
      `;
      
      // Inserir no topo do conteúdo principal
      const main = document.querySelector('main');
      if (main) {
        main.insertAdjacentHTML('afterbegin', alertHtml);
        
        // Remover o alerta após 5 segundos
        setTimeout(() => {
          const alert = document.querySelector('.alert-dismissible');
          if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
          }
        }, 5000);
      }
    }

    // Inicializar tooltips
    if (typeof bootstrap !== 'undefined') {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
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
