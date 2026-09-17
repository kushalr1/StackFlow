using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public interface ILeaveRequestService
{
    Task<IReadOnlyList<LeaveRequestDto>> GetAllAsync(
        int? employeeId,
        LeaveStatus? status,
        LeaveType? leaveType);
    Task<LeaveRequestDto?> GetByIdAsync(int id);
    Task<LeaveSaveResult> CreateAsync(SaveLeaveRequestDto leaveRequestDto);
    Task<LeaveSaveOutcome> UpdateAsync(int id, SaveLeaveRequestDto leaveRequestDto);
    Task<LeaveSaveOutcome> UpdateStatusAsync(int id, LeaveStatus status);
}

public enum LeaveSaveOutcome
{
    Saved,
    NotFound,
    EmployeeNotFound
}

public record LeaveSaveResult(LeaveSaveOutcome Outcome, LeaveRequestDto? LeaveRequest = null);
