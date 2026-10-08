using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class EmployeeLeaveService(ILeaveStore store) : IEmployeeLeaveService
{
    public async Task<IReadOnlyList<EmployeeLeaveDto>> GetAllAsync(int employeeId) =>
        (await store.ListOwnedAsync(employeeId)).Select(ToDto).ToList();

    public async Task<EmployeeLeaveCreateResult> CreateAsync(
        int employeeId,
        CreateEmployeeLeaveDto dto)
    {
        var employeeIsActive = await store.IsEmployeeActiveAsync(employeeId);
        if (!employeeIsActive)
        {
            return new(EmployeeLeaveCreateOutcome.EmployeeInactive);
        }

        var startDate = dto.StartDate!.Value;
        var endDate = dto.EndDate!.Value;
        var overlaps = await store.HasOverlapAsync(employeeId, startDate, endDate, approvedOnly: false);
        if (overlaps)
        {
            return new(EmployeeLeaveCreateOutcome.OverlappingRequest);
        }

        var hasAttendance = await store.HasAttendanceAsync(employeeId, startDate, endDate);
        if (hasAttendance)
        {
            return new(EmployeeLeaveCreateOutcome.AttendanceConflict);
        }

        var request = new LeaveRequest
        {
            EmployeeId = employeeId,
            LeaveType = dto.LeaveType,
            StartDate = startDate,
            EndDate = endDate,
            Reason = dto.Reason.Trim(),
            Status = LeaveStatus.Pending,
            AppliedOn = DateTime.UtcNow
        };

        await store.AddAsync(request, loadEmployee: false);
        return new(EmployeeLeaveCreateOutcome.Created, ToDto(request));
    }

    private static EmployeeLeaveDto ToDto(LeaveRequest request) => new()
    {
        Id = request.Id,
        LeaveType = request.LeaveType switch
        {
            LeaveType.CasualLeave => "Casual Leave",
            LeaveType.SickLeave => "Sick Leave",
            LeaveType.PaidLeave => "Paid Leave",
            _ => "Other"
        },
        StartDate = request.StartDate,
        EndDate = request.EndDate,
        TotalDays = request.EndDate.DayNumber - request.StartDate.DayNumber + 1,
        Reason = request.Reason,
        Status = request.Status.ToString(),
        AppliedOn = request.AppliedOn
    };
}
