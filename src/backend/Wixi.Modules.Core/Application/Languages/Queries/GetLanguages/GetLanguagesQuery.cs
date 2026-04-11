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
        var languages = await _context.Languages
            .Where(l => !l.IsDeleted)
            .OrderBy(l => l.Name)
            .ToListAsync(cancellationToken);

        return languages.Select(l => new LanguageDto
        {
            Id = l.Id,
            Code = l.Code,
            Name = l.Name,
            IsDefault = l.IsDefault,
            FlagCode = l.FlagCode,
            IconBase64 = l.IconData != null && l.IconMimeType != null 
                ? $"data:{l.IconMimeType};base64,{Convert.ToBase64String(l.IconData)}" 
                : (l.IconData != null ? $"data:image/png;base64,{Convert.ToBase64String(l.IconData)}" : null),
            IsActive = l.IsActive
        }).ToList();
    }
}
