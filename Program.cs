using MeuSiteEmMVC.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MeuSiteEmMVC.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<MeuSiteEmMVCContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MeuSiteEmMVCContext") ?? throw new InvalidOperationException("Connection string 'MeuSiteEmMVCContext' not found.")));

ContextMongodb.ConnectionString = builder.Configuration.GetSection("MongoConnection:ConnectionString").Value;
ContextMongodb.DatabaseName = builder.Configuration.GetSection("MongoConnection:Database").Value;
ContextMongodb.IsSSL = Convert.ToBoolean(builder.Configuration.GetSection("MongoConnection:IsSSL").Value);

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

// fazer o login funcional e retirar a barra menu da pagina login
// Rota para a página de login
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Login}/{id?}")
    .WithStaticAssets();

// Rota específica para o controlador Agenda
app.MapControllerRoute(
    name: "agenda",
    pattern: "Agenda/{action=Index}/{id?}");


app.Run();
