using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Attendance;

public class EfAttendanceStore(AppDbContext dbContext) : IAttendanceStore
{
    public async Task<List<stackflow_api.Models.Attendance>> ListAsync(DateOnly? date, int? employeeId, string? status)
    {
        var query = dbContext.AttendanceRecords.AsNoTracking().Include(record => record.Employee).AsQueryable();
        if (date.HasValue) query = query.Where(record => record.Date == date.Value);
        if (employeeId.HasValue) query = query.Where(record => record.EmployeeId == employeeId.Value);
        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<AttendanceStatus>(status.Replace(" ", ""), true, out var parsed))
            query = query.Where(record => record.Status == parsed);
        return await query.OrderByDescending(record => record.Date).ThenBy(record => record.Employee.Name).ToListAsync();
    }
    public Task<stackflow_api.Models.Attendance?> GetByIdAsync(int id) => dbContext.AttendanceRecords.AsNoTracking()
        .Include(record => record.Employee).FirstOrDefaultAsync(record => record.Id == id);
    public async Task<stackflow_api.Models.Attendance?> FindAsync(int id) => await dbContext.AttendanceRecords.FindAsync(id);
    public async Task<Employee?> FindEmployeeAsync(int id) => await dbContext.Employees.FindAsync(id);
    public Task<bool> IsDuplicateAsync(int employeeId, DateOnly date, int? excludedId = null) =>
        dbContext.AttendanceRecords.AnyAsync(record => record.EmployeeId == employeeId && record.Date == date &&
            (!excludedId.HasValue || record.Id != excludedId.Value));
    public Task<bool> HasApprovedLeaveAsync(int employeeId, DateOnly date) =>
        dbContext.LeaveRequests.AnyAsync(request => request.EmployeeId == employeeId &&
            request.Status == LeaveStatus.Approved && request.StartDate <= date && request.EndDate >= date);
    public async Task AddAsync(stackflow_api.Models.Attendance record)
    {
        dbContext.AttendanceRecords.Add(record);
        await dbContext.SaveChangesAsync();
        await dbContext.Entry(record).Reference(item => item.Employee).LoadAsync();
    }
    public async Task SaveAsync() => await dbContext.SaveChangesAsync();
    public async Task<IReadOnlyList<EmployeeAttendanceDto>> GetMonthlyAsync(int employeeId, DateOnly start, DateOnly end) =>
        await dbContext.AttendanceRecords.AsNoTracking()
            .Where(record => record.EmployeeId == employeeId && record.Date >= start && record.Date < end)
            .OrderByDescending(record => record.Date)
            .Select(record => new EmployeeAttendanceDto
            {
                Date = record.Date,
                Status = record.Status == AttendanceStatus.HalfDay ? "Half Day" :
                    record.Status == AttendanceStatus.OnLeave ? "On Leave" : record.Status.ToString()
            }).ToListAsync();
}
