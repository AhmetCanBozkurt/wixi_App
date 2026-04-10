using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using wixi.DataAccess;
using wixi.Clients.DTOs;
using wixi.Clients.Interfaces;
using wixi.Clients.Entities;
using wixi.Identity.Entities;
using wixi.Applications.Interfaces;

namespace wixi.WebAPI.Services
{
    public class ClientService : IClientService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<ClientService> _logger;
        private readonly IApplicationService _applicationService;
        private readonly UserManager<User> _userManager;

        public ClientService(
            WixiDbContext context,
            ILogger<ClientService> logger,
            IApplicationService applicationService,
            UserManager<User> userManager)
        {
            _context = context;
            _logger = logger;
            _applicationService = applicationService;
            _userManager = userManager;
        }

        public async Task<ClientDto> CreateClientAsync(ClientDto createDto)
        {
            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == createDto.UserId);
            if (!userExists)
            {
                throw new Exception("User not found");
            }

            // Check if client already exists for this user
            var existingClient = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == createDto.UserId && c.DeletedAt == null);
            if (existingClient != null)
            {
                throw new Exception("Client profile already exists for this user");
            }

            // Validate EducationTypeId if provided
            if (createDto.EducationTypeId.HasValue)
            {
                var educationTypeExists = await _context.EducationTypes.AnyAsync(et => et.Id == createDto.EducationTypeId.Value);
                if (!educationTypeExists)
                {
                    throw new Exception($"EducationType with ID {createDto.EducationTypeId.Value} not found");
                }
            }

            // Generate ClientCode if not provided
            string clientCode;
            if (!string.IsNullOrWhiteSpace(createDto.ClientCode))
            {
                // Use provided ClientCode (e.g., from PendingClientCode)
                clientCode = createDto.ClientCode;
                
                // Verify it's unique - check if it's already used in Clients table
                var codeExistsInClients = await _context.Clients.AnyAsync(c => c.ClientCode == clientCode && c.DeletedAt == null);
                if (codeExistsInClients)
                {
                    throw new Exception($"ClientCode '{clientCode}' is already in use by another client");
                }
            }
            else
            {
                // Generate unique ClientCode
                bool isUnique = false;
                int attempts = 0;
                const int maxAttempts = 10;
                
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
                    throw new Exception("Failed to generate unique ClientCode after multiple attempts");
                }
            }

            var client = new Client
            {
                UserId = createDto.UserId,
                FirstName = createDto.FirstName,
                LastName = createDto.LastName,
                Email = createDto.Email,
                Phone = createDto.Phone ?? string.Empty,
                DateOfBirth = createDto.DateOfBirth,
                Nationality = createDto.Nationality,
                Address = createDto.Address,
                EducationTypeId = createDto.EducationTypeId,
                ClientCode = clientCode,
                RegistrationDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Client profile created for user {UserId}", createDto.UserId);

            return await GetClientByIdAsync(client.Id);
        }

        public async Task<ClientDto> GetClientByIdAsync(int clientId)
        {
            var client = await _context.Clients
                .Include(c => c.EducationInfos)
                .Include(c => c.EducationType)
                .FirstOrDefaultAsync(c => c.Id == clientId && c.DeletedAt == null);

            if (client == null)
            {
                throw new Exception("Client not found");
            }

            return await MapToClientDtoAsync(client);
        }

        public async Task<ClientDto> GetClientByUserIdAsync(int userId)
        {
            var client = await _context.Clients
                .Include(c => c.EducationInfos)
                .Include(c => c.EducationType)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.DeletedAt == null);

            if (client == null)
            {
                throw new Exception("Client profile not found for this user");
            }

            return await MapToClientDtoAsync(client);
        }

        public async Task<List<ClientDto>> GetAllClientsAsync()
        {
            var clients = await _context.Clients
                .Include(c => c.EducationInfos)
                .Include(c => c.EducationType)
                .Where(c => c.DeletedAt == null)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var result = new List<ClientDto>();
            foreach (var client in clients)
            {
                result.Add(await MapToClientDtoAsync(client));
            }
            return result;
        }

        public async Task<ClientDto> UpdateClientAsync(int clientId, ClientDto updateDto)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId && c.DeletedAt == null);
            if (client == null)
            {
                throw new Exception("Client not found");
            }

            client.FirstName = updateDto.FirstName;
            client.LastName = updateDto.LastName;
            client.Email = updateDto.Email;
            client.Phone = updateDto.Phone;
            client.DateOfBirth = updateDto.DateOfBirth;
            client.Nationality = updateDto.Nationality;
            client.Address = updateDto.Address;
            client.EducationTypeId = updateDto.EducationTypeId;
            client.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Client profile updated: {ClientId}", clientId);

            return await GetClientByIdAsync(clientId);
        }

        public async Task<bool> DeleteClientAsync(int clientId)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == clientId && c.DeletedAt == null);
            
            if (client == null)
            {
                throw new Exception("Client not found");
            }

            var userId = client.UserId;

            // Soft delete client
            client.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Client profile deleted (soft): {ClientId}", clientId);

            // Delete user and roles if user exists
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                try
                {
                    // Check if user is admin (don't delete admin users)
                    var isAdmin = await _userManager.IsInRoleAsync(user, "Admin") || 
                                  await _userManager.IsInRoleAsync(user, "SuperAdmin");
                    
                    if (isAdmin)
                    {
                        _logger.LogWarning("Attempted to delete admin user {UserId} for client {ClientId}. User deletion skipped.", user.Id, clientId);
                    }
                    else
                    {
                        // Use raw SQL to delete all Identity-related data
                        var userRolesDeleted = await _context.Database.ExecuteSqlRawAsync(
                            "DELETE FROM [dbo].[wixi_UserRoles] WHERE [UserId] = {0}", userId);
                        _logger.LogInformation("Deleted {Count} user roles for user {UserId}", userRolesDeleted, userId);
                        
                        var userPreferencesDeleted = await _context.Database.ExecuteSqlRawAsync(
                            "DELETE FROM [dbo].[wixi_UserPreferences] WHERE [UserId] = {0}", userId.ToString());
                        _logger.LogInformation("Deleted {Count} user preferences for user {UserId}", userPreferencesDeleted, userId);
                        
                        var notificationsDeleted = await _context.Database.ExecuteSqlRawAsync(
                            "DELETE FROM [dbo].[wixi_Notifications] WHERE [UserId] = {0}", userId);
                        _logger.LogInformation("Deleted {Count} notifications for user {UserId}", notificationsDeleted, userId);
                        
                        var userDeleted = await _context.Database.ExecuteSqlRawAsync(
                            "DELETE FROM [dbo].[wixi_Users] WHERE [Id] = {0}", userId);
                        
                        if (userDeleted > 0)
                        {
                            _logger.LogInformation("User {UserId} and all roles deleted for client {ClientId}", userId, clientId);
                        }
                        else
                        {
                            _logger.LogWarning("User {UserId} was not deleted (may not exist)", userId);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting user {UserId} for client {ClientId}. Exception: {Exception}", userId, clientId, ex.Message);
                    throw new Exception($"Müşteri silindi ancak kullanıcı silinirken hata oluştu: {ex.Message}", ex);
                }
            }

            return true;
        }

        public async Task<EducationInfoDto> AddEducationInfoAsync(EducationInfoDto createDto)
        {
            // Validate client exists
            var clientExists = await _context.Clients.AnyAsync(c => c.Id == createDto.ClientId && c.DeletedAt == null);
            if (!clientExists)
            {
                throw new Exception("Client not found");
            }

            // Parse Level enum
            if (!Enum.TryParse<EducationLevel>(createDto.Level, true, out var educationLevel))
            {
                // Default to Bachelor if parsing fails
                educationLevel = EducationLevel.Bachelor;
            }

            var educationInfo = new EducationInfo
            {
                ClientId = createDto.ClientId,
                Level = educationLevel,
                Degree = createDto.Degree,
                Institution = createDto.Institution,
                FieldOfStudy = createDto.FieldOfStudy,
                StartDate = createDto.StartDate,
                GraduationDate = createDto.GraduationDate,
                Country = createDto.Country,
                City = createDto.City,
                IsCurrent = createDto.IsCurrent,
                Description = createDto.Description,
                GPA = createDto.GPA,
                CreatedAt = DateTime.UtcNow
            };

            _context.EducationInfos.Add(educationInfo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Education info added for client {ClientId}", createDto.ClientId);

            return MapToEducationInfoDto(educationInfo);
        }

        public async Task<EducationInfoDto> UpdateEducationInfoAsync(int educationInfoId, EducationInfoDto updateDto)
        {
            var educationInfo = await _context.EducationInfos.FindAsync(educationInfoId);
            if (educationInfo == null)
            {
                throw new Exception("Education info not found");
            }

            // Parse Level enum if provided
            if (!string.IsNullOrWhiteSpace(updateDto.Level))
            {
                if (Enum.TryParse<EducationLevel>(updateDto.Level, true, out var educationLevel))
                {
                    educationInfo.Level = educationLevel;
                }
            }

            educationInfo.Degree = updateDto.Degree;
            educationInfo.Institution = updateDto.Institution;
            educationInfo.FieldOfStudy = updateDto.FieldOfStudy;
            educationInfo.StartDate = updateDto.StartDate;
            educationInfo.GraduationDate = updateDto.GraduationDate;
            educationInfo.Country = updateDto.Country;
            educationInfo.City = updateDto.City;
            educationInfo.IsCurrent = updateDto.IsCurrent;
            educationInfo.Description = updateDto.Description;
            educationInfo.GPA = updateDto.GPA;
            educationInfo.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Education info updated: {EducationInfoId}", educationInfoId);

            return MapToEducationInfoDto(educationInfo);
        }

        public async Task<bool> DeleteEducationInfoAsync(int educationInfoId)
        {
            var educationInfo = await _context.EducationInfos.FindAsync(educationInfoId);
            if (educationInfo == null)
            {
                throw new Exception("Education info not found");
            }

            _context.EducationInfos.Remove(educationInfo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Education info deleted: {EducationInfoId}", educationInfoId);
            return true;
        }

        public async Task<List<EducationInfoDto>> GetClientEducationHistoryAsync(int clientId)
        {
            var educationHistory = await _context.EducationInfos
                .Where(e => e.ClientId == clientId)
                .OrderByDescending(e => e.StartDate)
                .ToListAsync();

            return educationHistory.Select(e => MapToEducationInfoDto(e)).ToList();
        }

        // Helper methods
        private EducationInfoDto MapToEducationInfoDto(EducationInfo educationInfo)
        {
            return new EducationInfoDto
            {
                Id = educationInfo.Id,
                ClientId = educationInfo.ClientId,
                Level = educationInfo.Level.ToString(),
                Degree = educationInfo.Degree,
                Institution = educationInfo.Institution,
                FieldOfStudy = educationInfo.FieldOfStudy,
                StartDate = educationInfo.StartDate,
                GraduationDate = educationInfo.GraduationDate,
                Country = educationInfo.Country,
                City = educationInfo.City,
                IsCurrent = educationInfo.IsCurrent,
                Description = educationInfo.Description,
                GPA = educationInfo.GPA,
                CreatedAt = educationInfo.CreatedAt,
                UpdatedAt = educationInfo.UpdatedAt
            };
        }

        private async Task<ClientDto> MapToClientDtoAsync(Client client)
        {
            int? age = null;
            if (client.DateOfBirth.HasValue)
            {
                var ageCalc = DateTime.UtcNow.Year - client.DateOfBirth.Value.Year;
                if (DateTime.UtcNow < client.DateOfBirth.Value.AddYears(ageCalc))
                {
                    ageCalc--;
                }
                age = ageCalc;
            }

            // Get user email
            string? userEmail = null;
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == client.UserId);
                userEmail = user?.Email;
            }
            catch
            {
                // Ignore errors when fetching user email
            }

            // Get education type name
            string? educationTypeName = null;
            if (client.EducationType != null)
            {
                // Use TR as default, frontend will handle language switching
                educationTypeName = client.EducationType.Name_TR ?? 
                                  client.EducationType.Name_EN ?? 
                                  client.EducationType.Name_DE ?? 
                                  client.EducationType.Name_AR;
            }

            // Map education history
            var educationHistory = client.EducationInfos?
                .OrderByDescending(e => e.StartDate ?? e.CreatedAt)
                .Select(e => new EducationInfoDto
                {
                    Id = e.Id,
                    ClientId = e.ClientId,
                    Level = e.Level.ToString(),
                    Degree = e.Degree,
                    Institution = e.Institution,
                    FieldOfStudy = e.FieldOfStudy,
                    StartDate = e.StartDate,
                    GraduationDate = e.GraduationDate,
                    Country = e.Country,
                    City = e.City,
                    IsCurrent = e.IsCurrent,
                    GPA = e.GPA,
                    Description = e.Description,
                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt
                })
                .ToList() ?? new List<EducationInfoDto>();

            return new ClientDto
            {
                Id = client.Id,
                UserId = client.UserId,
                UserEmail = userEmail,
                ClientCode = client.ClientCode,
                FirstName = client.FirstName,
                LastName = client.LastName,
                FullName = $"{client.FirstName} {client.LastName}".Trim(),
                Email = client.Email,
                Phone = client.Phone,
                Address = client.Address,
                City = client.City,
                PostalCode = client.PostalCode,
                Country = client.Country,
                DateOfBirth = client.DateOfBirth,
                Age = age,
                Nationality = client.Nationality,
                PassportNumber = client.PassportNumber,
                EducationTypeId = client.EducationTypeId,
                EducationTypeName = educationTypeName,
                ProfilePictureUrl = client.ProfilePictureUrl,
                Notes = client.Notes,
                Status = client.Status.ToString(),
                RegistrationDate = client.RegistrationDate,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt,
                LastActivityAt = client.LastActivityAt,
                EducationHistory = educationHistory
            };
        }
    }
}

