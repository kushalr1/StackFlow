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
        try
        {
            await db.SaveChangesAsync();
            return conversation;
        }
        catch (DbUpdateException)
        {
            // Two concurrent requests from the same account both saw no existing row and both
            // tried to insert one; the unique index on AccountId lets exactly one win. Detach our
            // losing attempt and return the row the other request actually committed.
            db.Entry(conversation).State = EntityState.Detached;
            return await db.ChatConversations
                .FirstAsync(existingConversation => existingConversation.AccountId == accountId);
        }
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

        // Messages alternate user/assistant, but history is read after the new user message is
        // appended and before its reply exists, so the stored sequence can have an odd length —
        // trimming to `take` can then land the window's first element on an assistant turn with
        // no preceding user turn, which is invalid multi-turn history for Gemini. Drop it.
        if (mostRecentFirst.Count > 0 && mostRecentFirst[0].Role != "user")
        {
            mostRecentFirst.RemoveAt(0);
        }

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
