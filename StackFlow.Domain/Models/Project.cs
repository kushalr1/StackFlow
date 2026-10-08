namespace stackflow_api.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? DueDate { get; set; }
    public DateOnly? CompletedOn { get; set; }
    public ProjectStatus Status { get; set; }
    public ProjectPriority Priority { get; set; } = ProjectPriority.Medium;
    public ICollection<EmployeeProject> EmployeeProjects { get; set; } = [];
}
