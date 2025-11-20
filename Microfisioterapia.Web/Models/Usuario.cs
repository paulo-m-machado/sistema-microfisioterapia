using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Microfisioterapia.Web.Models
{
    public class Usuario
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("nome")]
        public string Nome { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("senhaHash")]
        public string SenhaHash { get; set; } = string.Empty;

        [BsonElement("role")]
        public string Role { get; set; } = "user";

        [BsonElement("ativo")]
        public bool Ativo { get; set; } = true;
    }
}
