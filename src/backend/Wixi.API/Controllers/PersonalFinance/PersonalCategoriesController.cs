using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.PersonalFinance.Application.Categories.Commands.CreatePersonalCategory;
using Wixi.Modules.PersonalFinance.Application.Categories.Commands.UpdatePersonalCategory;
using Wixi.Modules.PersonalFinance.Application.Categories.Commands.DeletePersonalCategory;
using Wixi.Modules.PersonalFinance.Application.Categories.Queries.GetPersonalCategories;
using Wixi.Modules.PersonalFinance.Application.Categories.Queries.GetPersonalCategoryById;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.API.Controllers.PersonalFinance;

[ApiController]
[Route("api/v1/me/finance/categories")]
[Authorize]
public class PersonalCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUser;

    public PersonalCategoriesController(IMediator mediator, ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    private Guid GetUserId() => Guid.Parse(_currentUser.UserId!);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PersonalCategoryType? type = null)
    {
        var result = await _mediator.Send(new GetPersonalCategoriesQuery
        {
            UserId = GetUserId(),
            Type = type,
        });
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new GetPersonalCategoryByIdQuery
            {
                CategoryId = id,
                UserId = GetUserId(),
            });
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePersonalCategoryDto dto)
    {
        try
        {
            var result = await _mediator.Send(new CreatePersonalCategoryCommand
            {
                UserId = GetUserId(),
                Dto = dto,
            });
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePersonalCategoryDto dto)
    {
        try
        {
            var result = await _mediator.Send(new UpdatePersonalCategoryCommand
            {
                CategoryId = id,
                UserId = GetUserId(),
                Dto = dto,
            });
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _mediator.Send(new DeletePersonalCategoryCommand
        {
            CategoryId = id,
            UserId = GetUserId(),
        });

        if (!deleted) return NotFound(new { success = false, message = "Kategori bulunamadı." });
        return Ok(new { success = true, message = "Kategori silindi." });
    }
}
