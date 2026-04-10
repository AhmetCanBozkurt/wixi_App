using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Applications.Entities;
using wixi.Applications.DTOs;
using wixi.Applications.Interfaces;

namespace wixi.WebAPI.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<ApplicationService> _logger;

        public ApplicationService(
            WixiDbContext context,
            ILogger<ApplicationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ApplicationDto> CreateApplicationAsync(ApplicationDto createDto)
        {
            // Validate client
            var clientExists = await _context.Clients.AnyAsync(c => c.Id == createDto.ClientId);
            if (!clientExists)
            {
                throw new Exception("Client not found");
            }

            // Get template with steps
            var template = await _context.ApplicationTemplates
                .Include(t => t.StepTemplates)
                    .ThenInclude(st => st.SubStepTemplates)
                .FirstOrDefaultAsync(t => t.Id == createDto.ApplicationTemplateId && t.IsActive);

            if (template == null)
            {
                throw new Exception("Application template not found or inactive");
            }

            // Create application
            var application = new wixi.Applications.Entities.Application
            {
                ClientId = createDto.ClientId,
                ApplicationTemplateId = createDto.ApplicationTemplateId,
                Status = ApplicationStatus.InProgress,
                StartDate = DateTime.UtcNow,
                ExpectedCompletionDate = DateTime.UtcNow.AddDays(template.EstimatedDurationDays ?? 30),
                Notes = createDto.Notes,
                ApplicationNumber = $"APP-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(10000, 99999)}"
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            // Create steps from template
            bool isFirstStep = true;
            foreach (var stepTemplate in template.StepTemplates.OrderBy(st => st.StepOrder))
            {
                var step = new ApplicationStep
                {
                    ApplicationId = application.Id,
                    StepTemplateId = stepTemplate.Id,
                    Title = stepTemplate.Title_TR,
                    StepOrder = stepTemplate.StepOrder,
                    Status = isFirstStep ? StepStatus.InProgress : StepStatus.NotStarted
                };

                if (isFirstStep)
                {
                    step.StartDate = DateTime.UtcNow;
                }

                _context.ApplicationSteps.Add(step);
                await _context.SaveChangesAsync();

                // Create sub-steps from template
                bool isFirstSubStep = true;
                foreach (var subStepTemplate in stepTemplate.SubStepTemplates.OrderBy(sst => sst.SubStepOrder))
                {
                    var isFirstSubStepOfFirstStep = isFirstStep && isFirstSubStep;
                    var subStepStatus = isFirstSubStepOfFirstStep ? StepStatus.InProgress : StepStatus.NotStarted;
                    
                    var subStep = new ApplicationSubStep
                    {
                        ApplicationStepId = step.Id,
                        SubStepTemplateId = subStepTemplate.Id,
                        Name = subStepTemplate.Name_TR,
                        SubStepOrder = subStepTemplate.SubStepOrder,
                        Status = subStepStatus
                    };

                    if (isFirstSubStepOfFirstStep)
                    {
                        _logger.LogInformation(
                            "Creating first sub-step '{SubStepName}' (Order: {Order}) with Status: {Status} for first step '{StepTitle}' (Order: {StepOrder}) in Application {ApplicationId}",
                            subStepTemplate.Name_TR, subStepTemplate.SubStepOrder, subStepStatus, stepTemplate.Title_TR, stepTemplate.StepOrder, application.Id);
                    }

                    _context.ApplicationSubSteps.Add(subStep);
                    isFirstSubStep = false;
                }

                isFirstStep = false;
            }

            await _context.SaveChangesAsync();

            // Add history entry
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == createDto.ClientId);
            
            if (client != null && client.UserId > 0)
            {
                var history = new ApplicationHistory
                {
                    ApplicationId = application.Id,
                    Action = "Created",
                    Description = $"Application created using template: {template.Name_TR}",
                    UserId = client.UserId,
                    UserType = "Client",
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.ApplicationHistories.Add(history);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("Application created: {ApplicationId} for client {ClientId}",
                application.Id, createDto.ClientId);

            return await GetApplicationByIdAsync(application.Id);
        }

        public async Task<ApplicationDto> GetApplicationByIdAsync(long applicationId)
        {
            var application = await _context.Applications
                .Include(a => a.Template)
                .Include(a => a.Steps)
                    .ThenInclude(s => s.SubSteps)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
            {
                throw new Exception("Application not found");
            }

            return await MapToApplicationDtoAsync(application);
        }

        public async Task<List<ApplicationDto>> GetClientApplicationsAsync(int clientId)
        {
            var applications = await _context.Applications
                .Include(a => a.Template)
                .Include(a => a.Steps)
                    .ThenInclude(s => s.SubSteps)
                .Where(a => a.ClientId == clientId)
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();

            _logger.LogInformation("Found {Count} applications for client {ClientId}", applications.Count, clientId);
            
            var result = new List<ApplicationDto>();
            foreach (var app in applications)
            {
                result.Add(await MapToApplicationDtoAsync(app));
            }
            return result;
        }

        public async Task<List<ApplicationDto>> GetAllApplicationsAsync()
        {
            var applications = await _context.Applications
                .Include(a => a.Template)
                .Include(a => a.Steps)
                    .ThenInclude(s => s.SubSteps)
                .OrderByDescending(a => a.StartDate)
                .ToListAsync();

            var result = new List<ApplicationDto>();
            foreach (var app in applications)
            {
                result.Add(await MapToApplicationDtoAsync(app));
            }
            return result;
        }

        public async Task<ApplicationDto> UpdateApplicationAsync(long applicationId, ApplicationDto updateDto)
        {
            var application = await _context.Applications
                .Include(a => a.Template)
                .Include(a => a.Steps)
                    .ThenInclude(s => s.SubSteps)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
            {
                throw new Exception("Application not found");
            }

            var oldNotes = application.Notes;
            application.Notes = updateDto.Notes;
            application.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Add history
            var history = new ApplicationHistory
            {
                ApplicationId = applicationId,
                Action = "Updated",
                Description = "Application notes updated",
                OldValue = oldNotes,
                NewValue = updateDto.Notes,
                UserId = 1, // TODO: Get from authenticated user
                UserType = "Admin",
                CreatedAt = DateTime.UtcNow
            };
            _context.ApplicationHistories.Add(history);
            await _context.SaveChangesAsync();

            return await MapToApplicationDtoAsync(application);
        }

        public async Task<bool> DeleteApplicationAsync(long applicationId)
        {
            var application = await _context.Applications
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
            {
                throw new Exception("Application not found");
            }

            _context.Applications.Remove(application);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Application deleted: {ApplicationId}", applicationId);
            return true;
        }

        public async Task<ApplicationTemplateDto> GetTemplateByIdAsync(int templateId)
        {
            var template = await _context.ApplicationTemplates
                .Include(t => t.StepTemplates)
                    .ThenInclude(st => st.SubStepTemplates)
                .FirstOrDefaultAsync(t => t.Id == templateId && t.IsActive);

            if (template == null)
            {
                throw new Exception("Template not found");
            }

            return MapToTemplateDto(template);
        }

        public async Task<List<ApplicationTemplateDto>> GetAllTemplatesAsync()
        {
            var templates = await _context.ApplicationTemplates
                .Include(t => t.StepTemplates)
                    .ThenInclude(st => st.SubStepTemplates)
                .Where(t => t.IsActive)
                .OrderBy(t => t.DisplayOrder)
                .ToListAsync();

            return templates.Select(t => MapToTemplateDto(t)).ToList();
        }

        // Helper methods
        private async Task<ApplicationDto> MapToApplicationDtoAsync(wixi.Applications.Entities.Application application)
        {
            var totalSteps = application.Steps?.Count ?? 0;
            var completedSteps = application.Steps?.Count(s => s.Status == StepStatus.Completed) ?? 0;
            var currentStep = application.Steps?
                .Where(s => s.Status == StepStatus.InProgress)
                .OrderBy(s => s.StepOrder)
                .FirstOrDefault();

            // Map steps with substeps
            var stepsDto = application.Steps?
                .OrderBy(s => s.StepOrder)
                .Select(step => new ApplicationStepDto
                {
                    Id = step.Id,
                    ApplicationId = step.ApplicationId,
                    Title = step.Title ?? string.Empty,
                    StepOrder = step.StepOrder,
                    Status = step.Status.ToString(),
                    ProgressPercentage = step.SubSteps?.Count > 0
                        ? (int)((double)(step.SubSteps.Count(s => s.Status == StepStatus.Completed)) / step.SubSteps.Count * 100)
                        : step.Status == StepStatus.Completed ? 100 : step.Status == StepStatus.InProgress ? 50 : 0,
                    StartDate = step.StartDate,
                    CompletionDate = step.CompletionDate,
                    DueDate = step.DueDate,
                    AssignedTo = step.AssignedTo,
                    SubSteps = step.SubSteps?
                        .OrderBy(s => s.SubStepOrder)
                        .Select(subStep => new ApplicationSubStepDto
                        {
                            Id = subStep.Id,
                            ApplicationStepId = subStep.ApplicationStepId,
                            Name = subStep.Name ?? string.Empty,
                            SubStepOrder = subStep.SubStepOrder,
                            Status = subStep.Status.ToString(),
                            FileNumber = subStep.FileNumber,
                            InfoMessage = subStep.InfoMessage,
                            CompletionDate = subStep.CompletionDate
                        })
                        .ToList() ?? new List<ApplicationSubStepDto>()
                })
                .ToList() ?? new List<ApplicationStepDto>();

            // Get client name if available
            string? clientName = null;
            try
            {
                var client = await _context.Clients
                    .FirstOrDefaultAsync(c => c.Id == application.ClientId && c.DeletedAt == null);
                if (client != null)
                {
                    clientName = $"{client.FirstName} {client.LastName}".Trim();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not load client name for application {ApplicationId}", application.Id);
            }

            // Get template name if available
            var templateName = application.Template != null
                ? application.Template.Name_TR
                : null;

            return new ApplicationDto
            {
                Id = application.Id,
                ClientId = application.ClientId,
                ClientName = clientName,
                ApplicationTemplateId = application.ApplicationTemplateId,
                TemplateName = templateName,
                Type = application.Type.ToString(),
                Status = application.Status.ToString(),
                ApplicationNumber = application.ApplicationNumber,
                StartDate = application.StartDate,
                ExpectedCompletionDate = application.ExpectedCompletionDate,
                CompletionDate = application.CompletionDate,
                Notes = application.Notes,
                ProgressPercentage = totalSteps > 0 ? (int)((double)completedSteps / totalSteps * 100) : 0,
                CreatedAt = application.CreatedAt,
                Steps = stepsDto
            };
        }

        private ApplicationTemplateDto MapToTemplateDto(ApplicationTemplate template)
        {
            return new ApplicationTemplateDto
            {
                Id = template.Id,
                Name_TR = template.Name_TR,
                Name_EN = template.Name_EN,
                Name_DE = template.Name_DE,
                Name_AR = template.Name_AR,
                Description_TR = template.Description_TR,
                Description_EN = template.Description_EN,
                Description_DE = template.Description_DE,
                Description_AR = template.Description_AR,
                Type = template.Type.ToString(),
                IsActive = template.IsActive,
                IsDefault = template.IsDefault,
                DisplayOrder = template.DisplayOrder,
                IconName = template.IconName,
                EstimatedDurationDays = template.EstimatedDurationDays,
                MinDurationDays = template.MinDurationDays,
                MaxDurationDays = template.MaxDurationDays,
                StepTemplates = template.StepTemplates
                    .Where(st => st.IsActive)
                    .OrderBy(st => st.StepOrder)
                    .Select(st => new ApplicationStepTemplateDto
                    {
                        Id = st.Id,
                        ApplicationTemplateId = st.ApplicationTemplateId,
                        Title_TR = st.Title_TR,
                        Title_EN = st.Title_EN,
                        Title_DE = st.Title_DE,
                        Title_AR = st.Title_AR,
                        Description_TR = st.Description_TR,
                        Description_EN = st.Description_EN,
                        Description_DE = st.Description_DE,
                        Description_AR = st.Description_AR,
                        StepOrder = st.StepOrder,
                        IconName = st.IconName,
                        IsRequired = st.IsRequired,
                        IsActive = st.IsActive,
                        EstimatedDurationDays = st.EstimatedDurationDays,
                        SubStepTemplates = st.SubStepTemplates
                            .Where(sst => sst.IsActive)
                            .OrderBy(sst => sst.SubStepOrder)
                            .Select(sst => new ApplicationSubStepTemplateDto
                            {
                                Id = sst.Id,
                                StepTemplateId = sst.StepTemplateId,
                                Name_TR = sst.Name_TR,
                                Name_EN = sst.Name_EN,
                                Name_DE = sst.Name_DE,
                                Name_AR = sst.Name_AR,
                                Description_TR = sst.Description_TR,
                                Description_EN = sst.Description_EN,
                                Description_DE = sst.Description_DE,
                                Description_AR = sst.Description_AR,
                                SubStepOrder = sst.SubStepOrder,
                                IsRequired = sst.IsRequired,
                                IsActive = sst.IsActive,
                                EstimatedDurationDays = sst.EstimatedDurationDays
                            })
                            .ToList()
                    })
                    .ToList()
            };
        }

        public async Task<ApplicationStepDto> UpdateStepAsync(long stepId, StepUpdateDto updateDto, int userId)
        {
            var step = await _context.ApplicationSteps
                .Include(s => s.Application)
                .Include(s => s.SubSteps)
                .FirstOrDefaultAsync(s => s.Id == stepId);

            if (step == null)
            {
                throw new Exception("Step not found");
            }

            var oldStatus = step.Status.ToString();

            // Parse and update status
            if (Enum.TryParse<StepStatus>(updateDto.Status, true, out var newStatus))
            {
                step.Status = newStatus;

                if (newStatus == StepStatus.InProgress && step.StartDate == null)
                {
                    step.StartDate = DateTime.UtcNow;
                }
                else if (newStatus == StepStatus.Completed)
                {
                    step.CompletionDate = DateTime.UtcNow;
                }
            }

            step.Notes = updateDto.Notes;
            step.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Step {StepId} updated to status {Status} by user {UserId}", stepId, newStatus, userId);

            return MapToStepDto(step);
        }

        public async Task<ApplicationSubStepDto> UpdateSubStepAsync(long subStepId, SubStepUpdateDto updateDto, int userId)
        {
            var subStep = await _context.ApplicationSubSteps
                .Include(ss => ss.Step)
                    .ThenInclude(s => s.SubSteps)
                .Include(ss => ss.Step)
                    .ThenInclude(s => s.Application)
                .FirstOrDefaultAsync(ss => ss.Id == subStepId);

            if (subStep == null)
            {
                throw new Exception("Sub-step not found");
            }

            var oldSubStepStatus = subStep.Status;

            // Parse and update status
            if (Enum.TryParse<StepStatus>(updateDto.Status, true, out var newStatus))
            {
                subStep.Status = newStatus;

                if (newStatus == StepStatus.Completed && subStep.CompletionDate == null)
                {
                    subStep.CompletionDate = DateTime.UtcNow;
                }
                else if (newStatus != StepStatus.Completed)
                {
                    subStep.CompletionDate = null;
                }
            }

            subStep.Notes = updateDto.Notes;
            subStep.UpdatedAt = DateTime.UtcNow;

            // Auto-update parent step status based on sub-steps
            await UpdateParentStepStatusAsync(subStep.Step);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Sub-step {SubStepId} updated from {OldStatus} to {NewStatus} by user {UserId}", 
                subStepId, oldSubStepStatus, newStatus, userId);

            return MapToSubStepDto(subStep);
        }

        private async Task UpdateParentStepStatusAsync(ApplicationStep step)
        {
            // Load all substeps if not already loaded
            if (step.SubSteps == null || !step.SubSteps.Any())
            {
                await _context.Entry(step).Collection(s => s.SubSteps).LoadAsync();
            }

            var allSubSteps = step.SubSteps.ToList();
            
            if (!allSubSteps.Any())
            {
                _logger.LogWarning("Step {StepId} has no sub-steps", step.Id);
                return;
            }

            var allNotStarted = allSubSteps.All(ss => ss.Status == StepStatus.NotStarted);
            var allCompleted = allSubSteps.All(ss => ss.Status == StepStatus.Completed);
            var anyInProgress = allSubSteps.Any(ss => ss.Status == StepStatus.InProgress);
            var anyCompleted = allSubSteps.Any(ss => ss.Status == StepStatus.Completed);

            var oldStepStatus = step.Status;

            if (allCompleted)
            {
                // All sub-steps completed -> Step is Completed
                step.Status = StepStatus.Completed;
                if (step.CompletionDate == null)
                {
                    step.CompletionDate = DateTime.UtcNow;
                }
                _logger.LogInformation("Step {StepId} auto-updated to Completed (all sub-steps completed)", step.Id);
            }
            else if (allNotStarted)
            {
                // All sub-steps not started -> Step is NotStarted
                step.Status = StepStatus.NotStarted;
                step.StartDate = null;
                step.CompletionDate = null;
                _logger.LogInformation("Step {StepId} auto-updated to NotStarted (all sub-steps not started)", step.Id);
            }
            else if (anyInProgress || anyCompleted)
            {
                // Some sub-steps in progress or completed -> Step is InProgress
                if (step.Status != StepStatus.InProgress)
                {
                    step.Status = StepStatus.InProgress;
                    if (step.StartDate == null)
                    {
                        step.StartDate = DateTime.UtcNow;
                    }
                    step.CompletionDate = null;
                    _logger.LogInformation("Step {StepId} auto-updated to InProgress (some sub-steps in progress/completed)", step.Id);
                }
            }

            // Calculate progress percentage
            var completedCount = allSubSteps.Count(ss => ss.Status == StepStatus.Completed);
            step.ProgressPercentage = allSubSteps.Any() ? (int)Math.Round((double)completedCount / allSubSteps.Count * 100) : 0;

            step.UpdatedAt = DateTime.UtcNow;

            if (oldStepStatus != step.Status)
            {
                _logger.LogInformation("Step {StepId} status changed from {OldStatus} to {NewStatus}, Progress: {Progress}%", 
                    step.Id, oldStepStatus, step.Status, step.ProgressPercentage);
            }
        }

        private ApplicationStepDto MapToStepDto(ApplicationStep step)
        {
            return new ApplicationStepDto
            {
                Id = step.Id,
                ApplicationId = step.ApplicationId,
                Title = step.Title,
                StepOrder = step.StepOrder,
                Status = step.Status.ToString(),
                ProgressPercentage = step.SubSteps?.Count > 0
                    ? (int)((double)(step.SubSteps.Count(s => s.Status == StepStatus.Completed)) / step.SubSteps.Count * 100)
                    : step.Status == StepStatus.Completed ? 100 : step.Status == StepStatus.InProgress ? 50 : 0,
                StartDate = step.StartDate,
                CompletionDate = step.CompletionDate,
                DueDate = step.DueDate,
                AssignedTo = step.AssignedTo,
                SubSteps = step.SubSteps?
                    .OrderBy(s => s.SubStepOrder)
                    .Select(s => MapToSubStepDto(s))
                    .ToList()
            };
        }

        private ApplicationSubStepDto MapToSubStepDto(ApplicationSubStep subStep)
        {
            return new ApplicationSubStepDto
            {
                Id = subStep.Id,
                ApplicationStepId = subStep.ApplicationStepId,
                Name = subStep.Name,
                SubStepOrder = subStep.SubStepOrder,
                Status = subStep.Status.ToString(),
                FileNumber = subStep.FileNumber,
                InfoMessage = subStep.InfoMessage,
                CompletionDate = subStep.CompletionDate
            };
        }
    }
}

