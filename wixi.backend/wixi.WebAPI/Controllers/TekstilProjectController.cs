using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/projects")]
    public class TekstilProjectController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ILogger<TekstilProjectController> _logger;

        public TekstilProjectController(
            IProjectService projectService,
            ILogger<TekstilProjectController> logger)
        {
            _projectService = projectService;
            _logger = logger;
        }

        /// <summary>
        /// Get all projects (Public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProjectDto>>> GetAll([FromQuery] string? lang = null, [FromQuery] int? categoryId = null)
        {
            try
            {
                var projects = await _projectService.GetAllProjectsAsync(lang, categoryId);
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all projects");
                return StatusCode(500, new { message = "An error occurred while retrieving projects" });
            }
        }

        /// <summary>
        /// Get featured projects (Public)
        /// </summary>
        [HttpGet("featured")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProjectDto>>> GetFeatured([FromQuery] string? lang = null)
        {
            try
            {
                var projects = await _projectService.GetFeaturedProjectsAsync(lang);
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured projects");
                return StatusCode(500, new { message = "An error occurred while retrieving featured projects" });
            }
        }

        /// <summary>
        /// Get project by ID (Public)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProjectDto>> GetById(int id, [FromQuery] string? lang = null)
        {
            try
            {
                var project = await _projectService.GetProjectByIdAsync(id, lang);
                if (project == null)
                    return NotFound(new { message = "Project not found" });

                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project by ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the project" });
            }
        }

        /// <summary>
        /// Get project by slug (Public)
        /// </summary>
        [HttpGet("slug/{slug}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProjectDto>> GetBySlug(string slug, [FromQuery] string? lang = null)
        {
            try
            {
                var project = await _projectService.GetProjectBySlugAsync(slug, lang);
                if (project == null)
                    return NotFound(new { message = "Project not found" });

                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project by slug: {Slug}", slug);
                return StatusCode(500, new { message = "An error occurred while retrieving the project" });
            }
        }

        /// <summary>
        /// Create project (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProjectDto>> Create([FromBody] CreateProjectDto dto)
        {
            try
            {
                var project = await _projectService.CreateProjectAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");
                return StatusCode(500, new { message = "An error occurred while creating the project" });
            }
        }

        /// <summary>
        /// Update project (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProjectDto>> Update(int id, [FromBody] UpdateProjectDto dto)
        {
            try
            {
                var project = await _projectService.UpdateProjectAsync(id, dto);
                return Ok(project);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the project" });
            }
        }

        /// <summary>
        /// Delete project (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _projectService.DeleteProjectAsync(id);
                if (!result)
                    return NotFound(new { message = "Project not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the project" });
            }
        }
    }
}


