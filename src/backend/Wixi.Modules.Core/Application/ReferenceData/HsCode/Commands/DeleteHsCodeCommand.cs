using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.HsCode.Commands;

public record DeleteHsCodeCommand(Guid Id) : IRequest<bool>;

public class DeleteHsCodeCommandHandler : IRequestHandler<DeleteHsCodeCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteHsCodeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteHsCodeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.HsCodes.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
