using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IEmployeeProfileService
{
    Task<EmployeeProfileDto?> GetAsync(int employeeId);
}
