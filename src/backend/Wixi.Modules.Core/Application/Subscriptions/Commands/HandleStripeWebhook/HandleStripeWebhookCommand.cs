using MediatR;

namespace Wixi.Modules.Core.Application.Subscriptions.Commands.HandleStripeWebhook;

public record HandleStripeWebhookCommand(string Payload, string StripeSignature) : IRequest;
