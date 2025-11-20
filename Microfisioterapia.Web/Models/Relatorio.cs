using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Microfisioterapia.Web.Models
{
    public class Relatorio
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("agendamentoId")]
        public string AgendamentoId { get; set; } = string.Empty;

        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("pacienteId")]
        public string PacienteId { get; set; } = string.Empty;

        [BsonElement("conteudo")]
        public string Conteudo { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public long CreatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }
}
