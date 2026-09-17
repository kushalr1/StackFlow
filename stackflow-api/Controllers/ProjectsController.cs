using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProjectDto>>> GetAll([FromQuery] ProjectStatus? status) =>
        Ok(await projectService.GetAllAsync(status));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDto>> GetById(int id)
    {
        var project = await projectService.GetByIdAsync(id);
        return project is null ? NotFound(new { message = $"Project with ID {id} was not found." }) : Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create(SaveProjectDto dto)
    {
        var result = await projectService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Project!.Id }, result.Project);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SaveProjectDto dto) =>
        await projectService.UpdateAsync(id, dto) == ProjectSaveOutcome.NotFound
            ? NotFound(new { message = $"Project with ID {id} was not found." })
            : NoContent();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await projectService.DeleteAsync(id) == ProjectSaveOutcome.NotFound
            ? NotFound(new { message = $"Project with ID {id} was not found." })
            : NoContent();

    [HttpPost("{id:int}/employees")]
    public async Task<IActionResult> AssignEmployee(int id, AssignEmployeeDto dto)
    {
        var result = await projectService.AssignEmployeeAsync(id, dto.EmployeeId);
        return result switch
        {
            ProjectSaveOutcome.NotFound => NotFound(new { message = $"Project with ID {id} was not found." }),
            ProjectSaveOutcome.EmployeeNotFound => NotFound(new { message = "The selected employee was not found." }),
            ProjectSaveOutcome.DuplicateAssignment => Conflict(new { message = "This employee is already assigned to the project." }),
            _ => NoContent()
        };
    }

    [HttpDelete("{id:int}/employees/{employeeId:int}")]
    public async Task<IActionResult> RemoveEmployee(int id, int employeeId)
    {
        var result = await projectService.RemoveEmployeeAsync(id, employeeId);
        return result switch
        {
            ProjectSaveOutcome.NotFound => NotFound(new { message = $"Project with ID {id} was not found." }),
            ProjectSaveOutcome.AssignmentNotFound => NotFound(new { message = "This employee is not assigned to the project." }),
            _ => NoContent()
        };
    }
}
