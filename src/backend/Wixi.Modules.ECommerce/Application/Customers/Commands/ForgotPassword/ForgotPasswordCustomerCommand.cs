using MediatR;

namespace Wixi.Modules.ECommerce.Application.Customers.Commands.ForgotPassword;

public record ForgotPasswordCustomerCommand(string Email) : IRequest<Unit>;
