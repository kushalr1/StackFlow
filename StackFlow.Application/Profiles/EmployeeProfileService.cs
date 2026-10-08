using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IEmployeeProfileStore
{
    Task<EmployeeProfileDto?> GetAsync(int employeeId);
}

public class EmployeeProfileService(IEmployeeProfileStore store) : IEmployeeProfileService
{
    public Task<EmployeeProfileDto?> GetAsync(int employeeId) => store.GetAsync(employeeId);
}
