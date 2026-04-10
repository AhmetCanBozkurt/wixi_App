namespace wixi.Appointments.DTOs;

public class AppointmentDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? ClientEmail { get; set; }
    public int? ClientId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Color { get; set; } = "#3B82F6";
    public int? CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateAppointmentDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? ClientEmail { get; set; }
    public int? ClientId { get; set; }
    public string Status { get; set; } = "Pending";
    public string Color { get; set; } = "#3B82F6";
}

public class UpdateAppointmentDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? ClientName { get; set; }
    public string? ClientPhone { get; set; }
    public string? ClientEmail { get; set; }
    public int? ClientId { get; set; }
    public string? Status { get; set; }
    public string? Color { get; set; }
}

public class HolidayDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsRecurring { get; set; }
    public string CountryCode { get; set; } = "TR";
    public DateTime CreatedAt { get; set; }
}

public class CreateHolidayDto
{
    public string Name { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsRecurring { get; set; } = false;
    public string CountryCode { get; set; } = "TR";
}

public class UpdateHolidayDto
{
    public string? Name { get; set; }
    public DateTime? Date { get; set; }
    public bool? IsRecurring { get; set; }
    public string? CountryCode { get; set; }
}

