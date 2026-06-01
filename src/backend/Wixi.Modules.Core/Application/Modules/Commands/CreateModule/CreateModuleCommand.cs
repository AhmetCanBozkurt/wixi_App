using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Modules.Commands.CreateModule;

public record CreateModuleCommand(
    string Code,
    string Name,
    string? Description,
    string? Icon,
    bool IsPublic,
    decimal? PriceMonthly = null,
    decimal? PriceYearly = null,
    string? FeaturesJson = null,
    string? ColorAccent = null,
    bool IsPopular = false,
    int SortOrder = 0
) : IRequest<Guid>;

public class CreateModuleCommandHandler : IRequestHandler<CreateModuleCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateModuleCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateModuleCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Modules.AnyAsync(m => m.Code == request.Code && !m.IsDeleted, cancellationToken);
        if (exists) throw new InvalidOperationException($"Module with code {request.Code} already exists.");

        var module = new WixiModule
        {
            Code = request.Code,
            Name = request.Name,
            Description = request.Description,
            Icon = request.Icon,
            IsPublic = request.IsPublic,
            PriceMonthly = request.PriceMonthly,
            PriceYearly = request.PriceYearly,
            FeaturesJson = request.FeaturesJson,
            ColorAccent = request.ColorAccent,
            IsPopular = request.IsPopular,
            SortOrder = request.SortOrder
        };

        _context.Modules.Add(module);
        await _context.SaveChangesAsync(cancellationToken);
        return module.Id;
    }
}
