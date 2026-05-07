using MediatR;

namespace Wixi.Modules.Core.Application.Subscriptions.Commands.CreateCheckoutSession;

public record CreateCheckoutSessionCommand(
    Guid TenantId,
    string PlanCode,
    string BillingInterval,
    string SuccessUrl,
    string CancelUrl
) : IRequest<string>;
