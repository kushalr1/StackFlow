using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetAllAsync(ProjectStatus? status);
    Task<ProjectDto?> GetByIdAsync(int id);
    Task<ProjectSaveResult> CreateAsync(SaveProjectDto dto);
    Task<ProjectSaveOutcome> UpdateAsync(int id, SaveProjectDto dto);
    Task<ProjectSaveOutcome> DeleteAsync(int id);
    Task<ProjectSaveOutcome> AssignEmployeeAsync(int projectId, int employeeId);
    Task<ProjectSaveOutcome> RemoveEmployeeAsync(int projectId, int employeeId);
}

public enum ProjectSaveOutcome
{
    Saved,
    NotFound,
    EmployeeNotFound,
    DuplicateAssignment,
    AssignmentNotFound
}

public record ProjectSaveResult(ProjectSaveOutcome Outcome, ProjectDto? Project = null);
