using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public interface IProjectStore
{
    Task<List<Project>> ListAsync(ProjectStatus? status);
    Task<Project?> GetByIdAsync(int id);
    Task<Project?> FindAsync(int id);
    Task<List<Employee>> FindEmployeesAsync(int[] ids);
    Task<Employee?> FindEmployeeAsync(int id);
    Task<EmployeeProject?> FindAssignmentAsync(int employeeId, int projectId);
    Task<bool> HasAssignmentHistoryAsync(int projectId);
    Task<IReadOnlyList<EmployeeProjectDto>> ListOwnedAsync(int employeeId);
    void AddProject(Project project);
    void DeleteProject(Project project);
    void AddAssignment(EmployeeProject assignment);
    void AddNotification(EmployeeNotification notification);
    Task SaveAsync();
}

public interface IEmployeeNotificationStore
{
    Task<EmployeeNotificationInbox> GetInboxAsync(int employeeId);
    Task<EmployeeNotification?> FindOwnedAsync(int employeeId, int id);
    Task SaveAsync();
}
