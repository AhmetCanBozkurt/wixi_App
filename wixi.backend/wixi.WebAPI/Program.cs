using System.Text;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using wixi.DataAccess;
using wixi.Identity.Extensions;
using wixi.WebAPI.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();

// API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new Asp.Versioning.ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
})
.AddMvc();

// Swagger configuration with API versioning support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1.0", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Wixi Backend V1",
        Version = "v1.0",
        Description = "Wixi Backend V1 API Documentation",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Wixi Software",
            Email = "support@wixisoftware.com"
        }
    });

    // JWT Bearer auth for Swagger
    var securityScheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT token as: Bearer {token}",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new Microsoft.OpenApi.Models.OpenApiReference
        {
            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };
    options.AddSecurityDefinition("Bearer", securityScheme);
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });

    // Handle IFormFile for Swagger (file upload support)
    options.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Database Configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<WixiDbContext>(options =>
    options.UseSqlServer(connectionString));

// ASP.NET Core Identity
builder.Services.AddIdentity<wixi.Identity.Entities.User, wixi.Identity.Entities.Role>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    
    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
    
    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<WixiDbContext>()
.AddDefaultTokenProviders();

// Identity Services (Custom services: PasswordHasher, JwtService)
builder.Services.AddIdentityServices();

// Business Services (Client, Document, Application, Support, Email, Content, Form)
builder.Services.AddBusinessServices();

// Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(
        connectionString: connectionString!,
        name: "database",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "db", "sql" });

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var securityKey = jwtSettings.GetValue<string>("SecurityKey") 
    ?? throw new InvalidOperationException("JWT SecurityKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Authorization & Policies
builder.Services.AddAuthorization(options =>
{
    // Role-based policies
    options.AddPolicy(wixi.WebAPI.Authorization.Policies.AdminOnly, policy => 
        policy.RequireRole("Admin"));
    
    options.AddPolicy(wixi.WebAPI.Authorization.Policies.ClientOnly, policy => 
        policy.RequireRole("Client"));
    
    options.AddPolicy(wixi.WebAPI.Authorization.Policies.EmployeeOnly, policy => 
        policy.RequireRole("Employee"));
    
    options.AddPolicy(wixi.WebAPI.Authorization.Policies.AdminOrEmployee, policy => 
        policy.RequireRole("Admin", "Employee"));
    
    // Resource-based policies
    options.AddPolicy(wixi.WebAPI.Authorization.Policies.ManageUsers, policy =>
        policy.RequireRole("Admin"));
    
    options.AddPolicy(wixi.WebAPI.Authorization.Policies.ViewAuditLogs, policy =>
        policy.RequireRole("Admin"));
    
    options.AddPolicy(wixi.WebAPI.Authorization.Policies.ManageRoles, policy =>
        policy.RequireRole("Admin"));
});

// Authorization handlers
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, 
    wixi.WebAPI.Authorization.Requirements.ResourceOwnerAuthorizationHandler>();

// Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// Tekstil Module Services
builder.Services.AddTekstilServices();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("WixiCorsPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5002",
                "http://localhost:6013",
                "http://localhost:7080",
                "http://localhost:7081",
                "https://localhost:5002",
                "https://worklines.wixisoftware.com",
                "https://worklines.com.tr",
                "https://www.worklines.com.tr",
                "https://worklines.de",
                "https://www.worklines.de",
                "https://test.worklines.com.tr",
                "https://www.test.worklines.com.tr",
                "https://tekstil.wixisoftware.com",
                "https://api-tekstil.wixisoftware.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromMinutes(10)); // Cache preflight requests
    });
    
    // Add default policy that applies to all requests
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5002",
                "http://localhost:6013",
                "http://localhost:7080",
                "http://localhost:7081",
                "https://localhost:5002",
                "https://worklines.wixisoftware.com",
                "https://worklines.com.tr",
                "https://www.worklines.com.tr",
                "https://worklines.de",
                "https://www.worklines.de",
                "https://test.worklines.com.tr",
                "https://www.test.worklines.com.tr",
                "https://tekstil.wixisoftware.com",
                "https://api-tekstil.wixisoftware.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Auto-migrate database on startup (disabled for now - enable after SQL Server is ready)
// using (var scope = app.Services.CreateScope())
// {
//     var services = scope.ServiceProvider;
//     try
//     {
//         var context = services.GetRequiredService<WixiDbContext>();
//         context.Database.Migrate();
//         app.Logger.LogInformation("Database migration completed successfully");
//     }
//     catch (Exception ex)
//     {
//         var logger = services.GetRequiredService<ILogger<Program>>();
//         logger.LogError(ex, "An error occurred while migrating the database");
//     }
// }

// Use CORS early (must be before other middleware that might block requests)
// Also add manual CORS handling for edge cases
app.UseCors("WixiCorsPolicy");

// Handle OPTIONS preflight requests explicitly
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers["Origin"].ToString();
    var allowedOrigins = new[] { 
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:5002",
        "http://localhost:7080",
        "http://localhost:7081", 
        "https://localhost:5002", 
        "https://worklines.wixisoftware.com",
        "https://worklines.com.tr",
        "https://www.worklines.com.tr",
        "https://worklines.de",
        "https://www.worklines.de",
        "https://test.worklines.com.tr",
        "https://www.test.worklines.com.tr"
    };
    
    // Handle OPTIONS preflight request
    if (context.Request.Method == "OPTIONS" && !string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
    {
        context.Response.Headers["Access-Control-Allow-Origin"] = origin;
        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
        context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH";
        context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
        context.Response.Headers["Access-Control-Max-Age"] = "600";
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync(string.Empty);
        return;
    }
    
    // Ensure CORS headers are set for all responses via OnStarting callback
    if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
    {
        context.Response.OnStarting(() =>
        {
            if (!context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"))
            {
                context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH";
                context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
            }
            return Task.CompletedTask;
        });
    }
    
    await next();
});

// Request size limit
app.UseMiddleware<wixi.WebAPI.Middleware.RequestSizeLimitMiddleware>();

// IP Whitelist (Admin endpoints only) - Skip in development
if (!app.Environment.IsDevelopment())
{
    app.UseMiddleware<wixi.WebAPI.Middleware.IpWhitelistMiddleware>();
}

// Security headers
app.UseMiddleware<wixi.WebAPI.Middleware.SecurityHeadersMiddleware>();

// License validation middleware (check license before authentication)
app.UseMiddleware<wixi.WebAPI.Middleware.LicenseValidationMiddleware>();

// Exception handling middleware (must be early to catch all exceptions and add CORS)
app.UseMiddleware<wixi.WebAPI.Middleware.ExceptionHandlingMiddleware>();

// Audit logging middleware (Log critical security events)
app.UseMiddleware<wixi.WebAPI.Middleware.AuditLoggingMiddleware>();

// Rate limiting
app.UseIpRateLimiting();

// Configure Swagger (available in all environments)
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1.0/swagger.json", "Wixi Backend V1");
    options.RoutePrefix = "swagger"; // URL: /swagger/index.html
    options.DocumentTitle = "Wixi Backend V1 API Documentation";
    options.DefaultModelsExpandDepth(-1); // Hide models section by default
    options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List); // Expand operations by default
});

app.UseHttpsRedirection();

// Static files (wwwroot) - Must be before UseRouting/MapControllers
// This allows serving files from wwwroot folder (e.g., /TeamMembers/xxx.jpg)
app.UseStaticFiles();

app.UseAuthentication();

// Token blacklist check (after authentication)
app.UseMiddleware<wixi.WebAPI.Middleware.TokenBlacklistMiddleware>();

app.UseAuthorization();

// Ensure CORS headers are present for ALL error responses (401, 403, 500, etc.)
app.Use(async (context, next) =>
{
    await next();
    
    // Ensure CORS headers for any error response or if not already present
    var statusCode = context.Response.StatusCode;
    if (statusCode >= 400 || !context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"))
    {
        var origin = context.Request.Headers["Origin"].ToString();
        var allowedOrigins = new[] { 
            "http://localhost:3000", 
            "http://localhost:5173", 
            "http://localhost:5002",
            "http://localhost:7080",
            "http://localhost:7081", 
            "https://localhost:5002",
            "https://worklines.wixisoftware.com",
            "https://worklines.com.tr",
            "https://www.worklines.com.tr",
            "https://worklines.de",
            "https://www.worklines.de",
            "https://test.worklines.com.tr",
            "https://www.test.worklines.com.tr"
        };
        
        if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin) && !context.Response.HasStarted)
        {
            try
            {
                context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH";
                context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
            }
            catch (InvalidOperationException)
            {
                // Headers already written, cannot modify
                // This is expected in some cases
            }
        }
    }
});

app.MapControllers();

// Health check endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = System.Text.Json.JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            duration = report.TotalDuration,
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                duration = e.Value.Duration,
                description = e.Value.Description,
                exception = e.Value.Exception?.Message,
                data = e.Value.Data
            })
        });
        await context.Response.WriteAsync(result);
    }
});

// Simple health check
app.MapGet("/health/ready", () => Results.Ok(new { status = "ready", timestamp = DateTime.UtcNow }))
    .WithName("HealthReady")
    .WithTags("Health");

app.Run();
