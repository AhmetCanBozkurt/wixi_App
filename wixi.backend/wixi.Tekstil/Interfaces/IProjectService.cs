using System.Collections.Generic;
using System.Threading.Tasks;
using wixi.Tekstil.DTOs;

namespace wixi.Tekstil.Interfaces
{
    public interface IProjectService
    {
        Task<List<ProjectDto>> GetAllProjectsAsync(string? languageCode = null, int? categoryId = null);
        Task<ProjectDto?> GetProjectByIdAsync(int id, string? languageCode = null);
        Task<ProjectDto?> GetProjectBySlugAsync(string slug, string? languageCode = null);
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto);
        Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectDto dto);
        Task<bool> DeleteProjectAsync(int id);
        Task<List<ProjectDto>> GetFeaturedProjectsAsync(string? languageCode = null);
        Task<List<ProjectCategoryDto>> GetAllCategoriesAsync(string? languageCode = null);
        Task<ProjectCategoryDto?> GetCategoryByIdAsync(int id, string? languageCode = null);
        Task<ProjectCategoryDto> CreateCategoryAsync(CreateProjectCategoryDto dto);
        Task<ProjectCategoryDto> UpdateCategoryAsync(int id, UpdateProjectCategoryDto dto);
        Task<bool> DeleteCategoryAsync(int id);
    }
}


