using System.Diagnostics;
using MeuSiteEmMVC.Models;
using Microsoft.AspNetCore.Mvc;

namespace MeuSiteEmMVC.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Login(LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            // Aqui você pode adicionar a lógica de autenticação
            // Por enquanto, vamos apenas redirecionar para a página inicial se o PIN for "1234"
            if (model.Pin == "1234")
            {
                // Autenticação bem-sucedida
                // Em um cenário real, você usaria o sistema de autenticação do ASP.NET Core Identity
                // e armazenaria as informações do usuário em um cookie de autenticação
                
                // Redireciona para a página inicial
                return RedirectToAction("Index", "Home");
            }
            else
            {
                // Autenticação falhou
                ModelState.AddModelError(string.Empty, "PIN inválido. Tente novamente.");
                return View(model);
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
