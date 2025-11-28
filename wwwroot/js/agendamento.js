document.addEventListener('DOMContentLoaded', function() {
    // Funções auxiliares
    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para segunda-feira
        return new Date(d.setDate(diff));
    }
    
    // Elementos do formulário
    const form = document.getElementById('agendaForm');
    const pacienteInput = document.getElementById('agendaPacienteSearch');
    const dataInput = document.getElementById('agendaData');
    const horaInput = document.getElementById('agendaHora');
    const tipoSelect = document.getElementById('agendaTipo');
    const statusSelect = document.getElementById('agendaStatus');
    const obsTextarea = document.getElementById('agendaObs');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const btnCancelarConsulta = document.getElementById('btnCancelarConsulta');
    
    // Navegação
    const btnPrev = document.getElementById('btnPrev');
    const btnToday = document.getElementById('btnToday');
    const btnNext = document.getElementById('btnNext');
    const weekLabel = document.getElementById('weekLabel');
    
    // Elementos de informações rápidas
    const hojeDataEl = document.getElementById('hojeData');
    const totalConfirmadasEl = document.getElementById('totalConfirmadas');
    const totalPendentesEl = document.getElementById('totalPendentes');
    const totalCanceladasEl = document.getElementById('totalCanceladas');
    
    // Estado da aplicação
    let currentDate = new Date();
    let editMode = false;
    let currentConsultaId = null;
    let consultasHoje = [];
    
    // Inicialização
    initDatePickers();
    updateWeekLabel();
    setupEventListeners();
    carregarDadosHoje();
    carregarAgendaSemanal();
    
    function initDatePickers() {
        // Configura o datepicker para aceitar apenas datas futuras
        const today = new Date().toISOString().split('T')[0];
        if (dataInput) dataInput.min = today;
        
        // Configura o timepicker para intervalos de 15 minutos
        if (horaInput) horaInput.step = 900; // 15 minutos em segundos
    }
    
    function setupEventListeners() {
        // Navegação
        if (btnPrev) btnPrev.addEventListener('click', () => navigateWeek(-1));
        
        // Event listener para busca de pacientes
        if (pacienteInput) {
            // Busca após 300ms da última digitação (debounce)
            let timeoutId;
            pacienteInput.addEventListener('input', () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(searchPacientes, 300);
            });
            
            // Limpa a seleção quando o campo perde o foco
            pacienteInput.addEventListener('blur', () => {
                setTimeout(() => {
                    if (!document.activeElement || document.activeElement.id !== 'agendaPacienteSearch') {
                        pacienteInput.value = '';
                        const datalist = document.getElementById('pacientesList');
                        if (datalist) datalist.innerHTML = '';
                    }
                }, 200);
            });
        }
        if (btnNext) btnNext.addEventListener('click', () => navigateWeek(1));
        if (btnToday) btnToday.addEventListener('click', goToToday);
        
        // Formulário
        form.addEventListener('submit', handleFormSubmit);
        btnCancelarEdicao.addEventListener('click', resetForm);
        btnCancelarConsulta.addEventListener('click', showCancelConfirmation);
        
        // Função debounce para limitar chamadas repetitivas
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // Busca de pacientes
        const buscaPacientesDebounced = debounce(searchPacientes, 300);
        pacienteInput.addEventListener('input', function(e) {
            console.log('Input detectado:', e.target.value);
            buscaPacientesDebounced();
        });
        
        // Carrega os dados iniciais
        carregarDadosHoje();
        carregarAgendaSemanal();
    }
    
    function updateWeekLabel() {
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const startDate = startOfWeek.toLocaleDateString('pt-BR', options);
        const endDate = endOfWeek.toLocaleDateString('pt-BR', options);
        
        weekLabel.textContent = `${startDate} - ${endDate}`;
        
        // Atualiza a agenda da semana quando a data muda
        carregarAgendaSemanal();
    }
    
    
    function navigateWeek(direction) {
        currentDate.setDate(currentDate.getDate() + (7 * direction));
        updateWeekLabel();
        // Aqui você pode adicionar a lógica para carregar os agendamentos da semana
    }
    
    async function carregarDadosHoje() {
        try {
            const hoje = new Date().toISOString().split('T')[0];
            const response = await fetch(`/Agenda/GetConsultas?start=${hoje}&end=${hoje}`);
            // if (!response.ok) throw new Error('Erro ao carregar consultas de hoje');
            
            consultasHoje = await response.json();
            atualizarInformacoesRapidas();
        } catch (error) {
            console.error('Erro ao carregar consultas de hoje:', error);
            //showAlert('Erro ao carregar consultas de hoje', 'danger');
        }
    }
    
    function atualizarInformacoesRapidas() {
        if (!consultasHoje) return;
        
        const hoje = new Date().toLocaleDateString('pt-BR');
        hojeDataEl.textContent = hoje;
        
        const confirmadas = consultasHoje.filter(c => c.status.toLowerCase() === 'confirmada').length;
        const pendentes = consultasHoje.filter(c => 
            c.status.toLowerCase() === 'agendada' || 
            c.status.toLowerCase() === 'pendente'
        ).length;
        const canceladas = consultasHoje.filter(c => 
            c.status.toLowerCase() === 'cancelada' || 
            c.status.toLowerCase() === 'faltou'
        ).length;
        
        totalConfirmadasEl.textContent = confirmadas;
        totalPendentesEl.textContent = pendentes;
        totalCanceladasEl.textContent = canceladas;
    }
    
    async function carregarAgendaSemanal() {
        try {
            const startOfWeek = getStartOfWeek(currentDate);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            const start = startOfWeek.toISOString().split('T')[0];
            const end = endOfWeek.toISOString().split('T')[0];
            
            const response = await fetch(`/Agenda/GetConsultas?start=${start}&end=${end}`);
            if (!response.ok) throw new Error('Erro ao carregar agenda semanal');
            
            const consultas = await response.json();
            atualizarTabelaAgenda(consultas);
        } catch (error) {
            console.error('Erro ao carregar agenda semanal:', error);
            showAlert('Erro ao carregar agenda semanal', 'danger');
        }
    }
    
    function atualizarTabelaAgenda(consultas) {
        const tbody = document.getElementById('tabelaAgendaSemanaBody');
        tbody.innerHTML = '';
        
        // Adiciona evento de clique aos botões de histórico
        const handleHistoricoClick = (e) => {
            const button = e.target.closest('.btn-historico');
            if (button) {
                const pacienteId = button.dataset.pacienteId;
                const pacienteNome = button.closest('.d-flex').querySelector('.fw-bold').textContent;
                if (pacienteId) {
                    window.location.href = `/Paciente/Historico/${pacienteId}?nome=${encodeURIComponent(pacienteNome)}`;
                }
            }
        };
        
        // Remove event listeners anteriores para evitar duplicação
        tbody.removeEventListener('click', handleHistoricoClick);
        tbody.addEventListener('click', handleHistoricoClick);
        
        // Horários de trabalho (das 8h às 19h)
        const horarios = [];
        for (let h = 8; h < 20; h++) {
            horarios.push(`${h.toString().padStart(2, '0')}:00`);
        }
        
        // Cria as linhas da tabela
        horarios.forEach(hora => {
            const tr = document.createElement('tr');
            const tdHora = document.createElement('td');
            tdHora.className = 'text-center fw-bold bg-light';
            tdHora.textContent = hora;
            tr.appendChild(tdHora);
            
            // Cria as células para cada dia da semana
            for (let i = 0; i < 6; i++) {
                const td = document.createElement('td');
                const diaAtual = new Date(getStartOfWeek(currentDate));
                diaAtual.setDate(diaAtual.getDate() + i);
                
                // Filtra as consultas para este dia e horário
                const consultasDia = consultas.filter(c => {
                    if (!c.start) return false;
                    const dataConsulta = new Date(c.start);
                    return (
                        dataConsulta.getDate() === diaAtual.getDate() &&
                        dataConsulta.getMonth() === diaAtual.getMonth() &&
                        dataConsulta.getFullYear() === diaAtual.getFullYear() &&
                        dataConsulta.getHours() === parseInt(hora.split(':')[0])
                    );
                });
                
                if (consultasDia.length > 0) {
                    consultasDia.forEach(consulta => {
                        const div = document.createElement('div');
                        div.className = `p-2 mb-1 rounded ${getStatusClass(consulta.status)}`;
                        
                        // Formata a data e hora da consulta
                        let dataHoraFormatada = '';
                        if (consulta.start) {
                            const data = new Date(consulta.start);
                            dataHoraFormatada = data.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            });
                        }
                        
                        div.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center">
                                    <span class="fw-bold me-2">${consulta.pacienteNome || 'Paciente'}</span>
                                    <button class="btn btn-sm btn-outline-secondary btn-historico" data-paciente-id="${consulta.pacienteId}">
                                        <i class="bi bi-clock-history"></i>
                                    </button>
                                </div>
                                <span class="badge ${getStatusBadgeClass(consulta.status)}">
                                    ${consulta.tipo || 'Consulta'}
                                </span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center small">
                                <span>${dataHoraFormatada}</span>
                                <span class="text-muted">${consulta.status || ''}</span>
                            </div>
                        `;
                        td.appendChild(div);
                    });
                } else {
                    // Adiciona uma célula vazia com altura mínima para manter o layout
                    td.style.minHeight = '60px';
                }
                
                tr.appendChild(td);
            }
            
            tbody.appendChild(tr);
        });
    }
    
    function getStatusClass(status) {
        switch ((status || '').toLowerCase()) {
            case 'confirmada': return 'bg-success bg-opacity-10 border-start border-success border-3';
            case 'concluída': return 'bg-primary bg-opacity-10 border-start border-primary border-3';
            case 'cancelada':
            case 'faltou': return 'bg-danger bg-opacity-10 border-start border-danger border-3';
            default: return 'bg-warning bg-opacity-10 border-start border-warning border-3';
        }
    }
    
    function getStatusBadgeClass(status) {
        switch ((status || '').toLowerCase()) {
            case 'confirmada': return 'bg-success';
            case 'concluída': return 'bg-primary';
            case 'cancelada':
            case 'faltou': return 'bg-danger';
            default: return 'bg-warning';
        }
    }
    
    function goToToday() {
        currentDate = new Date();
        dataInput.value = currentDate.toISOString().split('T')[0];
        updateWeekLabel();
        carregarDadosHoje();
    }
    
    async function searchPacientes() {
        const termo = pacienteInput.value.trim();
        console.log('[FRONTEND] Buscando pacientes com termo:', termo);
        
        if (termo.length < 1) {  // Reduzido para 1 caractere para melhor experiência
            console.log('[FRONTEND] Termo muito curto, buscando todos os pacientes');
            updatePacientesList([]);
            return;
        }
        
        try {
            console.log('[FRONTEND] Fazendo requisição para /Agenda/BuscarPacientes');
            const response = await fetch(`/Agenda/BuscarPacientes?termo=${encodeURIComponent(termo)}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[FRONTEND] Erro na resposta:', response.status, errorText);
                throw new Error(`Erro ao buscar pacientes: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('[FRONTEND] Resposta recebida:', result);
            
            if (result.success) {
                if (Array.isArray(result.pacientes)) {
                    console.log(`[FRONTEND] ${result.pacientes.length} pacientes encontrados`);
                    updatePacientesList(result.pacientes);
                } else {
                    console.error('[FRONTEND] Formato de resposta inesperado (pacientes não é um array):', result);
                    updatePacientesList([]);
                }
            } else {
                console.error('[FRONTEND] Erro na resposta do servidor:', result.message || 'Erro desconhecido');
                showAlert('Erro ao buscar pacientes: ' + (result.message || 'Tente novamente.'), 'danger');
            }
        } catch (error) {
            console.error('[FRONTEND] Erro ao buscar pacientes:', error);
            showAlert('Erro ao buscar pacientes. Verifique o console para mais detalhes.', 'danger');
        }
    }
    
    function updatePacientesList(pacientes) {
        const datalist = document.getElementById('pacientesList');
        const pacienteInput = document.getElementById('agendaPacienteSearch');
        
        console.log('[FRONTEND] Atualizando lista de pacientes:', pacientes);
        
        // Limpa a lista atual
        datalist.innerHTML = '';
        
        // Se não houver pacientes, limpa o input
        if (!pacientes || !Array.isArray(pacientes) || pacientes.length === 0) {
            console.log('[FRONTEND] Nenhum paciente encontrado ou lista vazia');
            return;
        }
        
        console.log(`[FRONTEND] Exibindo ${pacientes.length} pacientes`);
        
        // Adiciona cada paciente à lista
        pacientes.forEach((paciente, index) => {
            if (!paciente || !paciente.id || !paciente.nome) {
                console.warn(`[FRONTEND] Paciente inválido na posição ${index}:`, paciente);
                return;
            }
            
            const option = document.createElement('option');
            option.value = paciente.nome;
            option.dataset.id = paciente.id;
            
            // Adiciona informações adicionais como CPF se disponível
            let displayText = paciente.nome;
            
            if (paciente.cpf) {
                const cpfFormatado = formatarCPF(paciente.cpf);
                displayText += ` (${cpfFormatado})`;
            }
            
            if (paciente.dataNascimento) {
                displayText += ` - ${paciente.dataNascimento}`;
            }
            
            option.textContent = displayText;
            datalist.appendChild(option);
            
            console.log(`[FRONTEND] Adicionado paciente: ${displayText}`);
        });
        
        // Se houver apenas um resultado, preenche automaticamente
        if (pacientes.length === 1) {
            const paciente = pacientes[0];
            pacienteInput.value = paciente.nome;
            console.log('[FRONTEND] Preenchendo automaticamente o campo de paciente');
        }
    }
    
    function formatarCPF(cpf) {
        if (!cpf) return '';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    function getSelectedPacienteId() {
        const input = document.getElementById('agendaPacienteSearch');
        const option = Array.from(document.getElementById('pacientesList').options).find(
            opt => opt.value === input.value
        );
        return option ? option.dataset.id : null;
    }
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        const pacienteId = getSelectedPacienteId();
        if (!pacienteId) {
            showAlert('Por favor, selecione um paciente da lista', 'warning');
            return;
        }
        
        // Criar data e hora combinadas no formato ISO
        const dataHora = new Date(`${dataInput.value}T${horaInput.value}:00`);
        
        const formData = {
            Id: currentConsultaId || undefined, // Se for novo, não envia o ID
            PacienteId: pacienteId,
            DataHora: dataHora.toISOString(),
            Tipo: tipoSelect.value,
            Status: statusSelect.value,
            Observacoes: obsTextarea.value
        };
        
        try {
            const response = await fetch('/Agenda/AgendarConsulta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar agendamento');
            }
            
            const result = await response.json();
            //showAlert('Agendamento salvo com sucesso!', 'success');
            resetForm();
            
            // Atualiza as informações na tela
            carregarDadosHoje();
            carregarAgendaSemanal();
            
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            showAlert(error.message || 'Erro ao salvar agendamento. Tente novamente.', 'danger');
        }
    }
    
    
    function resetForm() {
        form.reset();
        form.classList.remove('was-validated');
        editMode = false;
        currentConsultaId = null;
        
        // Restaura os valores padrão
        const hoje = new Date();
        dataInput.value = hoje.toISOString().split('T')[0];
        horaInput.value = hoje.getHours().toString().padStart(2, '0') + ':00';
        tipoSelect.value = 'Consulta';
        statusSelect.value = 'Agendada';
        
        // Atualiza a interface
        btnSalvar.textContent = 'Salvar Consulta';
        btnCancelarEdicao.style.display = 'none';
        btnCancelarConsulta.style.display = 'none';
    }
    
    function showCancelConfirmation() {
        if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
            cancelarConsulta();
        }
    }
    
    async function cancelarConsulta() {
        if (!currentConsultaId) return;
        
        try {
            const response = await fetch(`/Agenda/Cancelar/${currentConsultaId}`, {
                method: 'POST',
                headers: {
                    'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
                }
            });
            
            if (!response.ok) throw new Error('Erro ao cancelar consulta');
            
            showAlert('Consulta cancelada com sucesso!', 'success');
            resetForm();
            // Atualiza a visualização
            
        } catch (error) {
            console.error('Erro ao cancelar consulta:', error);
            showAlert('Erro ao cancelar consulta. Tente novamente.', 'danger');
        }
    }
    
    function showAlert(message, type = 'info') {
        // Remove alertas existentes
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });

        // Cria o novo alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        `;

        // Adiciona o alerta ao container de alertas
        const alertContainer = document.getElementById('alertContainer') || document.body;
        alertContainer.insertBefore(alertDiv, alertContainer.firstChild);

        // Remove o alerta após 5 segundos (exceto se for um erro)
        if (type !== 'danger') {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }, 5000);
        }

        // Remove o elemento do DOM após a animação de fechamento
        alertDiv.addEventListener('closed.bs.alert', () => {
            alertDiv.remove();
        });
    }
});
