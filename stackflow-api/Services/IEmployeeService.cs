using stackflow_api.DTOs;

namespace stackflow_api.Services;

public enum EmployeeUpdateResult
{
    Updated,
    EmployeeNotFound,
    DepartmentNotFound
}

public interface IEmployeeService
{
    Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        int? departmentId);

    Task<EmployeeDto?> GetByIdAsync(int id);

    Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto);

    Task<EmployeeUpdateResult> UpdateAsync(int id, UpdateEmployeeDto employeeDto);

    Task<bool> DeleteAsync(int id);
}
