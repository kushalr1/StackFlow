using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using stackflow_api.Data;
using stackflow_api.Services;

namespace stackflow_api.Tests.Integration;

public class ChatIntegrationTests
{
    private class FakeChatModelClient : IChatModelClient
    {
        public Task<ChatModelResponse> SendAsync(
            IReadOnlyList<ChatMessageDto> history, IReadOnlyList<ToolDefinition> allowedTools,
            string systemInstruction, CancellationToken cancellationToken = default) =>
            Task.FromResult(new ChatModelResponse("There are 9 active employees.", null));

        public Task<ChatModelResponse> ContinueWithToolResultAsync(
            ChatModelResponse previousResponse, string toolResultJson,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException("This test's fake model never requests a tool call.");
    }

    [Fact]
    public async Task PostChatMessage_ThroughRealAuthPipeline_ReturnsReply_AndPersistsIt()
    {
        using var factory = new IntegrationTestFactory
        {
            ExtraServices = services => services.AddScoped<IChatModelClient, FakeChatModelClient>()
        };
        var account = await factory.SeedAccountAsync("admin@example.test", "a-valid-password-123");
        var client = factory.CreateClient();
        var token = await factory.LoginAsync(client, "admin@example.test", "a-valid-password-123");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsJsonAsync("/api/chat/messages", new { message = "How many active employees are there?" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonReplyShape>();
        Assert.Equal("There are 9 active employees.", body!.Reply);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var messages = await db.ChatMessages.ToListAsync();
        Assert.Contains(messages, m => m.Role == "user" && m.Content == "How many active employees are there?");
        Assert.Contains(messages, m => m.Role == "assistant" && m.Content == "There are 9 active employees.");

        var conversation = await db.ChatConversations.SingleAsync();
        Assert.Equal(account.Id, conversation.AccountId);
    }

    [Fact]
    public async Task PostChatMessage_WithoutAToken_ReturnsUnauthorized()
    {
        using var factory = new IntegrationTestFactory
        {
            ExtraServices = services => services.AddScoped<IChatModelClient, FakeChatModelClient>()
        };
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/chat/messages", new { message = "Hi" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetChatMessages_ReturnsOnlyThisAccountsOwnConversation()
    {
        using var factory = new IntegrationTestFactory
        {
            ExtraServices = services => services.AddScoped<IChatModelClient, FakeChatModelClient>()
        };
        await factory.SeedAccountAsync("admin-one@example.test", "a-valid-password-123");
        await factory.SeedAccountAsync("admin-two@example.test", "a-valid-password-123");

        var clientOne = factory.CreateClient();
        var tokenOne = await factory.LoginAsync(clientOne, "admin-one@example.test", "a-valid-password-123");
        clientOne.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenOne);
        await clientOne.PostAsJsonAsync("/api/chat/messages", new { message = "Only I should see this" });

        var clientTwo = factory.CreateClient();
        var tokenTwo = await factory.LoginAsync(clientTwo, "admin-two@example.test", "a-valid-password-123");
        clientTwo.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenTwo);

        var response = await clientTwo.GetAsync("/api/chat/messages");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.DoesNotContain("Only I should see this", body);
    }

    [Fact]
    public async Task PostChatMessage_WithNoGeminiApiKeyConfigured_DegradesGracefully_NotA500()
    {
        // No ExtraServices override here — this exercises the REAL GeminiChatModelClient through
        // the real ChatController, with no Gemini:ApiKey in config (IntegrationTestFactory never
        // sets one), closing the gap where every other chat integration test substitutes a fake
        // model client and so never proves this failure path degrades gracefully.
        using var factory = new IntegrationTestFactory();
        await factory.SeedAccountAsync("admin-no-key@example.test", "a-valid-password-123");
        var client = factory.CreateClient();
        var token = await factory.LoginAsync(client, "admin-no-key@example.test", "a-valid-password-123");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsJsonAsync("/api/chat/messages", new { message = "How many active employees are there?" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonReplyShape>();
        Assert.Contains("unavailable", body!.Reply, StringComparison.OrdinalIgnoreCase);
    }

    private record JsonReplyShape(string Reply);
}
