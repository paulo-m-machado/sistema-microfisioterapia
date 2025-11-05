using Microsoft.AspNetCore.Mvc;

namespace MicroFisio.Controllers
{
    public class AnamneseController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }
    }
}
