using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;

using stackflow_api.Services;

namespace StackFlow.Infrastructure.Profiles;

public class EfEmployeeProfileStore(AppDbContext dbContext) : IEmployeeProfileStore
{
    public Task<EmployeeProfileDto?> GetAsync(int employeeId)
    {
        return dbContext.Employees
            .AsNoTracking()
            .Where(employee => employee.Id == employeeId)
            .Select(employee => new EmployeeProfileDto
            {
                Id = employee.Id,
                Name = employee.Name,
                Email = employee.Email,
                Phone = employee.Phone,
                Department = employee.Department.Name,
                JobTitle = employee.JobTitle,
                Salary = employee.Salary,
                DateOfJoining = employee.DateOfJoining,
                IsActive = employee.IsActive
            })
            .FirstOrDefaultAsync();
    }
}
