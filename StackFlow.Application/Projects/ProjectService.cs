using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class ProjectService(IProjectStore store) : IProjectService
{
    public async Task<IReadOnlyList<ProjectDto>> GetAllAsync(ProjectStatus? status)
    {
        var projects = await store.ListAsync(status);
        return projects
            .Select(ToDto)
            .OrderByDescending(project => project.IsDelayed)
            .ThenByDescending(project => PriorityRank(project.Priority))
            .ThenBy(project => project.Name)
            .ToList();
    }

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        var project = await store.GetByIdAsync(id);

        return project is null ? null : ToDto(project);
    }

    public async Task<ProjectSaveResult> CreateAsync(CreateProjectDto dto)
    {
        var employeeIds = (dto.EmployeeIds ?? []).Distinct().ToArray();
        if (employeeIds.Length > 0 && dto.Status is ProjectStatus.Completed or ProjectStatus.OnHold)
            return new(ProjectSaveOutcome.TeamLocked);
        var employees = await store.FindEmployeesAsync(employeeIds);
        if (employees.Count != employeeIds.Length)
            return new(ProjectSaveOutcome.EmployeeNotFound);
        if (employees.Any(employee => !employee.IsActive))
            return new(ProjectSaveOutcome.InactiveEmployee);

        var project = new Project();
        Map(dto, project);
        foreach (var employee in employees)
        {
            AddAssignmentNotification(project, employee.Id);
            project.EmployeeProjects.Add(new EmployeeProject
            {
                Employee = employee,
                Role = "Member",
                AssignedOn = DateOnly.FromDateTime(DateTime.Today)
            });
        }
        store.AddProject(project);
        // Persist the project, assignments and notifications together.
        await store.SaveAsync();
        return new(ProjectSaveOutcome.Saved, ToDto(project));
    }

    public async Task<ProjectSaveOutcome> UpdateAsync(int id, SaveProjectDto dto)
    {
        var project = await store.FindAsync(id);
        if (project is null) return ProjectSaveOutcome.NotFound;
        Map(dto, project);
        await store.SaveAsync();
        return ProjectSaveOutcome.Saved;
    }

    public async Task<ProjectSaveOutcome> DeleteAsync(int id)
    {
        var project = await store.FindAsync(id);
        if (project is null) return ProjectSaveOutcome.NotFound;
        if (await store.HasAssignmentHistoryAsync(id))
            return ProjectSaveOutcome.HasAssignmentHistory;
        store.DeleteProject(project);
        await store.SaveAsync();
        return ProjectSaveOutcome.Saved;
    }

    public async Task<ProjectSaveOutcome> AssignEmployeeAsync(int projectId, AssignEmployeeDto dto)
    {
        var project = await store.FindAsync(projectId);
        if (project is null)
            return ProjectSaveOutcome.NotFound;
        if (project.Status is ProjectStatus.Completed or ProjectStatus.OnHold)
            return ProjectSaveOutcome.TeamLocked;

        var employee = await store.FindEmployeeAsync(dto.EmployeeId);
        if (employee is null)
            return ProjectSaveOutcome.EmployeeNotFound;
        if (!employee.IsActive)
            return ProjectSaveOutcome.InactiveEmployee;

        var existing = await store.FindAssignmentAsync(dto.EmployeeId, projectId);
        if (existing is not null && existing.RemovedOn is null)
            return ProjectSaveOutcome.DuplicateAssignment;

        if (existing is null)
        {
            store.AddAssignment(new EmployeeProject
            {
                ProjectId = projectId,
                EmployeeId = dto.EmployeeId,
                Role = dto.Role.Trim(),
                AssignedOn = DateOnly.FromDateTime(DateTime.Today)
            });
        }
        else
        {
            existing.Role = dto.Role.Trim();
            existing.AssignedOn = DateOnly.FromDateTime(DateTime.Today);
            existing.RemovedOn = null;
        }

        AddAssignmentNotification(project, dto.EmployeeId);
        await store.SaveAsync();
        return ProjectSaveOutcome.Saved;
    }

    private void AddAssignmentNotification(Project project, int employeeId) =>
        store.AddNotification(new EmployeeNotification
        {
            EmployeeId = employeeId, Project = project,
            Message = $"You were assigned to {project.Name}."
        });

    public async Task<ProjectSaveOutcome> RemoveEmployeeAsync(int projectId, int employeeId)
    {
        var project = await store.FindAsync(projectId);
        if (project is null)
            return ProjectSaveOutcome.NotFound;
        if (project.Status is ProjectStatus.Completed or ProjectStatus.OnHold)
            return ProjectSaveOutcome.TeamLocked;
        var link = await store.FindAssignmentAsync(employeeId, projectId);
        if (link is null || link.RemovedOn is not null) return ProjectSaveOutcome.AssignmentNotFound;
        link.RemovedOn = DateOnly.FromDateTime(DateTime.Today);
        await store.SaveAsync();
        return ProjectSaveOutcome.Saved;
    }

    private static void Map(SaveProjectDto dto, Project project)
    {
        project.Name = dto.Name.Trim();
        project.Description = dto.Description.Trim();
        project.StartDate = dto.StartDate!.Value;
        project.DueDate = dto.DueDate;
        project.CompletedOn = dto.Status == ProjectStatus.Completed ? dto.CompletedOn : null;
        project.Status = dto.Status;
        project.Priority = dto.Priority;
    }

    private static ProjectDto ToDto(Project project)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var comparisonDate = project.Status == ProjectStatus.Completed
            ? project.CompletedOn
            : today;
        var delayDays = project.DueDate.HasValue && comparisonDate.HasValue && comparisonDate.Value > project.DueDate.Value
            ? comparisonDate.Value.DayNumber - project.DueDate.Value.DayNumber
            : 0;

        return new ProjectDto
        {
        Id = project.Id,
        Name = project.Name,
        Description = project.Description,
        StartDate = project.StartDate,
        DueDate = project.DueDate,
        CompletedOn = project.CompletedOn,
        Status = project.Status == ProjectStatus.OnHold ? "On Hold" : project.Status.ToString(),
        Priority = project.Priority.ToString(),
        IsDelayed = delayDays > 0,
        DelayDays = delayDays,
        Employees = project.EmployeeProjects
            .Where(link => link.RemovedOn == null)
            .OrderBy(link => link.Employee.Name)
            .Select(link => new ProjectEmployeeDto
            {
                Id = link.EmployeeId,
                Name = link.Employee.Name,
                Role = link.Role,
                AssignedOn = link.AssignedOn
            })
            .ToList()
        };
    }

    private static int PriorityRank(string priority) => priority switch
    {
        "High" => 3,
        "Medium" => 2,
        _ => 1
    };
}
