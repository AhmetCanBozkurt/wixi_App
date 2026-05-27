using MediatR;
using Wixi.Modules.Core.Application.Landing.Dto;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicRoadmap;

public record GetPublicRoadmapQuery(string Lang = "tr") : IRequest<PublicRoadmapDto>;
