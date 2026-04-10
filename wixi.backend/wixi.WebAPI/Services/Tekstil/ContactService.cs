using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Tekstil.DTOs;
using wixi.Tekstil.Entities;
using wixi.Tekstil.Interfaces;

namespace wixi.WebAPI.Services.Tekstil
{
    public class ContactService : IContactService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<ContactService> _logger;

        public ContactService(WixiDbContext context, ILogger<ContactService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Contact Info Methods

        public async Task<ContactInfoDto?> GetContactInfoAsync(string? languageCode = null)
        {
            var contactInfo = await _context.TekstilContactInfo
                .Include(c => c.Translations)
                .Where(c => c.IsActive)
                .FirstOrDefaultAsync();

            return contactInfo == null ? null : MapContactInfoToDto(contactInfo, languageCode);
        }

        public async Task<ContactInfoDto> CreateOrUpdateContactInfoAsync(CreateOrUpdateContactInfoDto dto)
        {
            var existingInfo = await _context.TekstilContactInfo.FirstOrDefaultAsync();

            if (existingInfo != null)
            {
                // Update existing
                existingInfo.CompanyName = dto.CompanyName;
                existingInfo.Address = dto.Address;
                existingInfo.Phone1 = dto.Phone1;
                existingInfo.Phone2 = dto.Phone2;
                existingInfo.Email1 = dto.Email1;
                existingInfo.Email2 = dto.Email2;
                existingInfo.City = dto.City;
                existingInfo.District = dto.District;
                existingInfo.PostalCode = dto.PostalCode;
                existingInfo.MapLatitude = dto.MapLatitude;
                existingInfo.MapLongitude = dto.MapLongitude;
                existingInfo.WhatsAppNumber = dto.WhatsAppNumber;
                existingInfo.IsActive = dto.IsActive;
                existingInfo.UpdatedAt = DateTime.UtcNow;
                existingInfo.UpdatedBy = dto.UpdatedBy;

                // Update translations
                if (dto.Translations != null)
                {
                    var existingTranslations = await _context.TekstilContactInfoTranslations
                        .Where(t => t.ContactInfoId == existingInfo.Id)
                        .ToListAsync();

                    _context.TekstilContactInfoTranslations.RemoveRange(existingTranslations);

                    foreach (var trans in dto.Translations)
                    {
                        var translation = new ContactInfoTranslation
                        {
                            ContactInfoId = existingInfo.Id,
                            LanguageCode = trans.LanguageCode,
                            CompanyName = trans.CompanyName,
                            Address = trans.Address,
                            WorkingHoursWeekday = trans.WorkingHoursWeekday,
                            WorkingHoursSaturday = trans.WorkingHoursSaturday,
                            WorkingHoursSunday = trans.WorkingHoursSunday,
                            WhatsAppDefaultMessage = trans.WhatsAppDefaultMessage,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.TekstilContactInfoTranslations.Add(translation);
                    }
                }

                await _context.SaveChangesAsync();
                return (await GetContactInfoAsync())!;
            }
            else
            {
                // Create new
                var contactInfo = new ContactInfo
                {
                    CompanyName = dto.CompanyName,
                    Address = dto.Address,
                    Phone1 = dto.Phone1,
                    Phone2 = dto.Phone2,
                    Email1 = dto.Email1,
                    Email2 = dto.Email2,
                    City = dto.City,
                    District = dto.District,
                    PostalCode = dto.PostalCode,
                    MapLatitude = dto.MapLatitude,
                    MapLongitude = dto.MapLongitude,
                    MapZoomLevel = 15,
                    WhatsAppNumber = dto.WhatsAppNumber,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = dto.UpdatedBy,
                    UpdatedBy = dto.UpdatedBy
                };

                _context.TekstilContactInfo.Add(contactInfo);
                await _context.SaveChangesAsync();

                // Add translations
                if (dto.Translations != null && dto.Translations.Any())
                {
                    foreach (var trans in dto.Translations)
                    {
                        var translation = new ContactInfoTranslation
                        {
                            ContactInfoId = contactInfo.Id,
                            LanguageCode = trans.LanguageCode,
                            CompanyName = trans.CompanyName,
                            Address = trans.Address,
                            WorkingHoursWeekday = trans.WorkingHoursWeekday,
                            WorkingHoursSaturday = trans.WorkingHoursSaturday,
                            WorkingHoursSunday = trans.WorkingHoursSunday,
                            WhatsAppDefaultMessage = trans.WhatsAppDefaultMessage,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.TekstilContactInfoTranslations.Add(translation);
                    }
                    await _context.SaveChangesAsync();
                }

                return (await GetContactInfoAsync())!;
            }
        }

        private ContactInfoDto MapContactInfoToDto(ContactInfo contactInfo, string? languageCode = null)
        {
            var dto = new ContactInfoDto
            {
                Id = contactInfo.Id,
                CompanyName = contactInfo.CompanyName,
                Address = contactInfo.Address,
                WorkingHoursWeekday = contactInfo.WorkingHoursWeekday,
                WorkingHoursSaturday = contactInfo.WorkingHoursSaturday,
                WorkingHoursSunday = contactInfo.WorkingHoursSunday,
                Phone1 = contactInfo.Phone1,
                Phone2 = contactInfo.Phone2,
                Email1 = contactInfo.Email1,
                Email2 = contactInfo.Email2,
                City = contactInfo.City,
                District = contactInfo.District,
                PostalCode = contactInfo.PostalCode,
                MapLatitude = contactInfo.MapLatitude,
                MapLongitude = contactInfo.MapLongitude,
                MapZoomLevel = contactInfo.MapZoomLevel,
                WhatsAppNumber = contactInfo.WhatsAppNumber,
                WhatsAppDefaultMessage = contactInfo.WhatsAppDefaultMessage,
                SocialMediaLinks = contactInfo.SocialMediaLinks,
                IsActive = contactInfo.IsActive
            };

            // If language code is specified, use translation
            if (!string.IsNullOrEmpty(languageCode))
            {
                var translation = contactInfo.Translations?.FirstOrDefault(t => t.LanguageCode == languageCode);
                if (translation != null)
                {
                    dto.CompanyName = translation.CompanyName ?? dto.CompanyName;
                    dto.Address = translation.Address ?? dto.Address;
                    dto.WorkingHoursWeekday = translation.WorkingHoursWeekday ?? dto.WorkingHoursWeekday;
                    dto.WorkingHoursSaturday = translation.WorkingHoursSaturday ?? dto.WorkingHoursSaturday;
                    dto.WorkingHoursSunday = translation.WorkingHoursSunday ?? dto.WorkingHoursSunday;
                    dto.WhatsAppDefaultMessage = translation.WhatsAppDefaultMessage ?? dto.WhatsAppDefaultMessage;
                }
            }

            return dto;
        }

        #endregion

        #region Contact Submission Methods

        public async Task<List<ContactSubmissionDto>> GetAllSubmissionsAsync()
        {
            var submissions = await _context.TekstilContactSubmissions
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return submissions.Select(s => MapSubmissionToDto(s)).ToList();
        }

        public async Task<ContactSubmissionDto?> GetSubmissionByIdAsync(int id)
        {
            var submission = await _context.TekstilContactSubmissions
                .FirstOrDefaultAsync(s => s.Id == id);

            return submission == null ? null : MapSubmissionToDto(submission);
        }

        public async Task<ContactSubmissionDto> CreateSubmissionAsync(CreateContactSubmissionDto dto)
        {
            var submission = new ContactSubmission
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Subject = dto.Subject,
                Message = dto.Message,
                Status = "New",
                Priority = "Medium",
                Source = dto.Source,
                LanguageCode = dto.LanguageCode,
                IpAddress = dto.IpAddress,
                UserAgent = dto.UserAgent,
                ReferrerUrl = dto.ReferrerUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TekstilContactSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            return (await GetSubmissionByIdAsync(submission.Id))!;
        }

        public async Task<ContactSubmissionDto> UpdateSubmissionStatusAsync(int id, UpdateContactSubmissionStatusDto dto)
        {
            var submission = await _context.TekstilContactSubmissions.FindAsync(id);
            if (submission == null)
                throw new KeyNotFoundException($"Contact submission with ID {id} not found");

            submission.Status = dto.Status;
            submission.ResponseMessage = dto.ResponseMessage;
            submission.ResponseDate = DateTime.UtcNow;
            submission.ResponseBy = dto.UpdatedBy;
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return (await GetSubmissionByIdAsync(submission.Id))!;
        }

        public async Task<bool> DeleteSubmissionAsync(int id)
        {
            var submission = await _context.TekstilContactSubmissions.FindAsync(id);
            if (submission == null)
                return false;

            _context.TekstilContactSubmissions.Remove(submission);
            await _context.SaveChangesAsync();
            return true;
        }

        private ContactSubmissionDto MapSubmissionToDto(ContactSubmission submission)
        {
            return new ContactSubmissionDto
            {
                Id = submission.Id,
                FullName = submission.FullName,
                Email = submission.Email,
                Phone = submission.Phone,
                Subject = submission.Subject,
                Message = submission.Message,
                Status = submission.Status,
                Priority = submission.Priority,
                AssignedTo = submission.AssignedTo,
                AssignedAt = submission.AssignedAt,
                ResponseMessage = submission.ResponseMessage,
                ResponseDate = submission.ResponseDate,
                ResponseBy = submission.ResponseBy,
                FollowUpDate = submission.FollowUpDate,
                Tags = submission.Tags,
                Source = submission.Source,
                LanguageCode = submission.LanguageCode,
                CreatedAt = submission.CreatedAt,
                UpdatedAt = submission.UpdatedAt
            };
        }

        #endregion
    }
}


