using stackflow_api.DTOs;

namespace stackflow_api.Services;

public enum EmployeeUpdateResult
{
    Updated,
    EmployeeNotFound,
    DepartmentNotFound
}

public enum EmployeeDeleteResult
{
    Deleted,
    NotFound,
    HasRelatedRecords
}

public enum EmployeeRelieveResult
{
    Relieved,
    NotFound,
    AlreadyRelieved,
    BeforeJoiningDate,
    FutureDate
}

public interface IEmployeeService
{
    Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        int? departmentId,
        bool? isActive);

    Task<EmployeeDto?> GetByIdAsync(int id);

    Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto);

    Task<EmployeeUpdateResult> UpdateAsync(int id, UpdateEmployeeDto employeeDto);

    Task<EmployeeRelieveResult> RelieveAsync(int id, RelieveEmployeeDto relieveEmployeeDto);

    Task<EmployeeDeleteResult> DeleteAsync(int id);
}
