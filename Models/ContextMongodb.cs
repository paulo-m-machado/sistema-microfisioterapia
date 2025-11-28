using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace MeuSiteEmMVC.Models
{
    public class ContextMongodb
    {
        public static string ConnectionString { get; set; }
        public static string DatabaseName { get; set; }
        public static bool IsSSL { get; set; }
        private IMongoDatabase _database { get; }

        public ContextMongodb()
        {
            try
            {
                MongoClientSettings setting = MongoClientSettings.
                    FromUrl(new MongoUrl(ConnectionString));

                if (IsSSL)
                {
                    setting.SslSettings = new SslSettings
                    {
                        EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12
                    };
                }

                var mongoCliente = new MongoClient(setting);
                _database = mongoCliente.GetDatabase(DatabaseName);

            }
            catch (Exception)
            {
                throw new Exception("Não foi possivel conectar");
            }
        }

        public IMongoCollection<Anamnese> Anamnese
        {
            get
            {
                return _database.GetCollection<Anamnese>("anamneses");
            }
        }
        public IMongoCollection<Consulta> Consulta
        {
            get
            {
                return _database.GetCollection<Consulta>("consultas");
            }
        }

        public IMongoCollection<Paciente> Paciente
        {
            get
            {
                return _database.GetCollection<Paciente>("pacientes");
            }
        }

        public IMongoCollection<Profissional> Profissional
        {
            get
            {
                return _database.GetCollection<Profissional>("profissionais");
            }
        }

        // Método auxiliar para suportar FirstOrDefaultAsync
        public async Task<T> FirstOrDefaultAsync<T>(FilterDefinition<T> filter, string collectionName)
        {
            var collection = _database.GetCollection<T>(collectionName);
            return await collection.Find(filter).FirstOrDefaultAsync();
        }
    }
}
