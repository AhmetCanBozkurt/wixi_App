namespace Wixi.Modules.Core.Application.Landing.Dto;

public record PublicFaqCategoryDto(string Slug, string Label, List<PublicFaqItemDto> Items);

public record PublicFaqItemDto(Guid Id, string Question, string Answer);
