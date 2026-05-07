using MediatR;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Application.Subscriptions.Commands.CreateCheckoutSession;

public class CreateCheckoutSessionCommandHandler : IRequestHandler<CreateCheckoutSessionCommand, string>
{
    private readonly IStripeService _stripe;

    public CreateCheckoutSessionCommandHandler(IStripeService stripe) => _stripe = stripe;

    public Task<string> Handle(CreateCheckoutSessionCommand request, CancellationToken ct)
        => _stripe.CreateCheckoutSessionAsync(
            request.TenantId, request.PlanCode, request.BillingInterval,
            request.SuccessUrl, request.CancelUrl, ct);
}
