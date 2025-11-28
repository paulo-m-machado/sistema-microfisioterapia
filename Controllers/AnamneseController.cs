using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MeuSiteEmMVC.Data;
using MeuSiteEmMVC.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Globalization;

namespace MeuSiteEmMVC.Controllers
{
    public class AnamneseController : Controller
    {

        private readonly ContextMongodb _context;

        public AnamneseController()
        {
            _context = new ContextMongodb();
        }

        // GET: Pacientes
        //public async Task<IActionResult> Index()
        //{
        //    ContextMongodb dbContext = new ContextMongodb();
        //    return View(await dbContext.Paciente.Find(u => true).ToListAsync());
        //}

        // GET: Anamnese/Index
        public IActionResult Index()
        {
            // Redireciona para a tela de busca de paciente
            return View();
        }

        // GET: AnamneseModels/Details/5
        public async Task<IActionResult> Details(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ContextMongodb dbContext = new ContextMongodb();
            var anamneseModel = await dbContext.Anamnese.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (anamneseModel == null)
            {
                return NotFound();
            }

            return View(anamneseModel);
        }

        // Historico
        public async Task<IActionResult> Historico(string id)
        {
            ContextMongodb dbContext = new ContextMongodb();
            var historico = await dbContext.Anamnese.Find(p => p.Paciente == id).ToListAsync();

            return View(historico);
        }

        // GET: AnamneseModels/Create
        //public IActionResult Create()
        //{
        //    return View();
        //}

        public async Task<IActionResult> Create(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ContextMongodb dbContext = new ContextMongodb();
            var paciente = await dbContext.Paciente.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (paciente == null)
            {
                return NotFound();
            }

            var anamnese = new Anamnese();
            anamnese.Paciente = paciente.Id;
            anamnese.Data = DateTime.Now.ToString("yyyy-MM-dd");

            return View(anamnese);
        }

        // POST: AnamneseModels/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Paciente,Profissional,Data,Queixa,Sintomas,Historico,Exames,Hipoteses,Evolucao,PlanoTeurapeutico")] Anamnese anamneseModel)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(anamneseModel.Queixa))
                {
                    ModelState.AddModelError("Queixa", "O campo Queixa Principal é obrigatório.");
                }

                if (ModelState.IsValid)
                {
                    // Garante que o ID seja gerado automaticamente
                    anamneseModel.Id = ObjectId.GenerateNewId().ToString();

                    ContextMongodb dbContext = new ContextMongodb();
                    await dbContext.Anamnese.InsertOneAsync(anamneseModel);

                    TempData["MensagemSucesso"] = "Anamnese cadastrada com sucesso!";
                    return RedirectToAction("Index", "Home");
                }
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, $"Ocorreu um erro ao salvar a anamnese: {ex.Message}");
                // Log do erro (implementar um serviço de log adequado em produção)
                Console.WriteLine($"Erro ao salvar anamnese: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
            
            // Se chegou aqui, algo deu errado, mostra o formulário novamente
            return View(anamneseModel);
        }

        // GET: AnamneseModels/Edit/5
        public async Task<IActionResult> Edit(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ContextMongodb dbContext = new ContextMongodb();
            var anamneseModel = await dbContext.Anamnese.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (anamneseModel == null)
            {
                return NotFound();
            }
            return View(anamneseModel);
        }

        // POST: AnamneseModels/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(string id, [Bind("Id,Paciente,Profissional,Data,Queixa,Sintomas,Historico,Exames,Hipoteses,Evolucao,PlanoTeurapeutico")] Anamnese anamneseModel)
        {
            if (id != anamneseModel.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    ContextMongodb dbContext = new ContextMongodb();
                    await dbContext.Anamnese.ReplaceOneAsync(m => m.Id == anamneseModel.Id, anamneseModel);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!AnamneseModelExists(anamneseModel.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(anamneseModel);
        }

        // GET: AnamneseModels/Delete/5
        public async Task<IActionResult> Delete(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ContextMongodb dbContext = new ContextMongodb();
            var anamneseModel = await dbContext.Anamnese.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (anamneseModel == null)
            {
                return NotFound();
            }

            return View(anamneseModel);
        }

        // POST: AnamneseModels/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(string id)
        {
            ContextMongodb dbContext = new ContextMongodb();
            await dbContext.Anamnese.DeleteOneAsync(a => a.Id == id);

            return RedirectToAction(nameof(Index));
        }

        private bool AnamneseModelExists(string id)
        {
            ContextMongodb dbContext = new ContextMongodb();
            var anamnese = dbContext.Anamnese.Find(u => u.Id == id).Any();

            return anamnese;
        }
    }
}
