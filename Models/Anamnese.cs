using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MeuSiteEmMVC.Models
 
{
    public class Anamnese
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("paciente")]
        public string Paciente { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("profissional")]
        public string? Profissional { get; set; }

        [BsonElement("data")]
        public string Data { get; set; }

        [BsonElement("queixa")]
        public string Queixa { get; set; }

        [BsonElement("sintomas")]
        public string Sintomas { get; set; }

        [BsonElement("historico")]
        public string Historico { get; set; }

        [BsonElement("exames")]
        public string Exames { get; set; }

        [BsonElement("hipoteses")]
        public string Hipoteses { get; set; }

        [BsonElement("evolucao")]
        public string Evolucao { get; set; }

        [BsonElement("planoTeurapeutico")]
        public string PlanoTeurapeutico { get; set; }
    }
}
