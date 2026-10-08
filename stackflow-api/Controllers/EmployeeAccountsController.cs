using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/employees/{employeeId:int}/account")]
public class EmployeeAccountsController(IEmployeeAccountService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<EmployeeAccountDto?>> Get(int employeeId) => Ok(await service.GetAsync(employeeId));

    [HttpPost]
    public async Task<ActionResult<EmployeeAccountDto>> Create(int employeeId, CreateEmployeeAccountDto dto)
    {
        var result = await service.CreateAsync(employeeId, dto.Password);
        return result.Outcome switch
        {
            EmployeeAccountOutcome.NotFound => NotFound(new { message = "Employee was not found." }),
            EmployeeAccountOutcome.Inactive => Conflict(new { message = "A relieved employee cannot receive login access." }),
            EmployeeAccountOutcome.AlreadyExists => Conflict(new { message = "A login account already exists for this employee or email." }),
            _ => Created($"/api/employees/{employeeId}/account", result.Account)
        };
    }

    [HttpPut("password")]
    public async Task<ActionResult<EmployeeAccountDto>> Reset(int employeeId, CreateEmployeeAccountDto dto)
    {
        var result = await service.ResetAsync(employeeId, dto.Password);
        return result.Outcome switch
        {
            EmployeeAccountOutcome.NotFound => NotFound(new { message = "Employee login account was not found." }),
            EmployeeAccountOutcome.Inactive => Conflict(new { message = "Password cannot be reset for a disabled or relieved employee." }),
            _ => Ok(result.Account)
        };
    }

    [HttpPut("access")]
    public async Task<ActionResult<EmployeeAccountDto>> SetAccess(int employeeId, SetEmployeeAccessDto dto)
    {
        var result = await service.SetAccessAsync(employeeId, dto.IsActive!.Value);
        return result.Outcome switch
        {
            EmployeeAccountOutcome.NotFound => NotFound(new { message = "Employee login account was not found." }),
            EmployeeAccountOutcome.Inactive => Conflict(new { message = "Login cannot be enabled for a relieved employee." }),
            _ => Ok(result.Account)
        };
    }
}
