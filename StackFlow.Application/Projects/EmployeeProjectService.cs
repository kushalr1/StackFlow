using stackflow_api.DTOs;

namespace stackflow_api.Services;

public class EmployeeProjectService(IProjectStore store) : IEmployeeProjectService
{
    public Task<IReadOnlyList<EmployeeProjectDto>> GetAllAsync(int employeeId) => store.ListOwnedAsync(employeeId);
}
