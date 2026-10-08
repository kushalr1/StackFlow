using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController, Authorize(Roles = "Employee"), Route("api/employee/tasks")]
public class PersonalTasksController(ICurrentUserService user, IPersonalTaskService service) : ControllerBase
{
    public record CompletionInput(bool IsCompleted);
    [HttpGet] public async Task<IActionResult> List() => user.EmployeeId is int owner ? Ok(await service.ListAsync(owner)) : Unauthorized();
    [HttpPost] public async Task<IActionResult> Create(SavePersonalTask input) => user.EmployeeId is int owner
        ? StatusCode(201, await service.CreateAsync(owner, input)) : Unauthorized();
    [HttpPatch("{id:int}/completion")] public async Task<IActionResult> Complete(int id, CompletionInput input) => user.EmployeeId is not int owner
        ? Unauthorized() : await service.CompleteAsync(owner, id, input.IsCompleted) ? NoContent() : NotFound();
    [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id) => user.EmployeeId is not int owner
        ? Unauthorized() : await service.DeleteAsync(owner, id) ? NoContent() : NotFound();
}
