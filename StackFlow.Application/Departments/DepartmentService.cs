using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class DepartmentService(IDepartmentStore store) : IDepartmentService
{
    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync()
    {
        return await store.GetAllAsync();
    }

    public async Task<DepartmentDto?> GetByIdAsync(int id)
    {
        return await store.GetByIdAsync(id);
    }

    public async Task<DepartmentDto?> CreateAsync(SaveDepartmentDto departmentDto)
    {
        var name = departmentDto.Name.Trim();

        if (await store.NameExistsAsync(name))
        {
            return null;
        }

        var department = new Department
        {
            Name = name,
            Description = departmentDto.Description.Trim()
        };

        await store.AddAsync(department);

        return ToDto(department);
    }

    public async Task<DepartmentUpdateResult> UpdateAsync(
        int id,
        SaveDepartmentDto departmentDto)
    {
        var department = await store.FindAsync(id);

        if (department is null)
        {
            return DepartmentUpdateResult.NotFound;
        }

        var name = departmentDto.Name.Trim();

        if (await store.NameExistsAsync(name, id))
        {
            return DepartmentUpdateResult.DuplicateName;
        }

        department.Name = name;
        department.Description = departmentDto.Description.Trim();
        await store.SaveAsync();

        return DepartmentUpdateResult.Updated;
    }

    public async Task<DepartmentDeleteResult> DeleteAsync(int id)
    {
        var department = await store.FindAsync(id);

        if (department is null)
        {
            return DepartmentDeleteResult.NotFound;
        }

        if (await store.HasEmployeesAsync(id))
        {
            return DepartmentDeleteResult.HasEmployees;
        }

        await store.DeleteAsync(department);

        return DepartmentDeleteResult.Deleted;
    }

    private static DepartmentDto ToDto(Department department)
    {
        return new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description,
            EmployeeCount = department.Employees.Count(employee => employee.IsActive),
            RelievedEmployeeCount = department.Employees.Count(employee => !employee.IsActive)
        };
    }
}
