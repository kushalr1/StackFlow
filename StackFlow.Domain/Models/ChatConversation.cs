namespace stackflow_api.Models;

public class ChatConversation
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public AdminUser Account { get; set; } = null!;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
}
