using MediatR;

namespace Wixi.Modules.ECommerce.Application.Customers.Commands.ResetPassword;

public record ResetPasswordCustomerCommand(string Token, string NewPassword) : IRequest<Unit>;
