'use strict';
(function(){
  const CONSULTAS_KEY = 'consultas';

  function loadConsultas(){
    try{ const raw = localStorage.getItem(CONSULTAS_KEY); const arr = raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch{return []}
  }
  function formatDateYYYYMMDD(d){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; }
  function formatBR(d){ return d.toLocaleDateString('pt-BR'); }

  const els = {};
  const state = {
    date: new Date(),
    showCanceled: false,
  };

  function firstDayMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
  function lastDayMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }

  function render(){
    const monthFirst = firstDayMonth(state.date);
    const monthLast = lastDayMonth(state.date);
    const year = state.date.getFullYear();
    const month = state.date.getMonth();

    if(els.calLabel){
      els.calLabel.textContent = state.date.toLocaleDateString('pt-BR', { month:'long', year:'numeric' });
    }

    if(!els.calDays) return;
    els.calDays.innerHTML = '';

    // offset Monday-first
    let offset = monthFirst.getDay(); // 0 Sun..6 Sat
    offset = (offset === 0 ? 6 : offset - 1);

    const prevMonthDays = new Date(year, month, 0).getDate();

    // Leading previous month cells
    for(let i=offset-1; i>=0; i--){
      const d = document.createElement('div');
      d.className = 'cal-day is-other-month';
      d.innerHTML = `<div class="cal-date">${prevMonthDays - i}</div>`;
      els.calDays.appendChild(d);
    }

    const today = new Date();
    const list = loadConsultas();

    for(let day=1; day<=monthLast.getDate(); day++){
      const dateObj = new Date(year, month, day);
      const dateStr = formatDateYYYYMMDD(dateObj);

      const dayEl = document.createElement('div');
      dayEl.className = 'cal-day';
      if(dateObj.getDate()===today.getDate() && dateObj.getMonth()===today.getMonth() && dateObj.getFullYear()===today.getFullYear()){
        dayEl.classList.add('is-today');
      }

      const header = document.createElement('div');
      header.className = 'cal-date';
      header.textContent = String(day);
      dayEl.appendChild(header);

      const dayList = document.createElement('ul');
      dayList.className = 'cal-events';

      const items = list
        .filter(c => (state.showCanceled || c.status !== 'Cancelada') && c.data === dateStr)
        .sort((a,b) => String(a.hora||'').localeCompare(String(b.hora||'')));

      if(items.length === 0){
        // no-op, keep empty cell
      } else {
        for(const c of items){
          const li = document.createElement('li');
          li.className = `evt ${String(c.status||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-')}`;
          const nome = c.paciente || 'Consulta';
          const tipo = c.tipo ? ` • ${c.tipo}` : '';
          li.textContent = `${c.hora} ${nome}${tipo}`;
          dayList.appendChild(li);
        }
      }

      dayEl.appendChild(dayList);
      dayEl.dataset.date = dateStr;
      els.calDays.appendChild(dayEl);
    }

    // Trailing next month to complete 42 cells
    const rendered = offset + monthLast.getDate();
    const rest = 42 - rendered;
    for(let i=1; i<=rest; i++){
      const d = document.createElement('div');
      d.className = 'cal-day is-other-month';
      d.innerHTML = `<div class="cal-date">${i}</div>`;
      els.calDays.appendChild(d);
    }
  }

  function openDayDetails(dateStr){
    const list = loadConsultas()
      .filter(c => (state.showCanceled || c.status !== 'Cancelada') && c.data === dateStr)
      .sort((a,b)=> String(a.hora||'').localeCompare(String(b.hora||'')));
    const ul = els.dayDetailsList;
    if(!ul) return;
    ul.innerHTML = '';
    if(list.length === 0){
      const li = document.createElement('li');
      li.className = 'agenda-day-empty';
      li.textContent = 'Sem atendimentos neste dia.';
      ul.appendChild(li);
    } else {
      for(const c of list){
        const li = document.createElement('li');
        li.className = `agenda-day-item ${String(c.status||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-')}`;
        const a = document.createElement('a'); a.href = 'agenda.html'; a.setAttribute('aria-label','Abrir agendamento');
        const time = document.createElement('span'); time.className='time'; time.textContent = c.hora;
        const title = document.createElement('span'); title.className='title';
        const nome = c.paciente || 'Consulta'; const tipo = c.tipo?` • ${c.tipo}`:'';
        title.textContent = `${nome}${tipo}`;
        a.appendChild(time); a.appendChild(title);
        li.appendChild(a);
        ul.appendChild(li);
      }
    }
    const dt = new Date(dateStr);
    if(els.dayDetailsLabel) els.dayDetailsLabel.textContent = `Atendimentos de ${formatBR(dt)}`;
    if(els.dayDetails) els.dayDetails.style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init(){
    els.calPrev = document.getElementById('calPrev');
    els.calNext = document.getElementById('calNext');
    els.calToday = document.getElementById('calToday');
    els.calLabel = document.getElementById('calLabel');
    els.calDays = document.getElementById('calDays');

    els.chkMostrarCanceladas = document.getElementById('chkMostrarCanceladas');

    els.dayDetails = document.getElementById('dayDetails');
    els.dayDetailsLabel = document.getElementById('dayDetailsLabel');
    els.dayDetailsList = document.getElementById('dayDetailsList');

    if(els.calPrev) els.calPrev.addEventListener('click', function(){ state.date.setMonth(state.date.getMonth()-1); render(); });
    if(els.calNext) els.calNext.addEventListener('click', function(){ state.date.setMonth(state.date.getMonth()+1); render(); });
    if(els.calToday) els.calToday.addEventListener('click', function(){ state.date = new Date(); render(); });

    if(els.chkMostrarCanceladas) els.chkMostrarCanceladas.addEventListener('change', function(){ state.showCanceled = !!this.checked; render(); });

    if(els.calDays){
      els.calDays.addEventListener('click', function(e){
        const day = e.target.closest('.cal-day');
        if(!day) return;
        const dateStr = day.dataset.date;
        if(dateStr) openDayDetails(dateStr);
      });
    }

    render();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
