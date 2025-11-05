using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MicroFisio.Models
{
    public class Relatorio
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("agendamentoId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string AgendamentoId { get; set; } = string.Empty;

        [BsonElement("pacienteId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PacienteId { get; set; } = string.Empty;

        [BsonElement("usuarioId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? UsuarioId { get; set; }

        [BsonElement("data")]
        public DateTime Data { get; set; } = DateTime.UtcNow;

        [BsonElement("conteudo")]
        public string Conteudo { get; set; } = string.Empty;
    }
}
