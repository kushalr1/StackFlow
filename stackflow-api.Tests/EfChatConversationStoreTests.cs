using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.Services;
using StackFlow.Infrastructure.Chat;

namespace stackflow_api.Tests;

public class EfChatConversationStoreTests
{
    private static AppDbContext NewDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    [Fact]
    public async Task GetOrCreateActiveAsync_CreatesOneConversation_ThenReusesIt()
    {
        await using var db = NewDb();
        var store = new EfChatConversationStore(db);

        var first = await store.GetOrCreateActiveAsync(accountId: 1);
        var second = await store.GetOrCreateActiveAsync(accountId: 1);

        Assert.Equal(first.Id, second.Id);
        Assert.Equal(1, first.AccountId);
    }

    [Fact]
    public async Task GetOrCreateActiveAsync_GivesDifferentAccountsDifferentConversations()
    {
        await using var db = NewDb();
        var store = new EfChatConversationStore(db);

        var accountOne = await store.GetOrCreateActiveAsync(accountId: 1);
        var accountTwo = await store.GetOrCreateActiveAsync(accountId: 2);

        Assert.NotEqual(accountOne.Id, accountTwo.Id);
    }

    [Fact]
    public async Task AddMessageAsync_PersistsRoleAndContent()
    {
        await using var db = NewDb();
        var store = new EfChatConversationStore(db);
        var conversation = await store.GetOrCreateActiveAsync(accountId: 1);

        var message = await store.AddMessageAsync(conversation.Id, "user", "What projects am I on?");

        Assert.Equal("user", message.Role);
        Assert.Equal("What projects am I on?", message.Content);
        Assert.Equal(conversation.Id, message.ConversationId);
    }

    [Fact]
    public async Task ListMessagesAsync_ReturnsOldestFirst_TruncatedToTake()
    {
        await using var db = NewDb();
        var store = new EfChatConversationStore(db);
        var conversation = await store.GetOrCreateActiveAsync(accountId: 1);

        for (var i = 0; i < 5; i++)
        {
            await store.AddMessageAsync(conversation.Id, "user", $"message {i}");
        }

        var messages = await store.ListMessagesAsync(conversation.Id, take: 3);

        Assert.Equal(3, messages.Count);
        Assert.Equal("message 2", messages[0].Content);
        Assert.Equal("message 3", messages[1].Content);
        Assert.Equal("message 4", messages[2].Content);
    }

    [Fact]
    public async Task ListMessagesAsync_NeverStartsTheWindowOnAnAssistantTurn()
    {
        // Messages alternate user/assistant, but the orchestrator reads history right after
        // appending the new user message and before the assistant reply exists — so at read
        // time the stored sequence has an odd length. Taking the most recent N from an odd-length
        // alternating sequence can land the window's first element on an assistant/"model" turn,
        // which is an invalid multi-turn history to hand to Gemini (no preceding user turn).
        await using var db = NewDb();
        var store = new EfChatConversationStore(db);
        var conversation = await store.GetOrCreateActiveAsync(accountId: 1);

        for (var i = 0; i < 10; i++)
        {
            await store.AddMessageAsync(conversation.Id, "user", $"question {i}");
            await store.AddMessageAsync(conversation.Id, "assistant", $"answer {i}");
        }
        await store.AddMessageAsync(conversation.Id, "user", "the newest question, no reply yet");

        var messages = await store.ListMessagesAsync(conversation.Id, take: 20);

        Assert.Equal("user", messages[0].Role);
    }

    [Fact]
    public async Task LogToolInvocationAsync_PersistsToolNameAndTarget()
    {
        await using var db = NewDb();
        var store = new EfChatConversationStore(db);
        var conversation = await store.GetOrCreateActiveAsync(accountId: 1);
        var message = await store.AddMessageAsync(conversation.Id, "assistant", "Here is the answer.");

        await store.LogToolInvocationAsync(message.Id, "GetMyLeaveSummaryTool", targetEmployeeId: null);
        await store.LogToolInvocationAsync(message.Id, "FindEmployeeTool", targetEmployeeId: 42);

        var invocations = await db.ChatToolInvocations
            .Where(invocation => invocation.ChatMessageId == message.Id)
            .ToListAsync();

        Assert.Equal(2, invocations.Count);
        Assert.Contains(invocations, invocation => invocation.ToolName == "GetMyLeaveSummaryTool" && invocation.TargetEmployeeId == null);
        Assert.Contains(invocations, invocation => invocation.ToolName == "FindEmployeeTool" && invocation.TargetEmployeeId == 42);
    }
}
