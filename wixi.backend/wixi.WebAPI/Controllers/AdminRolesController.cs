using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/roles")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminRolesController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminRolesController> _logger;

    public AdminRolesController(
        WixiDbContext context,
        ILogger<AdminRolesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// List all roles
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> ListRoles()
    {
        try
        {
            var roles = await _context.Roles
                .Select(r => new { r.Id, r.Name })
                .ToListAsync();
            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing roles");
            return StatusCode(500, new { message = "An error occurred while listing roles" });
        }
    }

    /// <summary>
    /// Create a new role
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Role name is required" });

            var exists = await _context.Roles.AnyAsync(r => r.Name == request.Name);
            if (exists)
                return Conflict(new { message = "Role already exists" });

            var role = new wixi.Identity.Entities.Role
            {
                Name = request.Name,
                NormalizedName = request.Name.ToUpperInvariant()
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return Ok(new { id = role.Id, name = role.Name });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role");
            return StatusCode(500, new { message = "An error occurred while creating role" });
        }
    }

    /// <summary>
    /// Get all users (excluding Client role users) with their roles
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult> ListUsers()
    {
        try
        {
            // Get Client role ID to exclude users with this role
            var clientRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == "Client" || r.NormalizedName == "CLIENT");
            
            var usersQuery = _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsQueryable();
            
            // Exclude users with Client role
            if (clientRole != null)
            {
                var clientUserIds = await _context.UserRoles
                    .Where(ur => ur.RoleId == clientRole.Id)
                    .Select(ur => ur.UserId)
                    .ToListAsync();
                
                usersQuery = usersQuery.Where(u => !clientUserIds.Contains(u.Id));
            }
            
            var usersList = await usersQuery.ToListAsync();
            
            // Map to DTO with roles
            var users = usersList.Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.FirstName,
                u.LastName,
                Roles = u.UserRoles != null
                    ? u.UserRoles
                        .Where(ur => ur != null && ur.Role != null && !string.IsNullOrEmpty(ur.Role.Name))
                        .Select(ur => ur.Role!.Name!)
                        .ToList()
                    : new List<string>()
            }).ToList();
            
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing users");
            return StatusCode(500, new { message = "An error occurred while listing users" });
        }
    }

    /// <summary>
    /// Assign role to user
    /// </summary>
    [HttpPost("assign")]
    public async Task<ActionResult> AssignRole([FromBody] ChangeUserRoleRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);
            if (role == null)
                return NotFound(new { message = "Role not found" });

            var exists = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == request.UserId && ur.RoleId == role.Id);

            if (exists)
                return BadRequest(new { message = "User already has this role" });

            var userRole = new wixi.Identity.Entities.UserRole
            {
                UserId = request.UserId,
                RoleId = role.Id
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning role");
            return StatusCode(500, new { message = "An error occurred while assigning role" });
        }
    }

    /// <summary>
    /// Remove role from user
    /// </summary>
    [HttpPost("remove")]
    public async Task<ActionResult> RemoveRole([FromBody] ChangeUserRoleRequest request)
    {
        try
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);
            if (role == null)
                return NotFound(new { message = "Role not found" });

            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserId == request.UserId && ur.RoleId == role.Id);

            if (userRole == null)
                return NotFound(new { message = "User does not have this role" });

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing role");
            return StatusCode(500, new { message = "An error occurred while removing role" });
        }
    }
}

public class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
}

public class ChangeUserRoleRequest
{
    public int UserId { get; set; }
    public string Role { get; set; } = string.Empty;
}

