namespace wixi.Core.Exceptions;

public class UnauthorizedException : BusinessException
{
    public UnauthorizedException(string message = "Unauthorized access") 
        : base(message, statusCode: 401, errorCode: "UNAUTHORIZED")
    {
    }
}

