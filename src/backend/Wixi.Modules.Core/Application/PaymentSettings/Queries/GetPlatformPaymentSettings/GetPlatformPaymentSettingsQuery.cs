using MediatR;
using Wixi.Modules.Core.Application.PaymentSettings.Dto;

namespace Wixi.Modules.Core.Application.PaymentSettings.Queries.GetPlatformPaymentSettings;

public record GetPlatformPaymentSettingsQuery : IRequest<PlatformPaymentSettingsDto>;
