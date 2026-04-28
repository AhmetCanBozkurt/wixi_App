using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Infrastructure.Services;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/saas/onboarding")]
public class SaasOnboardingController : ControllerBase
{
    private readonly WixiCoreDbContext _coreDb;
    private readonly IEnumerable<Wixi.Modules.Core.Application.Common.Interfaces.ITenantProvisioner> _provisioners;
    private readonly IConfiguration _configuration;

    public SaasOnboardingController(
        WixiCoreDbContext coreDb, 
        IEnumerable<Wixi.Modules.Core.Application.Common.Interfaces.ITenantProvisioner> provisioners,
        IConfiguration configuration)
    {
        _coreDb = coreDb;
        _provisioners = provisioners;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterTenant([FromBody] RegisterTenantRequest request)
    {
        // 1. Validation
        if (await _coreDb.Tenants.AnyAsync(t => t.Slug == request.Slug))
            return BadRequest(new { error = "Bu mağaza adı (URL) zaten alınmış." });

        // 2. Create Tenant Record
        var tenant = new WixiTenant
        {
            Name = request.StoreName,
            Slug = request.Slug,
            OwnerEmail = request.OwnerEmail,
            DatabaseName = $"wixi_store_{request.Slug.Replace("-", "_")}",
            EnabledModules = string.Join(",", request.SelectedModules ?? new List<string> { "ecommerce" }),
            Plan = "Trial"
        };

        // Create connection string (based on master)
        // Note: BuildTenantConnectionString is internal to Provisioner, so we use the provisioner's logic
        
        _coreDb.Tenants.Add(tenant);
        await _coreDb.SaveChangesAsync();

        // 3. Provision Database
        try
        {
            var masterConn = _configuration.GetConnectionString("DefaultConnection");
            var connBuilder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(masterConn)
            {
                InitialCatalog = tenant.DatabaseName
            };
            var tenantConnectionString = connBuilder.ConnectionString;
            tenant.ConnectionString = tenantConnectionString;

            var selectedModules = request.SelectedModules ?? new List<string> { "ecommerce" };
            
            foreach (var provisioner in _provisioners)
            {
                if (selectedModules.Contains(provisioner.ModuleName))
                {
                    await provisioner.ProvisionAsync(tenant.Id.ToString(), tenantConnectionString, tenant.DatabaseName);
                }
            }

            tenant.IsMigrated = true;
            await _coreDb.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Veritabanı kurulumu sırasında hata oluştu.", detail = ex.Message });
        }

        return Ok(new { 
            message = "Mağazanız başarıyla kuruldu!", 
            slug = tenant.Slug,
            adminUrl = $"/admin?tenant={tenant.Slug}"
        });
    }
}

public record RegisterTenantRequest(
    string StoreName,
    string Slug,
    string OwnerEmail,
    List<string>? SelectedModules
);
