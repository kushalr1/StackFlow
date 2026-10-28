using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Projects;

namespace StackFlow.Infrastructure.Chat;

/// <summary>Read-only queries for the chat. Never writes.</summary>
public class EfChatDataStore(AppDbContext db) : IChatDataStore
{
    public async Task<IReadOnlyList<ProjectAssignmentRecord>> ListProjectAssignmentsAsync(int? employeeId)
    {
        var query = db.EmployeeProjects.AsNoTracking()
            .Include(link => link.Employee)
            .Include(link => link.Project)
            .AsQueryable();

        if (employeeId is int id)
        {
            query = query.Where(link => link.EmployeeId == id);
        }

        return await query
            .Select(link => new ProjectAssignmentRecord(
                link.EmployeeId,
                link.Employee.Name,
                link.ProjectId,
                link.Project.Name,
                link.Project.Description,
                link.Project.Status,
                link.Project.StartDate,
                link.Project.CompletedOn,
                link.AssignedOn,
                link.RemovedOn))
            .ToListAsync();
    }
}
