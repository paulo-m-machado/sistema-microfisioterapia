using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Microfisioterapia.Web.Models
{
    public class Paciente
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("nomeCompleto")]
        public string NomeCompleto { get; set; } = string.Empty;

        [BsonElement("documento")]
        public string? Documento { get; set; }

        [BsonElement("telefone")]
        public string? Telefone { get; set; }

        [BsonElement("email")]
        public string? Email { get; set; }

        [BsonElement("dataNascimento")]
        public DateOnly? DataNascimento { get; set; }
    }
}
