using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public interface IAttendanceStore
{
    Task<List<Attendance>> ListAsync(DateOnly? date, int? employeeId, string? status);
    Task<Attendance?> GetByIdAsync(int id);
    Task<Attendance?> FindAsync(int id);
    Task<Employee?> FindEmployeeAsync(int id);
    Task<bool> IsDuplicateAsync(int employeeId, DateOnly date, int? excludedId = null);
    Task<bool> HasApprovedLeaveAsync(int employeeId, DateOnly date);
    Task AddAsync(Attendance record);
    Task SaveAsync();
    Task<IReadOnlyList<EmployeeAttendanceDto>> GetMonthlyAsync(int employeeId, DateOnly start, DateOnly end);
}
