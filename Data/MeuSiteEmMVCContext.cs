using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MeuSiteEmMVC.Models;

namespace MeuSiteEmMVC.Data
{
    public class MeuSiteEmMVCContext : DbContext
    {
        public MeuSiteEmMVCContext (DbContextOptions<MeuSiteEmMVCContext> options)
            : base(options)
        {
        }

        public DbSet<MeuSiteEmMVC.Models.Anamnese> AnamneseModel { get; set; } = default!;
        public DbSet<MeuSiteEmMVC.Models.Consulta> Consulta { get; set; } = default!;
        public DbSet<MeuSiteEmMVC.Models.Paciente> Paciente { get; set; } = default!;
        public DbSet<MeuSiteEmMVC.Models.Profissional> Profissional { get; set; } = default!;
    }
}
