using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Infrastructure.Data;
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
public class BlogController : WebBuilderControllerBase
{
    private readonly IMediator _mediator;

    public BlogController(IMediator mediator, WixiCoreDbContext db) : base(db)
    {
        _mediator = mediator;
    }

    // ── Categories ──────────────────────────────────────────────────

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetBlogCategoriesQuery(tenantId), cancellationToken);
        return Ok(result);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateBlogCategoryRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(
            new CreateBlogCategoryCommand(tenantId, request.Name, request.Slug, request.Description, request.SortOrder),
            cancellationToken);
        return Ok(result);
    }

    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateBlogCategoryRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(
            new UpdateBlogCategoryCommand(id, tenantId, request.Name, request.Slug, request.Description, request.SortOrder),
            cancellationToken);
        return NoContent();
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(new DeleteBlogCategoryCommand(id, tenantId), cancellationToken);
        return NoContent();
    }

    // ── Posts ────────────────────────────────────────────────────────

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts(
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? isPublished,
        CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetBlogPostsQuery(tenantId, categoryId, isPublished), cancellationToken);
        return Ok(result);
    }

    [HttpGet("posts/{slug}")]
    public async Task<IActionResult> GetPostBySlug(string slug, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetBlogPostBySlugQuery(tenantId, slug), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] CreateBlogPostRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(
            new CreateBlogPostCommand(tenantId, request.CategoryId, request.Title, request.Slug,
                request.Summary, request.ContentHtml, request.FeaturedImageUrl,
                request.MetaTitle, request.MetaDescription, request.Tags,
                request.AuthorName, request.ReadTimeMinutes),
            cancellationToken);
        return Ok(result);
    }

    [HttpPut("posts/{id}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdateBlogPostRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(
            new UpdateBlogPostCommand(id, tenantId, request.CategoryId, request.Title, request.Slug,
                request.Summary, request.ContentHtml, request.FeaturedImageUrl,
                request.MetaTitle, request.MetaDescription, request.Tags,
                request.AuthorName, request.ReadTimeMinutes),
            cancellationToken);
        return NoContent();
    }

    [HttpPut("posts/{id}/publish")]
    public async Task<IActionResult> PublishPost(Guid id, [FromBody] PublishBlogPostRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(new PublishBlogPostCommand(id, tenantId, request.IsPublished), cancellationToken);
        return NoContent();
    }

    [HttpDelete("posts/{id}")]
    public async Task<IActionResult> DeletePost(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(new DeleteBlogPostCommand(id, tenantId), cancellationToken);
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
