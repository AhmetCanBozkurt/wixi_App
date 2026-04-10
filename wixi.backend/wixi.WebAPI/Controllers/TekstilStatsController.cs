using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/stats")]
    public class TekstilStatsController : ControllerBase
    {
        private readonly IStatsService _statsService;
        private readonly ILogger<TekstilStatsController> _logger;

        public TekstilStatsController(
            IStatsService statsService,
            ILogger<TekstilStatsController> logger)
        {
            _statsService = statsService;
            _logger = logger;
        }

        /// <summary>
        /// Get all stats (Public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<StatDto>>> GetAll([FromQuery] string? lang = null)
        {
            try
            {
                var result = await _statsService.GetAllStatsAsync(lang);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all stats");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get active stats (Public)
        /// </summary>
        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<ActionResult<List<StatDto>>> GetActive([FromQuery] string? lang = null)
        {
            try
            {
                var result = await _statsService.GetActiveStatsAsync(lang);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active stats");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get stat by ID (Public)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<StatDto>> GetById(int id, [FromQuery] string? lang = null)
        {
            try
            {
                var result = await _statsService.GetStatByIdAsync(id, lang);
                if (result == null)
                    return NotFound($"Stat with ID {id} not found");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stat by ID {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create new stat (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StatDto>> Create([FromBody] CreateStatDto dto)
        {
            try
            {
                var result = await _statsService.CreateStatAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating stat");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update stat (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StatDto>> Update(int id, [FromBody] UpdateStatDto dto)
        {
            try
            {
                var result = await _statsService.UpdateStatAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stat {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete stat (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _statsService.DeleteStatAsync(id);
                if (!result)
                    return NotFound($"Stat with ID {id} not found");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting stat {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}


