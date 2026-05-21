using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Commands;

public record CreatePaymentTermCommand(
    string Code,
    string Name,
    string? NameEn,
    int DueDays,
    PaymentTermType Type,
    string? Description,
    int SortOrder) : IRequest<Guid>;

public class CreatePaymentTermCommandHandler : IRequestHandler<CreatePaymentTermCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreatePaymentTermCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreatePaymentTermCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiPaymentTerm
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            DueDays = request.DueDays,
            Type = request.Type,
            Description = request.Description,
            SortOrder = request.SortOrder
        };

        _context.PaymentTerms.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
