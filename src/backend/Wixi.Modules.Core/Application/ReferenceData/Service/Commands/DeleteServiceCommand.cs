using MediatR;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Service.Commands;

public record DeleteServiceCommand(Guid Id) : IRequest<bool>;

public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteServiceCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Services.FindAsync([request.Id], cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
