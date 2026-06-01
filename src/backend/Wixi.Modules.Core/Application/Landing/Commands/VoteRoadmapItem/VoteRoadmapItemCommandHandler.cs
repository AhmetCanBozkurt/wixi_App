using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Landing.Commands.VoteRoadmapItem;

public class VoteRoadmapItemCommandHandler : IRequestHandler<VoteRoadmapItemCommand, int>
{
    private readonly WixiCoreDbContext _db;

    public VoteRoadmapItemCommandHandler(WixiCoreDbContext db) => _db = db;

    public async Task<int> Handle(VoteRoadmapItemCommand request, CancellationToken ct)
    {
        var item = await _db.RoadmapItems
            .FirstOrDefaultAsync(i => i.Id == request.ItemId && i.IsActive && !i.IsDeleted, ct);

        if (item is null)
            return 0;

        var alreadyVoted = await _db.RoadmapVotes
            .AnyAsync(v => v.ItemId == request.ItemId && v.SessionToken == request.SessionToken, ct);

        if (alreadyVoted)
            return item.VoteCount;

        _db.RoadmapVotes.Add(new WixiRoadmapVote
        {
            ItemId = request.ItemId,
            SessionToken = request.SessionToken,
            IpHash = request.IpHash
        });

        item.VoteCount++;

        await _db.SaveChangesAsync(ct);

        return item.VoteCount;
    }
}
