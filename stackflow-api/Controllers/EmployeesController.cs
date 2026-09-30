using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class EmployeesController(IEmployeeService employeeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? departmentId,
        [FromQuery] bool? isActive = null)
    {
        var employees = await employeeService.GetAllAsync(search, departmentId, isActive);
        return Ok(employees);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "Employee ID must be greater than 0." });
        }

        var employee = await employeeService.GetByIdAsync(id);

        if (employee is null)
        {
            return NotFound(new { message = $"Employee with ID {id} was not found." });
        }

        return Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(
        CreateEmployeeDto employeeDto)
    {
        var employee = await employeeService.CreateAsync(employeeDto);

        if (employee is null)
        {
            return BadRequest(new { message = "The selected department does not exist." });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = employee.Id },
            employee);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateEmployeeDto employeeDto)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "Employee ID must be greater than 0." });
        }

        var result = await employeeService.UpdateAsync(id, employeeDto);

        if (result == EmployeeUpdateResult.EmployeeNotFound)
        {
            return NotFound(new { message = $"Employee with ID {id} was not found." });
        }

        if (result == EmployeeUpdateResult.DepartmentNotFound)
        {
            return BadRequest(new { message = "The selected department does not exist." });
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "Employee ID must be greater than 0." });
        }

        var result = await employeeService.DeleteAsync(id);

        if (result == EmployeeDeleteResult.NotFound)
        {
            return NotFound(new { message = $"Employee with ID {id} was not found." });
        }

        if (result == EmployeeDeleteResult.HasRelatedRecords)
        {
            return Conflict(new
            {
                message = "This employee cannot be deleted because attendance, leave, or project history exists. Relieve the employee instead."
            });
        }

        return NoContent();
    }

    [HttpPatch("{id:int}/relieve")]
    public async Task<IActionResult> Relieve(int id, RelieveEmployeeDto dto)
    {
        if (id <= 0)
        {
            return BadRequest(new { message = "Employee ID must be greater than 0." });
        }

        var result = await employeeService.RelieveAsync(id, dto);
        return result switch
        {
            EmployeeRelieveResult.NotFound =>
                NotFound(new { message = $"Employee with ID {id} was not found." }),
            EmployeeRelieveResult.AlreadyRelieved =>
                Conflict(new { message = "This employee has already been relieved." }),
            EmployeeRelieveResult.BeforeJoiningDate =>
                BadRequest(new { message = "Relieved date cannot be before the joining date." }),
            EmployeeRelieveResult.FutureDate =>
                BadRequest(new { message = "Relieved date cannot be in the future." }),
            _ => NoContent()
        };
    }
}
