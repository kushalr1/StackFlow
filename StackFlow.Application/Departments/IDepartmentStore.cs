using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public interface IDepartmentStore
{
    Task<IReadOnlyList<DepartmentDto>> GetAllAsync();
    Task<DepartmentDto?> GetByIdAsync(int id);
    Task<Department?> FindAsync(int id);
    Task<bool> NameExistsAsync(string name, int? excludedId = null);
    Task<bool> HasEmployeesAsync(int id);
    Task AddAsync(Department department);
    Task SaveAsync();
    Task DeleteAsync(Department department);
}
