using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.WebAPI.Authorization;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/database")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminDatabaseController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminDatabaseController> _logger;

    public AdminDatabaseController(
        WixiDbContext context,
        ILogger<AdminDatabaseController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get database statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetStats()
    {
        try
        {
            var stats = new
            {
                clients = await _context.Clients.CountAsync(),
                documents = await _context.Documents.CountAsync(),
                applications = await _context.Applications.CountAsync(),
                supportTickets = await _context.SupportTickets.CountAsync(),
                users = await _context.Users.CountAsync(),
                emailLogs = await _context.EmailLogs.CountAsync(),
                formSubmissions = new
                {
                    employee = await _context.EmployeeFormSubmissions.CountAsync(),
                    employer = await _context.EmployerFormSubmissions.CountAsync(),
                    contact = await _context.ContactFormSubmissions.CountAsync()
                }
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting database statistics");
            return StatusCode(500, new { success = false, message = "Error getting database statistics" });
        }
    }

    /// <summary>
    /// Clean up all data for a specific client (DANGEROUS - Use with caution!)
    /// </summary>
    [HttpPost("cleanup-client-data/{clientId}")]
    public async Task<ActionResult> CleanupClientData(int clientId, [FromQuery] bool deleteUser = false)
    {
        try
        {
            _logger.LogWarning("Client data cleanup started for client {ClientId} by user: {UserId}", 
                clientId, User.Identity?.Name);

            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == clientId);

            if (client == null)
            {
                return NotFound(new { success = false, message = "Client not found" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var deletedCounts = new Dictionary<string, int>();

                // 1. Support System
                var supportTicketsForClient = await _context.SupportTickets
                    .Where(t => t.ClientId == clientId)
                    .Select(t => t.Id)
                    .ToListAsync();

                var supportMessages = await _context.SupportMessages
                    .Where(m => supportTicketsForClient.Contains(m.TicketId))
                    .ToListAsync();
                var supportMessagesCount = supportMessages.Count;
                _context.SupportMessages.RemoveRange(supportMessages);
                await _context.SaveChangesAsync();
                deletedCounts["supportMessages"] = supportMessagesCount;

                var supportTickets = await _context.SupportTickets
                    .Where(t => t.ClientId == clientId)
                    .ToListAsync();
                var supportTicketsCount = supportTickets.Count;
                _context.SupportTickets.RemoveRange(supportTickets);
                await _context.SaveChangesAsync();
                deletedCounts["supportTickets"] = supportTicketsCount;

                // 2. Notifications
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == client.UserId)
                    .ToListAsync();
                var notificationsCount = notifications.Count;
                _context.Notifications.RemoveRange(notifications);
                await _context.SaveChangesAsync();
                deletedCounts["notifications"] = notificationsCount;

                // 3. Application System
                var applications = await _context.Applications
                    .Where(a => a.ClientId == clientId)
                    .Select(a => a.Id)
                    .ToListAsync();

                if (applications.Any())
                {
                    var applicationIds = applications;

                    // Delete application histories
                    var histories = await _context.ApplicationHistories
                        .Where(h => applicationIds.Contains(h.ApplicationId))
                        .ToListAsync();
                    _context.ApplicationHistories.RemoveRange(histories);
                    await _context.SaveChangesAsync();

                    // Get application step IDs
                    var applicationStepIds = await _context.ApplicationSteps
                        .Where(s => applicationIds.Contains(s.ApplicationId))
                        .Select(s => s.Id)
                        .ToListAsync();

                    // Delete application sub-steps
                    if (applicationStepIds.Any())
                    {
                        var subSteps = await _context.ApplicationSubSteps
                            .Where(ss => applicationStepIds.Contains(ss.ApplicationStepId))
                            .ToListAsync();
                        _context.ApplicationSubSteps.RemoveRange(subSteps);
                        await _context.SaveChangesAsync();
                    }

                    // Delete application steps
                    var steps = await _context.ApplicationSteps
                        .Where(s => applicationIds.Contains(s.ApplicationId))
                        .ToListAsync();
                    _context.ApplicationSteps.RemoveRange(steps);
                    await _context.SaveChangesAsync();

                    // Delete applications
                    var appsToDelete = await _context.Applications
                        .Where(a => applicationIds.Contains(a.Id))
                        .ToListAsync();
                    _context.Applications.RemoveRange(appsToDelete);
                    await _context.SaveChangesAsync();
                    deletedCounts["applications"] = appsToDelete.Count;
                }
                else
                {
                    deletedCounts["applications"] = 0;
                }

                // 4. Document System
                var documentsForClient = await _context.Documents
                    .Where(d => d.ClientId == clientId)
                    .Select(d => d.Id)
                    .ToListAsync();

                var documentReviews = await _context.DocumentReviews
                    .Where(dr => documentsForClient.Contains(dr.DocumentId))
                    .ToListAsync();
                var documentReviewsCount = documentReviews.Count;
                _context.DocumentReviews.RemoveRange(documentReviews);
                await _context.SaveChangesAsync();
                deletedCounts["documentReviews"] = documentReviewsCount;

                var documents = await _context.Documents
                    .Where(d => d.ClientId == clientId)
                    .ToListAsync();
                var documentsCount = documents.Count;
                _context.Documents.RemoveRange(documents);
                await _context.SaveChangesAsync();
                deletedCounts["documents"] = documentsCount;

                // 5. Education Info
                var educationInfos = await _context.EducationInfos
                    .Where(e => e.ClientId == clientId)
                    .ToListAsync();
                var educationInfosCount = educationInfos.Count;
                _context.EducationInfos.RemoveRange(educationInfos);
                await _context.SaveChangesAsync();
                deletedCounts["educationInfos"] = educationInfosCount;

                // 6. Pending Client Code (if exists)
                var pendingCode = await _context.PendingClientCodes
                    .FirstOrDefaultAsync(p => p.ClientCode == client.ClientCode);
                if (pendingCode != null)
                {
                    _context.PendingClientCodes.Remove(pendingCode);
                    await _context.SaveChangesAsync();
                    deletedCounts["pendingClientCode"] = 1;
                }

                // 7. Client
                _context.Clients.Remove(client);
                await _context.SaveChangesAsync();
                deletedCounts["client"] = 1;

                // 8. User (Optional)
                if (deleteUser && client.UserId > 0)
                {
                    var user = await _context.Users.FindAsync(client.UserId);
                    if (user != null)
                    {
                        // Remove user roles
                        var userRoles = await _context.UserRoles
                            .Where(ur => ur.UserId == client.UserId)
                            .ToListAsync();
                        _context.UserRoles.RemoveRange(userRoles);

                        // Remove refresh tokens
                        var refreshTokens = await _context.RefreshTokens
                            .Where(rt => rt.UserId == client.UserId)
                            .ToListAsync();
                        _context.RefreshTokens.RemoveRange(refreshTokens);

                        await _context.SaveChangesAsync();

                        _context.Users.Remove(user);
                        await _context.SaveChangesAsync();
                        deletedCounts["user"] = 1;
                    }
                }

                await transaction.CommitAsync();

                var summary = new
                {
                    success = true,
                    message = $"Client {client.FullName} ve tüm bağlı verileri başarıyla silindi",
                    clientName = client.FullName,
                    clientCode = client.ClientCode,
                    deleted = deletedCounts
                };

                _logger.LogWarning("Client data cleanup completed successfully for client {ClientId}", clientId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error during client data cleanup - transaction rolled back for client {ClientId}", clientId);
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up client data for client {ClientId}", clientId);
            return StatusCode(500, new { success = false, message = "Error cleaning up client data: " + ex.Message });
        }
    }
}

