using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Support.Entities;
using wixi.Support.DTOs;
using wixi.Support.Interfaces;

namespace wixi.WebAPI.Services
{
    public class NotificationService : INotificationService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(WixiDbContext context, ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<NotificationDto> CreateNotificationAsync(int userId, string title, string message, string type = "Info")
        {
            if (!Enum.TryParse<NotificationType>(type, true, out var notificationType))
                notificationType = NotificationType.Info;

            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = notificationType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Notification created for user {UserId}: {Title}", userId, title);
            
            return MapToDto(notification);
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
        {
            var query = _context.Notifications.Where(n => n.UserId == userId);

            if (unreadOnly)
                query = query.Where(n => !n.IsRead);

            var notifications = await query.OrderByDescending(n => n.CreatedAt).Take(50).ToListAsync();
            
            return notifications.Select(n => MapToDto(n)).ToList();
        }

        public async Task<bool> MarkAsReadAsync(long notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null) return false;

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Marked {Count} notifications as read for user {UserId}", notifications.Count, userId);

            return true;
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<bool> DeleteNotificationAsync(long notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null) return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return true;
        }

        private NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type.ToString(),
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt
            };
        }
    }
}

