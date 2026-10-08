using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IEmployeeProjectService
{
    Task<IReadOnlyList<EmployeeProjectDto>> GetAllAsync(int employeeId);
}
