using wixi.Support.DTOs;

namespace wixi.Support.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotificationAsync(int userId, string title, string message, string type = "Info");
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
        Task<bool> MarkAsReadAsync(long notificationId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> DeleteNotificationAsync(long notificationId);
    }
}

