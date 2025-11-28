using Microsoft.AspNetCore.Mvc;
using MeuSiteEmMVC.Models;
using MeuSiteEmMVC.ViewModels;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Newtonsoft.Json;
using System.Globalization;

namespace MeuSiteEmMVC.Controllers
{
    public class AgendaController : Controller
    {
        private readonly ContextMongodb _context;

        public AgendaController()
        {
            _context = new ContextMongodb();
        }

        public IActionResult AgendaCompleta()
        {
            return View();
        }

        public IActionResult Agendamento(DateTime? data)
        {
            var model = new AgendamentoViewModel
            {
                Data = data ?? DateTime.Today,
                Hora = new TimeSpan(DateTime.Now.Hour, 0, 0),
                Status = "Agendada",
                Tipo = "Consulta"
            };
            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> BuscarPacientes(string termo)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Buscando pacientes com termo: {termo}");

                if (string.IsNullOrWhiteSpace(termo) || termo.Length < 1)
                {
                    Console.WriteLine("[DEBUG] Termo de busca vazio ou muito curto");
                    return Json(new { success = true, pacientes = new List<object>() });
                }

                // Remove caracteres especiais e espaços em branco extras
                var termoLimpo = termo.Trim().ToLower();
                
                // Cria um filtro que busca por nome ou CPF
                var filter = Builders<Paciente>.Filter.Or(
                    Builders<Paciente>.Filter.Regex("Nome", new BsonRegularExpression(termoLimpo, "i")),
                    Builders<Paciente>.Filter.Regex("CPF", new BsonRegularExpression(termoLimpo, "i"))
                );

                Console.WriteLine($"[DEBUG] Filtro aplicado: {filter.ToJson()}");

                // Busca os pacientes no banco de dados
                var pacientes = await _context.Paciente.Find(filter)
                    .Limit(20) // Aumenta o limite de resultados
                    .ToListAsync();

                Console.WriteLine($"[DEBUG] Número de pacientes encontrados: {pacientes.Count}");

                // Mapeia os resultados para o formato esperado pelo frontend
                var resultado = pacientes.Select(p => new
                {
                    id = p.Id,
                    nome = p.Nome,
                    dataNascimento = p.DataNascimento?.ToString("dd/MM/yyyy") ?? "Não informada",
                    cpf = p.CPF
                }).ToList();

                Console.WriteLine($"[DEBUG] Resultado da busca: {JsonConvert.SerializeObject(resultado)}");

                return Json(new { success = true, pacientes = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Agendamento(AgendamentoViewModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.PacienteId))
                {
                    ModelState.AddModelError("PacienteId", "Selecione um paciente válido");
                }

                if (model.Data < DateTime.Today)
                {
                    ModelState.AddModelError("Data", "Não é possível agendar para datas passadas");
                }

                if (ModelState.IsValid)
                {
                    var consulta = new Consulta
                    {
                        Paciente = model.PacienteId,
                        DataHora = model.Data.Add(model.Hora),
                        Tipo = model.Tipo,
                        Status = model.Status,
                        Obs = model.Observacoes,
                        DataCriacao = DateTime.Now
                    };

                    await _context.Consulta.InsertOneAsync(consulta);
                    
                    TempData["MensagemSucesso"] = "Agendamento realizado com sucesso!";
                    return RedirectToAction(nameof(Agendamento), new { data = model.Data });
                }
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "Erro ao processar o agendamento: " + ex.Message);
            }

            // Se chegou até aqui, algo deu errado
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AgendarConsulta([FromBody] AgendamentoViewModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.PacienteId) || model.DataHora == default)
                {
                    return Json(new { success = false, message = "Dados inválidos para agendamento." });
                }

                var consulta = new Consulta
                {
                    Paciente = model.PacienteId,
                    DataHora = model.DataHora,
                    Tipo = model.Tipo ?? "Consulta",
                    Status = model.Status ?? "Agendada",
                    Obs = model.Observacoes
                };

                await _context.Consulta.InsertOneAsync(consulta);
                return Json(new { success = true, message = "Consulta agendada com sucesso!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Erro ao agendar consulta: " + ex.Message });
            }
        }


        [HttpGet]
        public async Task<JsonResult> GetConsultas(DateTime start, DateTime end)
        {
            try
            {
                // Ajustar as datas para incluir todo o dia
                var startDate = start.Date;
                var endDate = end.Date.AddDays(1).AddSeconds(-1);

                var filter = Builders<Consulta>.Filter.And(
                    Builders<Consulta>.Filter.Gte("dataHora", startDate),
                    Builders<Consulta>.Filter.Lte("dataHora", endDate)
                );

                var consultas = await _context.Consulta
                    .Find(filter)
                    .ToListAsync();

                // Carregar os nomes dos pacientes
                var pacienteIds = consultas?.Select(c => c.Paciente).Where(p => p != null).Distinct().ToList() ?? new List<string>();
                var pacientes = await _context.Paciente
                    .Find(p => pacienteIds.Contains(p.Id))
                    .ToListAsync();

                var eventos = consultas.Select(c => new
                {
                    id = c.Id,
                    title = $"{pacientes.FirstOrDefault(p => p.Id == c.Paciente)?.Nome ?? "Paciente não encontrado"} - {c.Tipo}",
                    start = c.DataHora.ToString("yyyy-MM-ddTHH:mm:ss"),
                    end = c.DataHora.AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss"),
                    type = c.Tipo.ToLower(),
                    status = c.Status.ToLower(),
                    pacienteId = c.Paciente,
                    pacienteNome = pacientes.FirstOrDefault(p => p.Id == c.Paciente)?.Nome ?? "Paciente não encontrado"
                });

                return Json(eventos);
            }
            catch (Exception ex)
            {
                return Json(new { error = $"Erro ao buscar consultas: {ex.Message}" });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AtualizarStatus(string id, string status)
        {
            try
            {
                var filter = Builders<Consulta>.Filter.Eq("_id", ObjectId.Parse(id));
                var update = Builders<Consulta>.Update.Set("status", status);
                var result = await _context.Consulta.UpdateOneAsync(filter, update);

                if (result.ModifiedCount > 0)
                {
                    return Json(new { success = true, message = "Status atualizado com sucesso!" });
                }
                return Json(new { success = false, message = "Nenhum documento foi atualizado." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Erro ao atualizar status: {ex.Message}" });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ExcluirConsulta(string id)
        {
            try
            {
                var result = await _context.Consulta.DeleteOneAsync(c => c.Id == id);
                if (result.DeletedCount > 0)
                {
                    return Json(new { success = true, message = "Consulta excluída com sucesso!" });
                }
                return Json(new { success = false, message = "Nenhuma consulta foi encontrada para exclusão." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Erro ao excluir consulta: {ex.Message}" });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Salvar([FromBody] AgendamentoViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { success = false, message = "Dados inválidos. Verifique os campos e tente novamente." });
            }

            try
            {
                var dataHora = model.Data.Add(model.Hora);
                
                // Verifica se já existe uma consulta no mesmo horário
                var consultaExistente = await _context.FirstOrDefaultAsync<Consulta>(
                    Builders<Consulta>.Filter.And(
                        Builders<Consulta>.Filter.Eq("dataHora", dataHora),
                        Builders<Consulta>.Filter.Ne("_id", model.Id)
                    ),
                    "consultas"
                );

                if (consultaExistente != null)
                {
                    return Json(new { success = false, message = "Já existe uma consulta agendada para este horário." });
                }

                // Verifica se o paciente existe
                var paciente = await _context.FirstOrDefaultAsync<Paciente>(
                    Builders<Paciente>.Filter.Eq("_id", model.PacienteId),
                    "pacientes"
                );

                if (paciente == null)
                {
                    return Json(new { success = false, message = "Paciente não encontrado." });
                }

                // Cria ou atualiza a consulta
                if (string.IsNullOrEmpty(model.Id))
                {
                    // Nova consulta
                    var novaConsulta = new Consulta
                    {
                        Paciente = model.PacienteId,
                        DataHora = dataHora,
                        Tipo = model.Tipo,
                        Status = model.Status,
                        Obs = model.Observacoes,
    Profissional = User?.Identity?.Name ?? "Sistema" // Usa 'Sistema' se não houver usuário logado
                    };

                    await _context.Consulta.InsertOneAsync(novaConsulta);
                    return Json(new { success = true, message = "Consulta agendada com sucesso!" });
                }
                else
                {
                    // Atualização de consulta existente
                    var filter = Builders<Consulta>.Filter.Eq("_id", ObjectId.Parse(model.Id));
                    var update = Builders<Consulta>.Update
                        .Set("paciente", model.PacienteId)
                        .Set("dataHora", dataHora)
                        .Set("tipo", model.Tipo)
                        .Set("status", model.Status)
                        .Set("obs", model.Observacoes);

                    var result = await _context.Consulta.UpdateOneAsync(filter, update);

                    if (result.ModifiedCount > 0)
                    {
                        return Json(new { success = true, message = "Consulta atualizada com sucesso!" });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Nenhuma alteração foi realizada na consulta." });
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Erro ao salvar consulta: {ex.Message}" });
            }
        }

        [HttpPost("Cancelar/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Cancelar(string id)
        {
            try
            {
                var filter = Builders<Consulta>.Filter.Eq("_id", ObjectId.Parse(id));
                var update = Builders<Consulta>.Update
                    .Set("status", "Cancelada")
                    .Set("obs", $"Consulta cancelada em {DateTime.Now:dd/MM/yyyy HH:mm}");

                var result = await _context.Consulta.UpdateOneAsync(filter, update);

                if (result.ModifiedCount > 0)
                {
                    return Json(new { success = true, message = "Consulta cancelada com sucesso!" });
                }
                return Json(new { success = false, message = "Nenhuma consulta foi encontrada para cancelamento." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Erro ao cancelar consulta: {ex.Message}" });
            }
        }
    }
}
