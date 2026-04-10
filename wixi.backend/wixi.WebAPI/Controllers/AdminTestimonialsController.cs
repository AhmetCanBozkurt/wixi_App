using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Content.Entities;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/admin/testimonials")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminTestimonialsController : ControllerBase
    {
        private readonly WixiDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<AdminTestimonialsController> _logger;

        public AdminTestimonialsController(
            WixiDbContext context,
            IWebHostEnvironment environment,
            ILogger<AdminTestimonialsController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        // GET: api/v1.0/admin/testimonials
        [HttpGet]
        public async Task<ActionResult> GetTestimonials(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool? isActive = null,
            [FromQuery] string? search = null)
        {
            try
            {
                var query = _context.Testimonials.AsQueryable();

                // Filter by active status
                if (isActive.HasValue)
                {
                    query = query.Where(t => t.IsActive == isActive.Value);
                }

                // Search filter
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(t => 
                        t.Name.Contains(search) ||
                        t.Role.Contains(search) ||
                        t.Location.Contains(search) ||
                        t.Company.Contains(search) ||
                        t.Content.Contains(search));
                }

                var total = await query.CountAsync();

                var testimonials = await query
                    .OrderBy(t => t.DisplayOrder)
                    .ThenByDescending(t => t.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
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
                        t.IsActive,
                        t.DisplayOrder,
                        t.CreatedAt,
                        t.UpdatedAt,
                        t.CreatedBy,
                        t.UpdatedBy
                    })
                    .ToListAsync();

                return Ok(new
                {
                    items = testimonials,
                    total,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting testimonials");
                return StatusCode(500, new { message = "Referanslar alınırken hata oluştu" });
            }
        }

        // GET: api/v1.0/admin/testimonials/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetTestimonial(int id)
        {
            try
            {
                var testimonial = await _context.Testimonials.FindAsync(id);

                if (testimonial == null)
                {
                    return NotFound(new { message = "Referans bulunamadı" });
                }

                return Ok(new
                {
                    testimonial.Id,
                    testimonial.Name,
                    testimonial.Role,
                    testimonial.Location,
                    testimonial.Company,
                    testimonial.Content,
                    testimonial.ContentDe,
                    testimonial.ContentEn,
                    testimonial.ContentAr,
                    testimonial.Rating,
                    testimonial.ImageUrl,
                    testimonial.IsActive,
                    testimonial.DisplayOrder,
                    testimonial.CreatedAt,
                    testimonial.UpdatedAt,
                    testimonial.CreatedBy,
                    testimonial.UpdatedBy
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting testimonial {Id}", id);
                return StatusCode(500, new { message = "Referans alınırken hata oluştu" });
            }
        }

        // POST: api/v1.0/admin/testimonials
        [HttpPost]
        public async Task<ActionResult> CreateTestimonial([FromBody] CreateTestimonialDto dto)
        {
            try
            {
                var userName = User.Identity?.Name ?? "System";

                var testimonial = new Testimonial
                {
                    Name = dto.Name,
                    Role = dto.Role,
                    Location = dto.Location,
                    Company = dto.Company,
                    Content = dto.Content,
                    ContentDe = dto.ContentDe,
                    ContentEn = dto.ContentEn,
                    ContentAr = dto.ContentAr,
                    Rating = dto.Rating,
                    ImageUrl = dto.ImageUrl,
                    IsActive = dto.IsActive,
                    DisplayOrder = dto.DisplayOrder,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userName
                };

                _context.Testimonials.Add(testimonial);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetTestimonial), new { id = testimonial.Id }, new
                {
                    testimonial.Id,
                    testimonial.Name,
                    testimonial.Role,
                    testimonial.Location,
                    testimonial.Company,
                    testimonial.Content,
                    testimonial.ContentDe,
                    testimonial.ContentEn,
                    testimonial.ContentAr,
                    testimonial.Rating,
                    testimonial.ImageUrl,
                    testimonial.IsActive,
                    testimonial.DisplayOrder,
                    testimonial.CreatedAt,
                    testimonial.CreatedBy
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating testimonial");
                return StatusCode(500, new { message = "Referans oluşturulurken hata oluştu" });
            }
        }

        // PUT: api/v1.0/admin/testimonials/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateTestimonial(int id, [FromBody] UpdateTestimonialDto dto)
        {
            try
            {
                var testimonial = await _context.Testimonials.FindAsync(id);

                if (testimonial == null)
                {
                    return NotFound(new { message = "Referans bulunamadı" });
                }

                var userName = User.Identity?.Name ?? "System";

                testimonial.Name = dto.Name;
                testimonial.Role = dto.Role;
                testimonial.Location = dto.Location;
                testimonial.Company = dto.Company;
                testimonial.Content = dto.Content;
                testimonial.ContentDe = dto.ContentDe;
                testimonial.ContentEn = dto.ContentEn;
                testimonial.ContentAr = dto.ContentAr;
                testimonial.Rating = dto.Rating;
                testimonial.ImageUrl = dto.ImageUrl;
                testimonial.IsActive = dto.IsActive;
                testimonial.DisplayOrder = dto.DisplayOrder;
                testimonial.UpdatedAt = DateTime.UtcNow;
                testimonial.UpdatedBy = userName;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    testimonial.Id,
                    testimonial.Name,
                    testimonial.Role,
                    testimonial.Location,
                    testimonial.Company,
                    testimonial.Content,
                    testimonial.ContentDe,
                    testimonial.ContentEn,
                    testimonial.ContentAr,
                    testimonial.Rating,
                    testimonial.ImageUrl,
                    testimonial.IsActive,
                    testimonial.DisplayOrder,
                    testimonial.UpdatedAt,
                    testimonial.UpdatedBy
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating testimonial {Id}", id);
                return StatusCode(500, new { message = "Referans güncellenirken hata oluştu" });
            }
        }

        // DELETE: api/v1.0/admin/testimonials/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTestimonial(int id)
        {
            try
            {
                var testimonial = await _context.Testimonials.FindAsync(id);

                if (testimonial == null)
                {
                    return NotFound(new { message = "Referans bulunamadı" });
                }

                _context.Testimonials.Remove(testimonial);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Referans silindi" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting testimonial {Id}", id);
                return StatusCode(500, new { message = "Referans silinirken hata oluştu" });
            }
        }

        // POST: api/v1.0/admin/testimonials/upload-image
        [HttpPost("upload-image")]
        public async Task<ActionResult> UploadImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "Dosya seçilmedi" });
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Geçersiz dosya tipi. Sadece resim dosyaları yüklenebilir." });
                }

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Dosya boyutu 5MB'dan küçük olmalıdır" });
                }

                // Create uploads directory if not exists
                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "testimonials");
                Directory.CreateDirectory(uploadsPath);

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var imageUrl = $"/uploads/testimonials/{fileName}";

                return Ok(new { imageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading testimonial image");
                return StatusCode(500, new { message = "Dosya yüklenirken hata oluştu" });
            }
        }

        // PATCH: api/v1.0/admin/testimonials/{id}/toggle-active
        [HttpPatch("{id}/toggle-active")]
        public async Task<ActionResult> ToggleActive(int id)
        {
            try
            {
                var testimonial = await _context.Testimonials.FindAsync(id);

                if (testimonial == null)
                {
                    return NotFound(new { message = "Referans bulunamadı" });
                }

                testimonial.IsActive = !testimonial.IsActive;
                testimonial.UpdatedAt = DateTime.UtcNow;
                testimonial.UpdatedBy = User.Identity?.Name ?? "System";

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    testimonial.Id,
                    testimonial.IsActive,
                    message = testimonial.IsActive ? "Referans aktif edildi" : "Referans pasif edildi"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling testimonial active status {Id}", id);
                return StatusCode(500, new { message = "Durum güncellenirken hata oluştu" });
            }
        }
    }

    // DTOs
    public class CreateTestimonialDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Role { get; set; }
        public string? Location { get; set; }
        public string? Company { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ContentDe { get; set; }
        public string? ContentEn { get; set; }
        public string? ContentAr { get; set; }
        public int Rating { get; set; } = 5;
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateTestimonialDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Role { get; set; }
        public string? Location { get; set; }
        public string? Company { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ContentDe { get; set; }
        public string? ContentEn { get; set; }
        public string? ContentAr { get; set; }
        public int Rating { get; set; } = 5;
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
    }
}

