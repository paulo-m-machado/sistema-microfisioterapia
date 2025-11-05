using Microsoft.AspNetCore.Mvc;
using MicroFisio.Models;
using MicroFisio.Services;

namespace MicroFisio.Controllers
{
    public class PacienteController : Controller
    {
        private readonly IPacienteService _service;
        public PacienteController(IPacienteService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View(new Paciente());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Paciente model)
        {
            if (string.IsNullOrWhiteSpace(model.Nome))
            {
                ModelState.AddModelError("Nome", "Informe o nome.");
            }
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            await _service.CreateAsync(model);
            return RedirectToAction("Index", "Home");
        }
    }
}
