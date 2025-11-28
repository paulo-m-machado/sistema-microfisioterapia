using System;
using System.Collections.Generic;

namespace MeuSiteEmMVC.Models
{
    public class HistoricoPaciente
    {
        public string PacienteId { get; set; }
        public string NomePaciente { get; set; }
        public DateTime DataNascimento { get; set; }
        public string Telefone { get; set; }
        public List<Anamnese> Anamneses { get; set; } = new List<Anamnese>();
        public List<Consulta> Consultas { get; set; } = new List<Consulta>();
    }
}
