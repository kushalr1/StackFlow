using System.ComponentModel.DataAnnotations;
using stackflow_api.Models;

namespace stackflow_api.DTOs;

public class SaveLeaveRequestDto : IValidatableObject
{
    [Range(1, int.MaxValue, ErrorMessage = "Employee is required.")]
    public int EmployeeId { get; set; }

    [EnumDataType(typeof(LeaveType), ErrorMessage = "Leave type is invalid.")]
    public LeaveType LeaveType { get; set; }

    [Required(ErrorMessage = "Start date is required.")]
    public DateOnly? StartDate { get; set; }

    [Required(ErrorMessage = "End date is required.")]
    public DateOnly? EndDate { get; set; }

    [Required(ErrorMessage = "Reason is required.")]
    [MinLength(5, ErrorMessage = "Reason must be at least 5 characters.")]
    [MaxLength(500, ErrorMessage = "Reason cannot exceed 500 characters.")]
    public string Reason { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (StartDate.HasValue && EndDate.HasValue && EndDate.Value < StartDate.Value)
        {
            yield return new ValidationResult(
                "End date cannot be before start date.",
                [nameof(EndDate)]);
        }
    }
}
