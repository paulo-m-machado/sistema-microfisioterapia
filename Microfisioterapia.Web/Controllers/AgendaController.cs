using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Microfisioterapia.Web.Data;
using Microfisioterapia.Web.Models;
using System.Threading.Tasks;

namespace Microfisioterapia.Web.Controllers
{
    [Route("api/[controller]/[action]")]
    // [ApiController] <--- REMOVIDO: Este atributo é desnecessário quando se usa Views
    public class AgendaController : Controller // <--- ALTERADO: Agora herda de 'Controller' para suportar o método View()
    {
        private readonly MongoDbContext _db;

        public AgendaController(MongoDbContext db)
        {
            _db = db;
        }

        // 1. Método Index (Retorna a View/Página principal da agenda)
        // Linha que estava causando o erro: return View();
        public IActionResult Index(string? start)
        {
            ViewData["Start"] = start;
            return View(); // CORRIGIDO: Agora funciona, pois herdamos de Controller
        }

        // 2. Método Weekly (Endpoint de API para buscar dados da agenda)
        [HttpGet]
        public async Task<IActionResult> Weekly(string? start, string? end, string? tipo)
        {
            var startDate = string.IsNullOrWhiteSpace(start) ? DateTime.Today : DateTime.Parse(start);
            var endDate = string.IsNullOrWhiteSpace(end) ? startDate.AddDays(6) : DateTime.Parse(end);

            var fb = Builders<Agendamento>.Filter;
            var filter = fb.Gte(a => a.Data, startDate.ToString("yyyy-MM-dd")) &
                         fb.Lte(a => a.Data, endDate.ToString("yyyy-MM-dd"));

            if (!string.IsNullOrWhiteSpace(tipo) && !string.Equals(tipo, "Todos", StringComparison.OrdinalIgnoreCase))
            {
                filter &= fb.Eq(a => a.Tipo, tipo);
            }

            var list = await _db.Agendamentos.Find(filter).ToListAsync();

            // CORRIGIDO: Para um Controller MVC, o método de retorno de JSON é o Json()
            return Json(list);
        }

        // 3. Método Create GET (Retorna a View/Formulário de criação/edição)
        // Linha que estava causando o erro: return View(model);
        [HttpGet]
        public async Task<IActionResult> Create(string? id, string? date, string? time)
        {
            var pacientes = await _db.Pacientes
                .Find(Builders<Paciente>.Filter.Empty)
                .Project(p => new { p.Id, p.NomeCompleto })
                .ToListAsync();
            ViewBag.Pacientes = pacientes;

            Agendamento model;
            if (!string.IsNullOrEmpty(id))
            {
                model = await _db.Agendamentos.Find(a => a.Id == id).FirstOrDefaultAsync() ?? new Agendamento();
            }
            else
            {
                model = new Agendamento { Data = date ?? string.Empty, Hora = time ?? string.Empty };
            }

            return View(model); // CORRIGIDO: Agora funciona
        }

        // 4. Método Create POST (Ação de salvar/atualizar)
        // Linha que estava causando o erro: return RedirectToAction(nameof(Index));
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Agendamento model)
        {
            if (string.IsNullOrWhiteSpace(model.PacienteId) || string.IsNullOrWhiteSpace(model.Data) || string.IsNullOrWhiteSpace(model.Hora))
            {
                ModelState.AddModelError(string.Empty, "Paciente, data e hora são obrigatórios.");
            }

            if (!ModelState.IsValid)
            {
                var pacientes = await _db.Pacientes
                    .Find(Builders<Paciente>.Filter.Empty)
                    .Project(p => new { p.Id, p.NomeCompleto })
                    .ToListAsync();
                ViewBag.Pacientes = pacientes;
                return View(model); // CORRIGIDO: Retorna o modelo para View com erros de validação
            }

            var paciente = await _db.Pacientes.Find(p => p.Id == model.PacienteId).FirstOrDefaultAsync();
            model.PacienteNome = paciente?.NomeCompleto ?? model.PacienteNome;

            if (string.IsNullOrEmpty(model.Id))
            {
                await _db.Agendamentos.InsertOneAsync(model);
            }
            else
            {
                await _db.Agendamentos.ReplaceOneAsync(a => a.Id == model.Id, model);
            }

            return RedirectToAction(nameof(Index)); // CORRIGIDO: Agora funciona
        }

        // 5. Método GetAgendaHoje (Endpoint de API)
        [HttpGet("hoje")]
        public async Task<IActionResult> GetAgendaHoje()
        {
            try
            {
                var hoje = DateTime.Today.ToString("yyyy-MM-dd");
                var filter = Builders<Agendamento>.Filter.Eq(a => a.Data, hoje);

                var agendamentos = await _db.Agendamentos
                    .Find(filter)
                    .ToListAsync();

                return Ok(agendamentos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao buscar agendamentos do dia", error = ex.Message });
            }
        }
    }
}