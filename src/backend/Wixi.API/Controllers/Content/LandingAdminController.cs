using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers.Content;

[ApiController]
[Route("api/v1/admin/landing")]
[Authorize(Roles = "SuperAdmin,Admin")]
public class LandingAdminController : ControllerBase
{
    private readonly WixiCoreDbContext _db;
    public LandingAdminController(WixiCoreDbContext db) => _db = db;

    // ── Contact Inbox ────────────────────────────────────────
    [HttpGet("contacts")]
    public async Task<IActionResult> GetContacts([FromQuery] bool unreadOnly = false, CancellationToken ct = default)
    {
        var q = _db.ContactSubmissions.AsQueryable();
        if (unreadOnly) q = q.Where(c => !c.IsRead);
        var list = await q.OrderByDescending(c => c.SubmittedAt)
            .Select(c => new { c.Id, c.FullName, c.Email, c.Phone, c.Topic, c.Message, c.Source, c.SubmittedAt, c.IsRead })
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPatch("contacts/{id}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var item = await _db.ContactSubmissions.FindAsync([id], ct);
        if (item == null) return NotFound();
        item.IsRead = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    // ── FAQ Categories ────────────────────────────────────────
    [HttpGet("faq/categories")]
    public async Task<IActionResult> GetFaqCategories(CancellationToken ct)
    {
        var cats = await _db.FaqCategories
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.SortOrder)
            .Include(c => c.Translations).ThenInclude(t => t.Language)
            .Include(c => c.Faqs.Where(f => !f.IsDeleted))
            .Select(c => new {
                c.Id, c.Slug, c.SortOrder, c.IsActive,
                translations = c.Translations.Select(t => new { t.LanguageId, langCode = t.Language.Code, t.Label }),
                faqCount = c.Faqs.Count
            })
            .ToListAsync(ct);
        return Ok(cats);
    }

    [HttpPost("faq/categories")]
    public async Task<IActionResult> CreateFaqCategory([FromBody] FaqCategoryUpsertRequest req, CancellationToken ct)
    {
        var cat = new WixiFaqCategory { Slug = req.Slug, SortOrder = req.SortOrder };
        _db.FaqCategories.Add(cat);
        foreach (var tr in req.Translations)
        {
            _db.FaqCategoryTranslations.Add(new WixiFaqCategoryTranslation { CategoryId = cat.Id, LanguageId = tr.LanguageId, Label = tr.Label });
        }
        await _db.SaveChangesAsync(ct);
        return Ok(new { cat.Id });
    }

    [HttpPut("faq/categories/{id}")]
    public async Task<IActionResult> UpdateFaqCategory(Guid id, [FromBody] FaqCategoryUpsertRequest req, CancellationToken ct)
    {
        var cat = await _db.FaqCategories.Include(c => c.Translations).FirstOrDefaultAsync(c => c.Id == id, ct);
        if (cat == null) return NotFound();
        cat.Slug = req.Slug;
        cat.SortOrder = req.SortOrder;
        cat.IsActive = req.IsActive;
        foreach (var tr in req.Translations)
        {
            var existing = cat.Translations.FirstOrDefault(t => t.LanguageId == tr.LanguageId);
            if (existing != null) existing.Label = tr.Label;
            else _db.FaqCategoryTranslations.Add(new WixiFaqCategoryTranslation { CategoryId = id, LanguageId = tr.LanguageId, Label = tr.Label });
        }
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("faq/categories/{id}")]
    public async Task<IActionResult> DeleteFaqCategory(Guid id, CancellationToken ct)
    {
        var cat = await _db.FaqCategories.FindAsync([id], ct);
        if (cat == null) return NotFound();
        cat.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    // ── FAQ Items ─────────────────────────────────────────────
    [HttpGet("faq")]
    public async Task<IActionResult> GetFaqs([FromQuery] Guid? categoryId, CancellationToken ct)
    {
        var q = _db.Faqs.Where(f => !f.IsDeleted)
            .Include(f => f.Translations).ThenInclude(t => t.Language)
            .Include(f => f.Category)
            .AsQueryable();
        if (categoryId.HasValue) q = q.Where(f => f.CategoryId == categoryId.Value);
        var list = await q.OrderBy(f => f.SortOrder)
            .Select(f => new {
                f.Id, f.CategoryId, categorySlug = f.Category.Slug, f.SortOrder, f.IsActive,
                translations = f.Translations.Select(t => new { t.LanguageId, langCode = t.Language.Code, t.Question, t.Answer })
            })
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("faq")]
    public async Task<IActionResult> CreateFaq([FromBody] FaqUpsertRequest req, CancellationToken ct)
    {
        var faq = new WixiFaq { CategoryId = req.CategoryId, SortOrder = req.SortOrder };
        _db.Faqs.Add(faq);
        foreach (var tr in req.Translations)
            _db.FaqTranslations.Add(new WixiFaqTranslation { FaqId = faq.Id, LanguageId = tr.LanguageId, Question = tr.Question, Answer = tr.Answer });
        await _db.SaveChangesAsync(ct);
        return Ok(new { faq.Id });
    }

    [HttpPut("faq/{id}")]
    public async Task<IActionResult> UpdateFaq(Guid id, [FromBody] FaqUpsertRequest req, CancellationToken ct)
    {
        var faq = await _db.Faqs.Include(f => f.Translations).FirstOrDefaultAsync(f => f.Id == id, ct);
        if (faq == null) return NotFound();
        faq.CategoryId = req.CategoryId;
        faq.SortOrder = req.SortOrder;
        faq.IsActive = req.IsActive;
        foreach (var tr in req.Translations)
        {
            var existing = faq.Translations.FirstOrDefault(t => t.LanguageId == tr.LanguageId);
            if (existing != null) { existing.Question = tr.Question; existing.Answer = tr.Answer; }
            else _db.FaqTranslations.Add(new WixiFaqTranslation { FaqId = id, LanguageId = tr.LanguageId, Question = tr.Question, Answer = tr.Answer });
        }
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("faq/{id}")]
    public async Task<IActionResult> DeleteFaq(Guid id, CancellationToken ct)
    {
        var faq = await _db.Faqs.FindAsync([id], ct);
        if (faq == null) return NotFound();
        faq.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    // ── Subscription Plans ────────────────────────────────────────
    [HttpGet("plans")]
    public async Task<IActionResult> GetPlans(CancellationToken ct)
    {
        var plans = await _db.SubscriptionPlans
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.SortOrder)
            .Select(p => new { p.Id, p.Name, p.Code, p.PriceMonthly, p.PriceYearly, p.FeaturesJson, p.MaxProducts, p.MaxUsers, p.SortOrder, p.IsActive })
            .ToListAsync(ct);
        return Ok(plans);
    }

    [HttpPost("plans")]
    public async Task<IActionResult> CreatePlan([FromBody] PlanUpsertRequest req, CancellationToken ct)
    {
        var plan = new WixiSubscriptionPlan
        {
            Name = req.Name, Code = req.Code,
            PriceMonthly = req.PriceMonthly, PriceYearly = req.PriceYearly,
            FeaturesJson = req.FeaturesJson, MaxProducts = req.MaxProducts,
            MaxUsers = req.MaxUsers, SortOrder = req.SortOrder
        };
        _db.SubscriptionPlans.Add(plan);
        await _db.SaveChangesAsync(ct);
        return Ok(new { plan.Id });
    }

    [HttpPut("plans/{id}")]
    public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] PlanUpsertRequest req, CancellationToken ct)
    {
        var plan = await _db.SubscriptionPlans.FindAsync([id], ct);
        if (plan == null) return NotFound();
        plan.Name = req.Name; plan.Code = req.Code;
        plan.PriceMonthly = req.PriceMonthly; plan.PriceYearly = req.PriceYearly;
        plan.FeaturesJson = req.FeaturesJson; plan.MaxProducts = req.MaxProducts;
        plan.MaxUsers = req.MaxUsers; plan.SortOrder = req.SortOrder;
        plan.IsActive = req.IsActive;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("plans/{id}")]
    public async Task<IActionResult> DeletePlan(Guid id, CancellationToken ct)
    {
        var plan = await _db.SubscriptionPlans.FindAsync([id], ct);
        if (plan == null) return NotFound();
        plan.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    // ── Team Members ──────────────────────────────────────────
    [HttpGet("team")]
    public async Task<IActionResult> GetTeam(CancellationToken ct)
    {
        var members = await _db.TeamMembers
            .Where(m => !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .Include(m => m.Translations).ThenInclude(t => t.Language)
            .Select(m => new {
                m.Id, m.FullName, m.Initials, m.AvatarUrl, m.AvatarColor, m.SortOrder, m.IsActive,
                translations = m.Translations.Select(t => new { t.LanguageId, langCode = t.Language.Code, t.Role, t.Department })
            })
            .ToListAsync(ct);
        return Ok(members);
    }

    [HttpPost("team")]
    public async Task<IActionResult> CreateTeamMember([FromBody] TeamMemberUpsertRequest req, CancellationToken ct)
    {
        var member = new WixiTeamMember
        {
            FullName = req.FullName, Initials = req.Initials,
            AvatarUrl = req.AvatarUrl, AvatarColor = req.AvatarColor,
            SortOrder = req.SortOrder
        };
        _db.TeamMembers.Add(member);
        foreach (var tr in req.Translations)
            _db.TeamMemberTranslations.Add(new WixiTeamMemberTranslation { MemberId = member.Id, LanguageId = tr.LanguageId, Role = tr.Role, Department = tr.Department });
        await _db.SaveChangesAsync(ct);
        return Ok(new { member.Id });
    }

    [HttpPut("team/{id}")]
    public async Task<IActionResult> UpdateTeamMember(Guid id, [FromBody] TeamMemberUpsertRequest req, CancellationToken ct)
    {
        var member = await _db.TeamMembers.Include(m => m.Translations).FirstOrDefaultAsync(m => m.Id == id, ct);
        if (member == null) return NotFound();
        member.FullName = req.FullName; member.Initials = req.Initials;
        member.AvatarUrl = req.AvatarUrl; member.AvatarColor = req.AvatarColor;
        member.SortOrder = req.SortOrder; member.IsActive = req.IsActive;
        foreach (var tr in req.Translations)
        {
            var existing = member.Translations.FirstOrDefault(t => t.LanguageId == tr.LanguageId);
            if (existing != null) { existing.Role = tr.Role; existing.Department = tr.Department; }
            else _db.TeamMemberTranslations.Add(new WixiTeamMemberTranslation { MemberId = id, LanguageId = tr.LanguageId, Role = tr.Role, Department = tr.Department });
        }
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("team/{id}")]
    public async Task<IActionResult> DeleteTeamMember(Guid id, CancellationToken ct)
    {
        var m = await _db.TeamMembers.FindAsync([id], ct);
        if (m == null) return NotFound();
        m.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    // ── Case Studies ──────────────────────────────────────────
    [HttpGet("cases")]
    public async Task<IActionResult> GetCases(CancellationToken ct)
    {
        var cases = await _db.CaseStudies
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.SortOrder)
            .Include(c => c.Translations).ThenInclude(t => t.Language)
            .Select(c => new {
                c.Id, c.ClientSlug, c.ClientInitials, c.ClientLogoUrl, c.Industry,
                c.Metric1Value, c.Metric2Value, c.IsFeatured, c.SortOrder, c.IsActive,
                translations = c.Translations.Select(t => new {
                    t.LanguageId, langCode = t.Language.Code,
                    t.ClientName, t.Title, t.Description,
                    t.Metric1Label, t.Metric2Label, t.QuoteText, t.QuoteAuthor
                })
            })
            .ToListAsync(ct);
        return Ok(cases);
    }

    [HttpPost("cases")]
    public async Task<IActionResult> CreateCase([FromBody] CaseStudyUpsertRequest req, CancellationToken ct)
    {
        var cs = new WixiCaseStudy
        {
            ClientSlug = req.ClientSlug, ClientInitials = req.ClientInitials,
            ClientLogoUrl = req.ClientLogoUrl, Industry = req.Industry,
            Metric1Value = req.Metric1Value, Metric2Value = req.Metric2Value,
            IsFeatured = req.IsFeatured, SortOrder = req.SortOrder
        };
        _db.CaseStudies.Add(cs);
        foreach (var tr in req.Translations)
            _db.CaseStudyTranslations.Add(new WixiCaseStudyTranslation
            {
                CaseStudyId = cs.Id, LanguageId = tr.LanguageId,
                ClientName = tr.ClientName, Title = tr.Title, Description = tr.Description,
                Metric1Label = tr.Metric1Label, Metric2Label = tr.Metric2Label,
                QuoteText = tr.QuoteText, QuoteAuthor = tr.QuoteAuthor
            });
        await _db.SaveChangesAsync(ct);
        return Ok(new { cs.Id });
    }

    [HttpPut("cases/{id}")]
    public async Task<IActionResult> UpdateCase(Guid id, [FromBody] CaseStudyUpsertRequest req, CancellationToken ct)
    {
        var cs = await _db.CaseStudies.Include(c => c.Translations).FirstOrDefaultAsync(c => c.Id == id, ct);
        if (cs == null) return NotFound();
        cs.ClientSlug = req.ClientSlug; cs.ClientInitials = req.ClientInitials;
        cs.ClientLogoUrl = req.ClientLogoUrl; cs.Industry = req.Industry;
        cs.Metric1Value = req.Metric1Value; cs.Metric2Value = req.Metric2Value;
        cs.IsFeatured = req.IsFeatured; cs.SortOrder = req.SortOrder; cs.IsActive = req.IsActive;
        foreach (var tr in req.Translations)
        {
            var existing = cs.Translations.FirstOrDefault(t => t.LanguageId == tr.LanguageId);
            if (existing != null)
            {
                existing.ClientName = tr.ClientName; existing.Title = tr.Title; existing.Description = tr.Description;
                existing.Metric1Label = tr.Metric1Label; existing.Metric2Label = tr.Metric2Label;
                existing.QuoteText = tr.QuoteText; existing.QuoteAuthor = tr.QuoteAuthor;
            }
            else
            {
                _db.CaseStudyTranslations.Add(new WixiCaseStudyTranslation
                {
                    CaseStudyId = id, LanguageId = tr.LanguageId, ClientName = tr.ClientName,
                    Title = tr.Title, Description = tr.Description, Metric1Label = tr.Metric1Label,
                    Metric2Label = tr.Metric2Label, QuoteText = tr.QuoteText, QuoteAuthor = tr.QuoteAuthor
                });
            }
        }
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("cases/{id}")]
    public async Task<IActionResult> DeleteCase(Guid id, CancellationToken ct)
    {
        var cs = await _db.CaseStudies.FindAsync([id], ct);
        if (cs == null) return NotFound();
        cs.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    // ── Roadmap Admin ─────────────────────────────────────────
    [HttpGet("roadmap")]
    public async Task<IActionResult> GetRoadmapItems(CancellationToken ct)
    {
        var items = await _db.RoadmapItems
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.SortOrder)
            .Include(r => r.Translations).ThenInclude(t => t.Language)
            .Select(r => new {
                r.Id, r.Phase, r.PhaseLabel, r.Category, r.PlannedDate,
                r.VoteCount, r.IsShipped, r.SortOrder, r.IsActive,
                translations = r.Translations.Select(t => new { t.LanguageId, langCode = t.Language.Code, t.Title, t.Description })
            })
            .ToListAsync(ct);
        return Ok(items);
    }

    [HttpPost("roadmap")]
    public async Task<IActionResult> CreateRoadmapItem([FromBody] RoadmapItemUpsertRequest req, CancellationToken ct)
    {
        var item = new WixiRoadmapItem
        {
            Phase = req.PhaseId,
            PhaseLabel = req.PhaseId,
            Category = req.Category,
            PlannedDate = req.PlannedDate ?? string.Empty,
            SortOrder = req.SortOrder,
            IsActive = req.IsActive
        };
        _db.RoadmapItems.Add(item);
        foreach (var tr in req.Translations)
            _db.RoadmapItemTranslations.Add(new WixiRoadmapItemTranslation { ItemId = item.Id, LanguageId = tr.LanguageId, Title = tr.Title, Description = tr.Description });
        await _db.SaveChangesAsync(ct);
        return Ok(new { item.Id });
    }

    [HttpPut("roadmap/{id}")]
    public async Task<IActionResult> UpdateRoadmapItem(Guid id, [FromBody] RoadmapItemUpsertRequest req, CancellationToken ct)
    {
        var item = await _db.RoadmapItems.Include(r => r.Translations).FirstOrDefaultAsync(r => r.Id == id, ct);
        if (item == null) return NotFound();
        item.Phase = req.PhaseId;
        item.PhaseLabel = req.PhaseId;
        item.Category = req.Category;
        item.PlannedDate = req.PlannedDate ?? string.Empty;
        item.SortOrder = req.SortOrder;
        item.IsActive = req.IsActive;
        foreach (var tr in req.Translations)
        {
            var existing = item.Translations.FirstOrDefault(t => t.LanguageId == tr.LanguageId);
            if (existing != null) { existing.Title = tr.Title; existing.Description = tr.Description; }
            else _db.RoadmapItemTranslations.Add(new WixiRoadmapItemTranslation { ItemId = id, LanguageId = tr.LanguageId, Title = tr.Title, Description = tr.Description });
        }
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("roadmap/{id}")]
    public async Task<IActionResult> DeleteRoadmapItem(Guid id, CancellationToken ct)
    {
        var item = await _db.RoadmapItems.FindAsync([id], ct);
        if (item == null) return NotFound();
        item.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpPatch("roadmap/{id}/ship")]
    public async Task<IActionResult> ShipRoadmapItem(Guid id, CancellationToken ct)
    {
        var item = await _db.RoadmapItems.FindAsync([id], ct);
        if (item == null) return NotFound();
        item.IsShipped = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    // ── Changelog Admin ───────────────────────────────────────
    [HttpGet("changelog")]
    public async Task<IActionResult> GetChangelog(CancellationToken ct)
    {
        var entries = await _db.ChangelogEntries
            .Where(e => !e.IsDeleted)
            .OrderByDescending(e => e.ReleaseDate)
            .Include(e => e.Translations).ThenInclude(t => t.Language)
            .Select(e => new {
                e.Id, e.Version, e.ReleaseDate, e.Tag, e.SortOrder, e.IsActive,
                translations = e.Translations.Select(t => new { t.LanguageId, langCode = t.Language.Code, t.Title, t.Description })
            })
            .ToListAsync(ct);
        return Ok(entries);
    }

    [HttpPost("changelog")]
    public async Task<IActionResult> CreateChangelog([FromBody] ChangelogUpsertRequest req, CancellationToken ct)
    {
        var entry = new WixiChangelogEntry
        {
            Version = req.Version,
            ReleaseDate = req.ReleaseDate,
            Tag = req.Tag,
            IsActive = req.IsActive
        };
        _db.ChangelogEntries.Add(entry);
        foreach (var tr in req.Translations)
            _db.ChangelogTranslations.Add(new WixiChangelogTranslation { EntryId = entry.Id, LanguageId = tr.LanguageId, Title = tr.Title, Description = tr.Description });
        await _db.SaveChangesAsync(ct);
        return Ok(new { entry.Id });
    }

    [HttpPut("changelog/{id}")]
    public async Task<IActionResult> UpdateChangelog(Guid id, [FromBody] ChangelogUpsertRequest req, CancellationToken ct)
    {
        var entry = await _db.ChangelogEntries.Include(e => e.Translations).FirstOrDefaultAsync(e => e.Id == id, ct);
        if (entry == null) return NotFound();
        entry.Version = req.Version;
        entry.ReleaseDate = req.ReleaseDate;
        entry.Tag = req.Tag;
        entry.IsActive = req.IsActive;
        foreach (var tr in req.Translations)
        {
            var existing = entry.Translations.FirstOrDefault(t => t.LanguageId == tr.LanguageId);
            if (existing != null) { existing.Title = tr.Title; existing.Description = tr.Description; }
            else _db.ChangelogTranslations.Add(new WixiChangelogTranslation { EntryId = id, LanguageId = tr.LanguageId, Title = tr.Title, Description = tr.Description });
        }
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("changelog/{id}")]
    public async Task<IActionResult> DeleteChangelog(Guid id, CancellationToken ct)
    {
        var entry = await _db.ChangelogEntries.FindAsync([id], ct);
        if (entry == null) return NotFound();
        entry.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    // ── Legal Documents Admin ─────────────────────────────────
    [HttpGet("legal")]
    public async Task<IActionResult> GetLegalDocs(CancellationToken ct)
    {
        var docs = await _db.LegalDocuments
            .Where(d => !d.IsDeleted)
            .OrderBy(d => d.Slug)
            .Include(d => d.Translations).ThenInclude(t => t.Language)
            .Select(d => new {
                d.Id, d.Slug, d.Version, d.EffectiveDate, d.IsActive,
                translations = d.Translations.Select(t => new {
                    t.LanguageId, langCode = t.Language.Code, t.Title, t.LastUpdatedAt,
                    contentHtmlPreview = t.ContentHtml.Length > 200 ? t.ContentHtml.Substring(0, 200) : t.ContentHtml
                })
            })
            .ToListAsync(ct);
        return Ok(docs);
    }

    [HttpPost("legal")]
    public async Task<IActionResult> CreateLegalDoc([FromBody] LegalDocumentUpsertRequest req, CancellationToken ct)
    {
        var doc = new WixiLegalDocument
        {
            Slug = req.Slug,
            Version = req.Version,
            EffectiveDate = req.EffectiveDate
        };
        _db.LegalDocuments.Add(doc);
        foreach (var tr in req.Translations)
            _db.LegalDocumentTranslations.Add(new WixiLegalDocumentTranslation { DocumentId = doc.Id, LanguageId = tr.LanguageId, Title = tr.Title, ContentHtml = tr.ContentHtml, LastUpdatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync(ct);
        return Ok(new { doc.Id });
    }

    [HttpPut("legal/{id}")]
    public async Task<IActionResult> UpdateLegalDoc(Guid id, [FromBody] LegalDocumentUpsertRequest req, CancellationToken ct)
    {
        var doc = await _db.LegalDocuments.Include(d => d.Translations).FirstOrDefaultAsync(d => d.Id == id, ct);
        if (doc == null) return NotFound();
        doc.Slug = req.Slug;
        doc.Version = req.Version;
        doc.EffectiveDate = req.EffectiveDate;
        foreach (var tr in req.Translations)
        {
            var existing = doc.Translations.FirstOrDefault(t => t.LanguageId == tr.LanguageId);
            if (existing != null) { existing.Title = tr.Title; existing.ContentHtml = tr.ContentHtml; existing.LastUpdatedAt = DateTime.UtcNow; }
            else _db.LegalDocumentTranslations.Add(new WixiLegalDocumentTranslation { DocumentId = id, LanguageId = tr.LanguageId, Title = tr.Title, ContentHtml = tr.ContentHtml, LastUpdatedAt = DateTime.UtcNow });
        }
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("legal/{id}")]
    public async Task<IActionResult> DeleteLegalDoc(Guid id, CancellationToken ct)
    {
        var doc = await _db.LegalDocuments.FindAsync([id], ct);
        if (doc == null) return NotFound();
        doc.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }
}

// ── Request Records ───────────────────────────────────────────────────────────
public record FaqCategoryUpsertRequest(
    string Slug, int SortOrder, bool IsActive,
    List<FaqCategoryTranslationInput> Translations
);
public record FaqCategoryTranslationInput(Guid LanguageId, string Label);

public record FaqUpsertRequest(
    Guid CategoryId, int SortOrder, bool IsActive,
    List<FaqTranslationInput> Translations
);
public record FaqTranslationInput(Guid LanguageId, string Question, string Answer);

public record PlanUpsertRequest(
    string Name, string Code,
    decimal PriceMonthly, decimal PriceYearly,
    string FeaturesJson,
    int MaxProducts, int MaxUsers,
    int SortOrder, bool IsActive = true
);

public record TeamMemberUpsertRequest(
    string FullName, string Initials, string? AvatarUrl, string AvatarColor,
    int SortOrder, bool IsActive,
    List<TeamMemberTranslationInput> Translations
);
public record TeamMemberTranslationInput(Guid LanguageId, string Role, string Department);

public record CaseStudyUpsertRequest(
    string ClientSlug, string ClientInitials, string? ClientLogoUrl,
    string Industry, string Metric1Value, string Metric2Value,
    bool IsFeatured, int SortOrder, bool IsActive,
    List<CaseStudyTranslationInput> Translations
);
public record CaseStudyTranslationInput(
    Guid LanguageId, string ClientName, string Title, string Description,
    string Metric1Label, string Metric2Label, string? QuoteText, string? QuoteAuthor
);

public record RoadmapItemUpsertRequest(
    string PhaseId,
    string Category,
    string? PlannedDate,
    int SortOrder,
    bool IsActive,
    List<RoadmapItemTranslationInput> Translations
);
public record RoadmapItemTranslationInput(Guid LanguageId, string Title, string Description);

public record ChangelogUpsertRequest(
    string Version,
    DateOnly ReleaseDate,
    string Tag,
    bool IsActive,
    List<ChangelogTranslationInput> Translations
);
public record ChangelogTranslationInput(Guid LanguageId, string Title, string Description);

public record LegalDocumentUpsertRequest(
    string Slug,
    string Version,
    DateOnly EffectiveDate,
    List<LegalDocumentTranslationInput> Translations
);
public record LegalDocumentTranslationInput(Guid LanguageId, string Title, string ContentHtml);
