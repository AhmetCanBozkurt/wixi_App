using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Enterprise Database
builder.Services.AddDbContext<WixiCoreDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Configure Identity
builder.Services.AddIdentity<WixiUser, WixiRole>(options => {
    options.User.RequireUniqueEmail = true;
    options.Password.RequireDigit = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<WixiCoreDbContext>()
.AddDefaultTokenProviders();

var app = builder.Build();

// Seed Default Admin (Development or Safe Mode)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try {
        await SeedData.InitializeAsync(services);
    } catch (Exception ex) {
        Console.WriteLine($"An error occurred seeding the DB: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Run();
