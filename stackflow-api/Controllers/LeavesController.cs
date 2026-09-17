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
        return result.Outcome == LeaveSaveOutcome.EmployeeNotFound
            ? NotFound(new { message = "The selected employee was not found." })
            : CreatedAtAction(nameof(GetById), new { id = result.LeaveRequest!.Id }, result.LeaveRequest);
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
        _ => NoContent()
    };
}
