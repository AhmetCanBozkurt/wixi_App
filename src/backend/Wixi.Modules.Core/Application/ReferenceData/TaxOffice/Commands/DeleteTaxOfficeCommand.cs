using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Commands;

public record DeleteTaxOfficeCommand(Guid Id) : IRequest<bool>;

public class DeleteTaxOfficeCommandHandler : IRequestHandler<DeleteTaxOfficeCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteTaxOfficeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteTaxOfficeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TaxOffices
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
