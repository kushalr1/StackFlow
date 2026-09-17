namespace stackflow_api.DTOs;

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public IReadOnlyList<ProjectEmployeeDto> Employees { get; set; } = [];
}

public class ProjectEmployeeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
