using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class AttendanceService(AppDbContext dbContext) : IAttendanceService
{
    public async Task<IReadOnlyList<AttendanceDto>> GetAllAsync(
        DateOnly? date,
        int? employeeId,
        string? status)
    {
        var query = dbContext.AttendanceRecords
            .AsNoTracking()
            .Include(record => record.Employee)
            .AsQueryable();

        if (date.HasValue)
        {
            query = query.Where(record => record.Date == date.Value);
        }

        if (employeeId.HasValue)
        {
            query = query.Where(record => record.EmployeeId == employeeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<AttendanceStatus>(status.Replace(" ", ""), true, out var parsedStatus))
        {
            query = query.Where(record => record.Status == parsedStatus);
        }

        return await query
            .OrderByDescending(record => record.Date)
            .ThenBy(record => record.Employee.Name)
            .Select(record => ToDto(record))
            .ToListAsync();
    }

    public async Task<AttendanceDto?> GetByIdAsync(int id) =>
        await dbContext.AttendanceRecords
            .AsNoTracking()
            .Include(record => record.Employee)
            .Where(record => record.Id == id)
            .Select(record => ToDto(record))
            .FirstOrDefaultAsync();

    public async Task<AttendanceSaveResult> CreateAsync(SaveAttendanceDto attendanceDto)
    {
        var employee = await dbContext.Employees.FindAsync(attendanceDto.EmployeeId);
        if (employee is null)
        {
            return new(AttendanceSaveOutcome.EmployeeNotFound);
        }

        if (!employee.IsActive)
        {
            return new(AttendanceSaveOutcome.EmployeeInactive);
        }

        var date = attendanceDto.Date!.Value;

        if (await HasApprovedLeaveAsync(attendanceDto.EmployeeId, date))
        {
            return new(AttendanceSaveOutcome.ApprovedLeave);
        }

        if (await IsDuplicateAsync(attendanceDto.EmployeeId, date))
        {
            return new(AttendanceSaveOutcome.Duplicate);
        }

        var record = new Attendance
        {
            EmployeeId = attendanceDto.EmployeeId,
            Date = date,
            Status = attendanceDto.Status
        };

        dbContext.AttendanceRecords.Add(record);
        await dbContext.SaveChangesAsync();
        await dbContext.Entry(record).Reference(item => item.Employee).LoadAsync();

        return new(AttendanceSaveOutcome.Saved, ToDto(record));
    }

    public async Task<AttendanceSaveResult> UpdateAsync(int id, SaveAttendanceDto attendanceDto)
    {
        var record = await dbContext.AttendanceRecords.FindAsync(id);
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

        var employee = await dbContext.Employees.FindAsync(attendanceDto.EmployeeId);
        if (employee is null)
        {
            return new(AttendanceSaveOutcome.EmployeeNotFound);
        }


        if (!employee.IsActive)
        {
            return new(AttendanceSaveOutcome.EmployeeInactive);
        }

        var date = attendanceDto.Date!.Value;

        if (await HasApprovedLeaveAsync(attendanceDto.EmployeeId, date))
        {
            return new(AttendanceSaveOutcome.ApprovedLeave);
        }

        if (await IsDuplicateAsync(attendanceDto.EmployeeId, date, id))
        {
            return new(AttendanceSaveOutcome.Duplicate);
        }

        record.Status = attendanceDto.Status;
        await dbContext.SaveChangesAsync();

        return new(AttendanceSaveOutcome.Saved);
    }

    private Task<bool> IsDuplicateAsync(int employeeId, DateOnly date, int? excludedId = null) =>
        dbContext.AttendanceRecords.AnyAsync(record =>
            record.EmployeeId == employeeId &&
            record.Date == date &&
            (!excludedId.HasValue || record.Id != excludedId.Value));

    private Task<bool> HasApprovedLeaveAsync(int employeeId, DateOnly date) =>
        dbContext.LeaveRequests.AnyAsync(request =>
            request.EmployeeId == employeeId &&
            request.Status == LeaveStatus.Approved &&
            request.StartDate <= date &&
            request.EndDate >= date);

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
