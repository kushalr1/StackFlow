using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Leaves;

public class EfLeaveStore(AppDbContext dbContext) : ILeaveStore
{
    public async Task<List<LeaveRequest>> ListAsync(int? employeeId, LeaveStatus? status, LeaveType? leaveType)
    {
        var query = dbContext.LeaveRequests.AsNoTracking().Include(request => request.Employee).AsQueryable();
        if (employeeId.HasValue) query = query.Where(request => request.EmployeeId == employeeId.Value);
        if (status.HasValue) query = query.Where(request => request.Status == status.Value);
        if (leaveType.HasValue) query = query.Where(request => request.LeaveType == leaveType.Value);
        return await query.OrderByDescending(request => request.AppliedOn).ToListAsync();
    }
    public Task<List<LeaveRequest>> ListOwnedAsync(int employeeId) => dbContext.LeaveRequests.AsNoTracking()
        .Where(request => request.EmployeeId == employeeId).OrderByDescending(request => request.AppliedOn).ToListAsync();
    public Task<LeaveRequest?> GetByIdAsync(int id) => dbContext.LeaveRequests.AsNoTracking()
        .Include(request => request.Employee).FirstOrDefaultAsync(request => request.Id == id);
    public async Task<LeaveRequest?> FindAsync(int id) => await dbContext.LeaveRequests.FindAsync(id);
    public async Task<Employee?> FindEmployeeAsync(int id) => await dbContext.Employees.FindAsync(id);
    public Task<bool> IsEmployeeActiveAsync(int id) => dbContext.Employees.AnyAsync(employee => employee.Id == id && employee.IsActive);
    public Task<bool> HasAttendanceAsync(int employeeId, DateOnly start, DateOnly end) =>
        dbContext.AttendanceRecords.AnyAsync(record => record.EmployeeId == employeeId && record.Date >= start && record.Date <= end);
    public Task<bool> HasOverlapAsync(int employeeId, DateOnly start, DateOnly end, bool approvedOnly, int? excludedId = null) =>
        dbContext.LeaveRequests.AnyAsync(request => request.EmployeeId == employeeId &&
            (!excludedId.HasValue || request.Id != excludedId.Value) &&
            (approvedOnly ? request.Status == LeaveStatus.Approved : request.Status != LeaveStatus.Rejected) &&
            request.StartDate <= end && request.EndDate >= start);
    public async Task AddAsync(LeaveRequest request, bool loadEmployee)
    {
        dbContext.LeaveRequests.Add(request);
        await dbContext.SaveChangesAsync();
        if (loadEmployee) await dbContext.Entry(request).Reference(item => item.Employee).LoadAsync();
    }
    public async Task SaveAsync() => await dbContext.SaveChangesAsync();
}
