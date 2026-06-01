using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Landing.Commands.SubmitContact;

public class SubmitContactCommandHandler : IRequestHandler<SubmitContactCommand, Guid>
{
    private readonly WixiCoreDbContext _db;

    public SubmitContactCommandHandler(WixiCoreDbContext db) => _db = db;

    public async Task<Guid> Handle(SubmitContactCommand request, CancellationToken ct)
    {
        var submission = new WixiContactSubmission
        {
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            Topic = request.Topic,
            Message = request.Message,
        };
        _db.ContactSubmissions.Add(submission);
        await _db.SaveChangesAsync(ct);
        return submission.Id;
    }
}
