using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Languages.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Languages.Queries.GetLanguages;

public record GetLanguagesQuery : IRequest<List<LanguageDto>>;

public class GetLanguagesQueryHandler : IRequestHandler<GetLanguagesQuery, List<LanguageDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetLanguagesQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<LanguageDto>> Handle(GetLanguagesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Languages
            .Where(l => !l.IsDeleted)
            .OrderBy(l => l.Name)
            .Select(l => new LanguageDto
            {
                Id = l.Id,
                Code = l.Code,
                Name = l.Name,
                IsDefault = l.IsDefault,
                FlagCode = l.FlagCode,
                IsActive = l.IsActive
            })
            .ToListAsync(cancellationToken);
    }
}
