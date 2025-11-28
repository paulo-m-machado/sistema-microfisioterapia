'use strict';

(function () {
  const STORAGE_KEY = 'pacientes';

  const els = {};
  const state = { query: '', sortBy: 'nome', sortDir: 'asc' };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }
  function save(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

  function formatDate(d) {
    if (!d) return '';
    try { const [y,m,dd]=d.split('-').map(Number); return new Date(y,(m||1)-1,dd||1).toLocaleDateString('pt-BR'); } catch { return d; }
  }
  function escapeHtml(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

  function render() {
    const q = state.query.trim().toLowerCase();
    const rows = load()
      .filter(r => !q || [r.nome,r.cpf,r.telefone,r.email].filter(Boolean).some(v => String(v).toLowerCase().includes(q)) )
      .sort((a,b)=>{
        const dir = state.sortDir==='asc'?1:-1;
        let va=a[state.sortBy]??'', vb=b[state.sortBy]??'';
        if (state.sortBy==='nascimento') { va=a.nascimento||''; vb=b.nascimento||''; }
        va = String(va).toLowerCase(); vb = String(vb).toLowerCase();
        if (va<vb) return -1*dir; if(va>vb) return 1*dir; return 0;
      });

    els.tbody.innerHTML = rows.map(r=>`
      <tr>
        <td>${escapeHtml(r.nome)}</td>
        <td>${formatDate(r.nascimento)}</td>
        <td>${escapeHtml(r.cpf||'')}</td>
        <td>${escapeHtml(r.telefone||'')}</td>
        <td>${escapeHtml(r.email||'')}</td>
        <td>
          <a href="#" class="acao" data-action="editar" data-id="${r.id}">Editar</a>
          <a href="#" class="acao" data-action="excluir" data-id="${r.id}">Excluir</a>
          <a href="anamnese.html?pacienteId=${r.id}" class="acao">Anamnese</a>
          <a href="historico.html?pacienteId=${r.id}" class="acao">Histórico</a>
        </td>
      </tr>`).join('') || '<tr><td colspan="6">Nenhum paciente encontrado.</td></tr>';
  }

  function clearForm() {
    els.form.reset();
    els.pacienteId.value='';
    els.btnCancelar.style.display='none';
    els.btnSalvar.textContent='Salvar';
  }

  function fillForm(m) {
    els.pacienteId.value=m.id||'';
    els.nome.value=m.nome||'';
    els.nascimento.value=m.nascimento||'';
    els.cpf.value=m.cpf||'';
    els.telefone.value=m.telefone||'';
    els.email.value=m.email||'';
    els.endereco.value=m.endereco||'';
    els.observacoes.value=m.observacoes||'';
    els.btnCancelar.style.display='inline-block';
    els.btnSalvar.textContent='Atualizar';
  }

  function handleSubmit(e){
    e.preventDefault();
    const model={
      id: els.pacienteId.value || uid(),
      nome: els.nome.value.trim(),
      nascimento: els.nascimento.value,
      cpf: els.cpf.value.trim(),
      telefone: els.telefone.value.trim(),
      email: els.email.value.trim(),
      endereco: els.endereco.value.trim(),
      observacoes: els.observacoes.value.trim(),
      createdAt: Date.now(),
    };
    if(!model.nome){ alert('Informe o nome do paciente.'); return; }

    const list=load();
    if(model.cpf){
      const dup = list.find(p=> p.cpf && p.cpf===model.cpf && p.id!==model.id);
      if(dup){ alert('CPF já cadastrado para outro paciente.'); return; }
    }
    const idx=list.findIndex(x=>x.id===model.id);
    if(idx>=0) list[idx]=model; else list.push(model);
    save(list);
    clearForm();
    render();
  }

  function handleTableClick(e){
    const a=e.target.closest('a[data-action]'); if(!a) return; e.preventDefault();
    const id=a.getAttribute('data-id'); const action=a.getAttribute('data-action');
    const list=load(); const item=list.find(x=>x.id===id);
    if(action==='editar'){ if(item) fillForm(item); return; }
    if(action==='excluir'){
      if(!confirm('Excluir este paciente?')) return;
      save(list.filter(x=>x.id!==id)); render(); return;
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
    els.form=document.getElementById('pacienteForm');
    els.pacienteId=document.getElementById('pacienteId');
    els.nome=document.getElementById('nome');
    els.nascimento=document.getElementById('nascimento');
    els.cpf=document.getElementById('cpf');
    els.telefone=document.getElementById('telefone');
    els.email=document.getElementById('email');
    els.endereco=document.getElementById('endereco');
    els.observacoes=document.getElementById('observacoes');
    els.btnSalvar=document.getElementById('btnSalvar');
    els.btnCancelar=document.getElementById('btnCancelar');

    els.busca=document.getElementById('busca');
    els.tabela=document.getElementById('tabelaPacientes');
    els.tbody=els.tabela.querySelector('tbody');
    els.thead=els.tabela.querySelector('thead');

    els.form.addEventListener('submit', handleSubmit);
    els.btnCancelar.addEventListener('click', clearForm);
    els.busca.addEventListener('input', function(){ state.query=this.value; render(); });
    els.tbody.addEventListener('click', handleTableClick);
    els.thead.addEventListener('click', handleSort);

    render();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
