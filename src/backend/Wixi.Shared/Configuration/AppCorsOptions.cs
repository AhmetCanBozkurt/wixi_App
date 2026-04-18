namespace Wixi.Shared.Configuration;

public class AppCorsOptions
{
    public const string SectionName = "AppCors";

    public string[] Origins { get; set; } = [];
}
