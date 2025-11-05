using MicroFisio.Data;
using MicroFisio.Models;
using MongoDB.Driver;

namespace MicroFisio.Services
{
    public interface IPacienteService
    {
        Task<List<Paciente>> GetAllAsync();
        Task<Paciente?> GetByIdAsync(string id);
        Task CreateAsync(Paciente p);
    }

    public class PacienteService : IPacienteService
    {
        private readonly MongoDbContext _ctx;
        public PacienteService(MongoDbContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<List<Paciente>> GetAllAsync()
        {
            return await _ctx.Pacientes.Find(_ => true).ToListAsync();
        }

        public async Task<Paciente?> GetByIdAsync(string id)
        {
            return await _ctx.Pacientes.Find(p => p.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(Paciente p)
        {
            await _ctx.Pacientes.InsertOneAsync(p);
        }
    }
}
