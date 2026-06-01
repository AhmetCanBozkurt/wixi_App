using MediatR;
using Wixi.Modules.WebBuilder.Application.Forms.Dto;

namespace Wixi.Modules.WebBuilder.Application.Forms.Commands.CreateWebForm;

public record CreateWebFormCommand(
    Guid TenantId,
    string Name,
    string Slug,
    string? FieldsJson,
    string SubmitButtonText = "Gönder",
    string? SuccessMessage = null,
    string? NotifyEmail = null) : IRequest<WebFormDto>;
