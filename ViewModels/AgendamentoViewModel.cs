using System;
using System.ComponentModel.DataAnnotations;

namespace MeuSiteEmMVC.ViewModels
{
    public class AgendamentoViewModel
    {
        public string Id { get; set; }

        [Required(ErrorMessage = "O paciente é obrigatório")]
        [Display(Name = "Paciente")]
        public string PacienteId { get; set; }

        [Display(Name = "Nome do Paciente")]
        public string PacienteNome { get; set; }

        [Required(ErrorMessage = "A data é obrigatória")]
        [Display(Name = "Data")]
        [DataType(DataType.Date)]
        public DateTime Data { get; set; } = DateTime.Today;

        [Required(ErrorMessage = "A hora é obrigatória")]
        [Display(Name = "Hora")]
        [DataType(DataType.Time)]
        public TimeSpan Hora { get; set; }

        [Required(ErrorMessage = "O tipo de atendimento é obrigatório")]
        [Display(Name = "Tipo de Atendimento")]
        public string Tipo { get; set; } = "Consulta";

        [Required(ErrorMessage = "O status é obrigatório")]
        [Display(Name = "Status")]
        public string Status { get; set; } = "Agendada";

        [Display(Name = "Observações")]
        [DataType(DataType.MultilineText)]
        public string Observacoes { get; set; }

        [Display(Name = "Data e Hora")]
        public DateTime DataHora
        {
            get => Data.Date.Add(Hora);
            set
            {
                Data = value.Date;
                Hora = value.TimeOfDay;
            }
        }
    }
}
