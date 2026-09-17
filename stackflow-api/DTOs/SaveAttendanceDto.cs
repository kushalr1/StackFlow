using System.ComponentModel.DataAnnotations;
using stackflow_api.Models;

namespace stackflow_api.DTOs;

public class SaveAttendanceDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Employee is required.")]
    public int EmployeeId { get; set; }

    [Required(ErrorMessage = "Date is required.")]
    public DateOnly? Date { get; set; }

    [EnumDataType(typeof(AttendanceStatus), ErrorMessage = "Attendance status is invalid.")]
    public AttendanceStatus Status { get; set; }
}
