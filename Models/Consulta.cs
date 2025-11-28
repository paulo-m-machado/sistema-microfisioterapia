using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MeuSiteEmMVC.Models
{
    public class Consulta
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("paciente")]
        public string Paciente { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("profissional")]
        public string Profissional { get; set; }

        [BsonElement("dataHora")]
        public DateTime DataHora { get; set; }

        [BsonElement("tipo")]
        public string Tipo { get; set; }

        [BsonElement("status")]
        public string Status { get; set; }

        [BsonElement("obs")]
        public string Obs { get; set; }

        [BsonElement("dataCriacao")]
        public DateTime DataCriacao { get; set; }
    }
}
