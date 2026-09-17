using System.ComponentModel.DataAnnotations;
using stackflow_api.Models;

namespace stackflow_api.DTOs;

public class SaveProjectDto : IValidatableObject
{
    [Required(ErrorMessage = "Project name is required.")]
    [MinLength(2, ErrorMessage = "Project name must be at least 2 characters.")]
    [MaxLength(100, ErrorMessage = "Project name cannot exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Start date is required.")]
    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [EnumDataType(typeof(ProjectStatus), ErrorMessage = "Project status is invalid.")]
    public ProjectStatus Status { get; set; }

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
