using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.SystemPage.Commands;

public record CreateSystemPageCommand(string Path, string Name, string? Group, string? Icon, int SortOrder) : IRequest<Guid>;

public class CreateSystemPageCommandHandler : IRequestHandler<CreateSystemPageCommand, Guid>
{
    private readonly WixiCoreDbContext _context;
    public CreateSystemPageCommandHandler(WixiCoreDbContext context) => _context = context;

    public async Task<Guid> Handle(CreateSystemPageCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiSystemPage { Path = request.Path, Name = request.Name, Group = request.Group, Icon = request.Icon, SortOrder = request.SortOrder };
        _context.SystemPages.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
