using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/contact-info")]
    public class TekstilContactInfoController : ControllerBase
    {
        private readonly IContactService _contactService;
        private readonly ILogger<TekstilContactInfoController> _logger;

        public TekstilContactInfoController(
            IContactService contactService,
            ILogger<TekstilContactInfoController> logger)
        {
            _contactService = contactService;
            _logger = logger;
        }

        /// <summary>
        /// Get active contact info (Public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ContactInfoDto>> GetContactInfo([FromQuery] string? lang = null)
        {
            try
            {
                var contactInfo = await _contactService.GetContactInfoAsync(lang);
                if (contactInfo == null)
                    return NotFound(new { message = "Contact info not found" });

                return Ok(contactInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contact info");
                return StatusCode(500, new { message = "An error occurred while retrieving contact info" });
            }
        }

        /// <summary>
        /// Create or update contact info (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ContactInfoDto>> CreateOrUpdate([FromBody] CreateOrUpdateContactInfoDto dto)
        {
            try
            {
                var contactInfo = await _contactService.CreateOrUpdateContactInfoAsync(dto);
                return Ok(contactInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating/updating contact info");
                return StatusCode(500, new { message = "An error occurred while saving contact info" });
            }
        }
    }
}


