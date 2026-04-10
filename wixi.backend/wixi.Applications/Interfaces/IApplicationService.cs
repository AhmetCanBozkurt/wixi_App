using wixi.Applications.DTOs;

namespace wixi.Applications.Interfaces
{
    public interface IApplicationService
    {
        Task<ApplicationDto> CreateApplicationAsync(ApplicationDto createDto);
        Task<ApplicationDto> GetApplicationByIdAsync(long applicationId);
        Task<List<ApplicationDto>> GetClientApplicationsAsync(int clientId);
        Task<List<ApplicationDto>> GetAllApplicationsAsync();
        Task<ApplicationDto> UpdateApplicationAsync(long applicationId, ApplicationDto updateDto);
        Task<bool> DeleteApplicationAsync(long applicationId);
        Task<ApplicationTemplateDto> GetTemplateByIdAsync(int templateId);
        Task<List<ApplicationTemplateDto>> GetAllTemplatesAsync();
        Task<ApplicationStepDto> UpdateStepAsync(long stepId, StepUpdateDto updateDto, int userId);
        Task<ApplicationSubStepDto> UpdateSubStepAsync(long subStepId, SubStepUpdateDto updateDto, int userId);
    }
}
