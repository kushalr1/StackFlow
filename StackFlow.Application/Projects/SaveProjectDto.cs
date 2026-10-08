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

    public DateOnly? DueDate { get; set; }

    public DateOnly? CompletedOn { get; set; }

    [EnumDataType(typeof(ProjectStatus), ErrorMessage = "Project status is invalid.")]
    public ProjectStatus Status { get; set; }

    [EnumDataType(typeof(ProjectPriority), ErrorMessage = "Project priority is invalid.")]
    public ProjectPriority Priority { get; set; } = ProjectPriority.Medium;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (StartDate.HasValue && DueDate.HasValue && DueDate.Value < StartDate.Value)
        {
            yield return new ValidationResult(
                "Due date cannot be before start date.",
                [nameof(DueDate)]);
        }

        var today = DateOnly.FromDateTime(DateTime.Today);

        if ((Status == ProjectStatus.Active || Status == ProjectStatus.OnHold) &&
            StartDate.HasValue && StartDate.Value > today)
        {
            yield return new ValidationResult(
                "An active or on-hold project cannot start in the future.",
                [nameof(StartDate), nameof(Status)]);
        }

        if (Status == ProjectStatus.Completed && !CompletedOn.HasValue)
        {
            yield return new ValidationResult(
                "A completed project requires its actual completion date.",
                [nameof(CompletedOn), nameof(Status)]);
        }

        if (CompletedOn.HasValue && CompletedOn.Value > today)
        {
            yield return new ValidationResult(
                "The actual completion date cannot be in the future.",
                [nameof(CompletedOn)]);
        }

        if (StartDate.HasValue && CompletedOn.HasValue && CompletedOn.Value < StartDate.Value)
        {
            yield return new ValidationResult(
                "The actual completion date cannot be before the start date.",
                [nameof(CompletedOn)]);
        }

        if (Status != ProjectStatus.Completed && CompletedOn.HasValue)
        {
            yield return new ValidationResult(
                "Only completed projects can have an actual completion date.",
                [nameof(CompletedOn), nameof(Status)]);
        }
    }
}
