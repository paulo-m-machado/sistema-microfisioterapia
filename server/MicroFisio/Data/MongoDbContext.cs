using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MicroFisio.Settings;
using MicroFisio.Models;

namespace MicroFisio.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IOptions<MongoDbSettings> options)
        {
            var settings = options.Value;
            var client = new MongoClient(settings.ConnectionString);
            _database = client.GetDatabase(settings.DatabaseName);
        }

        public IMongoCollection<Paciente> Pacientes => _database.GetCollection<Paciente>("pacientes");
        public IMongoCollection<Usuario> Usuarios => _database.GetCollection<Usuario>("usuarios");
        public IMongoCollection<Agendamento> Agendamentos => _database.GetCollection<Agendamento>("agendamentos");
        public IMongoCollection<Relatorio> Relatorios => _database.GetCollection<Relatorio>("relatorios");
    }
}
