using MeuSiteEmMVC.Data;
using MeuSiteEmMVC.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeuSiteEmMVC.Controllers
{
    public class PacientesController : Controller
    {
        // GET: Pacientes
        public async Task<IActionResult> Index()
        {
            ContextMongodb dbContext = new ContextMongodb();
            return View(await dbContext.Paciente.Find(u => true).ToListAsync());
        }

        // busca de pacientes para a criar anamneses
        public async Task<IActionResult> Index1()
        {
            ContextMongodb dbContext = new ContextMongodb();
            return View(await dbContext.Paciente.Find(u => true).ToListAsync());
        }

        // busca de pacientes para a editar anamneses
        public async Task<IActionResult> Index2()
        {
            ContextMongodb dbContext = new ContextMongodb();
            return View(await dbContext.Paciente.Find(u => true).ToListAsync());
        }

        // GET: Pacientes/Details/5
        public async Task<IActionResult> Details(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ContextMongodb dbContext = new ContextMongodb();
            var paciente = await dbContext.Paciente.Find(p => p.Id == id).FirstOrDefaultAsync();
            if (paciente == null)
            {
                return NotFound();
            }

            return View(paciente);
        }

        // GET: Pacientes/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Pacientes/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Nome,DataNascimento,CPF,Telefone,Email,Endereco,Obs,DataCadastro")] Paciente paciente)
        {
            if (ModelState.IsValid)
            {
                ContextMongodb dbContext = new ContextMongodb();
                await dbContext.Paciente.InsertOneAsync(paciente);

                return RedirectToAction(nameof(Index));
            }
            return View(paciente);
        }

        // GET: Pacientes/Edit/5
        public async Task<IActionResult> Edit(string id)
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
            return View(paciente);
        }

        // POST: Pacientes/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(string id, [Bind("Id,Nome,DataNascimento,CPF,Telefone,Email,Endereco,Obs,DataCadastro")] Paciente paciente)
        {
            if (id != paciente.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    ContextMongodb dbContext = new ContextMongodb();
                    await dbContext.Paciente.ReplaceOneAsync(m => m.Id == paciente.Id, paciente);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!PacienteExists(paciente.Id))
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
            return View(paciente);
        }

        // GET: Pacientes/Delete/5
        public async Task<IActionResult> Delete(string id)
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

            return View(paciente);
        }

        // POST: Pacientes/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(string id)
        {
            ContextMongodb dbContext = new ContextMongodb();
            await dbContext.Paciente.DeleteOneAsync(a => a.Id == id); 

            return RedirectToAction(nameof(Index));
        }

        private bool PacienteExists(string id)
        {
            ContextMongodb dbContext = new ContextMongodb();
            var paciente = dbContext.Paciente.Find(u => u.Id == id).Any();

            return paciente;
        }
    }
}
