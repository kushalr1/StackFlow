using stackflow_api.DTOs;

namespace stackflow_api.Services;

public enum EmployeeAccountOutcome { Created, NotFound, Inactive, AlreadyExists }
public record EmployeeAccountResult(EmployeeAccountOutcome Outcome, EmployeeAccountDto? Account = null);

public interface IEmployeeAccountService
{
    Task<EmployeeAccountDto?> GetAsync(int employeeId);
    Task<EmployeeAccountResult> CreateAsync(int employeeId, string password);
    Task<EmployeeAccountResult> ResetAsync(int employeeId, string password);
    Task<EmployeeAccountResult> SetAccessAsync(int employeeId, bool isActive);
}
