using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Departments;

public class EfDepartmentStore(AppDbContext dbContext) : IDepartmentStore
{
    private IQueryable<DepartmentDto> ReadQuery() => dbContext.Departments.AsNoTracking()
        .Select(department => new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description,
            EmployeeCount = department.Employees.Count(employee => employee.IsActive),
            RelievedEmployeeCount = department.Employees.Count(employee => !employee.IsActive)
        });

    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync() =>
        await ReadQuery().OrderBy(department => department.Name).ToListAsync();
    public Task<DepartmentDto?> GetByIdAsync(int id) => ReadQuery().FirstOrDefaultAsync(department => department.Id == id);
    public async Task<Department?> FindAsync(int id) => await dbContext.Departments.FindAsync(id);
    public Task<bool> NameExistsAsync(string name, int? excludedId = null) =>
        dbContext.Departments.AnyAsync(department => EF.Functions.ILike(department.Name, name) &&
            (!excludedId.HasValue || department.Id != excludedId.Value));
    public Task<bool> HasEmployeesAsync(int id) => dbContext.Employees.AnyAsync(employee => employee.DepartmentId == id);
    public async Task AddAsync(Department department)
    {
        dbContext.Departments.Add(department);
        await dbContext.SaveChangesAsync();
    }
    public async Task SaveAsync() => await dbContext.SaveChangesAsync();
    public async Task DeleteAsync(Department department)
    {
        dbContext.Departments.Remove(department);
        await dbContext.SaveChangesAsync();
    }
}
