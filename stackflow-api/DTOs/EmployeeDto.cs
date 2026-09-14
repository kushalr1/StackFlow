namespace stackflow_api.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public DateOnly DateOfJoining { get; set; }

    public bool IsActive { get; set; }
}
