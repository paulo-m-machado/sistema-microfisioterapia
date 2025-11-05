using Microsoft.AspNetCore.Mvc;
using MicroFisio.Services;
using MicroFisio.Models;
using MicroFisio.Models.ViewModels;

namespace MicroFisio.Controllers
{
    public class AgendaController : Controller
    {
        private readonly IAgendamentoService _agService;
        private readonly IPacienteService _pacService;

        public AgendaController(IAgendamentoService agService, IPacienteService pacService)
        {
            _agService = agService;
            _pacService = pacService;
        }

        private static DateTime GetMonday(DateTime date)
        {
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.Date.AddDays(-1 * diff);
        }

        public async Task<IActionResult> Index(string? mode, string? start, string? date, string? tipo, int? slotMinutes, string? dayStart, string? dayEnd, bool? more)
        {
            var modeNormalized = string.IsNullOrWhiteSpace(mode) ? "day" : mode.ToLowerInvariant();
            var currentDate = !string.IsNullOrWhiteSpace(date) && DateTime.TryParse(date, out var d) ? d.Date : DateTime.Today;
            var baseWeekStart = !string.IsNullOrWhiteSpace(start) && DateTime.TryParse(start, out var s)
                ? GetMonday(s)
                : GetMonday(currentDate);
            var baseWeekEnd = baseWeekStart.AddDays(7);

            List<Agendamento> items;
            if (modeNormalized == "week")
            {
                items = await _agService.ListByWeekAsync(baseWeekStart, baseWeekEnd, tipo);
            }
            else
            {
                var dayStartDt = currentDate.Date;
                var dayEndDt = dayStartDt.AddDays(1);
                items = await _agService.ListByWeekAsync(dayStartDt, dayEndDt, tipo);
            }

            var pacientes = await _pacService.GetAllAsync();
            var map = pacientes.ToDictionary(p => p.Id, p => p.Nome);

            var vm = new AgendaWeekViewModel
            {
                WeekStart = baseWeekStart,
                WeekEnd = baseWeekEnd,
                SlotMinutes = slotMinutes ?? 30,
                DayStart = !string.IsNullOrWhiteSpace(dayStart) ? dayStart! : "08:00",
                DayEnd = !string.IsNullOrWhiteSpace(dayEnd) ? dayEnd! : "18:00",
                TipoFilter = tipo,
                Mode = modeNormalized,
                CurrentDate = currentDate,
                More = more ?? false,
                Itens = items,
                PacienteNomes = map
            };
            return View(vm);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            var vm = new AgendamentoCreateViewModel
            {
                Pacientes = await _pacService.GetAllAsync()
            };
            return View(vm);
        }

        public class AgendamentoInputModel
        {
            public string PacienteId { get; set; } = string.Empty;
            public DateTime Data { get; set; }
            public string Hora { get; set; } = "08:00";
            public int DuracaoMinutos { get; set; } = 30;
            public string Tipo { get; set; } = "consulta";
            public string? Observacoes { get; set; }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(AgendamentoInputModel model)
        {
            if (string.IsNullOrWhiteSpace(model.PacienteId))
            {
                ModelState.AddModelError("PacienteId", "Selecione um paciente.");
            }
            if (!TimeSpan.TryParse(model.Hora, out var hora))
            {
                ModelState.AddModelError("Hora", "Hora inválida.");
            }
            if (!ModelState.IsValid)
            {
                var vm = new AgendamentoCreateViewModel
                {
                    Pacientes = await _pacService.GetAllAsync(),
                    PacienteId = model.PacienteId,
                    Data = model.Data,
                    Hora = model.Hora,
                    DuracaoMinutos = model.DuracaoMinutos,
                    Tipo = model.Tipo,
                    Observacoes = model.Observacoes
                };
                return View(vm);
            }

            var inicio = model.Data.Date.Add(hora);
            var ag = new Agendamento
            {
                PacienteId = model.PacienteId,
                DataHoraInicio = inicio,
                DuracaoMinutos = model.DuracaoMinutos,
                Tipo = (model.Tipo ?? "consulta").ToLowerInvariant(),
                Status = "agendada",
                Observacoes = model.Observacoes
            };
            await _agService.CreateAsync(ag);

            var monday = GetMonday(inicio);
            return RedirectToAction("Index", new { start = monday.ToString("yyyy-MM-dd") });
        }
    }
}
