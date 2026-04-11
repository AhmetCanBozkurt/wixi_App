using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Languages.Commands.CreateLanguage;

public record CreateLanguageCommand(string Code, string Name, bool IsDefault, string? FlagCode) : IRequest<Guid>;

public class CreateLanguageCommandHandler : IRequestHandler<CreateLanguageCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateLanguageCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateLanguageCommand request, CancellationToken cancellationToken)
    {
        var lang = new WixiLanguage
        {
            Code = request.Code,
            Name = request.Name,
            IsDefault = request.IsDefault,
            FlagCode = request.FlagCode
        };

        // If this is set as default, unset others
        if (lang.IsDefault)
        {
            var others = _context.Languages.Where(l => l.IsDefault);
            foreach (var o in others) o.IsDefault = false;
        }

        _context.Languages.Add(lang);
        await _context.SaveChangesAsync(cancellationToken);
        return lang.Id;
    }
}
