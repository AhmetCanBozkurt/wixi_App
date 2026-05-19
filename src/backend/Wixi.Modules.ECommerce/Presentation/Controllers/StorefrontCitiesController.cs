using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Cities;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/public/storefront/cities")]
public class StorefrontCitiesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetCities()
    {
        var sorted = TurkishCities.All.OrderBy(c => c).ToList();
        return Ok(sorted);
    }
}
