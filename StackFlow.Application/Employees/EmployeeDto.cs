namespace stackflow_api.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public int DepartmentId { get; set; }

    public string Department { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public DateOnly DateOfJoining { get; set; }

    public bool IsActive { get; set; }

    public DateOnly? RelievedDate { get; set; }

    public string? RelievingReason { get; set; }

    public IReadOnlyList<EmployeeProjectHistoryDto> ProjectHistory { get; set; } = [];
}

public class EmployeeProjectHistoryDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectStatus { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateOnly? AssignedOn { get; set; }
    public DateOnly? RemovedOn { get; set; }
    public bool IsCurrent { get; set; }
}
