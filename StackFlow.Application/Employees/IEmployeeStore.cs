using stackflow_api.Models;

namespace stackflow_api.Services;

public interface IEmployeeStore
{
    Task<List<Employee>> ListAsync(string? search, int? departmentId, bool? isActive);
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee?> FindAsync(int id);
    Task<Department?> FindDepartmentAsync(int id);
    Task<bool> HasRelatedRecordsAsync(int id);
    Task AddAsync(Employee employee);
    Task SaveAsync();
    Task RemoveAssignmentsAsync(int id, DateOnly relievedDate);
    Task DeleteAsync(Employee employee);
}
