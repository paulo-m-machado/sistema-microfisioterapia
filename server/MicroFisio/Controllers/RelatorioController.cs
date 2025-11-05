using Microsoft.AspNetCore.Mvc;
using MicroFisio.Services;

namespace MicroFisio.Controllers
{
    public class RelatorioController : Controller
    {
        private readonly IRelatorioService _relService;
        public RelatorioController(IRelatorioService relService)
        {
            _relService = relService;
        }

        public async Task<IActionResult> Details(string id)
        {
            var r = await _relService.GetByIdAsync(id);
            if (r == null) return NotFound();
            return View(r);
        }
    }
}
