using MediatR;
using Wixi.Modules.Core.Application.Landing.Dto;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicCases;

public record GetPublicCasesQuery(string Lang = "tr", string? Industry = null) : IRequest<PublicCasesDto>;
