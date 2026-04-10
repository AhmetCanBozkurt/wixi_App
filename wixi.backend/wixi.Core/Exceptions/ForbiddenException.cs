namespace wixi.Core.Exceptions;

public class ForbiddenException : BusinessException
{
    public ForbiddenException(string message = "Forbidden access") 
        : base(message, statusCode: 403, errorCode: "FORBIDDEN")
    {
    }
}

