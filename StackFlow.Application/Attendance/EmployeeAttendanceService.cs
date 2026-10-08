using stackflow_api.DTOs;

namespace stackflow_api.Services;

public class EmployeeAttendanceService(IAttendanceStore store) : IEmployeeAttendanceService
{
    public Task<IReadOnlyList<EmployeeAttendanceDto>> GetMonthlyAsync(int employeeId, int year, int month)
    {
        var startDate = new DateOnly(year, month, 1);
        return store.GetMonthlyAsync(employeeId, startDate, startDate.AddMonths(1));
    }
}
