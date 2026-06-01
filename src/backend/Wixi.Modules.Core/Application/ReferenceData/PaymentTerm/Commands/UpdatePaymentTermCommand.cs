using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Commands;

public record UpdatePaymentTermCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    int DueDays,
    PaymentTermType Type,
    string? Description,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdatePaymentTermCommandHandler : IRequestHandler<UpdatePaymentTermCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdatePaymentTermCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdatePaymentTermCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PaymentTerms
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.DueDays = request.DueDays;
        entity.Type = request.Type;
        entity.Description = request.Description;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
