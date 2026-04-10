namespace wixi.Core.Exceptions;

public class BusinessException : Exception
{
    public string? ErrorCode { get; set; }
    public int StatusCode { get; set; }

    public BusinessException(string message, int statusCode = 400, string? errorCode = null) 
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }

    public BusinessException(string message, Exception innerException, int statusCode = 400, string? errorCode = null) 
        : base(message, innerException)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}

