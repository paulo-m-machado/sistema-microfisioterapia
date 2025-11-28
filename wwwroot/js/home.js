document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o calendário
    initCalendar();
    
    // Atualiza a data atual no cabeçalho
    updateCurrentDate();
});

// Função para inicializar o calendário
function initCalendar() {
    const calLabel = document.getElementById('calLabel');
    const calPrev = document.getElementById('calPrev');
    const calNext = document.getElementById('calNext');
    const miniCalDays = document.getElementById('miniCalDays');
    
    if (!calLabel || !calPrev || !calNext || !miniCalDays) return;
    
    let currentDate = new Date();
    
    // Função para renderizar o calendário
    function renderCalendar() {
        // Define o mês e ano atuais no cabeçalho
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        calLabel.textContent = `${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
        
        // Limpa os dias do mês anterior
        miniCalDays.innerHTML = '';
        
        // Obtém o primeiro dia do mês e o último dia do mês
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Obtém o dia da semana do primeiro dia do mês (0 = domingo, 1 = segunda, etc.)
        const firstDayOfWeek = firstDay.getDay();
        
        // Adiciona células vazias para os dias do mês anterior
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'mini-cal-day empty';
            miniCalDays.appendChild(emptyCell);
        }
        
        // Adiciona os dias do mês
        const today = new Date();
        const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                             currentDate.getFullYear() === today.getFullYear();
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'mini-cal-day';
            dayCell.textContent = day;
            
            // Destaca o dia atual
            if (isCurrentMonth && day === today.getDate()) {
                dayCell.classList.add('today');
            }
            
            miniCalDays.appendChild(dayCell);
        }
    }
    
    // Event listeners para navegação do calendário
    calPrev.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    calNext.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Renderiza o calendário inicial
    renderCalendar();
}

// Função para atualizar a data atual no cabeçalho
function updateCurrentDate() {
    const dateLabel = document.getElementById('homeDayLabel');
    if (dateLabel) {
        const today = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        dateLabel.textContent = today.toLocaleDateString('pt-BR', options);
    }
}
