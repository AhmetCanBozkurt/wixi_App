namespace wixi.Core.Exceptions;

public class ValidationException : BusinessException
{
    public Dictionary<string, string[]>? Errors { get; set; }

    public ValidationException(string message, Dictionary<string, string[]>? errors = null) 
        : base(message, statusCode: 422, errorCode: "VALIDATION_ERROR")
    {
        Errors = errors;
    }
}

