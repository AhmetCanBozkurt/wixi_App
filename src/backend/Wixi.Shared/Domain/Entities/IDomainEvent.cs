namespace Wixi.Shared.Domain.Entities;

/// <summary>
/// Tüm Domain Event'lerin temel interface'i.
/// MediatR INotification'dan türetilir, modüller arası gevşek bağlı iletişim sağlar.
/// </summary>
public interface IDomainEvent : MediatR.INotification
{
    Guid EventId { get; }
    DateTime OccurredAt { get; }
}
