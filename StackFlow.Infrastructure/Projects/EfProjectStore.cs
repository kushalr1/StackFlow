using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Projects;

public class EfProjectStore(AppDbContext dbContext) : IProjectStore
{
    private IQueryable<Project> ReadQuery() => dbContext.Projects.AsNoTracking()
        .Include(project => project.EmployeeProjects).ThenInclude(link => link.Employee);
    public Task<List<Project>> ListAsync(ProjectStatus? status) =>
        (status.HasValue ? ReadQuery().Where(project => project.Status == status.Value) : ReadQuery()).ToListAsync();
    public Task<Project?> GetByIdAsync(int id) => ReadQuery().FirstOrDefaultAsync(project => project.Id == id);
    public async Task<Project?> FindAsync(int id) => await dbContext.Projects.FindAsync(id);
    public Task<List<Employee>> FindEmployeesAsync(int[] ids) => dbContext.Employees.Where(employee => ids.Contains(employee.Id)).ToListAsync();
    public async Task<Employee?> FindEmployeeAsync(int id) => await dbContext.Employees.FindAsync(id);
    public async Task<EmployeeProject?> FindAssignmentAsync(int employeeId, int projectId) => await dbContext.EmployeeProjects.FindAsync(employeeId, projectId);
    public Task<bool> HasAssignmentHistoryAsync(int projectId) => dbContext.EmployeeProjects.AnyAsync(link => link.ProjectId == projectId);
    public void AddProject(Project project) => dbContext.Projects.Add(project);
    public void DeleteProject(Project project) => dbContext.Projects.Remove(project);
    public void AddAssignment(EmployeeProject assignment) => dbContext.EmployeeProjects.Add(assignment);
    public void AddNotification(EmployeeNotification notification) => dbContext.EmployeeNotifications.Add(notification);
    public async Task SaveAsync() => await dbContext.SaveChangesAsync();
    public async Task<IReadOnlyList<EmployeeProjectDto>> ListOwnedAsync(int employeeId) =>
        await dbContext.EmployeeProjects.AsNoTracking().Where(assignment => assignment.EmployeeId == employeeId)
            .OrderByDescending(assignment => assignment.AssignedOn).ThenBy(assignment => assignment.Project.Name)
            .Select(assignment => new EmployeeProjectDto
            {
                Id = assignment.ProjectId, Name = assignment.Project.Name, Description = assignment.Project.Description,
                Status = assignment.Project.Status.ToString(), Priority = assignment.Project.Priority.ToString(),
                Role = assignment.Role, StartDate = assignment.Project.StartDate, DueDate = assignment.Project.DueDate,
                CompletedOn = assignment.Project.CompletedOn, AssignedOn = assignment.AssignedOn, RemovedOn = assignment.RemovedOn
            }).ToListAsync();
}
