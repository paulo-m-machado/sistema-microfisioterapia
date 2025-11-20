var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// MongoDB configuration and DI
builder.Services.Configure<Microfisioterapia.Web.Data.MongoSettings>(
    builder.Configuration.GetSection("Mongo"));

builder.Services.AddSingleton<MongoDB.Driver.IMongoClient>(sp =>
{
    var opts = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<Microfisioterapia.Web.Data.MongoSettings>>().Value;
    return new MongoDB.Driver.MongoClient(opts.ConnectionString);
});

builder.Services.AddSingleton<Microfisioterapia.Web.Data.MongoDbContext>();
builder.Services.AddSingleton<Microfisioterapia.Web.Security.IPasswordHasher, Microfisioterapia.Web.Security.BCryptPasswordHasher>();

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

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
