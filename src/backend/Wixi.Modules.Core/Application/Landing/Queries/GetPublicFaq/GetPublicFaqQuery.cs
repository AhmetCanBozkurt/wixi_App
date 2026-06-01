using MediatR;
using Wixi.Modules.Core.Application.Landing.Dto;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicFaq;

public record GetPublicFaqQuery(string Lang = "tr") : IRequest<List<PublicFaqCategoryDto>>;
