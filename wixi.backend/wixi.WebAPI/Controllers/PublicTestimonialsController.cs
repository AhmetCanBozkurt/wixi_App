using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/public/testimonials")]
    public class PublicTestimonialsController : ControllerBase
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<PublicTestimonialsController> _logger;

        public PublicTestimonialsController(
            WixiDbContext context,
            ILogger<PublicTestimonialsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/v1.0/public/testimonials
        [HttpGet]
        public async Task<ActionResult> GetActiveTestimonials([FromQuery] int? limit = null)
        {
            try
            {
                var query = _context.Testimonials
                    .Where(t => t.IsActive)
                    .OrderBy(t => t.DisplayOrder)
                    .ThenByDescending(t => t.CreatedAt);

                if (limit.HasValue && limit.Value > 0)
                {
                    query = (IOrderedQueryable<wixi.Content.Entities.Testimonial>)query.Take(limit.Value);
                }

                var testimonials = await query
                    .Select(t => new
                    {
                        t.Id,
                        t.Name,
                        t.Role,
                        t.Location,
                        t.Company,
                        t.Content,
                        t.ContentDe,
                        t.ContentEn,
                        t.ContentAr,
                        t.Rating,
                        t.ImageUrl,
                        t.DisplayOrder
                    })
                    .ToListAsync();

                return Ok(testimonials);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting public testimonials");
                return StatusCode(500, new { message = "Referanslar alınırken hata oluştu" });
            }
        }
    }
}

