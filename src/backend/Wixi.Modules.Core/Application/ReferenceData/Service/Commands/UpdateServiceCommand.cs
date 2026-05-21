using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Service.Commands;

public record UpdateServiceCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string? Description,
    Guid? ServiceCategoryId,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateServiceCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Services.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.Description = request.Description;
        entity.ServiceCategoryId = request.ServiceCategoryId;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
