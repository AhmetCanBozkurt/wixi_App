namespace wixi.Content.DTOs
{
    public class UserPreferenceDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Language { get; set; } = "de";
        public string Theme { get; set; } = "light";
    }
}

