using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Queries;

public record GetPaymentTermsQuery : IRequest<List<PaymentTermDto>>;

public class GetPaymentTermsQueryHandler : IRequestHandler<GetPaymentTermsQuery, List<PaymentTermDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetPaymentTermsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<PaymentTermDto>> Handle(GetPaymentTermsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.PaymentTerms
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return items.Select(x => new PaymentTermDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            NameEn = x.NameEn,
            DueDays = x.DueDays,
            Type = x.Type,
            Description = x.Description,
            SortOrder = x.SortOrder,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            CreatedByUser = x.CreatedByUser,
            UpdatedAt = x.UpdatedAt,
            UpdatedByUser = x.UpdatedByUser
        }).ToList();
    }
}
