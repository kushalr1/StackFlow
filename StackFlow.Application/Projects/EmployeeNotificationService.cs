using stackflow_api.Models;

namespace stackflow_api.Services;

public record EmployeeNotificationDto(int Id, int ProjectId, string Message, DateTime CreatedAt, DateTime? ReadAt);
public record EmployeeNotificationInbox(int UnreadCount, IReadOnlyList<EmployeeNotificationDto> Items);

public interface IEmployeeNotificationService
{
    Task<EmployeeNotificationInbox> GetInboxAsync(int employeeId);
    Task<bool> MarkReadAsync(int employeeId, int id);
}

public class EmployeeNotificationService(IEmployeeNotificationStore store) : IEmployeeNotificationService
{
    public async Task<EmployeeNotificationInbox> GetInboxAsync(int employeeId)
    {
        return await store.GetInboxAsync(employeeId);
    }

    public async Task<bool> MarkReadAsync(int employeeId, int id)
    {
        var item = await store.FindOwnedAsync(employeeId, id);
        if (item is null) return false;
        if (item.ReadAt is null)
        {
            item.ReadAt = DateTime.UtcNow;
            await store.SaveAsync();
        }
        return true;
    }
}
