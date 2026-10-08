using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class AttendanceService(IAttendanceStore store) : IAttendanceService
{
    public async Task<IReadOnlyList<AttendanceDto>> GetAllAsync(
        DateOnly? date,
        int? employeeId,
        string? status)
    {
        return (await store.ListAsync(date, employeeId, status)).Select(ToDto).ToList();
    }

    public async Task<AttendanceDto?> GetByIdAsync(int id)
    {
        var record = await store.GetByIdAsync(id);
        return record is null ? null : ToDto(record);
    }

    public async Task<AttendanceSaveResult> CreateAsync(SaveAttendanceDto attendanceDto)
    {
        var employee = await store.FindEmployeeAsync(attendanceDto.EmployeeId);
        if (employee is null)
        {
            return new(AttendanceSaveOutcome.EmployeeNotFound);
        }

        if (!employee.IsActive)
        {
            return new(AttendanceSaveOutcome.EmployeeInactive);
        }

        var date = attendanceDto.Date!.Value;

        if (await store.HasApprovedLeaveAsync(attendanceDto.EmployeeId, date))
        {
            return new(AttendanceSaveOutcome.ApprovedLeave);
        }

        if (await store.IsDuplicateAsync(attendanceDto.EmployeeId, date))
        {
            return new(AttendanceSaveOutcome.Duplicate);
        }

        var record = new Attendance
        {
            EmployeeId = attendanceDto.EmployeeId,
            Date = date,
            Status = attendanceDto.Status
        };

        await store.AddAsync(record);

        return new(AttendanceSaveOutcome.Saved, ToDto(record));
    }

    public async Task<AttendanceSaveResult> UpdateAsync(int id, SaveAttendanceDto attendanceDto)
    {
        var record = await store.FindAsync(id);
        if (record is null)
        {
            return new(AttendanceSaveOutcome.NotFound);
        }

        var today = DateOnly.FromDateTime(DateTime.Today);
        if (record.Date != today)
        {
            return new(AttendanceSaveOutcome.HistoricalRecordReadOnly);
        }

        if (attendanceDto.EmployeeId != record.EmployeeId || attendanceDto.Date != record.Date)
        {
            return new(AttendanceSaveOutcome.RecordIdentityCannotChange);
        }

        var employee = await store.FindEmployeeAsync(attendanceDto.EmployeeId);
        if (employee is null)
        {
            return new(AttendanceSaveOutcome.EmployeeNotFound);
        }


        if (!employee.IsActive)
        {
            return new(AttendanceSaveOutcome.EmployeeInactive);
        }

        var date = attendanceDto.Date!.Value;

        if (await store.HasApprovedLeaveAsync(attendanceDto.EmployeeId, date))
        {
            return new(AttendanceSaveOutcome.ApprovedLeave);
        }

        if (await store.IsDuplicateAsync(attendanceDto.EmployeeId, date, id))
        {
            return new(AttendanceSaveOutcome.Duplicate);
        }

        record.Status = attendanceDto.Status;
        await store.SaveAsync();

        return new(AttendanceSaveOutcome.Saved);
    }

    private static AttendanceDto ToDto(Attendance record) => new()
    {
        Id = record.Id,
        EmployeeId = record.EmployeeId,
        EmployeeName = record.Employee.Name,
        Date = record.Date,
        Status = record.Status switch
        {
            AttendanceStatus.HalfDay => "Half Day",
            AttendanceStatus.OnLeave => "On Leave",
            _ => record.Status.ToString()
        }
    };
}
