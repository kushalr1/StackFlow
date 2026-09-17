using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class ProjectService(AppDbContext dbContext) : IProjectService
{
    public async Task<IReadOnlyList<ProjectDto>> GetAllAsync(ProjectStatus? status)
    {
        var query = dbContext.Projects.AsNoTracking().AsQueryable();
        if (status.HasValue) query = query.Where(project => project.Status == status.Value);
        return await query.OrderBy(project => project.Name).Select(project => ToDto(project)).ToListAsync();
    }

    public async Task<ProjectDto?> GetByIdAsync(int id) =>
        await dbContext.Projects.AsNoTracking()
            .Where(project => project.Id == id)
            .Select(project => ToDto(project))
            .FirstOrDefaultAsync();

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
        dbContext.Projects.Remove(project);
        await dbContext.SaveChangesAsync();
        return ProjectSaveOutcome.Saved;
    }

    public async Task<ProjectSaveOutcome> AssignEmployeeAsync(int projectId, int employeeId)
    {
        if (!await dbContext.Projects.AnyAsync(project => project.Id == projectId))
            return ProjectSaveOutcome.NotFound;
        if (!await dbContext.Employees.AnyAsync(employee => employee.Id == employeeId))
            return ProjectSaveOutcome.EmployeeNotFound;
        if (await dbContext.EmployeeProjects.AnyAsync(link => link.ProjectId == projectId && link.EmployeeId == employeeId))
            return ProjectSaveOutcome.DuplicateAssignment;

        dbContext.EmployeeProjects.Add(new EmployeeProject { ProjectId = projectId, EmployeeId = employeeId });
        await dbContext.SaveChangesAsync();
        return ProjectSaveOutcome.Saved;
    }

    public async Task<ProjectSaveOutcome> RemoveEmployeeAsync(int projectId, int employeeId)
    {
        if (!await dbContext.Projects.AnyAsync(project => project.Id == projectId))
            return ProjectSaveOutcome.NotFound;
        var link = await dbContext.EmployeeProjects.FindAsync(employeeId, projectId);
        if (link is null) return ProjectSaveOutcome.AssignmentNotFound;
        dbContext.EmployeeProjects.Remove(link);
        await dbContext.SaveChangesAsync();
        return ProjectSaveOutcome.Saved;
    }

    private static void Map(SaveProjectDto dto, Project project)
    {
        project.Name = dto.Name.Trim();
        project.Description = dto.Description.Trim();
        project.StartDate = dto.StartDate!.Value;
        project.EndDate = dto.EndDate;
        project.Status = dto.Status;
    }

    private static ProjectDto ToDto(Project project) => new()
    {
        Id = project.Id,
        Name = project.Name,
        Description = project.Description,
        StartDate = project.StartDate,
        EndDate = project.EndDate,
        Status = project.Status == ProjectStatus.OnHold ? "On Hold" : project.Status.ToString(),
        Employees = project.EmployeeProjects
            .OrderBy(link => link.Employee.Name)
            .Select(link => new ProjectEmployeeDto { Id = link.EmployeeId, Name = link.Employee.Name })
            .ToList()
    };
}
