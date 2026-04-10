namespace wixi.WebAPI.Authorization;

public static class Policies
{
    // Role-based policies
    public const string AdminOnly = "AdminOnly";
    public const string ClientOnly = "ClientOnly";
    public const string EmployeeOnly = "EmployeeOnly";
    
    // Combined policies
    public const string AdminOrEmployee = "AdminOrEmployee";
    
    // Resource-based policies
    public const string ManageUsers = "ManageUsers";
    public const string ViewAuditLogs = "ViewAuditLogs";
    public const string ManageRoles = "ManageRoles";
}







