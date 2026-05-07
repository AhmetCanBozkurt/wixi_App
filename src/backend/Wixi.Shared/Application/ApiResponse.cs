namespace Wixi.Shared.Application;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Error { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T data) => new() { Success = true, Data = data };
    public static ApiResponse<T> Fail(string error) => new() { Success = false, Error = error };
}

public class ApiResponse : ApiResponse<object?>
{
    public static ApiResponse OkMessage(string message) => new() { Success = true, Data = message };
    public static new ApiResponse Fail(string error) => new() { Success = false, Error = error };
}
