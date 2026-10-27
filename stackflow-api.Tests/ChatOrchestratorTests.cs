using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class ChatOrchestratorTests
{
    private static ChatCallContext EmployeeContext() => new(AccountId: 1, EmployeeId: 7, Role: "Employee");
    private static ChatCallContext AdminContext() => new(AccountId: 2, EmployeeId: null, Role: "Admin");

    [Fact]
    public async Task HandleAsync_OffersOnlyEmployeeTools_ToAnEmployeeCaller()
    {
        var employeeTool = new StubTool("get_my_leave_summary", ChatRole.Employee);
        var adminTool = new StubTool("find_employee", ChatRole.Admin);
        var model = new FakeChatModelClient([new ChatModelResponse("All done.", null)]);
        var orchestrator = new ChatOrchestrator([employeeTool, adminTool], model, new FakeChatConversationStore());

        await orchestrator.HandleAsync(EmployeeContext(), "What's my leave balance?");

        var offeredNames = model.ToolsOfferedOnFirstCall!.Select(tool => tool.Name).ToList();
        Assert.Contains("get_my_leave_summary", offeredNames);
        Assert.DoesNotContain("find_employee", offeredNames);
    }

    [Fact]
    public async Task HandleAsync_OffersOnlyAdminTools_ToAnAdminCaller()
    {
        var employeeTool = new StubTool("get_my_leave_summary", ChatRole.Employee);
        var adminTool = new StubTool("find_employee", ChatRole.Admin);
        var model = new FakeChatModelClient([new ChatModelResponse("All done.", null)]);
        var orchestrator = new ChatOrchestrator([employeeTool, adminTool], model, new FakeChatConversationStore());

        await orchestrator.HandleAsync(AdminContext(), "Find Priya");

        var offeredNames = model.ToolsOfferedOnFirstCall!.Select(tool => tool.Name).ToList();
        Assert.Contains("find_employee", offeredNames);
        Assert.DoesNotContain("get_my_leave_summary", offeredNames);
    }

    [Fact]
    public async Task HandleAsync_NeverExecutesATool_TheModelWasNotOffered()
    {
        // The model (hallucinating, or manipulated by injected text) asks for an Admin tool
        // while talking to an Employee. It must never run, regardless of what the model asked for.
        var adminOnlyTool = new StubTool("find_employee", ChatRole.Admin);
        var model = new FakeChatModelClient([
            new ChatModelResponse(null, new ToolCallRequest("find_employee", "{}"), "state-1"),
            new ChatModelResponse("Sorry, I can't do that.", null)
        ]);
        var orchestrator = new ChatOrchestrator([adminOnlyTool], model, new FakeChatConversationStore());

        var reply = await orchestrator.HandleAsync(EmployeeContext(), "Find Priya's salary");

        Assert.False(adminOnlyTool.WasExecuted);
        Assert.Equal("Sorry, I can't do that.", reply);
    }

    [Fact]
    public async Task HandleAsync_ExecutesAnAllowedTool_AndLogsTheInvocation()
    {
        var tool = new StubTool("get_my_leave_summary", ChatRole.Employee) { ResultJson = """{"status":"Approved"}""" };
        var model = new FakeChatModelClient([
            new ChatModelResponse(null, new ToolCallRequest("get_my_leave_summary", "{}"), "state-1"),
            new ChatModelResponse("You have an approved leave.", null)
        ]);
        var store = new FakeChatConversationStore();
        var orchestrator = new ChatOrchestrator([tool], model, store);

        var reply = await orchestrator.HandleAsync(EmployeeContext(), "What's my leave status?");

        Assert.True(tool.WasExecuted);
        Assert.Equal("You have an approved leave.", reply);

        var invocation = Assert.Single(store.LoggedInvocations);
        Assert.Equal("get_my_leave_summary", invocation.ToolName);
        Assert.Equal(7, invocation.TargetEmployeeId); // falls back to the caller's own EmployeeId
    }

    [Fact]
    public async Task HandleAsync_PersistsTheUserMessage_AndTheFinalAssistantReply()
    {
        var model = new FakeChatModelClient([new ChatModelResponse("Hi there!", null)]);
        var store = new FakeChatConversationStore();
        var orchestrator = new ChatOrchestrator([], model, store);

        await orchestrator.HandleAsync(EmployeeContext(), "Hello");

        Assert.Contains(store.Messages, m => m.Role == "user" && m.Content == "Hello");
        Assert.Contains(store.Messages, m => m.Role == "assistant" && m.Content == "Hi there!");
    }

    [Fact]
    public async Task HandleAsync_StopsAfterThreeToolRoundTrips_AndDoesNotLoopForever()
    {
        var tool = new StubTool("get_my_leave_summary", ChatRole.Employee);
        // A model that keeps asking for another tool call forever, to prove the cap actually stops it.
        var responses = Enumerable.Range(0, 10)
            .Select(_ => new ChatModelResponse(null, new ToolCallRequest("get_my_leave_summary", "{}"), "state"))
            .ToList();
        var model = new FakeChatModelClient(responses);
        var orchestrator = new ChatOrchestrator([tool], model, new FakeChatConversationStore());

        var reply = await orchestrator.HandleAsync(EmployeeContext(), "Loop please");

        Assert.Equal(3, tool.ExecutionCount);
        Assert.False(string.IsNullOrEmpty(reply));
    }

    [Fact]
    public async Task HandleAsync_DegradesToASafeMessage_WhenTheModelIsUnavailable()
    {
        var model = new FakeChatModelClient([]) { ThrowUnavailable = true };
        var orchestrator = new ChatOrchestrator([], model, new FakeChatConversationStore());

        var reply = await orchestrator.HandleAsync(EmployeeContext(), "Hello");

        Assert.Contains("unavailable", reply, StringComparison.OrdinalIgnoreCase);
    }

    private class StubTool(string name, ChatRole allowedRole) : IChatTool
    {
        public string Name => name;
        public string Description => "stub";
        public ChatRole AllowedRole => allowedRole;
        public string ParameterSchemaJson => """{"type":"object","properties":{}}""";
        public string ResultJson { get; set; } = "{}";
        public bool WasExecuted { get; private set; }
        public int ExecutionCount { get; private set; }

        public Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
        {
            WasExecuted = true;
            ExecutionCount++;
            return Task.FromResult(ResultJson);
        }
    }

    private class FakeChatModelClient(List<ChatModelResponse> responses) : IChatModelClient
    {
        public bool ThrowUnavailable { get; set; }
        public IReadOnlyList<ToolDefinition>? ToolsOfferedOnFirstCall { get; private set; }
        private int _index;

        public Task<ChatModelResponse> SendAsync(
            IReadOnlyList<ChatMessageDto> history, IReadOnlyList<ToolDefinition> allowedTools,
            CancellationToken cancellationToken = default)
        {
            ToolsOfferedOnFirstCall ??= allowedTools;
            return NextAsync();
        }

        public Task<ChatModelResponse> ContinueWithToolResultAsync(
            ChatModelResponse previousResponse, string toolResultJson,
            CancellationToken cancellationToken = default) => NextAsync();

        private Task<ChatModelResponse> NextAsync()
        {
            if (ThrowUnavailable)
            {
                throw new ChatModelUnavailableException("unavailable in test");
            }
            var response = responses[Math.Min(_index, responses.Count - 1)];
            _index++;
            return Task.FromResult(response);
        }
    }

    private class FakeChatConversationStore : IChatConversationStore
    {
        public List<ChatMessage> Messages { get; } = [];
        public List<ChatToolInvocation> LoggedInvocations { get; } = [];
        private int _nextMessageId = 1;

        public Task<ChatConversation> GetOrCreateActiveAsync(int accountId) =>
            Task.FromResult(new ChatConversation { Id = 1, AccountId = accountId });

        public Task<ChatMessage> AddMessageAsync(int conversationId, string role, string content)
        {
            var message = new ChatMessage { Id = _nextMessageId++, ConversationId = conversationId, Role = role, Content = content };
            Messages.Add(message);
            return Task.FromResult(message);
        }

        public Task<List<ChatMessage>> ListMessagesAsync(int conversationId, int take) =>
            Task.FromResult(Messages.Where(m => m.ConversationId == conversationId).TakeLast(take).ToList());

        public Task LogToolInvocationAsync(int chatMessageId, string toolName, int? targetEmployeeId)
        {
            LoggedInvocations.Add(new ChatToolInvocation { ChatMessageId = chatMessageId, ToolName = toolName, TargetEmployeeId = targetEmployeeId });
            return Task.CompletedTask;
        }
    }
}
