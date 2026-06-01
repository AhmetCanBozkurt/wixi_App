namespace Wixi.Modules.PersonalFinance.Application.Common.Interfaces;

public interface IPersonalFinanceCurrentUserService
{
    Guid? UserId { get; }
    bool IsAuthenticated { get; }
}
