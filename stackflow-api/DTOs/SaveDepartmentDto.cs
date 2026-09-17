using System.ComponentModel.DataAnnotations;

namespace stackflow_api.DTOs;

public class SaveDepartmentDto
{
    [Required(ErrorMessage = "Department name is required.")]
    [MinLength(2, ErrorMessage = "Department name must be at least 2 characters.")]
    [MaxLength(100, ErrorMessage = "Department name cannot exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string Description { get; set; } = string.Empty;
}
