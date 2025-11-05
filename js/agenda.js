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
    mode: 'day',
    more: false,
  };

  function startOfWeek(d){
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = x.getDay(); // 0 Sun, 1 Mon ...
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    x.setDate(x.getDate() + diff);
    x.setHours(0,0,0,0);
    return x;
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

  function populatePacientesSelect(){
    const pacientes = loadPacientes();
    els.agendaPaciente.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecione um paciente';
    placeholder.disabled = true;
    placeholder.selected = true;
    els.agendaPaciente.appendChild(placeholder);
    pacientes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nome;
      els.agendaPaciente.appendChild(opt);
    });
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
    return list.find(c => c.data === dateStr && c.hora === timeStr && c.status !== 'Cancelada');
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
      li.textContent = 'Nenhum agendamento para hoje.';
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
    if(model.pacienteId){ els.agendaPaciente.value = model.pacienteId; }
    els.agendaData.value = model.data || '';
    els.agendaHora.value = model.hora || '';
    els.agendaTipo.value = model.tipo || 'Avaliação';
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
    const pacientes = loadPacientes();
    const pacienteId = els.agendaPaciente.value;
    const paciente = (pacientes.find(p=>p.id===pacienteId)||{}).nome || '';

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

    if(!model.pacienteId || !model.data || !model.hora){
      alert('Selecione o paciente e preencha data e hora.');
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
    els.agendaPaciente = document.getElementById('agendaPaciente');
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

    populatePacientesSelect();

    els.agendaBody.addEventListener('click', handleSlotClick);
    els.agendaForm.addEventListener('submit', handleSubmit);
    els.btnCancelarEdicao.addEventListener('click', handleCancelEdit);
    els.btnCancelarConsulta.addEventListener('click', handleCancelConsulta);

    els.btnPrev.addEventListener('click', function(){ state.weekStart = addDays(state.weekStart, -7); renderGrid(); });
    els.btnNext.addEventListener('click', function(){ state.weekStart = addDays(state.weekStart, 7); renderGrid(); });
    els.btnToday.addEventListener('click', function(){ state.weekStart = startOfWeek(new Date()); renderGrid(); });

    els.dayStart.addEventListener('change', function(){ state.dayStart = this.value || '08:00'; if(state.mode==='week'){ renderGrid(); } });
    els.dayEnd.addEventListener('change', function(){ state.dayEnd = this.value || '18:00'; if(state.mode==='week'){ renderGrid(); } });
    els.slotMinutes.addEventListener('change', function(){ state.slotMinutes = parseInt(this.value||'30',10); if(state.mode==='week'){ renderGrid(); } });

    if(els.btnViewDay) els.btnViewDay.addEventListener('click', function(){ showMode('day'); });
    if(els.btnViewWeek) els.btnViewWeek.addEventListener('click', function(){ showMode('week'); });

    if(els.btnDayPrev) els.btnDayPrev.addEventListener('click', function(){ state.currentDate = addDays(state.currentDate, -1); renderDayList(); });
    if(els.btnDayNext) els.btnDayNext.addEventListener('click', function(){ state.currentDate = addDays(state.currentDate, 1); renderDayList(); });
    if(els.btnDayToday) els.btnDayToday.addEventListener('click', function(){ state.currentDate = new Date(); renderDayList(); });

    if(els.btnVerMais) els.btnVerMais.addEventListener('click', function(){ state.more = true; renderDayList(); });
    if(els.btnVerMenos) els.btnVerMenos.addEventListener('click', function(){ state.more = false; renderDayList(); });

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

    state.currentDate = new Date();
    showMode('day');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

