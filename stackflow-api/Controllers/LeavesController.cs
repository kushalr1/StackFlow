using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class LeavesController(ILeaveRequestService leaveRequestService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LeaveRequestDto>>> GetAll(
        [FromQuery] int? employeeId,
        [FromQuery] LeaveStatus? status,
        [FromQuery] LeaveType? leaveType) =>
        Ok(await leaveRequestService.GetAllAsync(employeeId, status, leaveType));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LeaveRequestDto>> GetById(int id)
    {
        var request = await leaveRequestService.GetByIdAsync(id);
        return request is null
            ? NotFound(new { message = $"Leave request with ID {id} was not found." })
            : Ok(request);
    }

    [HttpPost]
    public async Task<ActionResult<LeaveRequestDto>> Create(SaveLeaveRequestDto dto)
    {
        var result = await leaveRequestService.CreateAsync(dto);
        return result.Outcome switch
        {
            LeaveSaveOutcome.EmployeeNotFound =>
                NotFound(new { message = "The selected employee was not found." }),
            LeaveSaveOutcome.EmployeeInactive =>
                Conflict(new { message = "A leave request cannot be created for a relieved employee." }),
            _ => CreatedAtAction(nameof(GetById), new { id = result.LeaveRequest!.Id }, result.LeaveRequest)
        };
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SaveLeaveRequestDto dto)
    {
        var result = await leaveRequestService.UpdateAsync(id, dto);
        return ResultToAction(result, id);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateLeaveStatusDto dto)
    {
        if (dto.Status == LeaveStatus.Pending)
        {
            return BadRequest(new { message = "Choose Approved or Rejected." });
        }

        var result = await leaveRequestService.UpdateStatusAsync(id, dto.Status);
        return ResultToAction(result, id);
    }

    private IActionResult ResultToAction(LeaveSaveOutcome result, int id) => result switch
    {
        LeaveSaveOutcome.NotFound =>
            NotFound(new { message = $"Leave request with ID {id} was not found." }),
        LeaveSaveOutcome.EmployeeNotFound =>
            NotFound(new { message = "The selected employee was not found." }),
        LeaveSaveOutcome.EmployeeInactive =>
            Conflict(new { message = "This action is not available for a relieved employee." }),
        LeaveSaveOutcome.NotEditable =>
            Conflict(new { message = "Only pending leave requests can be edited." }),
        LeaveSaveOutcome.InvalidDateRange =>
            Conflict(new { message = "This leave cannot be approved because its dates are outside the allowed range. Edit the pending request and enter valid dates first." }),
        LeaveSaveOutcome.AttendanceConflict =>
            Conflict(new { message = "This leave cannot be approved because attendance already exists within the requested dates." }),
        LeaveSaveOutcome.OverlappingApprovedLeave =>
            Conflict(new { message = "This employee already has approved leave overlapping these dates." }),
        _ => NoContent()
    };
}
