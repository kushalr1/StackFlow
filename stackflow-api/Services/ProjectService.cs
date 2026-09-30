using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class ProjectService(AppDbContext dbContext) : IProjectService
{
    public async Task<IReadOnlyList<ProjectDto>> GetAllAsync(ProjectStatus? status)
    {
        var query = dbContext.Projects
            .AsNoTracking()
            .Include(project => project.EmployeeProjects)
                .ThenInclude(link => link.Employee)
            .AsQueryable();
        if (status.HasValue) query = query.Where(project => project.Status == status.Value);
        var projects = await query.ToListAsync();
        return projects
            .Select(ToDto)
            .OrderByDescending(project => project.IsDelayed)
            .ThenByDescending(project => PriorityRank(project.Priority))
            .ThenBy(project => project.Name)
            .ToList();
    }

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        var project = await dbContext.Projects.AsNoTracking()
            .Include(project => project.EmployeeProjects)
                .ThenInclude(link => link.Employee)
            .Where(project => project.Id == id)
            .FirstOrDefaultAsync();

        return project is null ? null : ToDto(project);
    }

    public async Task<ProjectSaveResult> CreateAsync(SaveProjectDto dto)
    {
        var project = new Project();
        Map(dto, project);
        dbContext.Projects.Add(project);
        await dbContext.SaveChangesAsync();
        return new(ProjectSaveOutcome.Saved, ToDto(project));
    }

    public async Task<ProjectSaveOutcome> UpdateAsync(int id, SaveProjectDto dto)
    {
        var project = await dbContext.Projects.FindAsync(id);
        if (project is null) return ProjectSaveOutcome.NotFound;
        Map(dto, project);
        await dbContext.SaveChangesAsync();
        return ProjectSaveOutcome.Saved;
    }

    public async Task<ProjectSaveOutcome> DeleteAsync(int id)
    {
        var project = await dbContext.Projects.FindAsync(id);
        if (project is null) return ProjectSaveOutcome.NotFound;
        if (await dbContext.EmployeeProjects.AnyAsync(link => link.ProjectId == id))
            return ProjectSaveOutcome.HasAssignmentHistory;
        dbContext.Projects.Remove(project);
        await dbContext.SaveChangesAsync();
        return ProjectSaveOutcome.Saved;
    }

    public async Task<ProjectSaveOutcome> AssignEmployeeAsync(int projectId, AssignEmployeeDto dto)
    {
        var project = await dbContext.Projects.FindAsync(projectId);
        if (project is null)
            return ProjectSaveOutcome.NotFound;
        if (project.Status is ProjectStatus.Completed or ProjectStatus.OnHold)
            return ProjectSaveOutcome.TeamLocked;

        var employee = await dbContext.Employees.FindAsync(dto.EmployeeId);
        if (employee is null)
            return ProjectSaveOutcome.EmployeeNotFound;
        if (!employee.IsActive)
            return ProjectSaveOutcome.InactiveEmployee;

        var existing = await dbContext.EmployeeProjects.FindAsync(dto.EmployeeId, projectId);
        if (existing is not null && existing.RemovedOn is null)
            return ProjectSaveOutcome.DuplicateAssignment;

        if (existing is null)
        {
            dbContext.EmployeeProjects.Add(new EmployeeProject
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

        await dbContext.SaveChangesAsync();
        return ProjectSaveOutcome.Saved;
    }

    public async Task<ProjectSaveOutcome> RemoveEmployeeAsync(int projectId, int employeeId)
    {
        var project = await dbContext.Projects.FindAsync(projectId);
        if (project is null)
            return ProjectSaveOutcome.NotFound;
        if (project.Status is ProjectStatus.Completed or ProjectStatus.OnHold)
            return ProjectSaveOutcome.TeamLocked;
        var link = await dbContext.EmployeeProjects.FindAsync(employeeId, projectId);
        if (link is null || link.RemovedOn is not null) return ProjectSaveOutcome.AssignmentNotFound;
        link.RemovedOn = DateOnly.FromDateTime(DateTime.Today);
        await dbContext.SaveChangesAsync();
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
