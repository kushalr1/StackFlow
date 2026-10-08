using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class EmployeeService(IEmployeeStore store) : IEmployeeService
{
    public async Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        int? departmentId,
        bool? isActive)
    {
        return (await store.ListAsync(search, departmentId, isActive)).Select(ToDto).ToList();
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var employee = await store.GetByIdAsync(id);
        return employee is null ? null : ToDto(employee);
    }

    public async Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto)
    {
        var department = await store.FindDepartmentAsync(employeeDto.DepartmentId);

        if (department is null)
        {
            return null;
        }

        var employee = new Employee
        {
            Name = employeeDto.Name.Trim(),
            Email = employeeDto.Email.Trim(),
            Phone = employeeDto.Phone.Trim(),
            DepartmentId = department.Id,
            Department = department,
            JobTitle = employeeDto.JobTitle.Trim(),
            Salary = employeeDto.Salary,
            DateOfJoining = GetRequiredJoiningDate(employeeDto.DateOfJoining),
            IsActive = true
        };

        await store.AddAsync(employee);

        return ToDto(employee);
    }

    public async Task<EmployeeUpdateResult> UpdateAsync(
        int id,
        UpdateEmployeeDto employeeDto)
    {
        var employee = await store.FindAsync(id);

        if (employee is null)
        {
            return EmployeeUpdateResult.EmployeeNotFound;
        }

        var department = await store.FindDepartmentAsync(employeeDto.DepartmentId);

        if (department is null)
        {
            return EmployeeUpdateResult.DepartmentNotFound;
        }

        employee.Name = employeeDto.Name.Trim();
        employee.Email = employeeDto.Email.Trim();
        employee.Phone = employeeDto.Phone.Trim();
        employee.DepartmentId = department.Id;
        employee.Department = department;
        employee.JobTitle = employeeDto.JobTitle.Trim();
        employee.Salary = employeeDto.Salary;
        employee.DateOfJoining = GetRequiredJoiningDate(employeeDto.DateOfJoining);

        await store.SaveAsync();
        return EmployeeUpdateResult.Updated;
    }

    public async Task<EmployeeRelieveResult> RelieveAsync(int id, RelieveEmployeeDto dto)
    {
        var employee = await store.FindAsync(id);

        if (employee is null)
        {
            return EmployeeRelieveResult.NotFound;
        }

        if (!employee.IsActive)
        {
            return EmployeeRelieveResult.AlreadyRelieved;
        }

        var relievedDate = dto.RelievedDate!.Value;
        if (relievedDate > DateOnly.FromDateTime(DateTime.Today))
        {
            return EmployeeRelieveResult.FutureDate;
        }

        if (relievedDate < employee.DateOfJoining)
        {
            return EmployeeRelieveResult.BeforeJoiningDate;
        }

        employee.IsActive = false;
        employee.RelievedDate = relievedDate;
        employee.RelievingReason = string.IsNullOrWhiteSpace(dto.Reason)
            ? null
            : dto.Reason.Trim();

        await store.RemoveAssignmentsAsync(id, relievedDate);
        await store.SaveAsync();
        return EmployeeRelieveResult.Relieved;
    }

    public async Task<EmployeeDeleteResult> DeleteAsync(int id)
    {
        var employee = await store.FindAsync(id);

        if (employee is null)
        {
            return EmployeeDeleteResult.NotFound;
        }

        var hasRelatedRecords = await store.HasRelatedRecordsAsync(id);

        if (hasRelatedRecords)
        {
            return EmployeeDeleteResult.HasRelatedRecords;
        }

        await store.DeleteAsync(employee);
        return EmployeeDeleteResult.Deleted;
    }

    private static DateOnly GetRequiredJoiningDate(DateOnly? dateOfJoining)
    {
        return dateOfJoining
            ?? throw new ArgumentException("Date of joining is required.");
    }

    private static EmployeeDto ToDto(Employee employee)
    {
        return new EmployeeDto
        {
            Id = employee.Id,
            Name = employee.Name,
            Email = employee.Email,
            Phone = employee.Phone,
            DepartmentId = employee.DepartmentId,
            Department = employee.Department.Name,
            JobTitle = employee.JobTitle,
            Salary = employee.Salary,
            DateOfJoining = employee.DateOfJoining,
            IsActive = employee.IsActive,
            RelievedDate = employee.RelievedDate,
            RelievingReason = employee.RelievingReason,
            ProjectHistory = employee.EmployeeProjects
                .OrderByDescending(link => link.RemovedOn == null)
                .ThenByDescending(link => link.AssignedOn)
                .Select(link => new EmployeeProjectHistoryDto
                {
                    ProjectId = link.ProjectId,
                    ProjectName = link.Project.Name,
                    ProjectStatus = link.Project.Status == ProjectStatus.OnHold
                        ? "On Hold"
                        : link.Project.Status.ToString(),
                    Role = link.Role,
                    AssignedOn = link.AssignedOn,
                    RemovedOn = link.RemovedOn,
                    IsCurrent = link.RemovedOn == null
                })
                .ToList()
        };
    }
}
