using MediatR;

namespace Wixi.Modules.WebBuilder.Application.Forms.Commands.UpdateWebForm;

public record UpdateWebFormCommand(
    Guid FormId,
    Guid TenantId,
    string Name,
    string Slug,
    string? FieldsJson,
    string SubmitButtonText,
    string? SuccessMessage,
    string? NotifyEmail) : IRequest<Unit>;
