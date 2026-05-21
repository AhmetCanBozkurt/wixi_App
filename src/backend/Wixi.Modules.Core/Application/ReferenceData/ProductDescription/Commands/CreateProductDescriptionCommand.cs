using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Commands;

public record CreateProductDescriptionCommand(
    string Code,
    string Name,
    string? NameEn,
    string? HsCode,
    string? Description,
    int SortOrder,
    bool IsActive) : IRequest<Guid>;

public class CreateProductDescriptionCommandHandler : IRequestHandler<CreateProductDescriptionCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateProductDescriptionCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateProductDescriptionCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiProductDescription
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            HsCode = request.HsCode,
            Description = request.Description,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _context.ProductDescriptions.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
