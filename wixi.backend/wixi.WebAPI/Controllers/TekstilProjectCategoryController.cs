using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/project-categories")]
    public class TekstilProjectCategoryController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ILogger<TekstilProjectCategoryController> _logger;

        public TekstilProjectCategoryController(
            IProjectService projectService,
            ILogger<TekstilProjectCategoryController> logger)
        {
            _projectService = projectService;
            _logger = logger;
        }

        /// <summary>
        /// Get all project categories (Public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProjectCategoryDto>>> GetAll([FromQuery] string? lang = null)
        {
            try
            {
                var categories = await _projectService.GetAllCategoriesAsync(lang);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all project categories");
                return StatusCode(500, new { message = "An error occurred while retrieving project categories" });
            }
        }

        /// <summary>
        /// Get project category by ID (Public)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProjectCategoryDto>> GetById(int id, [FromQuery] string? lang = null)
        {
            try
            {
                var category = await _projectService.GetCategoryByIdAsync(id, lang);
                if (category == null)
                    return NotFound(new { message = "Project category not found" });

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project category by ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the project category" });
            }
        }

        /// <summary>
        /// Create project category (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProjectCategoryDto>> Create([FromBody] CreateProjectCategoryDto dto)
        {
            try
            {
                var category = await _projectService.CreateCategoryAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project category");
                return StatusCode(500, new { message = "An error occurred while creating the project category" });
            }
        }

        /// <summary>
        /// Update project category (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProjectCategoryDto>> Update(int id, [FromBody] UpdateProjectCategoryDto dto)
        {
            try
            {
                var category = await _projectService.UpdateCategoryAsync(id, dto);
                return Ok(category);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project category {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the project category" });
            }
        }

        /// <summary>
        /// Delete project category (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _projectService.DeleteCategoryAsync(id);
                if (!result)
                    return NotFound(new { message = "Project category not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project category {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the project category" });
            }
        }
    }
}


