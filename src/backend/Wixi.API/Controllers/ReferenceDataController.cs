using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.SystemPage.Commands;
using Wixi.Modules.Core.Application.ReferenceData.SystemPage.Queries;
using Wixi.Modules.Core.Application.ReferenceData.Region.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Region.Queries;
using Wixi.Modules.Core.Application.ReferenceData.Port.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Port.Queries;
using Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Commands;
using Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Queries;
using Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Commands;
using Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Queries;
using Wixi.Modules.Core.Application.ReferenceData.Incoterm.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Incoterm.Queries;
using Wixi.Modules.Core.Application.ReferenceData.TransportMode.Commands;
using Wixi.Modules.Core.Application.ReferenceData.TransportMode.Queries;
using Wixi.Modules.Core.Application.ReferenceData.PackageType.Commands;
using Wixi.Modules.Core.Application.ReferenceData.PackageType.Queries;
using Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Commands;
using Wixi.Modules.Core.Application.ReferenceData.UnitCategory.Queries;
using Wixi.Modules.Core.Application.ReferenceData.Unit.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Unit.Queries;
using Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Commands;
using Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Queries;
using Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Commands;
using Wixi.Modules.Core.Application.ReferenceData.ServiceCategory.Queries;
using Wixi.Modules.Core.Application.ReferenceData.Service.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Service.Queries;
using Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Commands;
using Wixi.Modules.Core.Application.ReferenceData.ProductDescription.Queries;
using Wixi.Modules.Core.Application.ReferenceData.HsCode.Commands;
using Wixi.Modules.Core.Application.ReferenceData.HsCode.Queries;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/ref")]
public class ReferenceDataController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReferenceDataController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // ── Regions ────────────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("regions")]
    public async Task<IActionResult> GetRegions()
    {
        var result = await _mediator.Send(new GetRegionsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("regions")]
    public async Task<IActionResult> CreateRegion([FromBody] CreateRegionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("regions")]
    public async Task<IActionResult> UpdateRegion([FromBody] UpdateRegionCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("regions/{id}")]
    public async Task<IActionResult> DeleteRegion(Guid id)
    {
        var result = await _mediator.Send(new DeleteRegionCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Ports ──────────────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("ports")]
    public async Task<IActionResult> GetPorts()
    {
        var result = await _mediator.Send(new GetPortsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("ports")]
    public async Task<IActionResult> CreatePort([FromBody] CreatePortCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("ports")]
    public async Task<IActionResult> UpdatePort([FromBody] UpdatePortCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("ports/{id}")]
    public async Task<IActionResult> DeletePort(Guid id)
    {
        var result = await _mediator.Send(new DeletePortCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Payment Terms ──────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("payment-terms")]
    public async Task<IActionResult> GetPaymentTerms()
    {
        var result = await _mediator.Send(new GetPaymentTermsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("payment-terms")]
    public async Task<IActionResult> CreatePaymentTerm([FromBody] CreatePaymentTermCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("payment-terms")]
    public async Task<IActionResult> UpdatePaymentTerm([FromBody] UpdatePaymentTermCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("payment-terms/{id}")]
    public async Task<IActionResult> DeletePaymentTerm(Guid id)
    {
        var result = await _mediator.Send(new DeletePaymentTermCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Tax Offices ────────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("tax-offices")]
    public async Task<IActionResult> GetTaxOffices()
    {
        var result = await _mediator.Send(new GetTaxOfficesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("tax-offices")]
    public async Task<IActionResult> CreateTaxOffice([FromBody] CreateTaxOfficeCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("tax-offices")]
    public async Task<IActionResult> UpdateTaxOffice([FromBody] UpdateTaxOfficeCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("tax-offices/{id}")]
    public async Task<IActionResult> DeleteTaxOffice(Guid id)
    {
        var result = await _mediator.Send(new DeleteTaxOfficeCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Incoterms ──────────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("incoterms")]
    public async Task<IActionResult> GetIncoterms()
    {
        var result = await _mediator.Send(new GetIncotermsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("incoterms")]
    public async Task<IActionResult> CreateIncoterm([FromBody] CreateIncotermCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("incoterms")]
    public async Task<IActionResult> UpdateIncoterm([FromBody] UpdateIncotermCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("incoterms/{id}")]
    public async Task<IActionResult> DeleteIncoterm(Guid id)
    {
        var result = await _mediator.Send(new DeleteIncotermCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Transport Modes ────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("transport-modes")]
    public async Task<IActionResult> GetTransportModes()
    {
        var result = await _mediator.Send(new GetTransportModesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("transport-modes")]
    public async Task<IActionResult> CreateTransportMode([FromBody] CreateTransportModeCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("transport-modes")]
    public async Task<IActionResult> UpdateTransportMode([FromBody] UpdateTransportModeCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("transport-modes/{id}")]
    public async Task<IActionResult> DeleteTransportMode(Guid id)
    {
        var result = await _mediator.Send(new DeleteTransportModeCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Package Types ──────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("package-types")]
    public async Task<IActionResult> GetPackageTypes()
    {
        var result = await _mediator.Send(new GetPackageTypesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("package-types")]
    public async Task<IActionResult> CreatePackageType([FromBody] CreatePackageTypeCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("package-types")]
    public async Task<IActionResult> UpdatePackageType([FromBody] UpdatePackageTypeCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("package-types/{id}")]
    public async Task<IActionResult> DeletePackageType(Guid id)
    {
        var result = await _mediator.Send(new DeletePackageTypeCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Unit Categories ────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("unit-categories")]
    public async Task<IActionResult> GetUnitCategories()
    {
        var result = await _mediator.Send(new GetUnitCategoriesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("unit-categories")]
    public async Task<IActionResult> CreateUnitCategory([FromBody] CreateUnitCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("unit-categories")]
    public async Task<IActionResult> UpdateUnitCategory([FromBody] UpdateUnitCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("unit-categories/{id}")]
    public async Task<IActionResult> DeleteUnitCategory(Guid id)
    {
        var result = await _mediator.Send(new DeleteUnitCategoryCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Units ──────────────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("units")]
    public async Task<IActionResult> GetUnits()
    {
        var result = await _mediator.Send(new GetUnitsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("units")]
    public async Task<IActionResult> CreateUnit([FromBody] CreateUnitCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("units")]
    public async Task<IActionResult> UpdateUnit([FromBody] UpdateUnitCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("units/{id}")]
    public async Task<IActionResult> DeleteUnit(Guid id)
    {
        var result = await _mediator.Send(new DeleteUnitCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Unit Conversions ───────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("unit-conversions")]
    public async Task<IActionResult> GetUnitConversions()
    {
        var result = await _mediator.Send(new GetUnitConversionsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("unit-conversions")]
    public async Task<IActionResult> CreateUnitConversion([FromBody] CreateUnitConversionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("unit-conversions")]
    public async Task<IActionResult> UpdateUnitConversion([FromBody] UpdateUnitConversionCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("unit-conversions/{id}")]
    public async Task<IActionResult> DeleteUnitConversion(Guid id)
    {
        var result = await _mediator.Send(new DeleteUnitConversionCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Service Categories ─────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("service-categories")]
    public async Task<IActionResult> GetServiceCategories()
    {
        var result = await _mediator.Send(new GetServiceCategoriesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("service-categories")]
    public async Task<IActionResult> CreateServiceCategory([FromBody] CreateServiceCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("service-categories")]
    public async Task<IActionResult> UpdateServiceCategory([FromBody] UpdateServiceCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("service-categories/{id}")]
    public async Task<IActionResult> DeleteServiceCategory(Guid id)
    {
        var result = await _mediator.Send(new DeleteServiceCategoryCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Services ───────────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var result = await _mediator.Send(new GetServicesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("services")]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("services")]
    public async Task<IActionResult> UpdateService([FromBody] UpdateServiceCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("services/{id}")]
    public async Task<IActionResult> DeleteService(Guid id)
    {
        var result = await _mediator.Send(new DeleteServiceCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── Product Descriptions ───────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("product-descriptions")]
    public async Task<IActionResult> GetProductDescriptions()
    {
        var result = await _mediator.Send(new GetProductDescriptionsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("product-descriptions")]
    public async Task<IActionResult> CreateProductDescription([FromBody] CreateProductDescriptionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("product-descriptions")]
    public async Task<IActionResult> UpdateProductDescription([FromBody] UpdateProductDescriptionCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("product-descriptions/{id}")]
    public async Task<IActionResult> DeleteProductDescription(Guid id)
    {
        var result = await _mediator.Send(new DeleteProductDescriptionCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── HS Codes ───────────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("hs-codes")]
    public async Task<IActionResult> GetHsCodes()
    {
        var result = await _mediator.Send(new GetHsCodesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("hs-codes")]
    public async Task<IActionResult> CreateHsCode([FromBody] CreateHsCodeCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("hs-codes")]
    public async Task<IActionResult> UpdateHsCode([FromBody] UpdateHsCodeCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("hs-codes/{id}")]
    public async Task<IActionResult> DeleteHsCode(Guid id)
    {
        var result = await _mediator.Send(new DeleteHsCodeCommand(id));
        return result ? Ok() : BadRequest();
    }

    // ── System Pages ───────────────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("system-pages")]
    public async Task<IActionResult> GetSystemPages()
    {
        var result = await _mediator.Send(new GetSystemPagesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("system-pages")]
    public async Task<IActionResult> CreateSystemPage([FromBody] CreateSystemPageCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("system-pages")]
    public async Task<IActionResult> UpdateSystemPage([FromBody] UpdateSystemPageCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("system-pages/{id}")]
    public async Task<IActionResult> DeleteSystemPage(Guid id)
    {
        var result = await _mediator.Send(new DeleteSystemPageCommand(id));
        return result ? Ok() : BadRequest();
    }
}
