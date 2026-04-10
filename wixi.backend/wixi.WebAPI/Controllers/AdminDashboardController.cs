using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Email.Entities;
using wixi.WebAPI.Authorization;
using wixi.WebAPI.Services;
using wixi.Appointments.Entities;
using wixi.Payments.Entities;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/admin/dashboard")]
[Asp.Versioning.ApiVersion("1.0")]
[Authorize(Policy = Policies.AdminOnly)]
public class AdminDashboardController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AdminDashboardController> _logger;

    public AdminDashboardController(
        WixiDbContext context,
        ILogger<AdminDashboardController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetDashboardStats()
    {
        try
        {
            var totalUsers = await _context.Users.CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);

            var totalEmployeeSubmissions = await _context.EmployeeFormSubmissions.CountAsync();
            var totalEmployerSubmissions = await _context.EmployerFormSubmissions.CountAsync();
            var totalContactSubmissions = await _context.ContactFormSubmissions.CountAsync();
            var totalFormSubmissions = totalEmployeeSubmissions + totalEmployerSubmissions + totalContactSubmissions;

            var totalEmailLogs = await _context.EmailLogs.CountAsync();
            var sentEmails = await _context.EmailLogs.CountAsync(e => e.Status == EmailStatus.Sent);
            var failedEmails = await _context.EmailLogs.CountAsync(e => e.Status == EmailStatus.Failed);

            // Appointments statistics
            var totalAppointments = await _context.Appointments.CountAsync();
            var pendingAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Pending);
            var confirmedAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Confirmed);
            var completedAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Completed);
            var cancelledAppointments = await _context.Appointments.CountAsync(a => a.Status == AppointmentStatus.Cancelled);
            
            var today = DateTime.UtcNow.Date;
            var todayAppointments = await _context.Appointments.CountAsync(a => a.StartTime.Date == today);
            var upcomingAppointments = await _context.Appointments.CountAsync(a => a.StartTime > DateTime.UtcNow);
            var pastAppointments = await _context.Appointments.CountAsync(a => a.EndTime < DateTime.UtcNow);

            // Payments statistics
            var totalPayments = await _context.Payments.CountAsync();
            var completedPayments = await _context.Payments.CountAsync(p => p.Status == PaymentStatus.Completed);
            var pendingPayments = await _context.Payments.CountAsync(p => p.Status == PaymentStatus.Pending);
            var failedPayments = await _context.Payments.CountAsync(p => p.Status == PaymentStatus.Failed);
            var cancelledPayments = await _context.Payments.CountAsync(p => p.Status == PaymentStatus.Cancelled);
            var refundedPayments = await _context.Payments.CountAsync(p => p.Status == PaymentStatus.Refunded);
            
            var totalRevenue = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Completed)
                .SumAsync(p => (decimal?)p.PaidAmount) ?? 0;
            
            var todayPayments = await _context.Payments.CountAsync(p => p.CreatedAt.Date == today);
            var todayRevenue = await _context.Payments
                .Where(p => p.Status == PaymentStatus.Completed && p.CreatedAt.Date == today)
                .SumAsync(p => (decimal?)p.PaidAmount) ?? 0;

            // Last 30 days data for charts
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var appointmentsLast30Days = await _context.Appointments
                .Where(a => a.CreatedAt >= thirtyDaysAgo)
                .GroupBy(a => a.CreatedAt.Date)
                .Select(g => new { date = g.Key, count = g.Count() })
                .OrderBy(x => x.date)
                .ToListAsync();
            
            var paymentsLast30Days = await _context.Payments
                .Where(p => p.CreatedAt >= thirtyDaysAgo)
                .GroupBy(p => p.CreatedAt.Date)
                .Select(g => new { 
                    date = g.Key, 
                    count = g.Count(),
                    revenue = g.Where(p => p.Status == PaymentStatus.Completed).Sum(p => (decimal?)p.PaidAmount) ?? 0
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            var recentEmployeeSubmissions = await _context.EmployeeFormSubmissions
                .CountAsync(e => e.CreatedAt >= today);
            var recentEmployerSubmissions = await _context.EmployerFormSubmissions
                .CountAsync(e => e.CreatedAt >= today);

            return Ok(new
            {
                users = new
                {
                    total = totalUsers,
                    active = activeUsers
                },
                formSubmissions = new
                {
                    total = totalFormSubmissions,
                    employees = totalEmployeeSubmissions,
                    employers = totalEmployerSubmissions,
                    contact = totalContactSubmissions,
                    today = recentEmployeeSubmissions + recentEmployerSubmissions
                },
                emails = new
                {
                    total = totalEmailLogs,
                    sent = sentEmails,
                    failed = failedEmails
                },
                appointments = new
                {
                    total = totalAppointments,
                    pending = pendingAppointments,
                    confirmed = confirmedAppointments,
                    completed = completedAppointments,
                    cancelled = cancelledAppointments,
                    today = todayAppointments,
                    upcoming = upcomingAppointments,
                    past = pastAppointments
                },
                payments = new
                {
                    total = totalPayments,
                    completed = completedPayments,
                    pending = pendingPayments,
                    failed = failedPayments,
                    cancelled = cancelledPayments,
                    refunded = refundedPayments,
                    totalRevenue = totalRevenue,
                    today = todayPayments,
                    todayRevenue = todayRevenue
                },
                charts = new
                {
                    appointmentsLast30Days = appointmentsLast30Days.Select(a => new { date = a.date.ToString("yyyy-MM-dd"), count = a.count }),
                    paymentsLast30Days = paymentsLast30Days.Select(p => new { date = p.date.ToString("yyyy-MM-dd"), count = p.count, revenue = p.revenue })
                },
                systemStatus = "Aktif"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching dashboard statistics");
            return StatusCode(500, new { message = "An error occurred while fetching dashboard statistics" });
        }
    }
}

