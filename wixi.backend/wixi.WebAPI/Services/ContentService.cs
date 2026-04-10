using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using wixi.DataAccess;
using wixi.Content.Entities;
using wixi.Content.DTOs;
using wixi.Content.Interfaces;

namespace wixi.WebAPI.Services
{
    public class ContentService : IContentService
    {
        private readonly WixiDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ContentService> _logger;

        public ContentService(WixiDbContext context, IMemoryCache cache, ILogger<ContentService> logger)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        #region NewsItem

        public async Task<List<NewsItemDto>> GetAllNewsItemsAsync(bool activeOnly = true)
        {
            var query = _context.NewsItems.AsQueryable();
            if (activeOnly) query = query.Where(n => n.IsActive);

            var newsItems = await query.OrderByDescending(n => n.PublishedAt).ToListAsync();
            return newsItems.Select(n => MapToNewsDto(n)).ToList();
        }

        public async Task<NewsItemDto> GetNewsItemByIdAsync(int id)
        {
            var newsItem = await _context.NewsItems.FindAsync(id);
            if (newsItem == null) throw new Exception("News item not found");
            return MapToNewsDto(newsItem);
        }

        public async Task<NewsItemDto?> GetNewsItemBySlugAsync(string slug)
        {
            var newsItem = await _context.NewsItems.FirstOrDefaultAsync(n => n.Slug == slug);
            if (newsItem == null) return null;
            return MapToNewsDto(newsItem);
        }

        public async Task<NewsItemDto> CreateNewsItemAsync(NewsItemDto dto)
        {
            var newsItem = new NewsItem
            {
                TitleTr = dto.TitleTr,
                TitleEn = dto.TitleEn,
                TitleDe = dto.TitleDe,
                TitleAr = dto.TitleAr,
                ContentTr = dto.ContentTr,
                ContentEn = dto.ContentEn,
                ContentDe = dto.ContentDe,
                ContentAr = dto.ContentAr,
                Slug = dto.Slug,
                ImageUrl = dto.ImageUrl,
                PublishedAt = dto.PublishedAt,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.NewsItems.Add(newsItem);
            await _context.SaveChangesAsync();
            _logger.LogInformation("News item created: {Id}", newsItem.Id);

            return MapToNewsDto(newsItem);
        }

        public async Task<NewsItemDto> UpdateNewsItemAsync(int id, NewsItemDto dto)
        {
            var newsItem = await _context.NewsItems.FindAsync(id);
            if (newsItem == null) throw new Exception("News item not found");

            newsItem.TitleTr = dto.TitleTr;
            newsItem.TitleEn = dto.TitleEn;
            newsItem.TitleDe = dto.TitleDe;
            newsItem.TitleAr = dto.TitleAr;
            newsItem.ContentTr = dto.ContentTr;
            newsItem.ContentEn = dto.ContentEn;
            newsItem.ContentDe = dto.ContentDe;
            newsItem.ContentAr = dto.ContentAr;
            newsItem.Slug = dto.Slug;
            newsItem.ImageUrl = dto.ImageUrl;
            newsItem.PublishedAt = dto.PublishedAt;
            newsItem.IsActive = dto.IsActive;
            newsItem.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("News item updated: {Id}", id);

            return MapToNewsDto(newsItem);
        }

        public async Task<bool> DeleteNewsItemAsync(int id)
        {
            var newsItem = await _context.NewsItems.FindAsync(id);
            if (newsItem == null) return false;

            _context.NewsItems.Remove(newsItem);
            await _context.SaveChangesAsync();
            _logger.LogInformation("News item deleted: {Id}", id);

            return true;
        }

        #endregion

        #region TeamMember

        public async Task<List<TeamMemberDto>> GetAllTeamMembersAsync(bool activeOnly = true)
        {
            var query = _context.TeamMembers.AsQueryable();
            if (activeOnly) query = query.Where(t => t.IsActive);

            var teamMembers = await query.OrderBy(t => t.DisplayOrder).ToListAsync();
            return teamMembers.Select(t => MapToTeamDto(t)).ToList();
        }

        public async Task<TeamMemberDto> GetTeamMemberByIdAsync(int id)
        {
            var teamMember = await _context.TeamMembers.FindAsync(id);
            if (teamMember == null) throw new Exception("Team member not found");
            return MapToTeamDto(teamMember);
        }

        public async Task<TeamMemberDto> CreateTeamMemberAsync(TeamMemberDto dto)
        {
            var teamMember = new TeamMember
            {
                Name = dto.Name,
                Slug = dto.Slug,
                ImageUrl = dto.ImageUrl,
                Email = dto.Email,
                Phone = dto.Phone,
                Experience = dto.Experience,
                PositionDe = dto.PositionDe,
                PositionTr = dto.PositionTr,
                PositionEn = dto.PositionEn,
                LocationDe = dto.LocationDe,
                LocationTr = dto.LocationTr,
                LocationEn = dto.LocationEn,
                EducationDe = dto.EducationDe,
                EducationTr = dto.EducationTr,
                EducationEn = dto.EducationEn,
                BioDe = dto.BioDe,
                BioTr = dto.BioTr,
                BioEn = dto.BioEn,
                PhilosophyDe = dto.PhilosophyDe,
                PhilosophyTr = dto.PhilosophyTr,
                PhilosophyEn = dto.PhilosophyEn,
                SpecializationsDe = dto.SpecializationsDe,
                SpecializationsTr = dto.SpecializationsTr,
                SpecializationsEn = dto.SpecializationsEn,
                LanguagesDe = dto.LanguagesDe,
                LanguagesTr = dto.LanguagesTr,
                LanguagesEn = dto.LanguagesEn,
                AchievementsDe = dto.AchievementsDe,
                AchievementsTr = dto.AchievementsTr,
                AchievementsEn = dto.AchievementsEn,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive,
                CanProvideConsultation = dto.CanProvideConsultation,
                ConsultationPrice = dto.ConsultationPrice,
                ConsultationCurrency = dto.ConsultationCurrency,
                CreatedAt = DateTime.UtcNow
            };

            _context.TeamMembers.Add(teamMember);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Team member created: {Id}", teamMember.Id);

            return MapToTeamDto(teamMember);
        }

        public async Task<TeamMemberDto> UpdateTeamMemberAsync(int id, TeamMemberDto dto)
        {
            var teamMember = await _context.TeamMembers.FindAsync(id);
            if (teamMember == null) throw new Exception("Team member not found");

            teamMember.Name = dto.Name;
            teamMember.Slug = dto.Slug;
            teamMember.ImageUrl = dto.ImageUrl;
            teamMember.Email = dto.Email;
            teamMember.Phone = dto.Phone;
            teamMember.Experience = dto.Experience;
            teamMember.PositionDe = dto.PositionDe;
            teamMember.PositionTr = dto.PositionTr;
            teamMember.PositionEn = dto.PositionEn;
            teamMember.LocationDe = dto.LocationDe;
            teamMember.LocationTr = dto.LocationTr;
            teamMember.LocationEn = dto.LocationEn;
            teamMember.EducationDe = dto.EducationDe;
            teamMember.EducationTr = dto.EducationTr;
            teamMember.EducationEn = dto.EducationEn;
            teamMember.BioDe = dto.BioDe;
            teamMember.BioTr = dto.BioTr;
            teamMember.BioEn = dto.BioEn;
            teamMember.PhilosophyDe = dto.PhilosophyDe;
            teamMember.PhilosophyTr = dto.PhilosophyTr;
            teamMember.PhilosophyEn = dto.PhilosophyEn;
            teamMember.SpecializationsDe = dto.SpecializationsDe;
            teamMember.SpecializationsTr = dto.SpecializationsTr;
            teamMember.SpecializationsEn = dto.SpecializationsEn;
            teamMember.LanguagesDe = dto.LanguagesDe;
            teamMember.LanguagesTr = dto.LanguagesTr;
            teamMember.LanguagesEn = dto.LanguagesEn;
            teamMember.AchievementsDe = dto.AchievementsDe;
            teamMember.AchievementsTr = dto.AchievementsTr;
            teamMember.AchievementsEn = dto.AchievementsEn;
            teamMember.DisplayOrder = dto.DisplayOrder;
            teamMember.IsActive = dto.IsActive;
            teamMember.CanProvideConsultation = dto.CanProvideConsultation;
            teamMember.ConsultationPrice = dto.ConsultationPrice;
            teamMember.ConsultationCurrency = dto.ConsultationCurrency;
            teamMember.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Team member updated: {Id}", id);

            return MapToTeamDto(teamMember);
        }

        public async Task<bool> DeleteTeamMemberAsync(int id)
        {
            var teamMember = await _context.TeamMembers.FindAsync(id);
            if (teamMember == null) return false;

            _context.TeamMembers.Remove(teamMember);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Team member deleted: {Id}", id);

            return true;
        }

        #endregion

        #region Translation

        public async Task<Dictionary<string, string>> GetTranslationsAsync(string lang)
        {
            var cacheKey = $"i18n_{lang}";
            if (_cache.TryGetValue(cacheKey, out Dictionary<string, string>? cached))
                return cached!;

            var dict = await _context.Translations.AsNoTracking()
                .Select(t => new { t.Key, Value = lang == "de" ? t.De : lang == "tr" ? t.Tr : lang == "en" ? t.En : t.Ar })
                .Where(x => x.Value != null)
                .ToDictionaryAsync(x => x.Key, x => x.Value!);

            _cache.Set(cacheKey, dict, TimeSpan.FromMinutes(10));
            return dict;
        }

        public async Task<List<TranslationDto>> ListTranslationsAsync(string? search = null, int page = 1, int pageSize = 50)
        {
            var query = _context.Translations.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(t => t.Key.Contains(search));
            }

            var translations = await query
                .OrderBy(t => t.Key)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            return translations.Select(t => MapToTranslationDto(t)).ToList();
        }

        public async Task<TranslationDto?> GetTranslationByKeyAsync(string key)
        {
            var translation = await _context.Translations.AsNoTracking().FirstOrDefaultAsync(t => t.Key == key);
            return translation != null ? MapToTranslationDto(translation) : null;
        }

        public async Task<TranslationDto> UpsertTranslationAsync(TranslationDto item, string? updatedBy = null)
        {
            var existing = await _context.Translations.FirstOrDefaultAsync(t => t.Key == item.Key);
            if (existing == null)
            {
                var newTranslation = new Translation
                {
                    Key = item.Key,
                    De = item.De,
                    Tr = item.Tr,
                    En = item.En,
                    Ar = item.Ar,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = updatedBy
                };
                _context.Translations.Add(newTranslation);
            }
            else
            {
                existing.De = item.De;
                existing.Tr = item.Tr;
                existing.En = item.En;
                existing.Ar = item.Ar;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = updatedBy;
            }
            await _context.SaveChangesAsync();
            InvalidateTranslationCache(null);
            _logger.LogInformation("Translation upserted: {Key}", item.Key);

            return (await GetTranslationByKeyAsync(item.Key))!;
        }

        public async Task DeleteTranslationAsync(long id)
        {
            var translation = await _context.Translations.FindAsync(id);
            if (translation == null) return;
            
            _context.Translations.Remove(translation);
            await _context.SaveChangesAsync();
            InvalidateTranslationCache(null);
            _logger.LogInformation("Translation deleted: {Id}", id);
        }

        public void InvalidateTranslationCache(string? lang = null)
        {
            if (lang != null)
            {
                _cache.Remove($"i18n_{lang}");
                return;
            }
            foreach (var l in new[] { "de", "tr", "en", "ar" })
            {
                _cache.Remove($"i18n_{l}");
            }
        }

        #endregion

        #region ContentSettings

        public async Task<ContentSettingsDto?> GetContentSettingsAsync()
        {
            var cacheKey = "content_settings_cache";
            if (_cache.TryGetValue(cacheKey, out ContentSettings? cached))
                return cached != null ? MapToContentSettingsDto(cached) : null;

            var settings = await _context.ContentSettings.AsNoTracking().FirstOrDefaultAsync();
            if (settings != null)
            {
                _cache.Set(cacheKey, settings, TimeSpan.FromMinutes(5));
                return MapToContentSettingsDto(settings);
            }
            return null;
        }

        public async Task<object?> GetPublicContentSettingsAsync(string lang = "de")
        {
            var settings = await GetContentSettingsAsync();
            if (settings == null)
                return null;

            // Normalize language code
            lang = lang.ToLowerInvariant();
            if (lang != "de" && lang != "tr" && lang != "en" && lang != "ar")
                lang = "de"; // Default to German

            return new
            {
                footerCompanyDesc = lang switch
                {
                    "de" => settings.FooterCompanyDescDe ?? string.Empty,
                    "tr" => settings.FooterCompanyDescTr ?? string.Empty,
                    "en" => settings.FooterCompanyDescEn ?? settings.FooterCompanyDescDe ?? string.Empty,
                    "ar" => settings.FooterCompanyDescAr ?? settings.FooterCompanyDescDe ?? string.Empty,
                    _ => settings.FooterCompanyDescDe ?? string.Empty
                },
                socialMedia = new
                {
                    facebook = settings.FacebookUrl,
                    instagram = settings.InstagramUrl,
                    twitter = settings.TwitterUrl,
                    linkedin = settings.LinkedInUrl
                },
                aboutMission = new
                {
                    text1 = lang switch
                    {
                        "de" => settings.AboutMissionText1De ?? string.Empty,
                        "tr" => settings.AboutMissionText1Tr ?? string.Empty,
                        "en" => settings.AboutMissionText1En ?? settings.AboutMissionText1De ?? string.Empty,
                        "ar" => settings.AboutMissionText1Ar ?? settings.AboutMissionText1De ?? string.Empty,
                        _ => settings.AboutMissionText1De ?? string.Empty
                    },
                    text2 = lang switch
                    {
                        "de" => settings.AboutMissionText2De ?? string.Empty,
                        "tr" => settings.AboutMissionText2Tr ?? string.Empty,
                        "en" => settings.AboutMissionText2En ?? settings.AboutMissionText2De ?? string.Empty,
                        "ar" => settings.AboutMissionText2Ar ?? settings.AboutMissionText2De ?? string.Empty,
                        _ => settings.AboutMissionText2De ?? string.Empty
                    }
                },
                contact = new
                {
                    phone = settings.ContactPhone ?? string.Empty,
                    email = settings.ContactEmail ?? string.Empty,
                    addresses = new
                    {
                        germany = settings.AddressGermany ?? string.Empty,
                        turkeyMersin = settings.AddressTurkeyMersin ?? string.Empty,
                        turkeyIstanbul = settings.AddressTurkeyIstanbul ?? string.Empty
                    }
                }
            };
        }

        public async Task<ContentSettingsDto> UpsertContentSettingsAsync(ContentSettingsDto input, string? updatedBy = null)
        {
            var existing = await _context.ContentSettings.FirstOrDefaultAsync();
            if (existing == null)
            {
                var newSettings = new ContentSettings
                {
                    FooterCompanyDescDe = input.FooterCompanyDescDe ?? string.Empty,
                    FooterCompanyDescTr = input.FooterCompanyDescTr ?? string.Empty,
                    FooterCompanyDescEn = input.FooterCompanyDescEn,
                    FooterCompanyDescAr = input.FooterCompanyDescAr,
                    FacebookUrl = input.FacebookUrl,
                    InstagramUrl = input.InstagramUrl,
                    TwitterUrl = input.TwitterUrl,
                    LinkedInUrl = input.LinkedInUrl,
                    AboutMissionText1De = input.AboutMissionText1De ?? string.Empty,
                    AboutMissionText1Tr = input.AboutMissionText1Tr ?? string.Empty,
                    AboutMissionText1En = input.AboutMissionText1En,
                    AboutMissionText1Ar = input.AboutMissionText1Ar,
                    AboutMissionText2De = input.AboutMissionText2De ?? string.Empty,
                    AboutMissionText2Tr = input.AboutMissionText2Tr ?? string.Empty,
                    AboutMissionText2En = input.AboutMissionText2En,
                    AboutMissionText2Ar = input.AboutMissionText2Ar,
                    ContactPhone = input.ContactPhone ?? string.Empty,
                    ContactEmail = input.ContactEmail ?? string.Empty,
                    AddressGermany = input.AddressGermany ?? string.Empty,
                    AddressTurkeyMersin = input.AddressTurkeyMersin ?? string.Empty,
                    AddressTurkeyIstanbul = input.AddressTurkeyIstanbul ?? string.Empty,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = updatedBy
                };
                _context.ContentSettings.Add(newSettings);
            }
            else
            {
                existing.FooterCompanyDescDe = input.FooterCompanyDescDe ?? string.Empty;
                existing.FooterCompanyDescTr = input.FooterCompanyDescTr ?? string.Empty;
                existing.FooterCompanyDescEn = input.FooterCompanyDescEn;
                existing.FooterCompanyDescAr = input.FooterCompanyDescAr;
                existing.FacebookUrl = input.FacebookUrl;
                existing.InstagramUrl = input.InstagramUrl;
                existing.TwitterUrl = input.TwitterUrl;
                existing.LinkedInUrl = input.LinkedInUrl;
                existing.AboutMissionText1De = input.AboutMissionText1De ?? string.Empty;
                existing.AboutMissionText1Tr = input.AboutMissionText1Tr ?? string.Empty;
                existing.AboutMissionText1En = input.AboutMissionText1En;
                existing.AboutMissionText1Ar = input.AboutMissionText1Ar;
                existing.AboutMissionText2De = input.AboutMissionText2De ?? string.Empty;
                existing.AboutMissionText2Tr = input.AboutMissionText2Tr ?? string.Empty;
                existing.AboutMissionText2En = input.AboutMissionText2En;
                existing.AboutMissionText2Ar = input.AboutMissionText2Ar;
                existing.ContactPhone = input.ContactPhone ?? string.Empty;
                existing.ContactEmail = input.ContactEmail ?? string.Empty;
                existing.AddressGermany = input.AddressGermany ?? string.Empty;
                existing.AddressTurkeyMersin = input.AddressTurkeyMersin ?? string.Empty;
                existing.AddressTurkeyIstanbul = input.AddressTurkeyIstanbul ?? string.Empty;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = updatedBy;
            }

            await _context.SaveChangesAsync();
            _cache.Remove("content_settings_cache");
            _logger.LogInformation("Content settings updated");

            return (await GetContentSettingsAsync())!;
        }

        #endregion

        #region SystemSettings

        public async Task<SystemSettingsDto?> GetSystemSettingsAsync()
        {
            var cacheKey = "system_settings_cache";
            if (_cache.TryGetValue(cacheKey, out SystemSettings? cached))
                return cached != null ? MapToSystemSettingsDto(cached) : null;

            var settings = await _context.SystemSettings.AsNoTracking().FirstOrDefaultAsync();
            if (settings != null)
            {
                _cache.Set(cacheKey, settings, TimeSpan.FromMinutes(5));
                return MapToSystemSettingsDto(settings);
            }
            return null;
        }

        public async Task<SystemSettingsDto> UpsertSystemSettingsAsync(SystemSettingsDto input, string? updatedBy = null)
        {
            var existing = await _context.SystemSettings.FirstOrDefaultAsync();
            if (existing == null)
            {
                var newSettings = new SystemSettings
                {
                    SiteName = input.SiteName ?? string.Empty,
                    SiteUrl = input.SiteUrl ?? string.Empty,
                    AdminEmail = input.AdminEmail ?? string.Empty,
                    PortalUrl = input.PortalUrl ?? "https://portal.worklines.de",
                    SupportEmail = input.SupportEmail ?? "support@worklines.de",
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = updatedBy
                };
                _context.SystemSettings.Add(newSettings);
            }
            else
            {
                existing.SiteName = input.SiteName ?? string.Empty;
                existing.SiteUrl = input.SiteUrl ?? string.Empty;
                existing.AdminEmail = input.AdminEmail ?? string.Empty;
                existing.PortalUrl = input.PortalUrl ?? existing.PortalUrl;
                existing.SupportEmail = input.SupportEmail ?? existing.SupportEmail;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = updatedBy;
            }

            await _context.SaveChangesAsync();
            _cache.Remove("system_settings_cache");
            _logger.LogInformation("System settings updated");

            return (await GetSystemSettingsAsync())!;
        }

        #endregion

        #region UserPreference

        public async Task<UserPreferenceDto> GetOrCreateUserPreferenceAsync(string userId)
        {
            if (!int.TryParse(userId, out int userIdInt))
                throw new ArgumentException("Invalid userId format", nameof(userId));
            
            var pref = await _context.UserPreferences.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userIdInt);
            if (pref != null) return MapToUserPreferenceDto(pref);
            
            var created = new UserPreference 
            { 
                UserId = userIdInt, 
                Language = "de", 
                Theme = "light", 
                UpdatedAt = DateTime.UtcNow 
            };
            _context.UserPreferences.Add(created);
            await _context.SaveChangesAsync();
            return MapToUserPreferenceDto(created);
        }

        public async Task<UserPreferenceDto> UpsertUserPreferenceAsync(string userId, string? language, string? theme)
        {
            if (!int.TryParse(userId, out int userIdInt))
                throw new ArgumentException("Invalid userId format", nameof(userId));
            
            var pref = await _context.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userIdInt);
            if (pref == null)
            {
                pref = new UserPreference { UserId = userIdInt };
                _context.UserPreferences.Add(pref);
            }
            if (!string.IsNullOrWhiteSpace(language)) pref.Language = language!;
            if (!string.IsNullOrWhiteSpace(theme)) pref.Theme = theme!;
            pref.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return MapToUserPreferenceDto(pref);
        }

        #endregion

        #region Mapping

        private NewsItemDto MapToNewsDto(NewsItem n) => new NewsItemDto
        {
            Id = n.Id,
            TitleDe = n.TitleDe,
            TitleTr = n.TitleTr,
            TitleEn = n.TitleEn,
            TitleAr = n.TitleAr,
            ExcerptDe = n.ExcerptDe,
            ExcerptTr = n.ExcerptTr,
            ExcerptEn = n.ExcerptEn,
            ExcerptAr = n.ExcerptAr,
            ContentDe = n.ContentDe,
            ContentTr = n.ContentTr,
            ContentEn = n.ContentEn,
            ContentAr = n.ContentAr,
            ImageUrl = n.ImageUrl,
            Category = n.Category,
            Featured = n.Featured,
            PublishedAt = n.PublishedAt,
            Slug = n.Slug,
            DisplayOrder = n.DisplayOrder,
            IsActive = n.IsActive
        };

        private TeamMemberDto MapToTeamDto(TeamMember t) => new TeamMemberDto
        {
            Id = t.Id,
            Name = t.Name,
            Slug = t.Slug,
            ImageUrl = t.ImageUrl,
            Email = t.Email,
            Phone = t.Phone,
            Experience = t.Experience,
            PositionDe = t.PositionDe,
            PositionTr = t.PositionTr,
            PositionEn = t.PositionEn,
            LocationDe = t.LocationDe,
            LocationTr = t.LocationTr,
            LocationEn = t.LocationEn,
            EducationDe = t.EducationDe,
            EducationTr = t.EducationTr,
            EducationEn = t.EducationEn,
            BioDe = t.BioDe,
            BioTr = t.BioTr,
            BioEn = t.BioEn,
            PhilosophyDe = t.PhilosophyDe,
            PhilosophyTr = t.PhilosophyTr,
            PhilosophyEn = t.PhilosophyEn,
            SpecializationsDe = t.SpecializationsDe,
            SpecializationsTr = t.SpecializationsTr,
            SpecializationsEn = t.SpecializationsEn,
            LanguagesDe = t.LanguagesDe,
            LanguagesTr = t.LanguagesTr,
            LanguagesEn = t.LanguagesEn,
            AchievementsDe = t.AchievementsDe,
            AchievementsTr = t.AchievementsTr,
            AchievementsEn = t.AchievementsEn,
            DisplayOrder = t.DisplayOrder,
            IsActive = t.IsActive,
            CanProvideConsultation = t.CanProvideConsultation,
            ConsultationPrice = t.ConsultationPrice,
            ConsultationCurrency = t.ConsultationCurrency
        };

        private TranslationDto MapToTranslationDto(Translation t) => new TranslationDto
        {
            Id = t.Id,
            Key = t.Key,
            De = t.De,
            Tr = t.Tr,
            En = t.En,
            Ar = t.Ar
        };

        private ContentSettingsDto MapToContentSettingsDto(ContentSettings s) => new ContentSettingsDto
        {
            Id = s.Id,
            FooterCompanyDescDe = s.FooterCompanyDescDe,
            FooterCompanyDescTr = s.FooterCompanyDescTr,
            FooterCompanyDescEn = s.FooterCompanyDescEn,
            FooterCompanyDescAr = s.FooterCompanyDescAr,
            FacebookUrl = s.FacebookUrl,
            InstagramUrl = s.InstagramUrl,
            TwitterUrl = s.TwitterUrl,
            LinkedInUrl = s.LinkedInUrl,
            AboutMissionText1De = s.AboutMissionText1De,
            AboutMissionText1Tr = s.AboutMissionText1Tr,
            AboutMissionText1En = s.AboutMissionText1En,
            AboutMissionText1Ar = s.AboutMissionText1Ar,
            AboutMissionText2De = s.AboutMissionText2De,
            AboutMissionText2Tr = s.AboutMissionText2Tr,
            AboutMissionText2En = s.AboutMissionText2En,
            AboutMissionText2Ar = s.AboutMissionText2Ar,
            ContactPhone = s.ContactPhone,
            ContactEmail = s.ContactEmail,
            AddressGermany = s.AddressGermany,
            AddressTurkeyMersin = s.AddressTurkeyMersin,
            AddressTurkeyIstanbul = s.AddressTurkeyIstanbul
        };

        private SystemSettingsDto MapToSystemSettingsDto(SystemSettings s) => new SystemSettingsDto
        {
            Id = s.Id,
            SiteName = s.SiteName,
            SiteUrl = s.SiteUrl,
            AdminEmail = s.AdminEmail,
            PortalUrl = s.PortalUrl,
            SupportEmail = s.SupportEmail
        };

        private UserPreferenceDto MapToUserPreferenceDto(UserPreference p) => new UserPreferenceDto
        {
            Id = p.Id,
            UserId = p.UserId,
            Language = p.Language,
            Theme = p.Theme
        };

        #endregion
    }
}

