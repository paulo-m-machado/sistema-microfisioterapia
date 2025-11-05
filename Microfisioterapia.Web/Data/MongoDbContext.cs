using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Microfisioterapia.Web.Models;

namespace Microfisioterapia.Web.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IOptions<MongoSettings> options, IMongoClient client)
        {
            var settings = options.Value;
            _database = client.GetDatabase(settings.DatabaseName);
        }

        public IMongoCollection<Usuario> Usuarios => _database.GetCollection<Usuario>("usuarios");
        public IMongoCollection<Paciente> Pacientes => _database.GetCollection<Paciente>("pacientes");
        public IMongoCollection<Agendamento> Agendamentos => _database.GetCollection<Agendamento>("agendamentos");
        public IMongoCollection<Relatorio> Relatorios => _database.GetCollection<Relatorio>("relatorios");
    }
}