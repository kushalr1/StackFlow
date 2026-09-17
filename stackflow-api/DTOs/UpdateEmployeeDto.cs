using System.ComponentModel.DataAnnotations;
using stackflow_api.Validation;

namespace stackflow_api.DTOs;

public class UpdateEmployeeDto
{
    [Required(ErrorMessage = "Name is required.")]
    [MinLength(2, ErrorMessage = "Name must be at least 2 characters.")]
    [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
    [EmployeeName]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [MaxLength(255, ErrorMessage = "Email cannot exceed 255 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone is required.")]
    [RegularExpression(@"^\d{10,15}$", ErrorMessage = "Phone must contain 10 to 15 digits.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Department is required.")]
    [MaxLength(100, ErrorMessage = "Department cannot exceed 100 characters.")]
    public string Department { get; set; } = string.Empty;

    [Required(ErrorMessage = "Job title is required.")]
    [MaxLength(100, ErrorMessage = "Job title cannot exceed 100 characters.")]
    public string JobTitle { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "9999999999.99",
        ErrorMessage = "Salary must be greater than 0.")]
    public decimal Salary { get; set; }

    [Required(ErrorMessage = "Date of joining is required.")]
    public DateOnly? DateOfJoining { get; set; }

    public bool IsActive { get; set; }
}
