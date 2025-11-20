document.addEventListener('DOMContentLoaded', function() {
    // Elementos da UI
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnToday = document.getElementById('btnToday');
    const btnViewWeek = document.getElementById('btnViewWeek');
    const weekLabel = document.getElementById('weekLabel');
    const filterTipo = document.getElementById('filterTipo');
    const dayStart = document.getElementById('dayStart');
    const dayEnd = document.getElementById('dayEnd');
    const slotMinutes = document.getElementById('slotMinutes');
    const agendaBody = document.getElementById('agendaBody');
    
    // Configuração inicial
    let currentDate = new Date();
    let startHour = 8; // 08:00
    let endHour = 18;  // 18:00
    let slotDuration = 30; // minutos
    
    // Inicialização
    function init() {
        updateWeekLabel();
        generateTimeSlots();
        loadAgenda();
        setupEventListeners();
    }
    
    // Atualiza o rótulo da semana atual
    function updateWeekLabel() {
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const options = { day: 'numeric', month: 'short' };
        const startStr = startOfWeek.toLocaleDateString('pt-BR', options);
        const endStr = endOfWeek.toLocaleDateString('pt-BR', options);
        
        weekLabel.textContent = `${startStr} - ${endStr} ${endOfWeek.getFullYear()}`;
    }
    
    // Gera os slots de tempo na grade
    function generateTimeSlots() {
        agendaBody.innerHTML = '';
        const startTime = new Date();
        startTime.setHours(startHour, 0, 0, 0);
        
        const endTime = new Date();
        endTime.setHours(endHour, 0, 0, 0);
        
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const timeStr = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const row = document.createElement('tr');
            
            // Célula de horário
            const timeCell = document.createElement('td');
            timeCell.className = 'times-col';
            timeCell.textContent = timeStr;
            row.appendChild(timeCell);
            
            // Células dos dias da semana
            for (let i = 0; i < 7; i++) {
                const dayCell = document.createElement('td');
                dayCell.className = 'agenda-day-cell';
                dayCell.dataset.time = currentTime.toISOString().substr(11, 5);
                dayCell.dataset.day = i;
                row.appendChild(dayCell);
            }
            
            agendaBody.appendChild(row);
            currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
        }
    }
    
    // Carrega os agendamentos da API
    async function loadAgenda() {
        try {
            const startDate = getStartOfWeek(currentDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            
            const response = await fetch(`/Agenda/Weekly?start=${formatDate(startDate)}&end=${formatDate(endDate)}&tipo=${filterTipo.value}`);
            const agendamentos = await response.json();
            
            renderAgendamentos(agendamentos);
        } catch (error) {
            console.error('Erro ao carregar agenda:', error);
        }
    }
    
    // Renderiza os agendamentos na grade
    function renderAgendamentos(agendamentos) {
        // Limpa eventos existentes
        document.querySelectorAll('.agenda-day-item').forEach(el => el.remove());
        
        agendamentos.forEach(agendamento => {
            const startTime = new Date(agendamento.Data + 'T' + agendamento.HoraInicio);
            const endTime = new Date(agendamento.Data + 'T' + agendamento.HoraFim);
            
            // Encontra a célula correta na grade
            const dayOfWeek = (startTime.getDay() + 6) % 7; // Ajusta para segunda a domingo
            const timeStr = startTime.toISOString().substr(11, 5);
            
            const cell = document.querySelector(`td[data-day="${dayOfWeek}"][data-time="${timeStr}"]`);
            if (cell) {
                const eventElement = document.createElement('div');
                eventElement.className = `agenda-day-item ${agendamento.Tipo.toLowerCase()}`;
                eventElement.innerHTML = `
                    <div class="event-time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
                    <div class="event-title">${agendamento.PacienteNome || 'Sem nome'}</div>
                    <div class="event-type">${agendamento.Tipo}</div>
                    <div class="agenda-day-actions">
                        <button class="btn-ghost btn-sm" onclick="editarAgendamento('${agendamento.Id}')">Editar</button>
                        <button class="btn-ghost btn-sm" onclick="cancelarAgendamento('${agendamento.Id}')">Cancelar</button>
                    </div>
                `;
                cell.appendChild(eventElement);
            }
        });
    }
    
    // Funções auxiliares
    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para começar na segunda-feira
        return new Date(d.setDate(diff));
    }
    
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    function formatTime(date) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Configura os event listeners
    function setupEventListeners() {
        btnPrev.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 7);
            updateWeekLabel();
            loadAgenda();
        });
        
        btnNext.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 7);
            updateWeekLabel();
            loadAgenda();
        });
        
        btnToday.addEventListener('click', () => {
            currentDate = new Date();
            updateWeekLabel();
            loadAgenda();
        });
        
        filterTipo.addEventListener('change', loadAgenda);
        dayStart.addEventListener('change', generateTimeSlots);
        dayEnd.addEventListener('change', generateTimeSlots);
        slotMinutes.addEventListener('change', () => {
            slotDuration = parseInt(slotMinutes.value);
            generateTimeSlots();
            loadAgenda();
        });
        
        // Duplo clique em uma célula para criar novo agendamento
        agendaBody.addEventListener('dblclick', (e) => {
            const cell = e.target.closest('td');
            if (cell && cell.classList.contains('agenda-day-cell')) {
                const dayIndex = parseInt(cell.dataset.day);
                const time = cell.dataset.time;
                const startDate = new Date(getStartOfWeek(currentDate));
                startDate.setDate(startDate.getDate() + dayIndex);
                
                const [hours, minutes] = time.split(':').map(Number);
                startDate.setHours(hours, minutes, 0, 0);
                
                const endDate = new Date(startDate);
                endDate.setMinutes(endDate.getMinutes() + slotDuration);
                
                // Redireciona para a página de criação de agendamento com os parâmetros
                window.location.href = `/Agenda/Create?date=${formatDate(startDate)}&time=${time}`;
            }
        });
    }
    
    // Funções globais para os botões de ação
    window.editarAgendamento = function(id) {
        window.location.href = `/Agenda/Edit/${id}`;
    };
    
    window.cancelarAgendamento = async function(id) {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            try {
                const response = await fetch(`/Agenda/Cancelar/${id}`, { method: 'POST' });
                if (response.ok) {
                    loadAgenda();
                } else {
                    alert('Erro ao cancelar agendamento');
                }
            } catch (error) {
                console.error('Erro ao cancelar agendamento:', error);
                alert('Erro ao cancelar agendamento');
            }
        }
    };
    
    // Inicializa a agenda
    init();
});
