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
    public class ConsultasController : Controller
    {
        // GET: Consultas
        public async Task<IActionResult> Index()
        {
            ContextMongodb dbContext = new ContextMongodb();
            return View(await dbContext.Consulta.Find(u => true).ToListAsync());
        }

        // GET: Consultas/Details/5
        public async Task<IActionResult> Details(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ContextMongodb dbContext = new ContextMongodb();
            var consulta = await dbContext.Consulta.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (consulta == null)
            {
                return NotFound();
            }

            return View(consulta);
        }

        // GET: Consultas/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Consultas/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Paciente,Profissional,DataHora,Tipo,Status,Obs")] Consulta consulta)
        {
            if (ModelState.IsValid)
            {
                ContextMongodb dbContext = new ContextMongodb();
                await dbContext.Consulta.InsertOneAsync(consulta);

                return RedirectToAction(nameof(Index));
            }
            return View(consulta);
        }

        // GET: Consultas/Edit/5
        public async Task<IActionResult> Edit(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ContextMongodb dbContext = new ContextMongodb();
            var consulta = await dbContext.Consulta.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (consulta == null)
            {
                return NotFound();
            }
            return View(consulta);
        }

        // POST: Consultas/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(string id, [Bind("Id,Paciente,Profissional,DataHora,Tipo,Status,Obs")] Consulta consulta)
        {
            if (id != consulta.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    ContextMongodb dbContext = new ContextMongodb();
                    await dbContext.Consulta.ReplaceOneAsync(m => m.Id == consulta.Id, consulta);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ConsultaExists(consulta.Id))
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
            return View(consulta);
        }

        // GET: Consultas/Delete/5
        public async Task<IActionResult> Delete(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            ContextMongodb dbContext = new ContextMongodb();
            var consulta = await dbContext.Consulta.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (consulta == null)
            {
                return NotFound();
            }

            return View(consulta);
        }

        // POST: Consultas/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(string id)
        {
            ContextMongodb dbContext = new ContextMongodb();
            await dbContext.Consulta.DeleteOneAsync(a => a.Id == id);

            return RedirectToAction(nameof(Index));
        }

        private bool ConsultaExists(string id)
        {
            ContextMongodb dbContext = new ContextMongodb();
            var consulta = dbContext.Consulta.Find(u => u.Id == id).Any();

            return consulta;
        }
    }
}
