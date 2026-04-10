using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/languages")]
    public class TekstilLanguageController : ControllerBase
    {
        private readonly ILanguageService _languageService;
        private readonly ILogger<TekstilLanguageController> _logger;

        public TekstilLanguageController(
            ILanguageService languageService,
            ILogger<TekstilLanguageController> logger)
        {
            _languageService = languageService;
            _logger = logger;
        }

        /// <summary>
        /// Get all languages (Public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<LanguageDto>>> GetAllLanguages()
        {
            try
            {
                var languages = await _languageService.GetAllLanguagesAsync();
                return Ok(languages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all languages");
                return StatusCode(500, new { message = "An error occurred while retrieving languages" });
            }
        }

        /// <summary>
        /// Get language by ID (Public)
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<LanguageDto>> GetLanguageById(int id)
        {
            try
            {
                var language = await _languageService.GetLanguageByIdAsync(id);
                if (language == null)
                    return NotFound(new { message = "Language not found" });

                return Ok(language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting language by ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the language" });
            }
        }

        /// <summary>
        /// Get language by code (Public)
        /// </summary>
        [HttpGet("by-code/{code}")]
        [AllowAnonymous]
        public async Task<ActionResult<LanguageDto>> GetLanguageByCode(string code)
        {
            try
            {
                var language = await _languageService.GetLanguageByCodeAsync(code);
                if (language == null)
                    return NotFound(new { message = "Language not found" });

                return Ok(language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting language by code: {Code}", code);
                return StatusCode(500, new { message = "An error occurred while retrieving the language" });
            }
        }

        /// <summary>
        /// Get default language (Public)
        /// </summary>
        [HttpGet("default")]
        [AllowAnonymous]
        public async Task<ActionResult<LanguageDto>> GetDefaultLanguage()
        {
            try
            {
                var language = await _languageService.GetDefaultLanguageAsync();
                if (language == null)
                    return NotFound(new { message = "Default language not found" });

                return Ok(language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting default language");
                return StatusCode(500, new { message = "An error occurred while retrieving the default language" });
            }
        }

        /// <summary>
        /// Create new language (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<LanguageDto>> CreateLanguage([FromBody] CreateLanguageDto dto)
        {
            try
            {
                var language = await _languageService.CreateLanguageAsync(dto);
                return CreatedAtAction(nameof(GetLanguageById), new { id = language.Id }, language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating language");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update language (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<LanguageDto>> UpdateLanguage(int id, [FromBody] UpdateLanguageDto dto)
        {
            try
            {
                var language = await _languageService.UpdateLanguageAsync(id, dto);
                return Ok(language);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating language: {Id}", id);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete language (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteLanguage(int id)
        {
            try
            {
                var result = await _languageService.DeleteLanguageAsync(id);
                if (!result)
                    return NotFound(new { message = "Language not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting language: {Id}", id);
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}


