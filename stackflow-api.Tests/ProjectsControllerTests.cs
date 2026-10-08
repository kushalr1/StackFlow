using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class ProjectsControllerTests
{
    [Theory]
    [InlineData(ProjectStatus.OnHold)]
    [InlineData(ProjectStatus.Completed)]
    public async Task Create_LockedStatusWithTeam_DoesNotStageProject(ProjectStatus status)
    {
        using var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=unused_guard_test;Username=unused").Options);
        var dto = ValidProject();
        dto.Status = status;
        dto.EmployeeIds = [1];
        var service = new ProjectService(new StackFlow.Infrastructure.Projects.EfProjectStore(context));
        var result = await service.CreateAsync(dto);
        Assert.Equal(ProjectSaveOutcome.TeamLocked, result.Outcome);
        Assert.Empty(context.ChangeTracker.Entries());
    }

    [Theory]
    [InlineData(ProjectSaveOutcome.EmployeeNotFound, 404)]
    [InlineData(ProjectSaveOutcome.InactiveEmployee, 409)]
    [InlineData(ProjectSaveOutcome.TeamLocked, 409)]
    public async Task Create_InvalidTeam_ReturnsExpectedFailure(ProjectSaveOutcome outcome, int statusCode)
    {
        var controller = new ProjectsController(new FakeProjectService { CreateOutcome = outcome });
        var result = await controller.Create(ValidProject());
        Assert.Equal(statusCode, Assert.IsAssignableFrom<ObjectResult>(result.Result).StatusCode);
    }

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
        await service.AssignEmployeeAsync(project.Project!.Id, new AssignEmployeeDto { EmployeeId = 1 });
        var controller = new ProjectsController(service);
        var result = await controller.AssignEmployee(project.Project.Id, new AssignEmployeeDto { EmployeeId = 1 });
        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public void Validation_DueBeforeStart_IsInvalid()
    {
        var dto = ValidProject();
        dto.DueDate = new DateOnly(2026, 9, 16);
        Assert.Single(dto.Validate(new System.ComponentModel.DataAnnotations.ValidationContext(dto)));
    }

    [Fact]
    public void Validation_CompletedWithoutActualDate_IsInvalid()
    {
        var dto = ValidProject();
        dto.Status = ProjectStatus.Completed;
        Assert.Contains(dto.Validate(new System.ComponentModel.DataAnnotations.ValidationContext(dto)),
            result => result.MemberNames.Contains(nameof(SaveProjectDto.CompletedOn)));
    }

    private static CreateProjectDto ValidProject() => new()
    {
        Name = "StackFlow", StartDate = new DateOnly(2026, 9, 17), Status = ProjectStatus.Active
    };

    private sealed class FakeProjectService : IProjectService
    {
        public ProjectSaveOutcome CreateOutcome { get; init; } = ProjectSaveOutcome.Saved;
        private readonly List<ProjectDto> projects = [];
        private readonly HashSet<(int, int)> assignments = [];
        public Task<IReadOnlyList<ProjectDto>> GetAllAsync(ProjectStatus? status) => Task.FromResult<IReadOnlyList<ProjectDto>>(projects);
        public Task<ProjectDto?> GetByIdAsync(int id) => Task.FromResult(projects.FirstOrDefault(p => p.Id == id));
        public Task<ProjectSaveResult> CreateAsync(CreateProjectDto dto)
        {
            if (CreateOutcome != ProjectSaveOutcome.Saved) return Task.FromResult(new ProjectSaveResult(CreateOutcome));
            var project = new ProjectDto { Id = projects.Count + 1, Name = dto.Name, StartDate = dto.StartDate!.Value, Status = dto.Status.ToString() };
            projects.Add(project); return Task.FromResult(new ProjectSaveResult(ProjectSaveOutcome.Saved, project));
        }
        public Task<ProjectSaveOutcome> UpdateAsync(int id, SaveProjectDto dto) => Task.FromResult(ProjectSaveOutcome.Saved);
        public Task<ProjectSaveOutcome> DeleteAsync(int id) => Task.FromResult(ProjectSaveOutcome.Saved);
        public Task<ProjectSaveOutcome> AssignEmployeeAsync(int projectId, AssignEmployeeDto dto) =>
            Task.FromResult(assignments.Add((projectId, dto.EmployeeId)) ? ProjectSaveOutcome.Saved : ProjectSaveOutcome.DuplicateAssignment);
        public Task<ProjectSaveOutcome> RemoveEmployeeAsync(int projectId, int employeeId) =>
            Task.FromResult(assignments.Remove((projectId, employeeId)) ? ProjectSaveOutcome.Saved : ProjectSaveOutcome.AssignmentNotFound);
    }
}
