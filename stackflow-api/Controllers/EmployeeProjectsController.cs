using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Employee")]
[Route("api/employee/projects")]
public class EmployeeProjectsController(
    ICurrentUserService currentUser,
    IEmployeeProjectService projectService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeProjectDto>>> GetAll() =>
        currentUser.EmployeeId is not int employeeId
            ? Unauthorized(new { message = "Employee identity was not found in the access token." })
            : Ok(await projectService.GetAllAsync(employeeId));
}
