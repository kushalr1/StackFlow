using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Projects;

public class EfEmployeeNotificationStore(AppDbContext context) : IEmployeeNotificationStore
{
    public async Task<EmployeeNotificationInbox> GetInboxAsync(int employeeId)
    {
        var query = context.EmployeeNotifications.AsNoTracking().Where(item => item.EmployeeId == employeeId);
        var count = await query.CountAsync(item => item.ReadAt == null);
        var items = await query.OrderBy(item => item.ReadAt != null).ThenByDescending(item => item.CreatedAt)
            .ThenByDescending(item => item.Id).Take(100)
            .Select(item => new EmployeeNotificationDto(item.Id, item.ProjectId, item.Message, item.CreatedAt, item.ReadAt)).ToListAsync();
        return new(count, items);
    }
    public Task<EmployeeNotification?> FindOwnedAsync(int employeeId, int id) =>
        context.EmployeeNotifications.SingleOrDefaultAsync(item => item.Id == id && item.EmployeeId == employeeId);
    public async Task SaveAsync() => await context.SaveChangesAsync();
}
