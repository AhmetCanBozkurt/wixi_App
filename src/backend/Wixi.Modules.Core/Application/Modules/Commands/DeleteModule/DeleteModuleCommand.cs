using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Modules.Commands.DeleteModule;

public record DeleteModuleCommand(Guid Id) : IRequest<bool>;

public class DeleteModuleCommandHandler : IRequestHandler<DeleteModuleCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteModuleCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteModuleCommand request, CancellationToken cancellationToken)
    {
        var module = await _context.Modules.FindAsync(new object[] { request.Id }, cancellationToken);
        if (module == null) return false;

        module.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
