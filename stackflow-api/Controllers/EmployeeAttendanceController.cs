using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Employee")]
[Route("api/employee/attendance")]
public class EmployeeAttendanceController(
    ICurrentUserService currentUser,
    IEmployeeAttendanceService employeeAttendanceService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeAttendanceDto>>> GetMonthly(
        [FromQuery] int? year,
        [FromQuery] int? month)
    {
        if (currentUser.EmployeeId is not int employeeId)
        {
            return Unauthorized(new { message = "Employee identity was not found in the access token." });
        }

        var today = DateOnly.FromDateTime(DateTime.Today);
        var selectedYear = year ?? today.Year;
        var selectedMonth = month ?? today.Month;

        if (selectedYear is < 1 or > 9999 || selectedMonth is < 1 or > 12)
        {
            return BadRequest(new { message = "Enter a valid year and month." });
        }

        return Ok(await employeeAttendanceService.GetMonthlyAsync(
            employeeId,
            selectedYear,
            selectedMonth));
    }
}
