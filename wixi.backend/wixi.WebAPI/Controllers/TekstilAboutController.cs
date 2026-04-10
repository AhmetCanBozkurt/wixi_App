using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/about")]
    public class TekstilAboutController : ControllerBase
    {
        private readonly IAboutService _aboutService;
        private readonly ILogger<TekstilAboutController> _logger;

        public TekstilAboutController(
            IAboutService aboutService,
            ILogger<TekstilAboutController> logger)
        {
            _aboutService = aboutService;
            _logger = logger;
        }

        /// <summary>
        /// Get all about entries (Public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<AboutDto>>> GetAll([FromQuery] string? lang = null)
        {
            try
            {
                var result = await _aboutService.GetAllAboutAsync(lang);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all about entries");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get active about entry (Public)
        /// </summary>
        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<ActionResult<AboutDto>> GetActive([FromQuery] string? lang = null)
        {
            try
            {
                var result = await _aboutService.GetActiveAboutAsync(lang);
                if (result == null)
                    return NotFound("No active about entry found");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active about entry");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get about by ID (Public)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<AboutDto>> GetById(int id, [FromQuery] string? lang = null)
        {
            try
            {
                var result = await _aboutService.GetAboutByIdAsync(id, lang);
                if (result == null)
                    return NotFound($"About with ID {id} not found");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting about by ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create new about entry (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AboutDto>> Create([FromBody] CreateAboutDto dto)
        {
            try
            {
                var result = await _aboutService.CreateAboutAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating about entry");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update about entry (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AboutDto>> Update(int id, [FromBody] UpdateAboutDto dto)
        {
            try
            {
                var result = await _aboutService.UpdateAboutAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating about entry {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete about entry (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _aboutService.DeleteAboutAsync(id);
                if (!result)
                    return NotFound($"About with ID {id} not found");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting about entry {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}


