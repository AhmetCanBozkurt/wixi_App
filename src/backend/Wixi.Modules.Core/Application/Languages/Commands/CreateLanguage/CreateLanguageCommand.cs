using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Languages.Commands.CreateLanguage;

public record CreateLanguageCommand(string Code, string Name, bool IsDefault, string? FlagCode, string? IconBase64) : IRequest<Guid>;

public class CreateLanguageCommandHandler : IRequestHandler<CreateLanguageCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateLanguageCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateLanguageCommand request, CancellationToken cancellationToken)
    {
        string? mimeType = null;
        byte[]? binaryData = null;

        if (!string.IsNullOrEmpty(request.IconBase64) && request.IconBase64.Contains(";base64,"))
        {
            var parts = request.IconBase64.Split(';');
            mimeType = parts[0].Replace("data:", "");
            var base64Data = parts[1].Replace("base64,", "");
            binaryData = Convert.FromBase64String(base64Data);
        }

        var lang = new WixiLanguage
        {
            Code = request.Code,
            Name = request.Name,
            IsDefault = request.IsDefault,
            FlagCode = request.FlagCode,
            IconData = binaryData,
            IconMimeType = mimeType
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
