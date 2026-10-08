using System.ComponentModel.DataAnnotations;

namespace stackflow_api.DTOs;

public class CreateProjectDto : SaveProjectDto
{
    [MaxLength(500)]
    public int[] EmployeeIds { get; set; } = [];
}
