using MediatR;

namespace Wixi.Modules.Core.Application.Landing.Commands.VoteRoadmapItem;

public record VoteRoadmapItemCommand(Guid ItemId, string SessionToken, string? IpHash) : IRequest<int>;
