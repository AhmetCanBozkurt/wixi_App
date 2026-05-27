using MediatR;
using Wixi.Modules.Core.Application.Landing.Dto;

namespace Wixi.Modules.Core.Application.Landing.Queries.GetPublicAbout;

public record GetPublicAboutQuery(string Lang = "tr") : IRequest<PublicAboutDto>;
