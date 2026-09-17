using System.ComponentModel.DataAnnotations;

namespace stackflow_api.DTOs;

public class AssignEmployeeDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Employee is required.")]
    public int EmployeeId { get; set; }
}
