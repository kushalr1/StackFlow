using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class EmployeeService(AppDbContext dbContext) : IEmployeeService
{
    public async Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        string? department)
    {
        var query = dbContext.Employees
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = $"%{search.Trim()}%";

            query = query.Where(employee =>
                EF.Functions.ILike(employee.Name, searchTerm) ||
                EF.Functions.ILike(employee.Email, searchTerm) ||
                EF.Functions.ILike(employee.JobTitle, searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            var departmentName = department.Trim();

            query = query.Where(employee =>
                EF.Functions.ILike(employee.Department, departmentName));
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
            .Where(employee => employee.Id == id)
            .Select(employee => ToDto(employee))
            .FirstOrDefaultAsync();
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto employeeDto)
    {
        var employee = new Employee
        {
            Name = employeeDto.Name.Trim(),
            Email = employeeDto.Email.Trim(),
            Phone = employeeDto.Phone.Trim(),
            Department = employeeDto.Department.Trim(),
            JobTitle = employeeDto.JobTitle.Trim(),
            Salary = employeeDto.Salary,
            DateOfJoining = GetRequiredJoiningDate(employeeDto.DateOfJoining),
            IsActive = employeeDto.IsActive
        };

        dbContext.Employees.Add(employee);
        await dbContext.SaveChangesAsync();

        return ToDto(employee);
    }

    public async Task<bool> UpdateAsync(int id, UpdateEmployeeDto employeeDto)
    {
        var employee = await dbContext.Employees.FindAsync(id);

        if (employee is null)
        {
            return false;
        }

        employee.Name = employeeDto.Name.Trim();
        employee.Email = employeeDto.Email.Trim();
        employee.Phone = employeeDto.Phone.Trim();
        employee.Department = employeeDto.Department.Trim();
        employee.JobTitle = employeeDto.JobTitle.Trim();
        employee.Salary = employeeDto.Salary;
        employee.DateOfJoining = GetRequiredJoiningDate(employeeDto.DateOfJoining);
        employee.IsActive = employeeDto.IsActive;

        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await dbContext.Employees.FindAsync(id);

        if (employee is null)
        {
            return false;
        }

        dbContext.Employees.Remove(employee);
        await dbContext.SaveChangesAsync();
        return true;
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
            Department = employee.Department,
            JobTitle = employee.JobTitle,
            Salary = employee.Salary,
            DateOfJoining = employee.DateOfJoining,
            IsActive = employee.IsActive
        };
    }
}
