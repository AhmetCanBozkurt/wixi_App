using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.HsCode.Commands;

public record CreateHsCodeCommand(
    string Code,
    string Name,
    string? NameEn,
    HsCodeLevel Level,
    Guid? ParentId,
    int SortOrder,
    bool IsActive) : IRequest<Guid>;

public class CreateHsCodeCommandHandler : IRequestHandler<CreateHsCodeCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateHsCodeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateHsCodeCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiHsCode
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            Level = request.Level,
            ParentId = request.ParentId,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };

        _context.HsCodes.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
