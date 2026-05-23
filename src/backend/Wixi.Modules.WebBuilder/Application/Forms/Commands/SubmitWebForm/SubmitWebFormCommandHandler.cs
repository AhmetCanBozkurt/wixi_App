using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Forms.Commands.SubmitWebForm;

public class SubmitWebFormCommandHandler : IRequestHandler<SubmitWebFormCommand, Guid>
{
    private readonly WebBuilderDbContext _db;

    public SubmitWebFormCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(SubmitWebFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _db.WebForms
            .FirstOrDefaultAsync(f => f.TenantId == request.TenantId && f.Slug == request.Slug, cancellationToken);

        if (form is null)
            throw new KeyNotFoundException($"Form bulunamadı: {request.Slug}");

        if (!form.IsActive)
            throw new ArgumentException("Bu form şu anda aktif değil.");

        var submission = new WixiWebFormSubmission
        {
            FormId = form.Id,
            TenantId = request.TenantId,
            DataJson = request.DataJson,
            IpAddress = request.IpAddress,
            CreatedAt = DateTime.UtcNow
        };

        _db.WebFormSubmissions.Add(submission);
        await _db.SaveChangesAsync(cancellationToken);

        return submission.Id;
    }
}
