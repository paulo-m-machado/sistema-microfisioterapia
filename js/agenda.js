'use strict';

(function(){
  const CONSULTAS_KEY = 'consultas';
  const PACIENTES_KEY = 'pacientes';

  const els = {};
  const state = {
    weekStart: startOfWeek(new Date()), // Monday
    currentDate: new Date(),
    dayStart: '08:00',
    dayEnd: '18:00',
    slotMinutes: 30,
    mode: 'none',
    more: false,
    cancelPacienteId: null,
  };

  function startOfWeek(d){
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = x.getDay(); // 0 Sun, 1 Mon ...
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    x.setDate(x.getDate() + diff);
    x.setHours(0,0,0,0);
    return x;
  }

  function renderCancelTable(){
    if(!els.cancelTbody) return;
    const pid = state.cancelPacienteId;
    const typedRaw = (els.cancelPacienteSearch && els.cancelPacienteSearch.value || '').trim();
    const typedLower = typedRaw.toLowerCase();
    const list = loadConsultas()
      .filter(c => {
        if(String(c.status||'') === 'Cancelada') return false;
        if(pid) return c.pacienteId === pid;
        if(typedLower){
          const nm = String(c.paciente||'').toLowerCase();
          return nm.includes(typedLower);
        }
        return false;
      })
      .sort((a,b)=> String(a.data||'').localeCompare(String(b.data||'')) || String(a.hora||'').localeCompare(String(b.hora||'')));
    if(list.length === 0){
      const msg = typedLower ? 'Nenhuma consulta encontrada para este paciente.' : 'Digite o nome do paciente para listar as consultas.';
      els.cancelTbody.innerHTML = `<tr><td colspan="5">${msg}</td></tr>`;
      return;
    }
    els.cancelTbody.innerHTML = list.map(c => {
      const st = String(c.status||'');
      const key = st.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const canConfirm = key === 'agendada';
      const canCancel = key === 'agendada' || key === 'confirmada';
      const actions = [];
      if(canConfirm) actions.push(`<a href="#" class="acao" data-action="confirmar" data-id="${c.id}">Confirmar</a>`);
      if(canCancel) actions.push(`<a href="#" class="acao" data-action="cancelar" data-id="${c.id}">Cancelar</a>`);
      const action = actions.length ? actions.join(' ') : '—';
      return `<tr>
        <td>${c.data}</td>
        <td>${c.hora||''}</td>
        <td>${c.tipo||''}</td>
        <td>${st}</td>
        <td>${action}</td>
      </tr>`;
    }).join('');
  }

  function formatDateYYYYMMDD(d){
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const dd=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  }

  function formatBR(d){ return d.toLocaleDateString('pt-BR'); }

  function addDays(d, n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

  function loadConsultas(){
    try{ const raw=localStorage.getItem(CONSULTAS_KEY); const arr= raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch{return []}
  }
  function saveConsultas(list){ localStorage.setItem(CONSULTAS_KEY, JSON.stringify(list)); }

  function loadPacientes(){
    try{ const raw=localStorage.getItem(PACIENTES_KEY); const arr= raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch{return []}
  }

  function populatePacientesDatalist(){
    if(!els.pacientesList) return;
    const pacientes = loadPacientes();
    els.pacientesList.innerHTML = '';
    pacientes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nome;
      els.pacientesList.appendChild(opt);
    });
  }

  function findPacienteByTyped(typed){
    const pacientes = loadPacientes();
    let match = pacientes.find(p => p.id === typed);
    if(!match){
      const q = String(typed||'').toLowerCase();
      match = pacientes.find(p=> p.nome && p.nome.toLowerCase()===q)
           || pacientes.find(p=> p.nome && p.nome.toLowerCase().startsWith(q))
           || pacientes.find(p=> p.nome && p.nome.toLowerCase().includes(q));
    }
    return match;
  }

  function timeToMinutes(t){
    const [H='0',M='0']=String(t||'').split(':');
    return (+H)*60 + (+M);
  }
  function minutesToTime(m){
    const H=Math.floor(m/60), M=m%60;
    return `${String(H).padStart(2,'0')}:${String(M).padStart(2,'0')}`;
  }

  function toCssClass(s){
    return String(s||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/\s+/g,'-');
  }

  function setWeekLabel(){
    const start = state.weekStart;
    const end = addDays(start, 6);
    els.weekLabel.textContent = `${formatBR(start)} – ${formatBR(end)}`;
  }

  function buildHeader(){
    const headerRow = document.getElementById('agendaHeaderRow');
    const days = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
    // Keep first th (Horários), fill others with dates
    // headerRow already has 8 th; update text content from index 1..7
    for(let i=0;i<7;i++){
      const th = headerRow.children[i+1];
      const d = addDays(state.weekStart, i);
      th.textContent = `${days[i]}\n${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
      const isToday = formatDateYYYYMMDD(d) === formatDateYYYYMMDD(new Date());
      th.classList.toggle('today', isToday);
    }
  }

  function slotKey(dateStr, timeStr){ return `${dateStr}T${timeStr}`; }

  function findConsultaAt(dateStr, timeStr){
    const list = loadConsultas();
    const step = +state.slotMinutes || 30;
    const base = timeToMinutes(timeStr);
    return list.find(c => c.data === dateStr && c.status !== 'Cancelada' && (function(){
      const m = timeToMinutes(c.hora);
      return m >= base && m < base + step;
    })());
  }

  function renderGrid(){
    setWeekLabel();
    buildHeader();

    const tbody = els.agendaBody;
    tbody.innerHTML = '';

    const startMin = timeToMinutes(state.dayStart);
    const endMin = timeToMinutes(state.dayEnd);
    const step = +state.slotMinutes || 30;

    for(let m=startMin; m<endMin; m+=step){
      const tr = document.createElement('tr');
      // time label
      const tdTime = document.createElement('td');
      tdTime.className = 'times-col';
      tdTime.textContent = minutesToTime(m);
      tr.appendChild(tdTime);

      for(let d=0; d<7; d++){
        const td = document.createElement('td');
        const slot = document.createElement('div');
        slot.className = 'slot';
        const dateObj = addDays(state.weekStart, d);
        const dateStr = formatDateYYYYMMDD(dateObj);
        const timeStr = minutesToTime(m);
        slot.dataset.date = dateStr;
        slot.dataset.time = timeStr;

        const c = findConsultaAt(dateStr, timeStr);
        if(c){
          const ev = document.createElement('div');
          ev.className = `event ${toCssClass(c.status)}`;
          const titulo = c.paciente ? c.paciente : 'Consulta';
          ev.textContent = `${titulo} • ${c.tipo||''}`;
          slot.appendChild(ev);
        }
        td.appendChild(slot);
        // highlight today column
        if(formatDateYYYYMMDD(dateObj) === formatDateYYYYMMDD(new Date())) td.classList.add('today');
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }

  function renderDayList(){
    const d = state.currentDate;
    if(els.dayLabel) els.dayLabel.textContent = formatBR(d);
    const list = loadConsultas()
      .filter(c => c.status !== 'Cancelada' && c.data === formatDateYYYYMMDD(d))
      .sort((a,b) => String(a.hora||'').localeCompare(String(b.hora||'')));
    const ul = els.agendaDayList;
    if(!ul) return;
    ul.innerHTML = '';
    if(list.length === 0){
      const li = document.createElement('li');
      li.className = 'agenda-day-empty';
      li.textContent = 'Não há atendimentos hoje. Que tal verificar os próximos dias?';
      ul.appendChild(li);
      if(els.btnVerMais) els.btnVerMais.style.display = 'none';
      if(els.btnVerMenos) els.btnVerMenos.style.display = 'none';
      return;
    }
    const max = state.more ? list.length : Math.min(5, list.length);
    for(let i=0;i<max;i++){
      const c = list[i];
      const li = document.createElement('li');
      li.className = `agenda-day-item ${toCssClass(c.status)}`;
      li.dataset.id = c.id;
      const a = document.createElement('a');
      a.href = '#';
      a.setAttribute('aria-label', 'Abrir agendamento');
      const time = document.createElement('span');
      time.className = 'time';
      time.textContent = c.hora;
      const title = document.createElement('span');
      title.className = 'title';
      const nm = c.paciente ? c.paciente : 'Consulta';
      const tipo = c.tipo ? ` • ${c.tipo}` : '';
      title.textContent = `${nm}${tipo}`;
      a.appendChild(time);
      a.appendChild(title);
      li.appendChild(a);
      ul.appendChild(li);
    }
    if(list.length > 5){
      if(els.btnVerMais) els.btnVerMais.style.display = state.more ? 'none' : 'inline-block';
      if(els.btnVerMenos) els.btnVerMenos.style.display = state.more ? 'inline-block' : 'none';
    } else {
      if(els.btnVerMais) els.btnVerMais.style.display = 'none';
      if(els.btnVerMenos) els.btnVerMenos.style.display = 'none';
    }
  }

  function showMode(mode){
    const m = mode === 'week' ? 'week' : 'day';
    state.mode = m;
    if(m === 'day'){
      if(els.agendaWeekSection) els.agendaWeekSection.style.display = 'none';
      if(els.agendaDaySection) els.agendaDaySection.style.display = '';
      if(els.btnViewDay) els.btnViewDay.className = 'btn-secondary';
      if(els.btnViewWeek) els.btnViewWeek.className = 'btn-ghost';
      renderDayList();
    } else {
      state.weekStart = startOfWeek(state.currentDate);
      if(els.agendaDaySection) els.agendaDaySection.style.display = 'none';
      if(els.agendaWeekSection) els.agendaWeekSection.style.display = '';
      if(els.btnViewDay) els.btnViewDay.className = 'btn-ghost';
      if(els.btnViewWeek) els.btnViewWeek.className = 'btn-secondary';
      renderGrid();
    }
  }

  function fillForm(model){
    els.consultaId.value = model.id || '';
    if(els.agendaPacienteSearch){ els.agendaPacienteSearch.value = model.paciente || ''; }
    els.agendaData.value = model.data || '';
    els.agendaHora.value = model.hora || '';
    els.agendaTipo.value = model.tipo || 'Consulta';
    els.agendaStatus.value = model.status || 'Agendada';
    els.agendaObs.value = model.observacoes || '';

    els.btnCancelarEdicao.style.display = 'inline-block';
    els.btnCancelarConsulta.style.display = 'inline-block';
    els.formTitle.textContent = 'Editar agendamento';
  }

  function clearForm(){
    els.agendaForm.reset();
    els.consultaId.value = '';
    els.btnCancelarEdicao.style.display = 'none';
    els.btnCancelarConsulta.style.display = 'none';
    els.formTitle.textContent = 'Agendar';
  }

  function uid(){ return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

  function conflictExists(list, data, hora, ignoreId){
    return list.some(c => c.data===data && c.hora===hora && c.status!=='Cancelada' && c.id!==ignoreId);
  }

  function handleSlotClick(e){
    const slot = e.target.closest('.slot');
    if(!slot) return;
    const data = slot.dataset.date;
    const hora = slot.dataset.time;

    const c = findConsultaAt(data, hora);
    if(c){
      fillForm(c);
      return;
    }
    // Novo agendamento
    els.agendaData.value = data;
    els.agendaHora.value = hora;
    els.agendaStatus.value = 'Agendada';
    els.formTitle.textContent = 'Agendar';
  }

  function handleSubmit(e){
    e.preventDefault();
    const typed = (els.agendaPacienteSearch && els.agendaPacienteSearch.value || '').trim();
    const match = findPacienteByTyped(typed);
    const pacienteId = match ? match.id : '';
    const paciente = match ? match.nome : '';

    const model = {
      id: els.consultaId.value || uid(),
      pacienteId,
      paciente,
      data: els.agendaData.value,
      hora: els.agendaHora.value,
      tipo: els.agendaTipo.value,
      status: els.agendaStatus.value,
      observacoes: els.agendaObs.value.trim(),
      createdAt: Date.now(),
    };

    // Ajusta a hora para o passo da grade (ex.: 30 ou 60 min) para garantir exibição na visão semanal
    const step = +state.slotMinutes || 30;
    const mins = timeToMinutes(model.hora);
    if(!Number.isNaN(mins) && mins % step !== 0){
      const aligned = mins - (mins % step); // arredonda para baixo
      model.hora = minutesToTime(aligned);
    }

    if(!model.pacienteId || !model.data || !model.hora){
      alert('Selecione o paciente (digite e escolha da lista) e preencha data e hora.');
      return;
    }

    const list = loadConsultas();
    if(conflictExists(list, model.data, model.hora, model.id)){
      alert('Horário já ocupado.');
      return;
    }

    const idx = list.findIndex(x => x.id === model.id);
    if(idx>=0) list[idx] = model; else list.push(model);
    saveConsultas(list);
    clearForm();
    if(state.mode==='week') renderGrid(); else renderDayList();
  }

  function handleCancelEdit(){ clearForm(); }

  function handleCancelConsulta(){
    const id = els.consultaId.value;
    if(!id) return;
    if(!confirm('Cancelar esta consulta?')) return;
    const list = loadConsultas();
    const idx = list.findIndex(x=>x.id===id);
    if(idx>=0){ list[idx].status = 'Cancelada'; saveConsultas(list); }
    clearForm();
    if(state.mode==='week') renderGrid(); else renderDayList();
  }

  function init(){
    els.agendaForm = document.getElementById('agendaForm');
    els.consultaId = document.getElementById('consultaId');
    els.agendaPacienteSearch = document.getElementById('agendaPacienteSearch');
    els.pacientesList = document.getElementById('pacientesList');
    els.agendaData = document.getElementById('agendaData');
    els.agendaHora = document.getElementById('agendaHora');
    els.agendaTipo = document.getElementById('agendaTipo');
    els.agendaStatus = document.getElementById('agendaStatus');
    els.agendaObs = document.getElementById('agendaObs');
    els.btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    els.btnCancelarConsulta = document.getElementById('btnCancelarConsulta');
    els.formTitle = document.getElementById('formTitle');

    els.agendaBody = document.getElementById('agendaBody');
    els.weekLabel = document.getElementById('weekLabel');
    els.btnPrev = document.getElementById('btnPrev');
    els.btnNext = document.getElementById('btnNext');
    els.btnToday = document.getElementById('btnToday');

    els.dayStart = document.getElementById('dayStart');
    els.dayEnd = document.getElementById('dayEnd');
    els.slotMinutes = document.getElementById('slotMinutes');

    els.agendaDaySection = document.getElementById('agendaDaySection');
    els.agendaWeekSection = document.getElementById('agendaWeekSection');
    els.agendaDayList = document.getElementById('agendaDayList');
    els.btnVerMais = document.getElementById('btnVerMais');
    els.btnVerMenos = document.getElementById('btnVerMenos');
    els.dayLabel = document.getElementById('dayLabel');
    els.btnDayPrev = document.getElementById('btnDayPrev');
    els.btnDayNext = document.getElementById('btnDayNext');
    els.btnDayToday = document.getElementById('btnDayToday');
    els.btnViewDay = document.getElementById('btnViewDay');
    els.btnViewWeek = document.getElementById('btnViewWeek');

    // Cancelamento por paciente (rodapé)
    els.cancelPacienteSearch = document.getElementById('cancelPacienteSearch');
    els.tabelaCancelamentos = document.getElementById('tabelaCancelamentos');
    els.cancelTbody = els.tabelaCancelamentos ? els.tabelaCancelamentos.querySelector('tbody') : null;

    populatePacientesDatalist();

    els.agendaBody.addEventListener('click', handleSlotClick);
    els.agendaForm.addEventListener('submit', handleSubmit);
    els.btnCancelarEdicao.addEventListener('click', handleCancelEdit);
    els.btnCancelarConsulta.addEventListener('click', handleCancelConsulta);

    els.btnPrev.addEventListener('click', function(){ state.weekStart = addDays(state.weekStart, -7); renderGrid(); });
    els.btnNext.addEventListener('click', function(){ state.weekStart = addDays(state.weekStart, 7); renderGrid(); });
    els.btnToday.addEventListener('click', function(){ state.weekStart = startOfWeek(new Date()); renderGrid(); });

    els.dayStart.addEventListener('change', function(){ state.dayStart = this.value || '08:00'; if(state.mode==='week'){ renderGrid(); } });
    els.dayEnd.addEventListener('change', function(){ state.dayEnd = this.value || '18:00'; if(state.mode==='week'){ renderGrid(); } });
    els.slotMinutes.addEventListener('change', function(){
      state.slotMinutes = parseInt(this.value||'30',10);
      if(els.agendaHora) els.agendaHora.step = String(state.slotMinutes * 60);
      if(state.mode==='week'){ renderGrid(); }
    });

    if(els.btnViewDay) els.btnViewDay.addEventListener('click', function(){ showMode('day'); });
    if(els.btnViewWeek) els.btnViewWeek.addEventListener('click', function(){ showMode('week'); });

    if(els.btnDayPrev) els.btnDayPrev.addEventListener('click', function(){ state.currentDate = addDays(state.currentDate, -1); renderDayList(); });
    if(els.btnDayNext) els.btnDayNext.addEventListener('click', function(){ state.currentDate = addDays(state.currentDate, 1); renderDayList(); });
    if(els.btnDayToday) els.btnDayToday.addEventListener('click', function(){ state.currentDate = new Date(); renderDayList(); });

    if(els.btnVerMais) els.btnVerMais.addEventListener('click', function(){ state.more = true; renderDayList(); });
    if(els.btnVerMenos) els.btnVerMenos.addEventListener('click', function(){ state.more = false; renderDayList(); });

    if(els.cancelPacienteSearch){
      els.cancelPacienteSearch.addEventListener('input', function(){
        const typed = (this.value||'').trim();
        const match = findPacienteByTyped(typed);
        state.cancelPacienteId = match ? match.id : null;
        renderCancelTable();
      });
    }
    if(els.cancelTbody){
      els.cancelTbody.addEventListener('click', function(e){
        const a = e.target.closest('a[data-action]');
        if(!a) return; e.preventDefault();
        const id = a.getAttribute('data-id');
        const action = a.getAttribute('data-action');
        const list = loadConsultas();
        const idx = list.findIndex(x=>x.id===id);
        if(idx<0) return;
        if(action === 'confirmar'){
          list[idx].status = 'Confirmada';
          saveConsultas(list);
          const isToday = list[idx].data === formatDateYYYYMMDD(new Date());
          if(isToday){ window.location.href = 'index.html'; return; }
          renderCancelTable();
          if(state.mode==='week') renderGrid(); else renderDayList();
          return;
        }
        if(action === 'cancelar'){
          if(!confirm('Cancelar esta consulta?')) return;
          list[idx].status = 'Cancelada';
          saveConsultas(list);
          renderCancelTable();
          if(state.mode==='week') renderGrid(); else renderDayList();
          return;
        }
      });
    }

    if(els.agendaDayList) els.agendaDayList.addEventListener('click', function(e){
      const link = e.target.closest('a');
      if(!link) return;
      e.preventDefault();
      const li = link.closest('li');
      const id = li && li.dataset.id;
      if(!id) return;
      const c = loadConsultas().find(x => x.id === id);
      if(c) fillForm(c);
    });

    // Init state from inputs
    state.dayStart = els.dayStart.value || state.dayStart;
    state.dayEnd = els.dayEnd.value || state.dayEnd;
    state.slotMinutes = parseInt(els.slotMinutes.value||state.slotMinutes,10);

    // Garante que o campo hora respeite o passo da grade
    if(els.agendaHora) els.agendaHora.step = String((state.slotMinutes||30) * 60);

    state.currentDate = new Date();
    renderCancelTable();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

