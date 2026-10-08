using System.ComponentModel.DataAnnotations;

namespace stackflow_api.DTOs;

public record EmployeeAccountDto(string Email, bool IsActive);

public class SetEmployeeAccessDto
{
    [Required]
    public bool? IsActive { get; set; }
}

public class CreateEmployeeAccountDto
{
    [Required]
    [StringLength(128, MinimumLength = 12)]
    public string Password { get; set; } = string.Empty;
}
