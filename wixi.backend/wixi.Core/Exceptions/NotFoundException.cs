namespace wixi.Core.Exceptions;

public class NotFoundException : BusinessException
{
    public NotFoundException(string message) 
        : base(message, statusCode: 404, errorCode: "NOT_FOUND")
    {
    }

    public NotFoundException(string entity, object id)
        : base($"{entity} with id '{id}' not found", statusCode: 404, errorCode: "NOT_FOUND")
    {
    }
}

