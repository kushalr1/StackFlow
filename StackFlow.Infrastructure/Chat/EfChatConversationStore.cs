using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Chat;

public class EfChatConversationStore(AppDbContext db) : IChatConversationStore
{
    public async Task<ChatConversation> GetOrCreateActiveAsync(int accountId)
    {
        var existing = await db.ChatConversations
            .FirstOrDefaultAsync(conversation => conversation.AccountId == accountId);
        if (existing is not null)
        {
            return existing;
        }

        var conversation = new ChatConversation { AccountId = accountId };
        db.Add(conversation);
        await db.SaveChangesAsync();
        return conversation;
    }

    public async Task<ChatMessage> AddMessageAsync(int conversationId, string role, string content)
    {
        var message = new ChatMessage
        {
            ConversationId = conversationId,
            Role = role,
            Content = content
        };
        db.Add(message);
        await db.SaveChangesAsync();
        return message;
    }

    public async Task<List<ChatMessage>> ListMessagesAsync(int conversationId, int take)
    {
        var mostRecentFirst = await db.ChatMessages
            .AsNoTracking()
            .Where(message => message.ConversationId == conversationId)
            .OrderByDescending(message => message.CreatedAt)
            .ThenByDescending(message => message.Id)
            .Take(take)
            .ToListAsync();

        mostRecentFirst.Reverse();
        return mostRecentFirst;
    }

    public async Task LogToolInvocationAsync(int chatMessageId, string toolName, int? targetEmployeeId)
    {
        db.Add(new ChatToolInvocation
        {
            ChatMessageId = chatMessageId,
            ToolName = toolName,
            TargetEmployeeId = targetEmployeeId
        });
        await db.SaveChangesAsync();
    }
}
