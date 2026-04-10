using Microsoft.AspNetCore.Authorization;

namespace wixi.WebAPI.Authorization.Requirements;

public class ResourceOwnerRequirement : IAuthorizationRequirement
{
    public ResourceOwnerRequirement()
    {
    }
}

public class ResourceOwnerAuthorizationHandler : AuthorizationHandler<ResourceOwnerRequirement, int>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ResourceOwnerRequirement requirement,
        int resourceUserId)
    {
        var userIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            // User can access their own resources
            if (userId == resourceUserId)
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
            
            // Admin can access all resources
            if (context.User.IsInRole("Admin"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
        }

        return Task.CompletedTask;
    }
}







