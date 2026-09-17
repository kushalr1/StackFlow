using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController(IDepartmentService departmentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DepartmentDto>>> GetAll()
    {
        return Ok(await departmentService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DepartmentDto>> GetById(int id)
    {
        var department = await departmentService.GetByIdAsync(id);
        return department is null
            ? NotFound(new { message = $"Department with ID {id} was not found." })
            : Ok(department);
    }

    [HttpPost]
    public async Task<ActionResult<DepartmentDto>> Create(SaveDepartmentDto departmentDto)
    {
        var department = await departmentService.CreateAsync(departmentDto);

        if (department is null)
        {
            return Conflict(new { message = "A department with this name already exists." });
        }

        return CreatedAtAction(nameof(GetById), new { id = department.Id }, department);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SaveDepartmentDto departmentDto)
    {
        var result = await departmentService.UpdateAsync(id, departmentDto);

        return result switch
        {
            DepartmentUpdateResult.NotFound =>
                NotFound(new { message = $"Department with ID {id} was not found." }),
            DepartmentUpdateResult.DuplicateName =>
                Conflict(new { message = "A department with this name already exists." }),
            _ => NoContent()
        };
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await departmentService.DeleteAsync(id);

        return result switch
        {
            DepartmentDeleteResult.NotFound =>
                NotFound(new { message = $"Department with ID {id} was not found." }),
            DepartmentDeleteResult.HasEmployees =>
                Conflict(new
                {
                    message = "This department cannot be deleted because employees are assigned to it."
                }),
            _ => NoContent()
        };
    }
}
