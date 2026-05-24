using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Wixi.Modules.Core.Application.Common.Behaviors;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddWixiAuth(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddIdentity<WixiUser, WixiRole>(options =>
        {
            options.User.RequireUniqueEmail = true;
            options.Password.RequireDigit = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
        })
        .AddEntityFrameworkStores<WixiCoreDbContext>()
        .AddDefaultTokenProviders();

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>();
        var key = Encoding.ASCII.GetBytes(jwtOptions?.SecretKey ?? "DefaultSecretKeyPlaceholder12345");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtOptions?.Issuer,
                ValidateAudience = true,
                ValidAudiences = new[] { jwtOptions?.Audience ?? string.Empty, "Wixi.Storefront" },
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddWixiCors(this IServiceCollection services, IConfiguration configuration)
    {
        var corsOpts = configuration.GetSection(AppCorsOptions.SectionName).Get<AppCorsOptions>() ?? new AppCorsOptions();

        services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp", policy =>
            {
                if (corsOpts.Origins.Length > 0)
                    policy.WithOrigins(corsOpts.Origins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                else
                    policy.SetIsOriginAllowed(_ => true)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
            });
        });

        return services;
    }

    public static IServiceCollection AddWixiRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var rateOpts = configuration.GetSection(AuthRateLimitOptions.SectionName).Get<AuthRateLimitOptions>() ?? new AuthRateLimitOptions();

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.ContentType = "application/json";
                await context.HttpContext.Response.WriteAsJsonAsync(
                    new { error = "Çok fazla istek. Lütfen kısa bir süre sonra tekrar deneyin." },
                    cancellationToken: token);
            };

            void AddFixedWindow(string name, int permitPerMinute)
            {
                options.AddPolicy(name, httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = permitPerMinute,
                            Window = TimeSpan.FromMinutes(1),
                            AutoReplenishment = true,
                            QueueLimit = 0
                        }));
            }

            // Global limiter — tüm endpoint'ler için güvenlik tabanı (IP başına 300/dk)
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
                RateLimitPartition.GetFixedWindowLimiter(
                    ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 300,
                        Window = TimeSpan.FromMinutes(1),
                        AutoReplenishment = true,
                        QueueLimit = 0
                    }));

            AddFixedWindow("auth_login", rateOpts.LoginPermitPerMinute);
            AddFixedWindow("auth_verify_2fa", rateOpts.VerifyTwoFactorPermitPerMinute);
            AddFixedWindow("auth_resend_2fa", rateOpts.ResendTwoFactorPermitPerMinute);
            AddFixedWindow("auth_refresh", rateOpts.RefreshPermitPerMinute);
            AddFixedWindow("auth_forgot_password", rateOpts.ForgotPasswordPermitPerMinute);
            AddFixedWindow("auth_reset_password", rateOpts.ResetPasswordPermitPerMinute);
            AddFixedWindow("auth_register", rateOpts.RegisterPermitPerMinute);
            AddFixedWindow("auth_logout_all", rateOpts.LogoutAllPermitPerMinute);
            AddFixedWindow("currency_sync", 5);
            AddFixedWindow("storefront-auth", 10);
        });

        return services;
    }

    public static IServiceCollection AddWixiValidation(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<WixiCoreDbContext>();
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        return services;
    }
}
