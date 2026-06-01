using MediatR;
using Wixi.Modules.Core.Application.TenantPaymentSettings.Dto;

namespace Wixi.Modules.Core.Application.TenantPaymentSettings.Queries.GetTenantPaymentSettings;

public record GetTenantPaymentSettingsQuery(Guid TenantId) : IRequest<TenantPaymentSettingsDto>;
