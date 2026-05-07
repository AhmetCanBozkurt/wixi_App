using MediatR;
using Wixi.Modules.Core.Application.Subscriptions.Dto;

namespace Wixi.Modules.Core.Application.Subscriptions.Queries.GetTenantSubscription;

public record GetTenantSubscriptionQuery(string TenantSlug) : IRequest<TenantSubscriptionDto?>;
