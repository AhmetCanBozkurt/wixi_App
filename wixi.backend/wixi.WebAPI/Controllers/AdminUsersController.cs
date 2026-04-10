using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.WebAPI.Authorization;
using wixi.Identity.Interfaces;
using wixi.Identity.Entities;
using wixi.Core.Exceptions;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/users")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminUsersController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminUsersController> _logger;
    private readonly IPasswordHasher _passwordHasher;

    public AdminUsersController(
        WixiDbContext context,
        ILogger<AdminUsersController> logger,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _logger = logger;
        _passwordHasher = passwordHasher;
    }

    /// <summary>
    /// Get all users with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(u =>
                    (u.FirstName != null && u.FirstName.ToLower().Contains(s)) ||
                    (u.LastName != null && u.LastName.ToLower().Contains(s)) ||
                    (u.Email != null && u.Email.ToLower().Contains(s)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(s)));
            }

            var total = await query.CountAsync();
            
            // First get the users with pagination
            var usersList = await query
                .OrderByDescending(u => u.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Then map to DTO with roles
            var users = usersList.Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                u.EmailConfirmed,
                u.CreatedAt,
                u.LastLoginAt,
                Roles = u.UserRoles != null
                    ? u.UserRoles
                        .Where(ur => ur != null && ur.Role != null && !string.IsNullOrEmpty(ur.Role.Name))
                        .Select(ur => ur.Role!.Name!)
                        .ToList()
                    : new List<string>()
            }).ToList();

            return Ok(new { success = true, total, page, pageSize, items = users });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching users: {ExceptionType} - {Message} - {StackTrace}", 
                ex.GetType().Name, ex.Message, ex.StackTrace);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching users", error = ex.Message });
        }
    }

    /// <summary>
    /// Get user statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetUserStats()
    {
        try
        {
            var totalUsers = await _context.Users.CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
            var adminCount = await _context.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => ur.Role != null && ur.Role.Name == "Admin")
                .Select(ur => ur.UserId)
                .Distinct()
                .CountAsync();

            return Ok(new
            {
                totalUsers,
                activeUsers,
                inactiveUsers = totalUsers - activeUsers,
                adminCount,
                regularUsers = totalUsers - adminCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user statistics");
            return StatusCode(500, new { message = "An error occurred while fetching user statistics" });
        }
    }

    /// <summary>
    /// Create a new user (excluding Client role)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new ValidationException("Email ve şifre gereklidir.", new Dictionary<string, string[]>
                {
                    { "Email", new[] { "Email gereklidir." } },
                    { "Password", new[] { "Şifre gereklidir." } }
                });
            }

            // Check if user already exists
            var normalizedEmail = request.Email.ToUpperInvariant();
            var existingUser = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

            if (existingUser != null)
            {
                // Check if user has Client role
                var hasClientRole = existingUser.UserRoles
                    .Any(ur => ur.Role != null && 
                          (ur.Role.Name == "Client" || ur.Role.NormalizedName == "CLIENT"));
                
                if (hasClientRole)
                {
                    throw new BusinessException(
                        $"'{request.Email}' email adresi ile zaten bir müşteri (Client) hesabı bulunmaktadır. " +
                        "Müşteri hesapları admin panelinden oluşturulamaz. " +
                        "Eğer bu kullanıcıya admin/çalışan yetkisi vermek istiyorsanız, 'Rol Ata' özelliğini kullanarak mevcut hesaba rol ekleyebilirsiniz.");
                }
                else
                {
                    throw new BusinessException(
                        $"'{request.Email}' email adresi zaten kullanılıyor. " +
                        "Bu email adresi ile başka bir kullanıcı hesabı mevcut.");
                }
            }

            // Create new user
            var user = new User
            {
                UserName = request.Email,
                NormalizedUserName = request.Email.ToUpperInvariant(),
                Email = request.Email,
                NormalizedEmail = normalizedEmail,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                FirstName = request.FirstName ?? string.Empty,
                LastName = request.LastName ?? string.Empty,
                SecurityStamp = Guid.NewGuid().ToString(),
                IsActive = true,
                EmailConfirmed = false,
                PhoneNumberConfirmed = false,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Assign role if provided (excluding Client role)
            if (!string.IsNullOrWhiteSpace(request.Role) && request.Role.ToLower() != "client")
            {
                var role = await _context.Roles
                    .FirstOrDefaultAsync(r => r.Name == request.Role);

                if (role != null)
                {
                    var userRole = new UserRole
                    {
                        UserId = user.Id,
                        RoleId = role.Id,
                        AssignedAt = DateTime.UtcNow
                    };
                    _context.UserRoles.Add(userRole);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName
            });
        }
        catch (ValidationException)
        {
            throw;
        }
        catch (BusinessException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { message = "Kullanıcı oluşturulurken hata oluştu", error = ex.Message });
        }
    }

    public class CreateUserRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Role { get; set; }
    }
}

