namespace stackflow_api.Models;

public class EmployeeProject
{
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string Role { get; set; } = "Member";
    public DateOnly? AssignedOn { get; set; }
    public DateOnly? RemovedOn { get; set; }
}
