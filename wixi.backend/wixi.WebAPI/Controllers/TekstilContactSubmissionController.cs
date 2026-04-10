using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Controllers
{
    [ApiController]
    [Route("api/v1.0/tekstil/contact-submissions")]
    public class TekstilContactSubmissionController : ControllerBase
    {
        private readonly IContactService _contactService;
        private readonly ILogger<TekstilContactSubmissionController> _logger;

        public TekstilContactSubmissionController(
            IContactService contactService,
            ILogger<TekstilContactSubmissionController> logger)
        {
            _contactService = contactService;
            _logger = logger;
        }

        /// <summary>
        /// Get all contact submissions (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<ContactSubmissionDto>>> GetAll()
        {
            try
            {
                var submissions = await _contactService.GetAllSubmissionsAsync();
                return Ok(submissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all contact submissions");
                return StatusCode(500, new { message = "An error occurred while retrieving contact submissions" });
            }
        }

        /// <summary>
        /// Get contact submission by ID (Admin only)
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ContactSubmissionDto>> GetById(int id)
        {
            try
            {
                var submission = await _contactService.GetSubmissionByIdAsync(id);
                if (submission == null)
                    return NotFound(new { message = "Contact submission not found" });

                return Ok(submission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting contact submission by ID: {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the contact submission" });
            }
        }

        /// <summary>
        /// Create contact submission (Public)
        /// </summary>
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<ContactSubmissionDto>> Create([FromBody] CreateContactSubmissionDto dto)
        {
            try
            {
                var submission = await _contactService.CreateSubmissionAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = submission.Id }, submission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contact submission");
                return StatusCode(500, new { message = "An error occurred while creating the contact submission" });
            }
        }

        /// <summary>
        /// Update contact submission status (Admin only)
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ContactSubmissionDto>> UpdateStatus(int id, [FromBody] UpdateContactSubmissionStatusDto dto)
        {
            try
            {
                var submission = await _contactService.UpdateSubmissionStatusAsync(id, dto);
                return Ok(submission);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contact submission status {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the contact submission" });
            }
        }

        /// <summary>
        /// Delete contact submission (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _contactService.DeleteSubmissionAsync(id);
                if (!result)
                    return NotFound(new { message = "Contact submission not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting contact submission {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the contact submission" });
            }
        }
    }
}


