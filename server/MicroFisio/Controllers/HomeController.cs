using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using MicroFisio.Models;
using MicroFisio.Models.ViewModels;
using MicroFisio.Services;

namespace MicroFisio.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IAgendamentoService _agService;
    private readonly IPacienteService _pacService;

    public HomeController(ILogger<HomeController> logger, IAgendamentoService agService, IPacienteService pacService)
    {
        _logger = logger;
        _agService = agService;
        _pacService = pacService;
    }

    public async Task<IActionResult> Index()
    {
        var today = DateTime.Today;
        var start = today;
        var end = today.AddDays(1);
        var items = await _agService.ListByWeekAsync(start, end, null);
        var pacientes = await _pacService.GetAllAsync();
        var map = pacientes.ToDictionary(p => p.Id, p => p.Nome);
        var top5 = items.OrderBy(i => i.DataHoraInicio).Take(5).ToList();
        var vm = new HomeIndexViewModel
        {
            Data = today,
            Itens = top5,
            Total = items.Count,
            PacienteNomes = map
        };
        return View(vm);
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
