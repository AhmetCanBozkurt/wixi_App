using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Wixi.Modules.WebBuilder.Application.Blog.Commands.CreateBlogCategory;
using Wixi.Modules.WebBuilder.Application.Blog.Commands.CreateBlogPost;
using Wixi.Modules.WebBuilder.Application.Blog.Commands.DeleteBlogCategory;
using Wixi.Modules.WebBuilder.Application.Blog.Commands.DeleteBlogPost;
using Wixi.Modules.WebBuilder.Application.Blog.Commands.PublishBlogPost;
using Wixi.Modules.WebBuilder.Application.Blog.Commands.UpdateBlogCategory;
using Wixi.Modules.WebBuilder.Application.Blog.Commands.UpdateBlogPost;
using Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogCategories;
using Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogPostBySlug;
using Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogPosts;

namespace Wixi.API.Controllers.WebBuilder;

[ApiController]
[Route("api/v1/web-builder/blog")]
[Authorize]
public class BlogController : ControllerBase
{
    private readonly IMediator _mediator;

    public BlogController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // TODO: TenantId'yi ileride JWT claim'den alınacak ("tenant_id" claim eklendikten sonra).
    // Şimdilik Guid.Empty placeholder olarak kullanılıyor.
    private Guid ResolveTenantId()
    {
        var tenantClaim = User.FindFirstValue("tenant_id");
        if (!string.IsNullOrEmpty(tenantClaim) && Guid.TryParse(tenantClaim, out var tenantId))
            return tenantId;

        // TODO: X-Tenant-Slug header'dan resolve (ileride eklenecek)
        return Guid.Empty;
    }

    // ── Categories ──────────────────────────────────────────────────

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBlogCategoriesQuery(ResolveTenantId()), cancellationToken);
        return Ok(result);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateBlogCategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new CreateBlogCategoryCommand(ResolveTenantId(), request.Name, request.Slug, request.Description, request.SortOrder),
            cancellationToken);
        return Ok(result);
    }

    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateBlogCategoryRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(
            new UpdateBlogCategoryCommand(id, ResolveTenantId(), request.Name, request.Slug, request.Description, request.SortOrder),
            cancellationToken);
        return NoContent();
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteBlogCategoryCommand(id, ResolveTenantId()), cancellationToken);
        return NoContent();
    }

    // ── Posts ────────────────────────────────────────────────────────

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts(
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? isPublished,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBlogPostsQuery(ResolveTenantId(), categoryId, isPublished), cancellationToken);
        return Ok(result);
    }

    [HttpGet("posts/{slug}")]
    public async Task<IActionResult> GetPostBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBlogPostBySlugQuery(ResolveTenantId(), slug), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] CreateBlogPostRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new CreateBlogPostCommand(ResolveTenantId(), request.CategoryId, request.Title, request.Slug,
                request.Summary, request.ContentHtml, request.FeaturedImageUrl,
                request.MetaTitle, request.MetaDescription, request.Tags,
                request.AuthorName, request.ReadTimeMinutes),
            cancellationToken);
        return Ok(result);
    }

    [HttpPut("posts/{id}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdateBlogPostRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(
            new UpdateBlogPostCommand(id, ResolveTenantId(), request.CategoryId, request.Title, request.Slug,
                request.Summary, request.ContentHtml, request.FeaturedImageUrl,
                request.MetaTitle, request.MetaDescription, request.Tags,
                request.AuthorName, request.ReadTimeMinutes),
            cancellationToken);
        return NoContent();
    }

    [HttpPut("posts/{id}/publish")]
    public async Task<IActionResult> PublishPost(Guid id, [FromBody] PublishBlogPostRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(new PublishBlogPostCommand(id, ResolveTenantId(), request.IsPublished), cancellationToken);
        return NoContent();
    }

    [HttpDelete("posts/{id}")]
    public async Task<IActionResult> DeletePost(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteBlogPostCommand(id, ResolveTenantId()), cancellationToken);
        return NoContent();
    }
}

public record CreateBlogCategoryRequest(string Name, string Slug, string? Description, int SortOrder = 0);
public record UpdateBlogCategoryRequest(string Name, string Slug, string? Description, int SortOrder);
public record CreateBlogPostRequest(
    Guid? CategoryId, string Title, string Slug, string? Summary, string? ContentHtml,
    string? FeaturedImageUrl, string? MetaTitle, string? MetaDescription, string? Tags,
    string? AuthorName, int ReadTimeMinutes = 0);
public record UpdateBlogPostRequest(
    Guid? CategoryId, string Title, string Slug, string? Summary, string? ContentHtml,
    string? FeaturedImageUrl, string? MetaTitle, string? MetaDescription, string? Tags,
    string? AuthorName, int ReadTimeMinutes);
public record PublishBlogPostRequest(bool IsPublished);
