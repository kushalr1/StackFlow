using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IAttendanceService
{
    Task<IReadOnlyList<AttendanceDto>> GetAllAsync(
        DateOnly? date,
        int? employeeId,
        string? status);
    Task<AttendanceDto?> GetByIdAsync(int id);
    Task<AttendanceSaveResult> CreateAsync(SaveAttendanceDto attendanceDto);
    Task<AttendanceSaveResult> UpdateAsync(int id, SaveAttendanceDto attendanceDto);
}

public enum AttendanceSaveOutcome
{
    Saved,
    NotFound,
    EmployeeNotFound,
    Duplicate
}

public record AttendanceSaveResult(
    AttendanceSaveOutcome Outcome,
    AttendanceDto? Attendance = null);
