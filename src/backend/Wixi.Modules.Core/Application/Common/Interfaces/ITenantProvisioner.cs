namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface ITenantProvisioner
{
    string ModuleName { get; }
    Task ProvisionAsync(string tenantId, string connectionString, string databaseName, CancellationToken cancellationToken = default);
}
