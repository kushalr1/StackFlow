namespace stackflow_api.Models;

public class Employee
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public int DepartmentId { get; set; }

    public Department Department { get; set; } = null!;

    public string JobTitle { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public DateOnly DateOfJoining { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Attendance> AttendanceRecords { get; set; } = [];

    public ICollection<LeaveRequest> LeaveRequests { get; set; } = [];

    public ICollection<EmployeeProject> EmployeeProjects { get; set; } = [];
}
