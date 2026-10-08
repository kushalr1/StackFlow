using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Employee")]
[Route("api/employee/profile")]
public class EmployeeProfileController(
    ICurrentUserService currentUser,
    IEmployeeProfileService employeeProfileService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<EmployeeProfileDto>> Get()
    {
        if (currentUser.EmployeeId is not int employeeId)
        {
            return Unauthorized(new { message = "Employee identity was not found in the access token." });
        }

        var profile = await employeeProfileService.GetAsync(employeeId);
        return profile is null
            ? NotFound(new { message = "The linked employee profile was not found." })
            : Ok(profile);
    }
}
