using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class LeaveRequestService(AppDbContext dbContext) : ILeaveRequestService
{
    public async Task<IReadOnlyList<LeaveRequestDto>> GetAllAsync(
        int? employeeId,
        LeaveStatus? status,
        LeaveType? leaveType)
    {
        var query = dbContext.LeaveRequests
            .AsNoTracking()
            .Include(request => request.Employee)
            .AsQueryable();

        if (employeeId.HasValue)
        {
            query = query.Where(request => request.EmployeeId == employeeId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(request => request.Status == status.Value);
        }

        if (leaveType.HasValue)
        {
            query = query.Where(request => request.LeaveType == leaveType.Value);
        }

        return await query
            .OrderByDescending(request => request.AppliedOn)
            .Select(request => ToDto(request))
            .ToListAsync();
    }

    public async Task<LeaveRequestDto?> GetByIdAsync(int id) =>
        await dbContext.LeaveRequests
            .AsNoTracking()
            .Include(request => request.Employee)
            .Where(request => request.Id == id)
            .Select(request => ToDto(request))
            .FirstOrDefaultAsync();

    public async Task<LeaveSaveResult> CreateAsync(SaveLeaveRequestDto dto)
    {
        var employee = await dbContext.Employees.FindAsync(dto.EmployeeId);
        if (employee is null)
        {
            return new(LeaveSaveOutcome.EmployeeNotFound);
        }

        if (!employee.IsActive)
        {
            return new(LeaveSaveOutcome.EmployeeInactive);
        }

        var request = new LeaveRequest
        {
            EmployeeId = dto.EmployeeId,
            LeaveType = dto.LeaveType,
            StartDate = dto.StartDate!.Value,
            EndDate = dto.EndDate!.Value,
            Reason = dto.Reason.Trim(),
            Status = LeaveStatus.Pending,
            AppliedOn = DateTime.UtcNow
        };

        dbContext.LeaveRequests.Add(request);
        await dbContext.SaveChangesAsync();
        await dbContext.Entry(request).Reference(item => item.Employee).LoadAsync();

        return new(LeaveSaveOutcome.Saved, ToDto(request));
    }

    public async Task<LeaveSaveOutcome> UpdateAsync(int id, SaveLeaveRequestDto dto)
    {
        var request = await dbContext.LeaveRequests.FindAsync(id);
        if (request is null)
        {
            return LeaveSaveOutcome.NotFound;
        }

        if (request.Status != LeaveStatus.Pending)
        {
            return LeaveSaveOutcome.NotEditable;
        }

        var employee = await dbContext.Employees.FindAsync(dto.EmployeeId);
        if (employee is null)
        {
            return LeaveSaveOutcome.EmployeeNotFound;
        }

        if (!employee.IsActive)
        {
            return LeaveSaveOutcome.EmployeeInactive;
        }

        request.EmployeeId = dto.EmployeeId;
        request.LeaveType = dto.LeaveType;
        request.StartDate = dto.StartDate!.Value;
        request.EndDate = dto.EndDate!.Value;
        request.Reason = dto.Reason.Trim();
        await dbContext.SaveChangesAsync();
        return LeaveSaveOutcome.Saved;
    }

    public async Task<LeaveSaveOutcome> UpdateStatusAsync(int id, LeaveStatus status)
    {
        var request = await dbContext.LeaveRequests.FindAsync(id);
        if (request is null)
        {
            return LeaveSaveOutcome.NotFound;
        }


        if (status == LeaveStatus.Approved)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var latestDate = today.AddYears(1);
            if (request.StartDate < today || request.EndDate > latestDate || request.EndDate < request.StartDate)
            {
                return LeaveSaveOutcome.InvalidDateRange;
            }

            var employeeIsActive = await dbContext.Employees
                .AnyAsync(employee => employee.Id == request.EmployeeId && employee.IsActive);
            if (!employeeIsActive)
            {
                return LeaveSaveOutcome.EmployeeInactive;
            }

            var hasAttendance = await dbContext.AttendanceRecords.AnyAsync(record =>
                record.EmployeeId == request.EmployeeId &&
                record.Date >= request.StartDate &&
                record.Date <= request.EndDate);
            if (hasAttendance)
            {
                return LeaveSaveOutcome.AttendanceConflict;
            }

            var hasOverlappingLeave = await dbContext.LeaveRequests.AnyAsync(other =>
                other.Id != request.Id &&
                other.EmployeeId == request.EmployeeId &&
                other.Status == LeaveStatus.Approved &&
                other.StartDate <= request.EndDate &&
                other.EndDate >= request.StartDate);
            if (hasOverlappingLeave)
            {
                return LeaveSaveOutcome.OverlappingApprovedLeave;
            }
        }

        request.Status = status;
        await dbContext.SaveChangesAsync();
        return LeaveSaveOutcome.Saved;
    }

    private static LeaveRequestDto ToDto(LeaveRequest request) => new()
    {
        Id = request.Id,
        EmployeeId = request.EmployeeId,
        EmployeeName = request.Employee.Name,
        LeaveType = DisplayName(request.LeaveType.ToString()),
        StartDate = request.StartDate,
        EndDate = request.EndDate,
        Reason = request.Reason,
        Status = request.Status.ToString(),
        AppliedOn = request.AppliedOn
    };

    private static string DisplayName(string value) => value
        .Replace("CasualLeave", "Casual Leave")
        .Replace("SickLeave", "Sick Leave")
        .Replace("PaidLeave", "Paid Leave");
}
