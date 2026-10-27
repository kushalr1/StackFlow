using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class ChatControllerTests
{
    [Fact]
    public async Task Send_ReturnsOk_WithReply_ForAnAuthenticatedCaller()
    {
        var orchestrator = new FakeOrchestrator { Reply = "Here is your answer." };
        var controller = new ChatController(new FakeUser(accountId: 1, employeeId: 7, role: "Employee"), orchestrator, new FakeStore());

        var result = await controller.Send(new ChatController.SendMessageRequest { Message = "Hi" }, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ChatController.SendMessageResponse>(ok.Value);
        Assert.Equal("Here is your answer.", response.Reply);
        Assert.Equal(1, orchestrator.ReceivedContext!.AccountId);
        Assert.Equal(7, orchestrator.ReceivedContext.EmployeeId);
        Assert.Equal("Employee", orchestrator.ReceivedContext.Role);
    }

    [Fact]
    public async Task Send_ReturnsUnauthorized_WhenNoAccountIdIsResolved()
    {
        var controller = new ChatController(new FakeUser(accountId: null, employeeId: null, role: null), new FakeOrchestrator(), new FakeStore());

        var result = await controller.Send(new ChatController.SendMessageRequest { Message = "Hi" }, CancellationToken.None);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task History_ReturnsTheCallersOwnConversation()
    {
        var store = new FakeStore();
        store.MessagesByConversation[1] = [new ChatMessage { Role = "user", Content = "Hi", CreatedAt = DateTime.UtcNow }];
        var controller = new ChatController(new FakeUser(accountId: 1, employeeId: 7, role: "Employee"), new FakeOrchestrator(), store);

        var result = await controller.History();

        var ok = Assert.IsType<OkObjectResult>(result);
        var messages = Assert.IsAssignableFrom<IEnumerable<ChatController.ChatMessageResponse>>(ok.Value);
        Assert.Single(messages);
    }

    [Theory]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData("What's my leave balance?", true)]
    public void SendMessageRequest_ValidatesMessageIsRequired(string message, bool expectedValid)
    {
        var request = new ChatController.SendMessageRequest { Message = message };
        var results = new List<ValidationResult>();

        var isValid = Validator.TryValidateObject(request, new ValidationContext(request), results, validateAllProperties: true);

        Assert.Equal(expectedValid, isValid);
    }

    [Fact]
    public void SendMessageRequest_HasNoClientSuppliedIdentityField()
    {
        // Structural guard: identity must only ever come from the authenticated caller
        // (ICurrentUserService), never from the request body.
        var properties = typeof(ChatController.SendMessageRequest).GetProperties().Select(p => p.Name);
        Assert.DoesNotContain(properties, name => name.Contains("Employee") || name.Contains("Account"));
    }

    private class FakeUser(int? accountId, int? employeeId, string? role) : ICurrentUserService
    {
        public int? EmployeeId => employeeId;
        public int? AccountId => accountId;
        public string? Role => role;
    }

    private class FakeOrchestrator : IChatOrchestrator
    {
        public string Reply { get; set; } = "ok";
        public ChatCallContext? ReceivedContext { get; private set; }

        public Task<string> HandleAsync(ChatCallContext context, string userMessage, CancellationToken cancellationToken = default)
        {
            ReceivedContext = context;
            return Task.FromResult(Reply);
        }
    }

    private class FakeStore : IChatConversationStore
    {
        public Dictionary<int, List<ChatMessage>> MessagesByConversation { get; } = [];

        public Task<ChatConversation> GetOrCreateActiveAsync(int accountId) => Task.FromResult(new ChatConversation { Id = 1, AccountId = accountId });
        public Task<ChatMessage> AddMessageAsync(int conversationId, string role, string content) =>
            throw new NotSupportedException("Not used by this test.");
        public Task<List<ChatMessage>> ListMessagesAsync(int conversationId, int take) =>
            Task.FromResult(MessagesByConversation.TryGetValue(conversationId, out var messages) ? messages : []);
        public Task LogToolInvocationAsync(int chatMessageId, string toolName, int? targetEmployeeId) =>
            throw new NotSupportedException("Not used by this test.");
    }
}
