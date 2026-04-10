using wixi.Appointments.DTOs;

namespace wixi.Appointments.Interfaces;

public interface IAppointmentService
{
    Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto, int? createdById);
    Task<AppointmentDto> UpdateAppointmentAsync(long appointmentId, UpdateAppointmentDto dto);
    Task<bool> DeleteAppointmentAsync(long appointmentId);
    Task<AppointmentDto?> GetAppointmentByIdAsync(long appointmentId);
    Task<List<AppointmentDto>> GetAppointmentsAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<List<AppointmentDto>> GetAppointmentsByClientAsync(int clientId);
    Task<List<AppointmentDto>> GetAppointmentsByDateRangeAsync(DateTime startDate, DateTime endDate);
    
    // Holiday management
    Task<HolidayDto> CreateHolidayAsync(CreateHolidayDto dto);
    Task<HolidayDto> UpdateHolidayAsync(long holidayId, UpdateHolidayDto dto);
    Task<bool> DeleteHolidayAsync(long holidayId);
    Task<List<HolidayDto>> GetHolidaysAsync(DateTime? startDate = null, DateTime? endDate = null);
}

