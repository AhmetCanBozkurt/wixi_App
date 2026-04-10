using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Infrastructure.Data;

public class WixiCoreDbContext : IdentityDbContext<WixiUser, WixiRole, Guid>
{
    public WixiCoreDbContext(DbContextOptions<WixiCoreDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Naming standard applied for Modular Enterprise App
        builder.Entity<WixiUser>(b =>
        {
            b.ToTable("WIXI_USERS");
        });

        builder.Entity<WixiRole>(b =>
        {
            b.ToTable("WIXI_ROLES");
        });

        builder.Entity<IdentityUserRole<Guid>>(b =>
        {
            b.ToTable("WIXI_USER_ROLES");
        });

        builder.Entity<IdentityUserClaim<Guid>>(b =>
        {
            b.ToTable("WIXI_USER_CLAIMS");
        });

        builder.Entity<IdentityUserLogin<Guid>>(b =>
        {
            b.ToTable("WIXI_USER_LOGINS");
        });

        builder.Entity<IdentityRoleClaim<Guid>>(b =>
        {
            b.ToTable("WIXI_ROLE_CLAIMS");
        });

        builder.Entity<IdentityUserToken<Guid>>(b =>
        {
            b.ToTable("WIXI_USER_TOKENS");
        });
    }
}
