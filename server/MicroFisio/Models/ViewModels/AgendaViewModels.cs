using MicroFisio.Models;

namespace MicroFisio.Models.ViewModels
{
    public class AgendaWeekViewModel
    {
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public int SlotMinutes { get; set; } = 30;
        public string DayStart { get; set; } = "08:00";
        public string DayEnd { get; set; } = "18:00";
        public string? TipoFilter { get; set; }
        public string Mode { get; set; } = "day";
        public DateTime CurrentDate { get; set; } = DateTime.Today;
        public bool More { get; set; } = false;
        public List<Agendamento> Itens { get; set; } = new();
        public Dictionary<string, string> PacienteNomes { get; set; } = new();
    }

    public class AgendamentoCreateViewModel
    {
        public List<Paciente> Pacientes { get; set; } = new();
        public string PacienteId { get; set; } = string.Empty;
        public DateTime Data { get; set; } = DateTime.Today;
        public string Hora { get; set; } = "08:00";
        public int DuracaoMinutos { get; set; } = 30;
        public string Tipo { get; set; } = "consulta";
        public string? Observacoes { get; set; }
    }
}
