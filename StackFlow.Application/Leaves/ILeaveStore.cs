using stackflow_api.Models;

namespace stackflow_api.Services;

public interface ILeaveStore
{
    Task<List<LeaveRequest>> ListAsync(int? employeeId, LeaveStatus? status, LeaveType? leaveType);
    Task<List<LeaveRequest>> ListOwnedAsync(int employeeId);
    Task<LeaveRequest?> GetByIdAsync(int id);
    Task<LeaveRequest?> FindAsync(int id);
    Task<Employee?> FindEmployeeAsync(int id);
    Task<bool> IsEmployeeActiveAsync(int id);
    Task<bool> HasAttendanceAsync(int employeeId, DateOnly start, DateOnly end);
    Task<bool> HasOverlapAsync(int employeeId, DateOnly start, DateOnly end, bool approvedOnly, int? excludedId = null);
    Task AddAsync(LeaveRequest request, bool loadEmployee);
    Task SaveAsync();
}
