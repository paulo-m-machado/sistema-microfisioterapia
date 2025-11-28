(function(){
 'use strict';
 const CONSULTAS_KEY = 'consultas';
 function loadConsultas(){ try{ const raw=localStorage.getItem(CONSULTAS_KEY); const arr= raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch{return []} }
 function formatDateYYYYMMDD(d){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; }
 function formatBR(d){ return d.toLocaleDateString('pt-BR'); }
 function toCssClass(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-'); }
 const ul = document.getElementById('homeAgendaList');
 if(!ul) return;
 const lbl = document.getElementById('homeDayLabel');
 const btnMais = document.getElementById('homeVerMais');
 const btnMenos = document.getElementById('homeVerMenos');
 const btnGoAgenda = document.getElementById('homeGoAgenda');
 let more = false;
 const today = new Date();
 if(lbl) lbl.textContent = formatBR(today);
 function render(){
   const todayStr = formatDateYYYYMMDD(today);
   const list = loadConsultas().filter(c => c.status!=='Cancelada' && c.data===todayStr).sort((a,b)=> String(a.hora||'').localeCompare(String(b.hora||'')));
   ul.innerHTML='';
   if(list.length===0){
     const li=document.createElement('li');
     li.className='agenda-day-empty';
     li.textContent='Não há atendimentos hoje. Que tal verificar os próximos dias?';
     ul.appendChild(li);
     if(btnMais) btnMais.style.display='none';
     if(btnMenos) btnMenos.style.display='none';
     if(btnGoAgenda) btnGoAgenda.style.display='inline-block';
     return;
   }
   const max = more ? list.length : Math.min(5, list.length);
   for(let i=0;i<max;i++){
     const c=list[i];
     const li=document.createElement('li');
     li.className = `agenda-day-item ${toCssClass(c.status)}`;
     const a=document.createElement('a'); a.href='agenda.html';
     const time=document.createElement('span'); time.className='time'; time.textContent=c.hora;
     const title=document.createElement('span'); title.className='title';
     const nm = c.paciente||'Consulta'; const tipo = c.tipo?` • ${c.tipo}`:''; title.textContent=`${nm}${tipo}`;
     a.appendChild(time); a.appendChild(title); li.appendChild(a); ul.appendChild(li);
   }
   if(list.length>5){ if(btnMais) btnMais.style.display = more?'none':'inline-block'; if(btnMenos) btnMenos.style.display = more?'inline-block':'none'; } else { if(btnMais) btnMais.style.display='none'; if(btnMenos) btnMenos.style.display='none'; }
   if(btnGoAgenda) btnGoAgenda.style.display='inline-block';
 }
 if(btnMais) btnMais.addEventListener('click', function(){ more=true; render(); });
 if(btnMenos) btnMenos.addEventListener('click', function(){ more=false; render(); });
 render();

 // Mini calendário
 const calLabel = document.getElementById('calLabel');
 const calDays = document.getElementById('miniCalDays');
 const calPrev = document.getElementById('calPrev');
 const calNext = document.getElementById('calNext');
 let calDate = new Date();
 calDate.setDate(1);

 function renderCalendar(){
   if(!calDays || !calLabel) return;
   const year = calDate.getFullYear();
   const month = calDate.getMonth();
   calLabel.textContent = calDate.toLocaleDateString('pt-BR', { month:'long', year:'numeric' });
   calDays.innerHTML = '';
   const first = new Date(year, month, 1);
   const daysInMonth = new Date(year, month+1, 0).getDate();
   const prevMonthDays = new Date(year, month, 0).getDate();
   // offset Monday-first
   let offset = first.getDay(); // 0 Sun..6 Sat
   offset = (offset === 0 ? 6 : offset - 1);
   // Leading previous month days
   for(let i=offset-1; i>=0; i--){
     const d = document.createElement('div');
     d.className = 'mini-cal-day is-other-month';
     d.textContent = String(prevMonthDays - i);
     calDays.appendChild(d);
   }
   // Current month days
   const today = new Date();
   for(let i=1; i<=daysInMonth; i++){
     const el = document.createElement('div');
     el.className = 'mini-cal-day';
     el.textContent = String(i);
     if(i===today.getDate() && month===today.getMonth() && year===today.getFullYear()){
       el.classList.add('is-today');
     }
     calDays.appendChild(el);
   }
   // Trailing next month days to complete 42 cells
   const total = offset + daysInMonth;
   const rest = 42 - total;
   for(let i=1; i<=rest; i++){
     const el = document.createElement('div');
     el.className = 'mini-cal-day is-other-month';
     el.textContent = String(i);
     calDays.appendChild(el);
   }
 }
 if(calPrev) calPrev.addEventListener('click', function(){ calDate.setMonth(calDate.getMonth()-1); renderCalendar(); });
 if(calNext) calNext.addEventListener('click', function(){ calDate.setMonth(calDate.getMonth()+1); renderCalendar(); });
 renderCalendar();
})();