namespace stackflow_api.Models;

public class ChatMessage
{
    public int Id { get; set; }
    public int ConversationId { get; set; }
    public ChatConversation Conversation { get; set; } = null!;

    /// <summary>"user" or "assistant".</summary>
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    /// <summary>JSON array of list payloads shown as cards with this reply. Null when the reply has no lists.</summary>
    public string? ListsJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
