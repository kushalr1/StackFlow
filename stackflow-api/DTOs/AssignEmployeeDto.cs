using System.ComponentModel.DataAnnotations;

namespace stackflow_api.DTOs;

public class AssignEmployeeDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Employee is required.")]
    public int EmployeeId { get; set; }

    [Required(ErrorMessage = "Project role is required.")]
    [MaxLength(50, ErrorMessage = "Project role cannot exceed 50 characters.")]
    public string Role { get; set; } = "Member";

}
