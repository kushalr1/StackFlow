using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class AttendanceController(IAttendanceService attendanceService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AttendanceDto>>> GetAll(
        [FromQuery] DateOnly? date,
        [FromQuery] int? employeeId,
        [FromQuery] string? status) =>
        Ok(await attendanceService.GetAllAsync(date, employeeId, status));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AttendanceDto>> GetById(int id)
    {
        var attendance = await attendanceService.GetByIdAsync(id);
        return attendance is null
            ? NotFound(new { message = $"Attendance record with ID {id} was not found." })
            : Ok(attendance);
    }

    [HttpPost]
    public async Task<ActionResult<AttendanceDto>> Create(SaveAttendanceDto attendanceDto)
    {
        var result = await attendanceService.CreateAsync(attendanceDto);
        return result.Outcome switch
        {
            AttendanceSaveOutcome.EmployeeNotFound =>
                NotFound(new { message = "The selected employee was not found." }),
            AttendanceSaveOutcome.EmployeeInactive =>
                Conflict(new { message = "Attendance cannot be recorded for a relieved employee." }),
            AttendanceSaveOutcome.ApprovedLeave =>
                Conflict(new { message = "Attendance cannot be recorded because this employee has approved leave on this date." }),
            AttendanceSaveOutcome.Duplicate =>
                Conflict(new { message = "Attendance already exists for this employee on this date." }),
            _ => CreatedAtAction(nameof(GetById), new { id = result.Attendance!.Id }, result.Attendance)
        };
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SaveAttendanceDto attendanceDto)
    {
        var result = await attendanceService.UpdateAsync(id, attendanceDto);
        return result.Outcome switch
        {
            AttendanceSaveOutcome.NotFound =>
                NotFound(new { message = $"Attendance record with ID {id} was not found." }),
            AttendanceSaveOutcome.EmployeeNotFound =>
                NotFound(new { message = "The selected employee was not found." }),
            AttendanceSaveOutcome.EmployeeInactive =>
                Conflict(new { message = "Attendance cannot be recorded for a relieved employee." }),
            AttendanceSaveOutcome.ApprovedLeave =>
                Conflict(new { message = "Attendance cannot be recorded because this employee has approved leave on this date." }),
            AttendanceSaveOutcome.HistoricalRecordReadOnly =>
                Conflict(new { message = "Only today's attendance status can be changed. Previous attendance is view-only." }),
            AttendanceSaveOutcome.RecordIdentityCannotChange =>
                BadRequest(new { message = "Employee and date cannot be changed while editing attendance. Only the status can be changed." }),
            AttendanceSaveOutcome.Duplicate =>
                Conflict(new { message = "Attendance already exists for this employee on this date." }),
            _ => NoContent()
        };
    }
}
