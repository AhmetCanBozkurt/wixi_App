using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Entities;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Services.Tekstil
{
    public class ProjectService : IProjectService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<ProjectService> _logger;

        public ProjectService(WixiDbContext context, ILogger<ProjectService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Project Methods

        public async Task<List<ProjectDto>> GetAllProjectsAsync(string? languageCode = null, int? categoryId = null)
        {
            var query = _context.TekstilProjects
                .Include(p => p.Category)
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .Include(p => p.Tags)
                .Where(p => p.IsActive)
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var projects = await query
                .OrderBy(p => p.DisplayOrder)
                .ThenByDescending(p => p.Year)
                .ToListAsync();

            return projects.Select(p => MapToDto(p, languageCode)).ToList();
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(int id, string? languageCode = null)
        {
            var project = await _context.TekstilProjects
                .Include(p => p.Category)
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .Include(p => p.Tags)
                .FirstOrDefaultAsync(p => p.Id == id);

            return project == null ? null : MapToDto(project, languageCode);
        }

        public async Task<ProjectDto?> GetProjectBySlugAsync(string slug, string? languageCode = null)
        {
            var project = await _context.TekstilProjects
                .Include(p => p.Category)
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .Include(p => p.Tags)
                .FirstOrDefaultAsync(p => p.Slug == slug);

            return project == null ? null : MapToDto(project, languageCode);
        }

        public async Task<List<ProjectDto>> GetFeaturedProjectsAsync(string? languageCode = null)
        {
            var projects = await _context.TekstilProjects
                .Include(p => p.Category)
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .Include(p => p.Tags)
                .Where(p => p.IsActive && p.IsFeatured)
                .OrderBy(p => p.DisplayOrder)
                .ToListAsync();

            return projects.Select(p => MapToDto(p, languageCode)).ToList();
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto)
        {
            var project = new Project
            {
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                ClientName = dto.ClientName,
                Description = dto.Description,
                Slug = dto.Slug,
                PrimaryImageUrl = dto.PrimaryImageUrl,
                PrimaryImageAlt = dto.PrimaryImageAlt,
                Year = dto.Year,
                Quantity = dto.Quantity,
                Duration = dto.Duration,
                Budget = dto.Budget,
                CompletionDate = dto.CompletionDate,
                IsActive = dto.IsActive,
                IsFeatured = dto.IsFeatured,
                DisplayOrder = dto.DisplayOrder,
                ViewCount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TekstilProjects.Add(project);
            await _context.SaveChangesAsync();

            // Add translations
            if (dto.Translations != null && dto.Translations.Any())
            {
                foreach (var trans in dto.Translations)
                {
                    var translation = new ProjectTranslation
                    {
                        ProjectId = project.Id,
                        LanguageCode = trans.LanguageCode,
                        Title = trans.Title,
                        ClientName = trans.ClientName,
                        Description = trans.Description,
                        MetaTitle = trans.MetaTitle,
                        MetaDescription = trans.MetaDescription,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProjectTranslations.Add(translation);
                }
            }

            // Add images
            if (dto.Images != null && dto.Images.Any())
            {
                foreach (var img in dto.Images)
                {
                    var image = new ProjectImage
                    {
                        ProjectId = project.Id,
                        ImageUrl = img.ImageUrl,
                        ImageAlt = img.ImageAlt,
                        ImageTitle = img.ImageTitle,
                        IsPrimary = img.IsPrimary,
                        DisplayOrder = img.DisplayOrder,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProjectImages.Add(image);
                }
            }

            // Add tags
            if (dto.Tags != null && dto.Tags.Any())
            {
                foreach (var tagName in dto.Tags)
                {
                    var tag = new ProjectTag
                    {
                        ProjectId = project.Id,
                        TagName = tagName,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProjectTags.Add(tag);
                }
            }

            await _context.SaveChangesAsync();
            return (await GetProjectByIdAsync(project.Id))!;
        }

        public async Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectDto dto)
        {
            var project = await _context.TekstilProjects
                .Include(p => p.Translations)
                .Include(p => p.Images)
                .Include(p => p.Tags)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
                throw new KeyNotFoundException($"Project with ID {id} not found");

            project.CategoryId = dto.CategoryId;
            project.Title = dto.Title;
            project.ClientName = dto.ClientName;
            project.Description = dto.Description;
            project.Slug = dto.Slug;
            project.PrimaryImageUrl = dto.PrimaryImageUrl;
            project.PrimaryImageAlt = dto.PrimaryImageAlt;
            project.Year = dto.Year;
            project.Quantity = dto.Quantity;
            project.Duration = dto.Duration;
            project.Budget = dto.Budget;
            project.CompletionDate = dto.CompletionDate;
            project.IsActive = dto.IsActive;
            project.IsFeatured = dto.IsFeatured;
            project.DisplayOrder = dto.DisplayOrder;
            project.UpdatedAt = DateTime.UtcNow;

            // Update translations
            if (dto.Translations != null)
            {
                // Remove old translations
                _context.TekstilProjectTranslations.RemoveRange(project.Translations);
                
                // Add new translations
                foreach (var trans in dto.Translations)
                {
                    var translation = new ProjectTranslation
                    {
                        ProjectId = project.Id,
                        LanguageCode = trans.LanguageCode,
                        Title = trans.Title,
                        ClientName = trans.ClientName,
                        Description = trans.Description,
                        MetaTitle = trans.MetaTitle,
                        MetaDescription = trans.MetaDescription,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProjectTranslations.Add(translation);
                }
            }

            // Update images
            if (dto.Images != null)
            {
                // Remove old images
                _context.TekstilProjectImages.RemoveRange(project.Images);
                
                // Add new images
                foreach (var img in dto.Images)
                {
                    var image = new ProjectImage
                    {
                        ProjectId = project.Id,
                        ImageUrl = img.ImageUrl,
                        ImageAlt = img.ImageAlt,
                        ImageTitle = img.ImageTitle,
                        IsPrimary = img.IsPrimary,
                        DisplayOrder = img.DisplayOrder,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProjectImages.Add(image);
                }
            }

            // Update tags
            if (dto.Tags != null)
            {
                // Remove old tags
                _context.TekstilProjectTags.RemoveRange(project.Tags);
                
                // Add new tags
                foreach (var tagName in dto.Tags)
                {
                    var tag = new ProjectTag
                    {
                        ProjectId = project.Id,
                        TagName = tagName,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProjectTags.Add(tag);
                }
            }

            await _context.SaveChangesAsync();
            return (await GetProjectByIdAsync(project.Id))!;
        }

        public async Task<bool> DeleteProjectAsync(int id)
        {
            var project = await _context.TekstilProjects.FindAsync(id);
            if (project == null)
                return false;

            _context.TekstilProjects.Remove(project);
            await _context.SaveChangesAsync();
            return true;
        }

        private ProjectDto MapToDto(Project project, string? languageCode = null)
        {
            var dto = new ProjectDto
            {
                Id = project.Id,
                CategoryId = project.CategoryId,
                CategoryName = project.Category?.Name ?? string.Empty,
                Title = project.Title,
                ClientName = project.ClientName,
                Description = project.Description,
                Slug = project.Slug,
                PrimaryImageUrl = project.PrimaryImageUrl,
                PrimaryImageAlt = project.PrimaryImageAlt,
                Year = project.Year,
                Quantity = project.Quantity,
                Duration = project.Duration,
                Budget = project.Budget,
                CompletionDate = project.CompletionDate,
                IsActive = project.IsActive,
                IsFeatured = project.IsFeatured,
                DisplayOrder = project.DisplayOrder,
                ViewCount = project.ViewCount,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt
            };

            // If language code is specified, use translation
            if (!string.IsNullOrEmpty(languageCode))
            {
                var translation = project.Translations?.FirstOrDefault(t => t.LanguageCode == languageCode);
                if (translation != null)
                {
                    dto.Title = translation.Title;
                    dto.ClientName = translation.ClientName ?? dto.ClientName;
                    dto.Description = translation.Description;
                }
            }

            return dto;
        }

        #endregion

        #region Category Methods

        public async Task<List<ProjectCategoryDto>> GetAllCategoriesAsync(string? languageCode = null)
        {
            var categories = await _context.TekstilProjectCategories
                .Include(c => c.Translations)
                .Include(c => c.Projects)
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .ToListAsync();

            return categories.Select(c => MapCategoryToDto(c, languageCode)).ToList();
        }

        public async Task<ProjectCategoryDto?> GetCategoryByIdAsync(int id, string? languageCode = null)
        {
            var category = await _context.TekstilProjectCategories
                .Include(c => c.Translations)
                .Include(c => c.Projects)
                .FirstOrDefaultAsync(c => c.Id == id);

            return category == null ? null : MapCategoryToDto(category, languageCode);
        }

        public async Task<ProjectCategoryDto> CreateCategoryAsync(CreateProjectCategoryDto dto)
        {
            var category = new ProjectCategory
            {
                Name = dto.Name,
                Description = dto.Description,
                Slug = dto.Slug,
                Color = dto.Color,
                IconName = dto.IconName,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TekstilProjectCategories.Add(category);
            await _context.SaveChangesAsync();

            // Add translations
            if (dto.Translations != null && dto.Translations.Any())
            {
                foreach (var trans in dto.Translations)
                {
                    var translation = new ProjectCategoryTranslation
                    {
                        CategoryId = category.Id,
                        LanguageCode = trans.LanguageCode,
                        Name = trans.Name,
                        Description = trans.Description,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProjectCategoryTranslations.Add(translation);
                }
                await _context.SaveChangesAsync();
            }

            return (await GetCategoryByIdAsync(category.Id))!;
        }

        public async Task<ProjectCategoryDto> UpdateCategoryAsync(int id, UpdateProjectCategoryDto dto)
        {
            var category = await _context.TekstilProjectCategories
                .Include(c => c.Translations)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                throw new KeyNotFoundException($"Project category with ID {id} not found");

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.Slug = dto.Slug;
            category.Color = dto.Color;
            category.IconName = dto.IconName;
            category.DisplayOrder = dto.DisplayOrder;
            category.IsActive = dto.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            // Update translations
            if (dto.Translations != null)
            {
                // Remove old translations
                _context.TekstilProjectCategoryTranslations.RemoveRange(category.Translations);
                
                // Add new translations
                foreach (var trans in dto.Translations)
                {
                    var translation = new ProjectCategoryTranslation
                    {
                        CategoryId = category.Id,
                        LanguageCode = trans.LanguageCode,
                        Name = trans.Name,
                        Description = trans.Description,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.TekstilProjectCategoryTranslations.Add(translation);
                }
            }

            await _context.SaveChangesAsync();
            return (await GetCategoryByIdAsync(category.Id))!;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.TekstilProjectCategories.FindAsync(id);
            if (category == null)
                return false;

            _context.TekstilProjectCategories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        private ProjectCategoryDto MapCategoryToDto(ProjectCategory category, string? languageCode = null)
        {
            var dto = new ProjectCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Slug = category.Slug,
                Color = category.Color,
                IconName = category.IconName,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                ProjectCount = category.Projects?.Count(p => p.IsActive) ?? 0
            };

            // If language code is specified, use translation
            if (!string.IsNullOrEmpty(languageCode))
            {
                var translation = category.Translations?.FirstOrDefault(t => t.LanguageCode == languageCode);
                if (translation != null)
                {
                    dto.Name = translation.Name;
                    dto.Description = translation.Description;
                }
            }

            return dto;
        }

        #endregion
    }
}


