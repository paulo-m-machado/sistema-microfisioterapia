using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MicroFisio.Models
{
    public class Paciente
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("nome")]
        public string Nome { get; set; } = string.Empty;

        [BsonElement("dataNascimento")]
        public DateTime? DataNascimento { get; set; }

        [BsonElement("telefone")]
        public string? Telefone { get; set; }

        [BsonElement("email")]
        public string? Email { get; set; }

        [BsonElement("observacoes")]
        public string? Observacoes { get; set; }
    }
}
