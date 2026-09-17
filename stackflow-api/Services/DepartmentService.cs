using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class DepartmentService(AppDbContext dbContext) : IDepartmentService
{
    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync()
    {
        return await dbContext.Departments
            .AsNoTracking()
            .OrderBy(department => department.Name)
            .Select(department => ToDto(department))
            .ToListAsync();
    }

    public async Task<DepartmentDto?> GetByIdAsync(int id)
    {
        return await dbContext.Departments
            .AsNoTracking()
            .Where(department => department.Id == id)
            .Select(department => ToDto(department))
            .FirstOrDefaultAsync();
    }

    public async Task<DepartmentDto?> CreateAsync(SaveDepartmentDto departmentDto)
    {
        var name = departmentDto.Name.Trim();

        if (await NameExistsAsync(name))
        {
            return null;
        }

        var department = new Department
        {
            Name = name,
            Description = departmentDto.Description.Trim()
        };

        dbContext.Departments.Add(department);
        await dbContext.SaveChangesAsync();

        return ToDto(department);
    }

    public async Task<DepartmentUpdateResult> UpdateAsync(
        int id,
        SaveDepartmentDto departmentDto)
    {
        var department = await dbContext.Departments.FindAsync(id);

        if (department is null)
        {
            return DepartmentUpdateResult.NotFound;
        }

        var name = departmentDto.Name.Trim();

        if (await NameExistsAsync(name, id))
        {
            return DepartmentUpdateResult.DuplicateName;
        }

        department.Name = name;
        department.Description = departmentDto.Description.Trim();
        await dbContext.SaveChangesAsync();

        return DepartmentUpdateResult.Updated;
    }

    public async Task<DepartmentDeleteResult> DeleteAsync(int id)
    {
        var department = await dbContext.Departments.FindAsync(id);

        if (department is null)
        {
            return DepartmentDeleteResult.NotFound;
        }

        if (await dbContext.Employees.AnyAsync(employee => employee.DepartmentId == id))
        {
            return DepartmentDeleteResult.HasEmployees;
        }

        dbContext.Departments.Remove(department);
        await dbContext.SaveChangesAsync();

        return DepartmentDeleteResult.Deleted;
    }

    private Task<bool> NameExistsAsync(string name, int? excludedId = null)
    {
        return dbContext.Departments.AnyAsync(department =>
            EF.Functions.ILike(department.Name, name) &&
            (!excludedId.HasValue || department.Id != excludedId.Value));
    }

    private static DepartmentDto ToDto(Department department)
    {
        return new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description,
            EmployeeCount = department.Employees.Count
        };
    }
}
