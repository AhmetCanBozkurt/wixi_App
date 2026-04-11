using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Languages.Commands.DeleteLanguage;

public record DeleteLanguageCommand(Guid Id) : IRequest<bool>;

public class DeleteLanguageCommandHandler : IRequestHandler<DeleteLanguageCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteLanguageCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteLanguageCommand request, CancellationToken cancellationToken)
    {
        var lang = await _context.Languages.FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);
        if (lang == null || lang.IsDefault) return false; // Basic safety: cannot delete default language

        lang.IsDeleted = true;
        lang.IsActive = false;
        lang.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
