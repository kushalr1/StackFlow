using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Employee")]
[Route("api/employee/leaves")]
public class EmployeeLeavesController(
    ICurrentUserService currentUser,
    IEmployeeLeaveService employeeLeaveService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeLeaveDto>>> GetAll()
    {
        return currentUser.EmployeeId is not int employeeId
            ? Unauthorized(new { message = "Employee identity was not found in the access token." })
            : Ok(await employeeLeaveService.GetAllAsync(employeeId));
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeLeaveDto>> Create(CreateEmployeeLeaveDto dto)
    {
        if (currentUser.EmployeeId is not int employeeId)
        {
            return Unauthorized(new { message = "Employee identity was not found in the access token." });
        }

        var result = await employeeLeaveService.CreateAsync(employeeId, dto);
        return result.Outcome switch
        {
            EmployeeLeaveCreateOutcome.EmployeeInactive =>
                Conflict(new { message = "A relieved employee cannot request leave." }),
            EmployeeLeaveCreateOutcome.OverlappingRequest =>
                Conflict(new { message = "You already have a pending or approved leave overlapping these dates." }),
            EmployeeLeaveCreateOutcome.AttendanceConflict =>
                Conflict(new { message = "Attendance already exists within these dates. Contact Admin/HR." }),
            _ => Created("/api/employee/leaves", result.Leave)
        };
    }
}
