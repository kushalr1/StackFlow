using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class DashboardService(AppDbContext dbContext) : IDashboardService
{
    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        return new DashboardStatsDto
        {
            TotalEmployees = await dbContext.Employees.CountAsync(),
            ActiveEmployees = await dbContext.Employees.CountAsync(employee => employee.IsActive),
            PresentToday = await dbContext.AttendanceRecords.CountAsync(record =>
                record.Date == today && record.Status == AttendanceStatus.Present),
            AbsentToday = await dbContext.AttendanceRecords.CountAsync(record =>
                record.Date == today && record.Status == AttendanceStatus.Absent),
            PendingLeaveRequests = await dbContext.LeaveRequests.CountAsync(request =>
                request.Status == LeaveStatus.Pending),
            TotalDepartments = await dbContext.Departments.CountAsync(),
            ActiveProjects = await dbContext.Projects.CountAsync(project =>
                project.Status == ProjectStatus.Active)
        };
    }
}
