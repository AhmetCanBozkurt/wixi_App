using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.ContactSubmissions;

// ─── DTOs ──────────────────────────────────────────────────────────
public record ContactSubmissionDto(
    Guid Id,
    string FullName,
    string Email,
    string? Phone,
    string? Subject,
    string Message,
    bool IsRead,
    DateTime? ReadAt,
    string? IpAddress,
    DateTime SubmittedAt);

// ─── Commands ──────────────────────────────────────────────────────
public record CreateContactSubmissionCommand(
    string FullName,
    string Email,
    string? Phone,
    string? Subject,
    string Message,
    string? IpAddress) : IRequest<Guid>;

public record MarkAsReadCommand(Guid Id) : IRequest<bool>;

public record DeleteContactSubmissionCommand(Guid Id) : IRequest<bool>;

// ─── Queries ───────────────────────────────────────────────────────
public record GetContactSubmissionsQuery(bool UnreadOnly = false)
    : IRequest<IReadOnlyList<ContactSubmissionDto>>;

// ─── Handlers ──────────────────────────────────────────────────────
public class CreateContactSubmissionCommandHandler : IRequestHandler<CreateContactSubmissionCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public CreateContactSubmissionCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<Guid> Handle(CreateContactSubmissionCommand r, CancellationToken ct)
    {
        var entity = new WixiContactFormSubmission
        {
            FullName = r.FullName,
            Email = r.Email,
            Phone = r.Phone,
            Subject = r.Subject,
            Message = r.Message,
            IpAddress = r.IpAddress
        };
        _db.ContactSubmissions.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.Id;
    }
}

public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public MarkAsReadCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(MarkAsReadCommand r, CancellationToken ct)
    {
        var entity = await _db.ContactSubmissions.FirstOrDefaultAsync(c => c.Id == r.Id, ct);
        if (entity is null) return false;
        entity.IsRead = true;
        entity.ReadAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class DeleteContactSubmissionCommandHandler : IRequestHandler<DeleteContactSubmissionCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public DeleteContactSubmissionCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(DeleteContactSubmissionCommand r, CancellationToken ct)
    {
        var entity = await _db.ContactSubmissions.FirstOrDefaultAsync(c => c.Id == r.Id, ct);
        if (entity is null) return false;
        _db.ContactSubmissions.Remove(entity);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class GetContactSubmissionsQueryHandler : IRequestHandler<GetContactSubmissionsQuery, IReadOnlyList<ContactSubmissionDto>>
{
    private readonly ECommerceDbContext _db;
    public GetContactSubmissionsQueryHandler(ECommerceDbContext db) => _db = db;
    public async Task<IReadOnlyList<ContactSubmissionDto>> Handle(GetContactSubmissionsQuery r, CancellationToken ct)
    {
        var q = _db.ContactSubmissions.AsNoTracking();
        if (r.UnreadOnly) q = q.Where(c => !c.IsRead);
        return await q.OrderByDescending(c => c.SubmittedAt)
            .Select(c => new ContactSubmissionDto(c.Id, c.FullName, c.Email, c.Phone, c.Subject,
                c.Message, c.IsRead, c.ReadAt, c.IpAddress, c.SubmittedAt))
            .ToListAsync(ct);
    }
}
