using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Microfisioterapia.Web.Models
{
    public class Agendamento
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("pacienteId")]
        public string PacienteId { get; set; } = string.Empty;

        [BsonElement("pacienteNome")]
        public string? PacienteNome { get; set; }

        [BsonElement("data")]
        public string Data { get; set; } = string.Empty; // YYYY-MM-DD

        [BsonElement("hora")]
        public string Hora { get; set; } = string.Empty; // HH:mm

        [BsonElement("tipo")]
        public string Tipo { get; set; } = "Consulta"; // Avaliação, Consulta, Retorno

        [BsonElement("status")]
        public string Status { get; set; } = "Agendada"; // Agendada, Concluída, Cancelada

        [BsonElement("observacoes")]
        public string? Observacoes { get; set; }

        [BsonElement("createdAt")]
        public long CreatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }
}
