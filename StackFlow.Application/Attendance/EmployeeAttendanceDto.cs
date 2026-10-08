namespace stackflow_api.DTOs;

public class EmployeeAttendanceDto
{
    public DateOnly Date { get; set; }

    public string Status { get; set; } = string.Empty;
}
