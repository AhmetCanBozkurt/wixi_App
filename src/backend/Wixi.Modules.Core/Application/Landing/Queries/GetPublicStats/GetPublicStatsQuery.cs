using MediatR;
using Wixi.Modules.Core.Application.Landing.Dto;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicStats;

public record GetPublicStatsQuery(string Lang = "tr") : IRequest<List<PublicStatDto>>;
