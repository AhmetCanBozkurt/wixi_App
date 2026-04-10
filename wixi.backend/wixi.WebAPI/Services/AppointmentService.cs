using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Appointments.Entities;
using wixi.Appointments.DTOs;
using wixi.Appointments.Interfaces;

namespace wixi.WebAPI.Services;

public class AppointmentService : IAppointmentService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(
        WixiDbContext context,
        ILogger<AppointmentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto, int? createdById)
    {
        // Validate time range
        if (dto.EndTime <= dto.StartTime)
        {
            throw new Exception("End time must be after start time");
        }

        var appointment = new Appointment
        {
            Title = dto.Title,
            Description = dto.Description,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            ClientName = dto.ClientName,
            ClientPhone = dto.ClientPhone,
            ClientEmail = dto.ClientEmail,
            ClientId = dto.ClientId,
            Status = Enum.Parse<AppointmentStatus>(dto.Status),
            Color = dto.Color,
            CreatedById = createdById,
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Appointment created. AppointmentId: {AppointmentId}, CreatedBy: {CreatedById}",
            appointment.Id, createdById);

        return await MapToDtoAsync(appointment);
    }

    public async Task<AppointmentDto> UpdateAppointmentAsync(long appointmentId, UpdateAppointmentDto dto)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            throw new Exception("Appointment not found");
        }

        if (dto.Title != null) appointment.Title = dto.Title;
        if (dto.Description != null) appointment.Description = dto.Description;
        if (dto.StartTime.HasValue) appointment.StartTime = dto.StartTime.Value;
        if (dto.EndTime.HasValue) appointment.EndTime = dto.EndTime.Value;
        if (dto.ClientName != null) appointment.ClientName = dto.ClientName;
        if (dto.ClientPhone != null) appointment.ClientPhone = dto.ClientPhone;
        if (dto.ClientEmail != null) appointment.ClientEmail = dto.ClientEmail;
        if (dto.ClientId.HasValue) appointment.ClientId = dto.ClientId;
        if (dto.Status != null) appointment.Status = Enum.Parse<AppointmentStatus>(dto.Status);
        if (dto.Color != null) appointment.Color = dto.Color;
        
        appointment.UpdatedAt = DateTime.UtcNow;

        // Validate time range
        if (appointment.EndTime <= appointment.StartTime)
        {
            throw new Exception("End time must be after start time");
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Appointment updated. AppointmentId: {AppointmentId}", appointmentId);

        return await MapToDtoAsync(appointment);
    }

    public async Task<bool> DeleteAppointmentAsync(long appointmentId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            throw new Exception("Appointment not found");
        }

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Appointment deleted. AppointmentId: {AppointmentId}", appointmentId);

        return true;
    }

    public async Task<AppointmentDto?> GetAppointmentByIdAsync(long appointmentId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
        {
            return null;
        }

        return await MapToDtoAsync(appointment);
    }

    public async Task<List<AppointmentDto>> GetAppointmentsAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Appointments
            .AsQueryable();

        if (startDate.HasValue)
        {
            query = query.Where(a => a.StartTime >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.StartTime <= endDate.Value);
        }

        var appointments = await query
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        var result = new List<AppointmentDto>();
        foreach (var appointment in appointments)
        {
            result.Add(await MapToDtoAsync(appointment));
        }

        return result;
    }

    public async Task<List<AppointmentDto>> GetAppointmentsByClientAsync(int clientId)
    {
        var appointments = await _context.Appointments
            .Where(a => a.ClientId == clientId)
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        var result = new List<AppointmentDto>();
        foreach (var appointment in appointments)
        {
            result.Add(await MapToDtoAsync(appointment));
        }

        return result;
    }

    public async Task<List<AppointmentDto>> GetAppointmentsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var appointments = await _context.Appointments
            .Where(a => a.StartTime >= startDate && a.StartTime <= endDate)
            .OrderBy(a => a.StartTime)
            .ToListAsync();

        var result = new List<AppointmentDto>();
        foreach (var appointment in appointments)
        {
            result.Add(await MapToDtoAsync(appointment));
        }

        return result;
    }

    public async Task<HolidayDto> CreateHolidayAsync(CreateHolidayDto dto)
    {
        var holiday = new Holiday
        {
            Name = dto.Name,
            Date = dto.Date.Date,  // Only date part
            IsRecurring = dto.IsRecurring,
            CountryCode = dto.CountryCode,
            CreatedAt = DateTime.UtcNow
        };

        _context.Holidays.Add(holiday);
        await _context.SaveChangesAsync();

        return MapToHolidayDto(holiday);
    }

    public async Task<HolidayDto> UpdateHolidayAsync(long holidayId, UpdateHolidayDto dto)
    {
        var holiday = await _context.Holidays
            .FirstOrDefaultAsync(h => h.Id == holidayId);

        if (holiday == null)
        {
            throw new Exception("Holiday not found");
        }

        if (dto.Name != null) holiday.Name = dto.Name;
        if (dto.Date.HasValue) holiday.Date = dto.Date.Value.Date;
        if (dto.IsRecurring.HasValue) holiday.IsRecurring = dto.IsRecurring.Value;
        if (dto.CountryCode != null) holiday.CountryCode = dto.CountryCode;

        await _context.SaveChangesAsync();

        return MapToHolidayDto(holiday);
    }

    public async Task<bool> DeleteHolidayAsync(long holidayId)
    {
        var holiday = await _context.Holidays
            .FirstOrDefaultAsync(h => h.Id == holidayId);

        if (holiday == null)
        {
            throw new Exception("Holiday not found");
        }

        _context.Holidays.Remove(holiday);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<HolidayDto>> GetHolidaysAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Holidays.AsQueryable();

        if (startDate.HasValue)
        {
            query = query.Where(h => h.Date >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            query = query.Where(h => h.Date <= endDate.Value.Date);
        }

        var holidays = await query
            .OrderBy(h => h.Date)
            .ToListAsync();

        return holidays.Select(MapToHolidayDto).ToList();
    }

    private async Task<AppointmentDto> MapToDtoAsync(Appointment appointment)
    {
        var dto = new AppointmentDto
        {
            Id = appointment.Id,
            Title = appointment.Title,
            Description = appointment.Description,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            ClientName = appointment.ClientName,
            ClientPhone = appointment.ClientPhone,
            ClientEmail = appointment.ClientEmail,
            ClientId = appointment.ClientId,
            Status = appointment.Status.ToString(),
            Color = appointment.Color,
            CreatedById = appointment.CreatedById,
            CreatedAt = appointment.CreatedAt,
            UpdatedAt = appointment.UpdatedAt
        };

        // Get creator name if available
        if (appointment.CreatedById.HasValue && appointment.CreatedById.Value > 0)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == appointment.CreatedById.Value);
            if (user != null)
            {
                dto.CreatedByName = $"{user.FirstName} {user.LastName}";
            }
        }

        return dto;
    }

    private HolidayDto MapToHolidayDto(Holiday holiday)
    {
        return new HolidayDto
        {
            Id = holiday.Id,
            Name = holiday.Name,
            Date = holiday.Date,
            IsRecurring = holiday.IsRecurring,
            CountryCode = holiday.CountryCode,
            CreatedAt = holiday.CreatedAt
        };
    }
}

