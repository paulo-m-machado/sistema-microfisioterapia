using MicroFisio.Data;
using MicroFisio.Models;
using MongoDB.Driver;

namespace MicroFisio.Services
{
    public interface IAgendamentoService
    {
        Task<List<Agendamento>> ListByWeekAsync(DateTime weekStart, DateTime weekEnd, string? tipo);
        Task<Agendamento?> GetByIdAsync(string id);
        Task CreateAsync(Agendamento a);
        Task UpdateAsync(Agendamento a);
    }

    public class AgendamentoService : IAgendamentoService
    {
        private readonly MongoDbContext _ctx;
        public AgendamentoService(MongoDbContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<List<Agendamento>> ListByWeekAsync(DateTime weekStart, DateTime weekEnd, string? tipo)
        {
            var filter = Builders<Agendamento>.Filter.And(
                Builders<Agendamento>.Filter.Gte(a => a.DataHoraInicio, weekStart),
                Builders<Agendamento>.Filter.Lt(a => a.DataHoraInicio, weekEnd)
            );
            if (!string.IsNullOrWhiteSpace(tipo))
            {
                filter = Builders<Agendamento>.Filter.And(filter, Builders<Agendamento>.Filter.Eq(a => a.Tipo, tipo));
            }
            return await _ctx.Agendamentos.Find(filter).SortBy(a => a.DataHoraInicio).ToListAsync();
        }

        public async Task<Agendamento?> GetByIdAsync(string id)
        {
            return await _ctx.Agendamentos.Find(a => a.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(Agendamento a)
        {
            await _ctx.Agendamentos.InsertOneAsync(a);
        }

        public async Task UpdateAsync(Agendamento a)
        {
            await _ctx.Agendamentos.ReplaceOneAsync(x => x.Id == a.Id, a);
        }
    }
}
