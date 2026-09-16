using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IEmployeeService
{
    Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        string? department);

    Task<EmployeeDto?> GetByIdAsync(int id);

    Task<EmployeeDto> CreateAsync(CreateEmployeeDto employeeDto);

    Task<bool> UpdateAsync(int id, UpdateEmployeeDto employeeDto);

    Task<bool> DeleteAsync(int id);
}
