using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Modules.Commands.UpdateModule;

public record UpdateModuleCommand(
    Guid Id,
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
) : IRequest<Unit>;

public class UpdateModuleCommandHandler : IRequestHandler<UpdateModuleCommand, Unit>
{
    private readonly WixiCoreDbContext _context;

    public UpdateModuleCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateModuleCommand request, CancellationToken cancellationToken)
    {
        var module = await _context.Modules
            .FirstOrDefaultAsync(m => m.Id == request.Id && !m.IsDeleted, cancellationToken);
            
        if (module == null) 
            throw new InvalidOperationException("Module not found.");

        module.Name = request.Name;
        module.Description = request.Description;
        module.Icon = request.Icon;
        module.IsPublic = request.IsPublic;
        module.PriceMonthly = request.PriceMonthly;
        module.PriceYearly = request.PriceYearly;
        module.FeaturesJson = request.FeaturesJson;
        module.ColorAccent = request.ColorAccent;
        module.IsPopular = request.IsPopular;
        module.SortOrder = request.SortOrder;

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
