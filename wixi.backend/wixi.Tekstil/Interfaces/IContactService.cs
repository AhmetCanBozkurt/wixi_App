using System.Collections.Generic;
using System.Threading.Tasks;
using wixi.Tekstil.DTOs;

namespace wixi.Tekstil.Interfaces
{
    public interface IContactService
    {
        Task<ContactInfoDto?> GetContactInfoAsync(string? languageCode = null);
        Task<ContactInfoDto> CreateOrUpdateContactInfoAsync(CreateOrUpdateContactInfoDto dto);
        Task<List<ContactSubmissionDto>> GetAllSubmissionsAsync();
        Task<ContactSubmissionDto?> GetSubmissionByIdAsync(int id);
        Task<ContactSubmissionDto> CreateSubmissionAsync(CreateContactSubmissionDto dto);
        Task<ContactSubmissionDto> UpdateSubmissionStatusAsync(int id, UpdateContactSubmissionStatusDto dto);
        Task<bool> DeleteSubmissionAsync(int id);
    }
}


