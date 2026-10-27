namespace stackflow_api.Models;

/// <summary>
/// Audit record: one row per tool execution, so "who queried whose data" can always be answered.
/// TargetEmployeeId is deliberately a plain column, not a foreign key — it's an audit label, not
/// a relationship the app needs to join on or enforce, and a hard FK here would complicate the
/// existing employee-deletion guard logic for no real benefit.
/// </summary>
public class ChatToolInvocation
{
    public int Id { get; set; }
    public int ChatMessageId { get; set; }
    public ChatMessage ChatMessage { get; set; } = null!;
    public string ToolName { get; set; } = string.Empty;
    public int? TargetEmployeeId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
