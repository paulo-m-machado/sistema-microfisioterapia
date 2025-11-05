using MicroFisio.Data;
using MicroFisio.Models;
using MongoDB.Driver;

namespace MicroFisio.Services
{
    public interface IRelatorioService
    {
        Task<Relatorio?> GetByIdAsync(string id);
        Task CreateAsync(Relatorio r);
        Task<Relatorio> CreateForAgendamentoAsync(string agendamentoId, string pacienteId, string? usuarioId, string conteudo);
    }

    public class RelatorioService : IRelatorioService
    {
        private readonly MongoDbContext _ctx;
        private readonly IAgendamentoService _agendamentoService;
        public RelatorioService(MongoDbContext ctx, IAgendamentoService agendamentoService)
        {
            _ctx = ctx;
            _agendamentoService = agendamentoService;
        }

        public async Task<Relatorio?> GetByIdAsync(string id)
        {
            return await _ctx.Relatorios.Find(r => r.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(Relatorio r)
        {
            await _ctx.Relatorios.InsertOneAsync(r);
        }

        public async Task<Relatorio> CreateForAgendamentoAsync(string agendamentoId, string pacienteId, string? usuarioId, string conteudo)
        {
            var rel = new Relatorio
            {
                AgendamentoId = agendamentoId,
                PacienteId = pacienteId,
                UsuarioId = usuarioId,
                Data = DateTime.UtcNow,
                Conteudo = conteudo
            };
            await _ctx.Relatorios.InsertOneAsync(rel);

            var ag = await _agendamentoService.GetByIdAsync(agendamentoId);
            if (ag != null)
            {
                ag.RelatorioId = rel.Id;
                ag.Status = "concluida";
                await _agendamentoService.UpdateAsync(ag);
            }
            return rel;
        }
    }
}
