using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class EmployeeService(AppDbContext dbContext) : IEmployeeService
{
    public async Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        int? departmentId,
        bool? isActive)
    {
        var query = dbContext.Employees
            .AsNoTracking()
            .Include(employee => employee.Department)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = $"%{search.Trim()}%";

            query = query.Where(employee =>
                EF.Functions.ILike(employee.Name, searchTerm) ||
                EF.Functions.ILike(employee.Email, searchTerm) ||
                EF.Functions.ILike(employee.JobTitle, searchTerm));
        }

        if (departmentId.HasValue)
        {
            query = query.Where(employee => employee.DepartmentId == departmentId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(employee => employee.IsActive == isActive.Value);
        }

        return await query
            .OrderBy(employee => employee.Name)
            .Select(employee => ToDto(employee))
            .ToListAsync();
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        return await dbContext.Employees
            .AsNoTracking()
            .Include(employee => employee.Department)
            .Include(employee => employee.EmployeeProjects)
                .ThenInclude(link => link.Project)
            .Where(employee => employee.Id == id)
            .Select(employee => ToDto(employee))
            .FirstOrDefaultAsync();
    }

    public async Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto)
    {
        var department = await dbContext.Departments.FindAsync(employeeDto.DepartmentId);

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

        dbContext.Employees.Add(employee);
        await dbContext.SaveChangesAsync();

        return ToDto(employee);
    }

    public async Task<EmployeeUpdateResult> UpdateAsync(
        int id,
        UpdateEmployeeDto employeeDto)
    {
        var employee = await dbContext.Employees.FindAsync(id);

        if (employee is null)
        {
            return EmployeeUpdateResult.EmployeeNotFound;
        }

        var department = await dbContext.Departments.FindAsync(employeeDto.DepartmentId);

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

        await dbContext.SaveChangesAsync();
        return EmployeeUpdateResult.Updated;
    }

    public async Task<EmployeeRelieveResult> RelieveAsync(int id, RelieveEmployeeDto dto)
    {
        var employee = await dbContext.Employees.FindAsync(id);

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

        await dbContext.EmployeeProjects
            .Where(link => link.EmployeeId == id && link.RemovedOn == null)
            .ExecuteUpdateAsync(update => update
                .SetProperty(link => link.RemovedOn, relievedDate));

        await dbContext.SaveChangesAsync();
        return EmployeeRelieveResult.Relieved;
    }

    public async Task<EmployeeDeleteResult> DeleteAsync(int id)
    {
        var employee = await dbContext.Employees.FindAsync(id);

        if (employee is null)
        {
            return EmployeeDeleteResult.NotFound;
        }

        var hasRelatedRecords = await dbContext.AttendanceRecords
            .AnyAsync(record => record.EmployeeId == id) ||
            await dbContext.LeaveRequests
                .AnyAsync(request => request.EmployeeId == id) ||
            await dbContext.EmployeeProjects
                .AnyAsync(link => link.EmployeeId == id);

        if (hasRelatedRecords)
        {
            return EmployeeDeleteResult.HasRelatedRecords;
        }

        dbContext.Employees.Remove(employee);
        await dbContext.SaveChangesAsync();
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
