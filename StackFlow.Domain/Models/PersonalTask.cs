namespace stackflow_api.Models;

public class PersonalTask
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public string Title { get; set; } = "";
    public string Period { get; set; } = "Daily";
    public DateOnly DueDate { get; set; }
    public bool IsCompleted { get; set; }
}
