using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IEmployeeLeaveService
{
    Task<IReadOnlyList<EmployeeLeaveDto>> GetAllAsync(int employeeId);
    Task<EmployeeLeaveCreateResult> CreateAsync(int employeeId, CreateEmployeeLeaveDto dto);
}

public enum EmployeeLeaveCreateOutcome
{
    Created,
    EmployeeInactive,
    OverlappingRequest,
    AttendanceConflict
}

public record EmployeeLeaveCreateResult(
    EmployeeLeaveCreateOutcome Outcome,
    EmployeeLeaveDto? Leave = null);
