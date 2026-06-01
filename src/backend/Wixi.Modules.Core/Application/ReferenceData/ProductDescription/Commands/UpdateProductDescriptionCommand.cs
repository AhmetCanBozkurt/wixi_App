using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Commands;

public record UpdateProductDescriptionCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string? HsCode,
    string? Description,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateProductDescriptionCommandHandler : IRequestHandler<UpdateProductDescriptionCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateProductDescriptionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateProductDescriptionCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ProductDescriptions.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.HsCode = request.HsCode;
        entity.Description = request.Description;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
