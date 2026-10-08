using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class LeaveRequestService(ILeaveStore store) : ILeaveRequestService
{
    public async Task<IReadOnlyList<LeaveRequestDto>> GetAllAsync(
        int? employeeId,
        LeaveStatus? status,
        LeaveType? leaveType)
    {
        return (await store.ListAsync(employeeId, status, leaveType)).Select(ToDto).ToList();
    }

    public async Task<LeaveRequestDto?> GetByIdAsync(int id)
    {
        var request = await store.GetByIdAsync(id);
        return request is null ? null : ToDto(request);
    }

    public async Task<LeaveSaveResult> CreateAsync(SaveLeaveRequestDto dto)
    {
        var employee = await store.FindEmployeeAsync(dto.EmployeeId);
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

        await store.AddAsync(request, loadEmployee: true);

        return new(LeaveSaveOutcome.Saved, ToDto(request));
    }

    public async Task<LeaveSaveOutcome> UpdateAsync(int id, SaveLeaveRequestDto dto)
    {
        var request = await store.FindAsync(id);
        if (request is null)
        {
            return LeaveSaveOutcome.NotFound;
        }

        if (request.Status != LeaveStatus.Pending)
        {
            return LeaveSaveOutcome.NotEditable;
        }

        var employee = await store.FindEmployeeAsync(dto.EmployeeId);
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
        await store.SaveAsync();
        return LeaveSaveOutcome.Saved;
    }

    public async Task<LeaveSaveOutcome> UpdateStatusAsync(int id, LeaveStatus status)
    {
        var request = await store.FindAsync(id);
        if (request is null)
        {
            return LeaveSaveOutcome.NotFound;
        }


        if (request.Status != LeaveStatus.Pending)
        {
            return LeaveSaveOutcome.NotEditable;
        }

        if (status == LeaveStatus.Approved)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var latestDate = today.AddYears(1);
            if (request.StartDate < today || request.EndDate > latestDate || request.EndDate < request.StartDate)
            {
                return LeaveSaveOutcome.InvalidDateRange;
            }

            var employeeIsActive = await store.IsEmployeeActiveAsync(request.EmployeeId);
            if (!employeeIsActive)
            {
                return LeaveSaveOutcome.EmployeeInactive;
            }

            var hasAttendance = await store.HasAttendanceAsync(request.EmployeeId, request.StartDate, request.EndDate);
            if (hasAttendance)
            {
                return LeaveSaveOutcome.AttendanceConflict;
            }

            var hasOverlappingLeave = await store.HasOverlapAsync(request.EmployeeId, request.StartDate, request.EndDate, approvedOnly: true, excludedId: request.Id);
            if (hasOverlappingLeave)
            {
                return LeaveSaveOutcome.OverlappingApprovedLeave;
            }
        }

        request.Status = status;
        await store.SaveAsync();
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
