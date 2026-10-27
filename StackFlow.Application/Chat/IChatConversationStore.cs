using stackflow_api.Models;

namespace stackflow_api.Services;

public interface IChatConversationStore
{
    /// <summary>Returns the account's single ongoing conversation, creating one if none exists.</summary>
    Task<ChatConversation> GetOrCreateActiveAsync(int accountId);

    Task<ChatMessage> AddMessageAsync(int conversationId, string role, string content);

    /// <summary>Most recent messages first truncated to <paramref name="take"/>, then returned oldest-first.</summary>
    Task<List<ChatMessage>> ListMessagesAsync(int conversationId, int take);

    Task LogToolInvocationAsync(int chatMessageId, string toolName, int? targetEmployeeId);
}
