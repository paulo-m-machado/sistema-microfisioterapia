using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MeuSiteEmMVC.Models
{
    public class Profissional
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("nome")]
        public string Nome { get; set; }

        [BsonElement("dataNascimento")]
        public DateOnly? DataNascimento { get; set; }

        [BsonElement("cpf")]
        public string CPF { get; set; }

        [BsonElement("telefone")]
        public string Telefone { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("endereco")]
        public string Endereco { get; set; }

        [BsonElement("obs")]
        public string Obs { get; set; }

        [BsonElement("dataCadastro")]
        public string DataCadastro { get; set; }

        [BsonElement("funcao")]
        public string Funcao { get; set; }

        [BsonElement("login")]
        public string Login { get; set; }

        [BsonElement("senha")]
        public string Senha { get; set; }
    }
}
