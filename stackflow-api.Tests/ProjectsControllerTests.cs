using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class ProjectsControllerTests
{
    [Fact]
    public async Task Create_ValidProject_Returns201Created()
    {
        var controller = new ProjectsController(new FakeProjectService());
        var result = await controller.Create(ValidProject());
        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    [Fact]
    public async Task AssignEmployee_Duplicate_Returns409Conflict()
    {
        var service = new FakeProjectService();
        var project = await service.CreateAsync(ValidProject());
        await service.AssignEmployeeAsync(project.Project!.Id, 1);
        var controller = new ProjectsController(service);
        var result = await controller.AssignEmployee(project.Project.Id, new AssignEmployeeDto { EmployeeId = 1 });
        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public void Validation_EndBeforeStart_IsInvalid()
    {
        var dto = ValidProject();
        dto.EndDate = new DateOnly(2026, 9, 16);
        Assert.Single(dto.Validate(new System.ComponentModel.DataAnnotations.ValidationContext(dto)));
    }

    private static SaveProjectDto ValidProject() => new()
    {
        Name = "StackFlow", StartDate = new DateOnly(2026, 9, 17), Status = ProjectStatus.Active
    };

    private sealed class FakeProjectService : IProjectService
    {
        private readonly List<ProjectDto> projects = [];
        private readonly HashSet<(int, int)> assignments = [];
        public Task<IReadOnlyList<ProjectDto>> GetAllAsync(ProjectStatus? status) => Task.FromResult<IReadOnlyList<ProjectDto>>(projects);
        public Task<ProjectDto?> GetByIdAsync(int id) => Task.FromResult(projects.FirstOrDefault(p => p.Id == id));
        public Task<ProjectSaveResult> CreateAsync(SaveProjectDto dto)
        {
            var project = new ProjectDto { Id = projects.Count + 1, Name = dto.Name, StartDate = dto.StartDate!.Value, Status = dto.Status.ToString() };
            projects.Add(project); return Task.FromResult(new ProjectSaveResult(ProjectSaveOutcome.Saved, project));
        }
        public Task<ProjectSaveOutcome> UpdateAsync(int id, SaveProjectDto dto) => Task.FromResult(ProjectSaveOutcome.Saved);
        public Task<ProjectSaveOutcome> DeleteAsync(int id) => Task.FromResult(ProjectSaveOutcome.Saved);
        public Task<ProjectSaveOutcome> AssignEmployeeAsync(int projectId, int employeeId) =>
            Task.FromResult(assignments.Add((projectId, employeeId)) ? ProjectSaveOutcome.Saved : ProjectSaveOutcome.DuplicateAssignment);
        public Task<ProjectSaveOutcome> RemoveEmployeeAsync(int projectId, int employeeId) =>
            Task.FromResult(assignments.Remove((projectId, employeeId)) ? ProjectSaveOutcome.Saved : ProjectSaveOutcome.AssignmentNotFound);
    }
}
