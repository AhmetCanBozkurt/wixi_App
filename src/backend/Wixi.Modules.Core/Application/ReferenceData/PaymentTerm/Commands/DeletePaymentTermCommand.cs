using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Commands;

public record DeletePaymentTermCommand(Guid Id) : IRequest<bool>;

public class DeletePaymentTermCommandHandler : IRequestHandler<DeletePaymentTermCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeletePaymentTermCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeletePaymentTermCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PaymentTerms
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.IsDeleted = true;
        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
