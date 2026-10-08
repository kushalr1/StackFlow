using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Employees;

public class EfEmployeeStore(AppDbContext dbContext) : IEmployeeStore
{
    public async Task<List<Employee>> ListAsync(string? search, int? departmentId, bool? isActive)
    {
        var query = dbContext.Employees.AsNoTracking().Include(employee => employee.Department).AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(employee => EF.Functions.ILike(employee.Name, term) ||
                EF.Functions.ILike(employee.Email, term) || EF.Functions.ILike(employee.JobTitle, term));
        }
        if (departmentId.HasValue) query = query.Where(employee => employee.DepartmentId == departmentId.Value);
        if (isActive.HasValue) query = query.Where(employee => employee.IsActive == isActive.Value);
        return await query.OrderBy(employee => employee.Name).ToListAsync();
    }
    public Task<Employee?> GetByIdAsync(int id) => dbContext.Employees.AsNoTracking()
        .Include(employee => employee.Department).Include(employee => employee.EmployeeProjects)
        .ThenInclude(link => link.Project).FirstOrDefaultAsync(employee => employee.Id == id);
    public async Task<Employee?> FindAsync(int id) => await dbContext.Employees.FindAsync(id);
    public async Task<Department?> FindDepartmentAsync(int id) => await dbContext.Departments.FindAsync(id);
    public async Task<bool> HasRelatedRecordsAsync(int id) =>
        await dbContext.AttendanceRecords.AnyAsync(record => record.EmployeeId == id) ||
        await dbContext.LeaveRequests.AnyAsync(request => request.EmployeeId == id) ||
        await dbContext.EmployeeProjects.AnyAsync(link => link.EmployeeId == id);
    public async Task AddAsync(Employee employee)
    {
        dbContext.Employees.Add(employee);
        await dbContext.SaveChangesAsync();
    }
    public async Task SaveAsync() => await dbContext.SaveChangesAsync();
    public async Task RemoveAssignmentsAsync(int id, DateOnly relievedDate) =>
        await dbContext.EmployeeProjects.Where(link => link.EmployeeId == id && link.RemovedOn == null)
            .ExecuteUpdateAsync(update => update.SetProperty(link => link.RemovedOn, relievedDate));
    public async Task DeleteAsync(Employee employee)
    {
        dbContext.Employees.Remove(employee);
        await dbContext.SaveChangesAsync();
    }
}
