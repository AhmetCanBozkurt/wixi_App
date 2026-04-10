using wixi.Clients.DTOs;

namespace wixi.Clients.Interfaces
{
    public interface IClientService
    {
        Task<ClientDto> CreateClientAsync(ClientDto createDto);
        Task<ClientDto> GetClientByIdAsync(int clientId);
        Task<ClientDto> GetClientByUserIdAsync(int userId);
        Task<List<ClientDto>> GetAllClientsAsync();
        Task<ClientDto> UpdateClientAsync(int clientId, ClientDto updateDto);
        Task<bool> DeleteClientAsync(int clientId);
        
        Task<EducationInfoDto> AddEducationInfoAsync(EducationInfoDto createDto);
        Task<EducationInfoDto> UpdateEducationInfoAsync(int educationInfoId, EducationInfoDto updateDto);
        Task<bool> DeleteEducationInfoAsync(int educationInfoId);
        Task<List<EducationInfoDto>> GetClientEducationHistoryAsync(int clientId);
    }
}
