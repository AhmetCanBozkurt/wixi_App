using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using wixi.DataAccess;
using wixi.Content.Interfaces;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public class SitemapController : ControllerBase
{
    private readonly WixiDbContext _db;
    private readonly IContentService _contentService;

    public SitemapController(WixiDbContext db, IContentService contentService)
    {
        _db = db;
        _contentService = contentService;
    }

    /// <summary>
    /// Get sitemap.xml (public)
    /// </summary>
    [HttpGet("sitemap.xml")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSitemap()
    {
        try
        {
            // Get site URL from system settings
            var systemSettings = await _contentService.GetSystemSettingsAsync();
            var baseUrl = systemSettings?.SiteUrl ?? "https://worklines.com.tr";
            if (baseUrl.EndsWith("/")) baseUrl = baseUrl.TrimEnd('/');

            var sb = new StringBuilder();
            sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
            sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

            void AddUrl(string path)
            {
                var loc = path.StartsWith("http") ? path : baseUrl + (path.StartsWith("/") ? path : "/" + path);
                sb.AppendLine("  <url>");
                sb.AppendLine($"    <loc>{System.Security.SecurityElement.Escape(loc)}</loc>");
                sb.AppendLine("  </url>");
            }

            // Static routes
            AddUrl("/");
            AddUrl("/about");
            AddUrl("/contact");
            AddUrl("/services/ausbildung");
            AddUrl("/services/language");
            AddUrl("/services/university");
            AddUrl("/services/work");

            // Team members
            var members = await _contentService.GetAllTeamMembersAsync(activeOnly: true);
            foreach (var member in members)
            {
                if (!string.IsNullOrEmpty(member.Slug))
                {
                    AddUrl($"/team/{member.Slug}");
                }
            }

            // News items (published + active)
            var news = await _contentService.GetAllNewsItemsAsync(activeOnly: true);
            foreach (var item in news)
            {
                var slug = !string.IsNullOrEmpty(item.Slug) ? item.Slug : item.Id.ToString();
                AddUrl($"/news/{slug}");
            }

            sb.AppendLine("</urlset>");
            return Content(sb.ToString(), "application/xml", Encoding.UTF8);
        }
        catch (Exception)
        {
            return StatusCode(500, new { success = false, message = "An error occurred while generating sitemap" });
        }
    }
}

