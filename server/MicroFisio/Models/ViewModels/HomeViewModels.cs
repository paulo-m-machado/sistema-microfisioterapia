using MicroFisio.Models;

namespace MicroFisio.Models.ViewModels
{
    public class HomeIndexViewModel
    {
        public DateTime Data { get; set; } = DateTime.Today;
        public List<Agendamento> Itens { get; set; } = new();
        public int Total { get; set; }
        public Dictionary<string, string> PacienteNomes { get; set; } = new();
    }
}
