using MediatR;

namespace Wixi.Modules.Core.Application.Landing.Commands.SubmitContact;

public record SubmitContactCommand(
    string FullName,
    string Email,
    string? Phone,
    string Topic,
    string Message
) : IRequest<Guid>;
