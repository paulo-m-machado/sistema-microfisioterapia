using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MicroFisio.Models
{
    public class Agendamento
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("pacienteId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PacienteId { get; set; } = string.Empty; // ref Paciente

        [BsonElement("usuarioId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? UsuarioId { get; set; } // profissional/usuário responsável

        [BsonElement("dataHoraInicio")]
        public DateTime DataHoraInicio { get; set; }

        [BsonElement("duracaoMinutos")]
        public int DuracaoMinutos { get; set; } = 30;

        [BsonElement("tipo")]
        public string Tipo { get; set; } = "consulta"; // avaliacao | consulta | retorno

        [BsonElement("status")]
        public string Status { get; set; } = "agendada"; // agendada | concluida | cancelada

        [BsonElement("observacoes")]
        public string? Observacoes { get; set; }

        [BsonElement("relatorioId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? RelatorioId { get; set; }
    }
}
