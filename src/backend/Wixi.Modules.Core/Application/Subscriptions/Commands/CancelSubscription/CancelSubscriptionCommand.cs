using MediatR;

namespace Wixi.Modules.Core.Application.Subscriptions.Commands.CancelSubscription;

public record CancelSubscriptionCommand(string TenantSlug) : IRequest;
