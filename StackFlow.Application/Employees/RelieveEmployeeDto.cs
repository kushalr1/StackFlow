using System.ComponentModel.DataAnnotations;

namespace stackflow_api.DTOs;

public class RelieveEmployeeDto
{
    [Required(ErrorMessage = "Relieved date is required.")]
    public DateOnly? RelievedDate { get; set; }

    [MaxLength(500, ErrorMessage = "Relieving reason cannot exceed 500 characters.")]
    public string? Reason { get; set; }
}
