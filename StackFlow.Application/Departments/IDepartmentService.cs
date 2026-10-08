using stackflow_api.DTOs;

namespace stackflow_api.Services;

public enum DepartmentUpdateResult
{
    Updated,
    NotFound,
    DuplicateName
}

public enum DepartmentDeleteResult
{
    Deleted,
    NotFound,
    HasEmployees
}

public interface IDepartmentService
{
    Task<IReadOnlyList<DepartmentDto>> GetAllAsync();

    Task<DepartmentDto?> GetByIdAsync(int id);

    Task<DepartmentDto?> CreateAsync(SaveDepartmentDto departmentDto);

    Task<DepartmentUpdateResult> UpdateAsync(int id, SaveDepartmentDto departmentDto);

    Task<DepartmentDeleteResult> DeleteAsync(int id);
}
