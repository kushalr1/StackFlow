using System.ComponentModel.DataAnnotations;
using stackflow_api.Models;

namespace stackflow_api.DTOs;

public class CreateEmployeeLeaveDto : IValidatableObject
{
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
        var today = DateOnly.FromDateTime(DateTime.Today);
        var latestDate = today.AddYears(1);

        if (StartDate is { } startDate && (startDate < today || startDate > latestDate))
        {
            yield return new ValidationResult(
                $"Start date must be between {today:yyyy-MM-dd} and {latestDate:yyyy-MM-dd}.",
                [nameof(StartDate)]);
        }

        if (EndDate is { } endDate && (endDate < today || endDate > latestDate))
        {
            yield return new ValidationResult(
                $"End date must be between {today:yyyy-MM-dd} and {latestDate:yyyy-MM-dd}.",
                [nameof(EndDate)]);
        }

        if (StartDate is { } start && EndDate is { } end && end < start)
        {
            yield return new ValidationResult(
                "End date cannot be before start date.",
                [nameof(EndDate)]);
        }
    }
}
