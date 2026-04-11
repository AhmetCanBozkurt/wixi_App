using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Languages.Commands.UpdateLanguage;

public record UpdateLanguageCommand(Guid Id, string Code, string Name, bool IsDefault, string? FlagCode, bool IsActive) : IRequest<bool>;

public class UpdateLanguageCommandHandler : IRequestHandler<UpdateLanguageCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateLanguageCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
    {
        var lang = await _context.Languages.FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);
        if (lang == null) return false;

        lang.Code = request.Code;
        lang.Name = request.Name;
        lang.IsDefault = request.IsDefault;
        lang.FlagCode = request.FlagCode;
        lang.IsActive = request.IsActive;
        lang.UpdatedAt = DateTime.UtcNow;

        if (lang.IsDefault)
        {
            var others = _context.Languages.Where(l => l.Id != lang.Id && l.IsDefault);
            foreach (var o in others) o.IsDefault = false;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
