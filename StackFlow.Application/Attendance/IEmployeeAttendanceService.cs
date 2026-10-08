using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IEmployeeAttendanceService
{
    Task<IReadOnlyList<EmployeeAttendanceDto>> GetMonthlyAsync(
        int employeeId,
        int year,
        int month);
}
