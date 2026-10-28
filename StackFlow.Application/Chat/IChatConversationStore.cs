using stackflow_api.Models;

namespace stackflow_api.Services;

public interface IChatConversationStore
{
    /// <summary>Returns the account's single ongoing conversation, creating one if none exists.</summary>
    Task<ChatConversation> GetOrCreateActiveAsync(int accountId);

    Task<ChatMessage> AddMessageAsync(int conversationId, string role, string content, string? listsJson = null);

    /// <summary>Most recent messages first truncated to <paramref name="take"/>, then returned oldest-first.</summary>
    Task<List<ChatMessage>> ListMessagesAsync(int conversationId, int take);

    Task LogToolInvocationAsync(int chatMessageId, string toolName, int? targetEmployeeId);

    /// <summary>Deletes every message in the conversation, so the next message starts a fresh chat.</summary>
    Task ClearAsync(int conversationId);
}
