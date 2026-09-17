namespace stackflow_api.DTOs;

public class DepartmentDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int EmployeeCount { get; set; }
}
