using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController(IEmployeeService employeeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? department)
    {
        var employees = await employeeService.GetAllAsync(search, department);
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

        var wasUpdated = await employeeService.UpdateAsync(id, employeeDto);

        if (!wasUpdated)
        {
            return NotFound(new { message = $"Employee with ID {id} was not found." });
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

        var wasDeleted = await employeeService.DeleteAsync(id);

        if (!wasDeleted)
        {
            return NotFound(new { message = $"Employee with ID {id} was not found." });
        }

        return NoContent();
    }
}
