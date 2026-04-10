using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using wixi.Core.Exceptions;
using wixi.DataAccess;
using wixi.Email.DTOs;
using wixi.Email.Interfaces;
using wixi.Identity.DTOs;
using wixi.Identity.Entities;
using wixi.Identity.Interfaces;
using wixi.Clients.Entities;
using wixi.Applications.Entities;

namespace wixi.WebAPI.Services;

public class AuthService : IAuthService
{
    private readonly WixiDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        WixiDbContext context,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        IEmailSender emailSender,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _emailSender = emailSender;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto, string ipAddress, string userAgent)
    {
        // Normalize inputs
        var normalizedUserName = registerDto.UserName.ToUpperInvariant();
        var normalizedEmail = registerDto.Email.ToUpperInvariant();
        
        // Check if user already exists (by username or email)
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => 
                u.NormalizedUserName == normalizedUserName || 
                u.NormalizedEmail == normalizedEmail);

        if (existingUser != null)
        {
            if (existingUser.NormalizedUserName == normalizedUserName)
                throw new BusinessException("Username is already taken", statusCode: 409);
            else
                throw new BusinessException("Email is already registered", statusCode: 409);
        }

        // Create new user with all Identity features
        var user = new User
        {
            UserName = registerDto.UserName,
            NormalizedUserName = normalizedUserName,
            Email = registerDto.Email,
            NormalizedEmail = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(registerDto.Password),
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            PhoneNumber = registerDto.PhoneNumber,
            SecurityStamp = Guid.NewGuid().ToString(),
            // ConcurrencyStamp will be set automatically by EF Core Identity
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

        // Assign default "Client" role
        var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Client");
        if (clientRole != null)
        {
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = clientRole.Id,
                AssignedAt = DateTime.UtcNow
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();
        }

        // Generate tokens
        var roles = new List<string> { "Client" };
        var accessToken = _jwtService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10080), // 7 days
            CreatedAt = DateTime.UtcNow,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        // Create Client entity for the registered user
        try
        {
            // Check if client code is provided (from PendingClientCode)
            string clientCode;
            PendingClientCode? pendingCode = null;
            
            if (!string.IsNullOrWhiteSpace(registerDto.ClientCode))
            {
                // Use provided client code and mark pending code as used
                pendingCode = await _context.PendingClientCodes
                    .FirstOrDefaultAsync(p => p.ClientCode == registerDto.ClientCode && !p.IsUsed);
                
                if (pendingCode != null)
                {
                    clientCode = pendingCode.ClientCode;
                    // Mark pending code as used
                    pendingCode.IsUsed = true;
                    pendingCode.UsedAt = DateTime.UtcNow;
                }
                else
                {
                    // Code provided but not found or already used - generate new one
                    clientCode = await GenerateUniqueClientCodeAsync();
                }
            }
            else
            {
                // Generate new client code
                clientCode = await GenerateUniqueClientCodeAsync();
            }

            // Create Client entity
            var client = new Client
            {
                UserId = user.Id,
                ClientCode = clientCode,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                Phone = registerDto.PhoneNumber ?? string.Empty,
                DateOfBirth = registerDto.DateOfBirth,
                Address = registerDto.Address,
                Nationality = registerDto.Nationality,
                EducationTypeId = registerDto.EducationTypeId,
                RegistrationDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Clients.Add(client);
            
            // Save pending code update if exists
            if (pendingCode != null)
            {
                _context.PendingClientCodes.Update(pendingCode);
            }
            
            await _context.SaveChangesAsync();

            // Add education history if provided
            if (registerDto.EducationHistory != null && registerDto.EducationHistory.Any())
            {
                try
                {
                    foreach (var eduItem in registerDto.EducationHistory)
                    {
                        if (!Enum.TryParse<EducationLevel>(eduItem.Level, true, out var educationLevel))
                        {
                            // Default to Bachelor if parsing fails
                            educationLevel = EducationLevel.Bachelor;
                        }

                        var educationInfo = new EducationInfo
                        {
                            ClientId = client.Id,
                            Level = educationLevel,
                            Degree = eduItem.Degree,
                            Institution = eduItem.Institution,
                            FieldOfStudy = eduItem.FieldOfStudy,
                            StartDate = eduItem.StartDate,
                            GraduationDate = eduItem.GraduationDate,
                            Country = eduItem.Country,
                            City = eduItem.City,
                            IsCurrent = eduItem.IsCurrent,
                            GPA = eduItem.GPA,
                            Description = eduItem.Description,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.EducationInfos.Add(educationInfo);
                    }
                    
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Education history added for client {ClientId}: {Count} entries", client.Id, registerDto.EducationHistory.Count);
                }
                catch (Exception eduEx)
                {
                    _logger.LogWarning(eduEx, "Failed to add education history for client {ClientId}. Client creation succeeded.", client.Id);
                    // Don't fail registration if education history creation fails
                }
            }

            _logger.LogInformation("Client profile created for user {UserId} with client code {ClientCode}", user.Id, clientCode);

            // Create default application if default template exists
            try
            {
                var defaultTemplate = await _context.ApplicationTemplates
                    .Include(t => t.StepTemplates)
                        .ThenInclude(st => st.SubStepTemplates)
                    .FirstOrDefaultAsync(t => t.IsDefault && t.IsActive);

                if (defaultTemplate != null)
                {
                    await CreateApplicationFromTemplateAsync(client.Id, defaultTemplate.Id, user.Id);
                    _logger.LogInformation("Default application created for client {ClientId} using template {TemplateId}", client.Id, defaultTemplate.Id);
                }
            }
            catch (Exception appEx)
            {
                _logger.LogWarning(appEx, "Failed to create default application for client {ClientId}. User registration succeeded.", client.Id);
                // Don't fail registration if application creation fails
            }
        }
        catch (Exception clientEx)
        {
            _logger.LogError(clientEx, "Failed to create client profile for user {UserId}. User registration succeeded but client profile creation failed.", user.Id);
            // Don't fail registration if client creation fails - user can create client profile later
        }

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                IsActive = user.IsActive,
                Roles = roles
            }
        };
    }

    private async Task<string> GenerateUniqueClientCodeAsync()
    {
        bool isUnique = false;
        int attempts = 0;
        const int maxAttempts = 10;
        string clientCode;

        do
        {
            clientCode = $"CL-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(10000, 99999)}";
            var codeExists = await _context.Clients.AnyAsync(c => c.ClientCode == clientCode && c.DeletedAt == null) ||
                             await _context.PendingClientCodes.AnyAsync(p => p.ClientCode == clientCode);
            isUnique = !codeExists;
            attempts++;
        } while (!isUnique && attempts < maxAttempts);

        if (!isUnique)
        {
            throw new BusinessException("Failed to generate unique ClientCode after multiple attempts");
        }

        return clientCode;
    }

    private async Task CreateApplicationFromTemplateAsync(int clientId, int templateId, int userId)
    {
        // Get template with steps
        var template = await _context.ApplicationTemplates
            .Include(t => t.StepTemplates)
                .ThenInclude(st => st.SubStepTemplates)
            .FirstOrDefaultAsync(t => t.Id == templateId && t.IsActive);

        if (template == null)
        {
            _logger.LogWarning("Template {TemplateId} not found or inactive. Cannot create application for client {ClientId}.", templateId, clientId);
            return;
        }

        // Create application
        var application = new Application
        {
            ClientId = clientId,
            ApplicationTemplateId = templateId,
            Type = template.Type,
            Status = ApplicationStatus.InProgress,
            StartDate = DateTime.UtcNow,
            ExpectedCompletionDate = DateTime.UtcNow.AddDays(template.EstimatedDurationDays ?? 30),
            ApplicationNumber = $"APP-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(10000, 99999)}"
        };

        _context.Applications.Add(application);
        await _context.SaveChangesAsync();

        // Log template info for debugging
        _logger.LogInformation("Creating application from template {TemplateId}. StepTemplates count: {StepCount}", 
            templateId, template.StepTemplates?.Count ?? 0);

        // Create steps from template
        if (template.StepTemplates == null || !template.StepTemplates.Any())
        {
            _logger.LogWarning("Template {TemplateId} has no StepTemplates. Application {ApplicationId} created without steps.", 
                templateId, application.Id);
            return;
        }

        bool isFirstStep = true;
        var activeStepTemplates = template.StepTemplates
            .Where(st => st.IsActive)
            .OrderBy(st => st.StepOrder)
            .ToList();

        _logger.LogInformation("Active StepTemplates count: {Count} for template {TemplateId}", 
            activeStepTemplates.Count, templateId);

        foreach (var stepTemplate in activeStepTemplates)
        {
            var step = new ApplicationStep
            {
                ApplicationId = application.Id,
                StepTemplateId = stepTemplate.Id,
                Title = stepTemplate.Title_TR ?? stepTemplate.Title_EN ?? stepTemplate.Title_DE ?? $"Step {stepTemplate.StepOrder}",
                StepOrder = stepTemplate.StepOrder,
                Status = isFirstStep ? StepStatus.InProgress : StepStatus.NotStarted
            };

            if (isFirstStep)
            {
                step.StartDate = DateTime.UtcNow;
            }

            _context.ApplicationSteps.Add(step);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created ApplicationStep {StepId} (Order: {StepOrder}) for application {ApplicationId}", 
                step.Id, step.StepOrder, application.Id);

            // Create sub-steps from template
            if (stepTemplate.SubStepTemplates == null || !stepTemplate.SubStepTemplates.Any())
            {
                _logger.LogWarning("StepTemplate {StepTemplateId} has no SubStepTemplates for application {ApplicationId}", 
                    stepTemplate.Id, application.Id);
            }
            else
            {
                bool isFirstSubStep = true;
                var activeSubStepTemplates = stepTemplate.SubStepTemplates
                    .Where(sst => sst.IsActive)
                    .OrderBy(sst => sst.SubStepOrder)
                    .ToList();

                _logger.LogInformation("Active SubStepTemplates count: {Count} for StepTemplate {StepTemplateId}", 
                    activeSubStepTemplates.Count, stepTemplate.Id);

                foreach (var subStepTemplate in activeSubStepTemplates)
                {
                    var isFirstSubStepOfFirstStep = isFirstStep && isFirstSubStep;
                    var subStepStatus = isFirstSubStepOfFirstStep ? StepStatus.InProgress : StepStatus.NotStarted;
                    
                    var subStep = new ApplicationSubStep
                    {
                        ApplicationStepId = step.Id,
                        SubStepTemplateId = subStepTemplate.Id,
                        Name = subStepTemplate.Name_TR ?? subStepTemplate.Name_EN ?? subStepTemplate.Name_DE ?? $"SubStep {subStepTemplate.SubStepOrder}",
                        SubStepOrder = subStepTemplate.SubStepOrder,
                        Status = subStepStatus
                    };

                    _context.ApplicationSubSteps.Add(subStep);
                    isFirstSubStep = false;

                    _logger.LogInformation("Created ApplicationSubStep {SubStepId} (Order: {SubStepOrder}) for step {StepId}", 
                        subStep.Id, subStep.SubStepOrder, step.Id);
                }

                // Save all substeps for this step at once (more efficient)
                await _context.SaveChangesAsync();
            }

            isFirstStep = false;
        }

        // Final save (should already be saved, but ensure all changes are persisted)
        await _context.SaveChangesAsync();

        _logger.LogInformation("Application {ApplicationId} created successfully with {StepCount} steps from template {TemplateId}", 
            application.Id, activeStepTemplates.Count, templateId);

        // Add history entry
        var history = new ApplicationHistory
        {
            ApplicationId = application.Id,
            Action = "Created",
            Description = $"Application created automatically during registration using template: {template.Name_TR}",
            UserId = userId,
            UserType = "Client",
            CreatedAt = DateTime.UtcNow
        };
        
        _context.ApplicationHistories.Add(history);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Application {ApplicationId} created automatically for client {ClientId} using template {TemplateId}", 
            application.Id, clientId, templateId);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto, string ipAddress, string userAgent)
    {
        // Normalize input for search
        var normalizedInput = loginDto.UserNameOrEmail.ToUpperInvariant();
        
        // Find user by username or email
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => 
                u.NormalizedUserName == normalizedInput || 
                u.NormalizedEmail == normalizedInput);

        if (user == null)
            throw new UnauthorizedException("Invalid username/email or password");

        // Verify password
        if (string.IsNullOrEmpty(user.PasswordHash) || !_passwordHasher.VerifyPassword(loginDto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid username/email or password");

        // Check if user is active
        if (!user.IsActive)
            throw new ForbiddenException("User account is disabled");

        // Get roles (handle null Role.Name)
        var roles = user.UserRoles
            .Where(ur => ur.Role != null && ur.Role!.Name != null)
            .Select(ur => ur.Role!.Name!)
            .ToList();
        
        // If no roles, assign default "Client" role
        if (roles.Count == 0)
        {
            var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Client");
            if (clientRole != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = clientRole.Id,
                    AssignedAt = DateTime.UtcNow
                };
                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();
                roles = new List<string> { "Client" };
            }
        }

        // Generate tokens
        var accessToken = _jwtService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10080), // 7 days
            CreatedAt = DateTime.UtcNow,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        _context.RefreshTokens.Add(refreshTokenEntity);

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName ?? user.Email ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                IsActive = user.IsActive,
                Roles = roles
            }
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent)
    {
        // Find refresh token
        var tokenEntity = await _context.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (tokenEntity == null || !tokenEntity.IsActive)
            throw new UnauthorizedException("Invalid or expired refresh token");

        var user = tokenEntity.User;

        // Check if user is active
        if (!user.IsActive)
            throw new ForbiddenException("User account is disabled");

        // Get roles
        var roles = user.UserRoles
            .Where(ur => ur.Role != null && ur.Role!.Name != null)
            .Select(ur => ur.Role!.Name!)
            .ToList();

        // Generate new tokens
        var accessToken = _jwtService.GenerateAccessToken(user, roles);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        // Revoke old token
        tokenEntity.IsRevoked = true;
        tokenEntity.RevokedAt = DateTime.UtcNow;

        // Save new refresh token
        var newTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10080), // 7 days
            CreatedAt = DateTime.UtcNow,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        _context.RefreshTokens.Add(newTokenEntity);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName ?? user.Email ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                IsActive = user.IsActive,
                Roles = roles
            }
        };
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (tokenEntity == null)
            throw new NotFoundException("Refresh token not found");

        if (tokenEntity.IsRevoked)
            throw new BusinessException("Token already revoked");

        tokenEntity.IsRevoked = true;
        tokenEntity.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? user.Email ?? string.Empty,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName ?? string.Empty,
            LastName = user.LastName ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            IsActive = user.IsActive,
            Roles = user.UserRoles
                .Where(ur => ur.Role != null && ur.Role!.Name != null)
                .Select(ur => ur.Role!.Name!)
                .ToList()
        };
    }

    /// <summary>
    /// Logout user by blacklisting the access token
    /// </summary>
    public async Task<bool> LogoutAsync(string accessToken, int userId, string reason = "User logout")
    {
        if (string.IsNullOrEmpty(accessToken))
            throw new BusinessException("Access token is required");

        try
        {
            // Parse JWT token to get expiration date
            var tokenHandler = new JwtSecurityTokenHandler();
            
            // Validate token format
            if (!tokenHandler.CanReadToken(accessToken))
                throw new BusinessException("Invalid token format");

            var jwtToken = tokenHandler.ReadJwtToken(accessToken);
            
            // Check if token already blacklisted
            var existingBlacklist = await _context.TokenBlacklists
                .FirstOrDefaultAsync(t => t.Token == accessToken);

            if (existingBlacklist != null)
            {
                // Already blacklisted, return success
                return true;
            }

            // Add token to blacklist
            var tokenBlacklist = new TokenBlacklist
            {
                Token = accessToken,
                UserId = userId,
                BlacklistedAt = DateTime.UtcNow,
                ExpirationDate = jwtToken.ValidTo,
                Reason = reason
            };

            _context.TokenBlacklists.Add(tokenBlacklist);
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception ex) when (ex is not BusinessException)
        {
            throw new BusinessException($"Failed to logout: {ex.Message}");
        }
    }

    /// <summary>
    /// Blacklist all active tokens for a specific user (e.g., password reset, account suspended)
    /// </summary>
    public async Task<int> LogoutAllUserSessionsAsync(int userId, string reason = "Logout all sessions")
    {
        // Get all active refresh tokens for user
        var activeRefreshTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync();

        // Revoke all refresh tokens
        foreach (var token in activeRefreshTokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return activeRefreshTokens.Count;
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto, string resetUrlBase)
    {
        // Normalize email
        var normalizedEmail = forgotPasswordDto.Email.ToUpperInvariant();

        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        // Don't reveal if user exists or not (security best practice)
        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("Password reset requested for non-existent or inactive user: {Email}", forgotPasswordDto.Email);
            // Return success anyway to prevent email enumeration
            return;
        }

        // Generate reset token
        var token = GeneratePasswordResetToken(user.Id, user.Email ?? string.Empty);
        // URL encode token (Base64 may contain +, /, = characters that need encoding)
        var encodedToken = Uri.EscapeDataString(token);
        var resetUrl = $"{resetUrlBase}?token={encodedToken}&email={Uri.EscapeDataString(user.Email ?? string.Empty)}";
        
        _logger.LogInformation("Generated password reset token for user {UserId}, email {Email}. Token length: {TokenLength}", 
            user.Id, user.Email, token.Length);

        // Send email
        var emailMessage = new EmailMessage
        {
            To = new List<string> { user.Email ?? string.Empty },
            Subject = "Şifre Sıfırlama - Worklines Pro",
            BodyHtml = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Şifre Sıfırlama İsteği</h2>
                    <p>Merhaba {user.FirstName} {user.LastName},</p>
                    <p>Hesabınız için şifre sıfırlama isteği aldık. Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                    <p><a href='{resetUrl}' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>Şifremi Sıfırla</a></p>
                    <p>Veya bu bağlantıyı tarayıcınıza kopyalayın:</p>
                    <p style='word-break: break-all;'>{resetUrl}</p>
                    <p><strong>Bu bağlantı 1 saat geçerlidir.</strong></p>
                    <p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
                    <hr>
                    <p style='color: #666; font-size: 12px;'>© 2024 Worklines Pro Consulting. All rights reserved.</p>
                </body>
                </html>",
            CorrelationId = Guid.NewGuid().ToString(),
            Metadata = new Dictionary<string, string>
            {
                { "Type", "PasswordReset" },
                { "UserId", user.Id.ToString() },
                { "Email", user.Email ?? string.Empty }
            }
        };

        try
        {
            await _emailSender.SendAsync(emailMessage);
            _logger.LogInformation("Password reset email sent to: {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to: {Email}", user.Email);
            throw new BusinessException("Failed to send password reset email. Please try again later.");
        }
    }

    public async Task ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        if (string.IsNullOrWhiteSpace(resetPasswordDto.Token))
            throw new UnauthorizedException("Reset token is required");
        
        if (string.IsNullOrWhiteSpace(resetPasswordDto.Email))
            throw new UnauthorizedException("Email is required");
        
        _logger.LogInformation("Attempting password reset for email: {Email}, Token length: {TokenLength}", 
            resetPasswordDto.Email, resetPasswordDto.Token.Length);
        
        // Validate token and extract user info
        var tokenData = ValidatePasswordResetToken(resetPasswordDto.Token, resetPasswordDto.Email);
        if (tokenData == null)
        {
            _logger.LogWarning("Password reset token validation failed for email: {Email}", resetPasswordDto.Email);
            throw new UnauthorizedException("Invalid or expired reset token");
        }

        var (userId, email, expiration) = tokenData.Value;

        // Find user
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && 
                                      u.NormalizedEmail == resetPasswordDto.Email.ToUpperInvariant());

        if (user == null || !user.IsActive)
            throw new UnauthorizedException("Invalid or expired reset token");

        // Update password
        user.PasswordHash = _passwordHasher.HashPassword(resetPasswordDto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Password reset successful for user: {Email}", user.Email);
    }

    private string GeneratePasswordResetToken(int userId, string email)
    {
        // Token expires in 1 hour
        var expiration = DateTime.UtcNow.AddHours(1);
        var secret = _configuration["JwtSettings:SecurityKey"] ?? "YourSecretKeyThatIsAtLeast32CharactersLong!";
        
        // Create token data: userId|email|expiration
        var tokenData = $"{userId}|{email}|{expiration:O}";
        
        // Create HMAC signature
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(tokenData));
        var signature = Convert.ToBase64String(hash);
        
        // Combine: tokenData|signature
        var token = $"{tokenData}|{signature}";
        
        // Base64 encode the entire token
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(token));
    }

    private (int UserId, string Email, DateTime Expiration)? ValidatePasswordResetToken(string token, string email)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(email))
            {
                _logger.LogWarning("Password reset token validation failed: token or email is empty");
                return null;
            }

            // Decode token (handle URL encoding if present)
            string decodedToken;
            try
            {
                var decodedBytes = Convert.FromBase64String(token);
                decodedToken = Encoding.UTF8.GetString(decodedBytes);
            }
            catch (FormatException ex)
            {
                _logger.LogWarning(ex, "Password reset token validation failed: invalid base64 format");
                return null;
            }
            
            // Split token and signature
            var parts = decodedToken.Split('|');
            if (parts.Length != 4)
            {
                _logger.LogWarning("Password reset token validation failed: invalid token format. Expected 4 parts, got {Count}", parts.Length);
                return null;
            }
            
            var userIdStr = parts[0];
            var tokenEmail = parts[1];
            var expirationStr = parts[2];
            var signature = parts[3];
            
            // Verify email matches
            if (tokenEmail.ToUpperInvariant() != email.ToUpperInvariant())
            {
                _logger.LogWarning("Password reset token validation failed: email mismatch. Token email: {TokenEmail}, Provided email: {Email}", tokenEmail, email);
                return null;
            }
            
            // Check expiration
            if (!DateTime.TryParse(expirationStr, null, System.Globalization.DateTimeStyles.RoundtripKind, out var expiration))
            {
                _logger.LogWarning("Password reset token validation failed: invalid expiration format: {ExpirationStr}", expirationStr);
                return null;
            }

            if (expiration < DateTime.UtcNow)
            {
                _logger.LogWarning("Password reset token validation failed: token expired. Expiration: {Expiration}, Now: {Now}", expiration, DateTime.UtcNow);
                return null;
            }
            
            // Verify signature
            var secret = _configuration["JwtSettings:SecurityKey"] ?? "YourSecretKeyThatIsAtLeast32CharactersLong!";
            var tokenData = $"{userIdStr}|{tokenEmail}|{expiration:O}";
            
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(tokenData));
            var expectedSignature = Convert.ToBase64String(hash);
            
            if (signature != expectedSignature)
            {
                _logger.LogWarning("Password reset token validation failed: signature mismatch");
                return null;
            }
            
            // Parse userId
            if (!int.TryParse(userIdStr, out var userId))
            {
                _logger.LogWarning("Password reset token validation failed: invalid userId format: {UserIdStr}", userIdStr);
                return null;
            }
            
            _logger.LogInformation("Password reset token validated successfully for user: {UserId}, email: {Email}", userId, email);
            return (userId, tokenEmail, expiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Password reset token validation failed with exception");
            return null;
        }
    }
}
