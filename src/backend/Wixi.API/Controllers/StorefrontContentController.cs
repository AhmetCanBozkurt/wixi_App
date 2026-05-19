using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.ContactSubmissions;
using Wixi.Modules.ECommerce.Application.FaqItems;
using Wixi.Modules.ECommerce.Application.PromoBanners;
using Wixi.Modules.ECommerce.Application.Sliders;
using Wixi.Modules.ECommerce.Application.Testimonials;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/storefront/content")]
[AllowAnonymous]
public class StorefrontContentController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontContentController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns all active testimonials for the storefront.
    /// </summary>
    [HttpGet("testimonials")]
    public async Task<IActionResult> GetTestimonials(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTestimonialsQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Returns all active promo banners for the storefront.
    /// </summary>
    [HttpGet("promo-banners")]
    public async Task<IActionResult> GetPromoBanners(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPromoBannersQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Returns all active sliders with their slides for the storefront.
    /// </summary>
    [HttpGet("sliders")]
    public async Task<IActionResult> GetSliders(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSlidersQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Returns a single slider with its slides by ID.
    /// </summary>
    [HttpGet("sliders/{id}")]
    public async Task<IActionResult> GetSliderById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSliderByIdQuery(id), ct);
        if (result is null)
            return NotFound(new { error = "Slider bulunamadı." });
        return Ok(result);
    }

    /// <summary>
    /// Returns all active FAQ items. Optionally filter by category.
    /// </summary>
    [HttpGet("faq")]
    public async Task<IActionResult> GetFaq([FromQuery] string? category, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFaqItemsQuery(category), ct);
        return Ok(result);
    }

    /// <summary>
    /// Submits a contact form from the public storefront.
    /// </summary>
    [HttpPost("contact")]
    public async Task<IActionResult> SubmitContact(
        [FromBody] StorefrontContactRequest request,
        CancellationToken ct)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var command = new CreateContactSubmissionCommand(
            request.FullName,
            request.Email,
            request.Phone,
            request.Subject,
            request.Message,
            ipAddress);
        var id = await _mediator.Send(command, ct);
        return Ok(new { id, message = "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız." });
    }
}

public record StorefrontContactRequest(
    string FullName,
    string Email,
    string? Phone,
    string? Subject,
    string Message);
