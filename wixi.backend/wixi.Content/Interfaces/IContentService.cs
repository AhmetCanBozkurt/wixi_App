using wixi.Content.DTOs;

namespace wixi.Content.Interfaces
{
    public interface IContentService
    {
        // NewsItem
        Task<List<NewsItemDto>> GetAllNewsItemsAsync(bool activeOnly = true);
        Task<NewsItemDto> GetNewsItemByIdAsync(int id);
        Task<NewsItemDto?> GetNewsItemBySlugAsync(string slug);
        Task<NewsItemDto> CreateNewsItemAsync(NewsItemDto dto);
        Task<NewsItemDto> UpdateNewsItemAsync(int id, NewsItemDto dto);
        Task<bool> DeleteNewsItemAsync(int id);
        
        // TeamMember
        Task<List<TeamMemberDto>> GetAllTeamMembersAsync(bool activeOnly = true);
        Task<TeamMemberDto> GetTeamMemberByIdAsync(int id);
        Task<TeamMemberDto> CreateTeamMemberAsync(TeamMemberDto dto);
        Task<TeamMemberDto> UpdateTeamMemberAsync(int id, TeamMemberDto dto);
        Task<bool> DeleteTeamMemberAsync(int id);
        
        // Translation
        Task<Dictionary<string, string>> GetTranslationsAsync(string lang);
        Task<List<TranslationDto>> ListTranslationsAsync(string? search = null, int page = 1, int pageSize = 50);
        Task<TranslationDto?> GetTranslationByKeyAsync(string key);
        Task<TranslationDto> UpsertTranslationAsync(TranslationDto item, string? updatedBy = null);
        Task DeleteTranslationAsync(long id);
        void InvalidateTranslationCache(string? lang = null);
        
        // ContentSettings
        Task<ContentSettingsDto?> GetContentSettingsAsync();
        Task<object?> GetPublicContentSettingsAsync(string lang = "de");
        Task<ContentSettingsDto> UpsertContentSettingsAsync(ContentSettingsDto input, string? updatedBy = null);
        
        // SystemSettings
        Task<SystemSettingsDto?> GetSystemSettingsAsync();
        Task<SystemSettingsDto> UpsertSystemSettingsAsync(SystemSettingsDto input, string? updatedBy = null);
        
        // UserPreference
        Task<UserPreferenceDto> GetOrCreateUserPreferenceAsync(string userId);
        Task<UserPreferenceDto> UpsertUserPreferenceAsync(string userId, string? language, string? theme);
    }
}
