using Microsoft.Extensions.Logging;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Services;

public class ChatOrchestrator(
    IEnumerable<IChatTool> tools,
    IChatModelClient modelClient,
    IChatConversationStore store,
    ChatActionCollector actions,
    ILogger<ChatOrchestrator> logger) : IChatOrchestrator
{
    private const int MaxToolRoundTrips = 6;
    private const int HistoryMessageLimit = 20;
    private const string ToolBudgetExhaustedJson =
        """{"error":"Tool limit reached. Answer the user now with the results already gathered."}""";
    private const string UnclearReply =
        "I couldn't get a clear answer for that. Try a name, a department, or a question like \"How many employees are there?\".";

    public async Task<ChatReply> HandleAsync(
        ChatCallContext context, string userMessage, CancellationToken cancellationToken = default)
    {
        actions.Clear();
        var allowedTools = tools.Where(tool => MatchesRole(tool.AllowedRole, context.Role)).ToList();
        var allowedToolsByName = allowedTools.ToDictionary(tool => tool.Name);
        var systemInstruction = ChatInstructions.For(
            context.Role == UserRoles.Admin ? ChatRole.Admin : ChatRole.Employee, ChatClock.Today());

        var conversation = await store.GetOrCreateActiveAsync(context.AccountId);
        await store.AddMessageAsync(conversation.Id, "user", userMessage);

        var role = ChatLookup.RoleOf(context);
        if (VagueQuestions.IsVague(userMessage) || VagueQuestions.IsUnscopedSalaryQuestion(userMessage, role))
        {
            var question = VagueQuestions.IsUnscopedSalaryQuestion(userMessage, role)
                ? "Whose salary would you like to know, or the whole company?"
                : VagueQuestions.Question;
            await store.AddMessageAsync(conversation.Id, "assistant", question);
            actions.SetSuggestions(VagueQuestions.IsUnscopedSalaryQuestion(userMessage, role)
                ? VagueQuestions.SalaryOptions
                : VagueQuestions.OptionsFor(role));
            return new ChatReply(question, [], actions.Suggestions.ToList());
        }

        var history = (await store.ListMessagesAsync(conversation.Id, HistoryMessageLimit))
            .Select(message => new ChatMessageDto(message.Role, message.Content))
            .ToList();

        var toolDefinitions = allowedTools
            .Select(tool => new ToolDefinition(tool.Name, tool.Description, tool.ParameterSchemaJson))
            .ToList();

        var invocationsToLog = new List<(string ToolName, int? TargetEmployeeId)>();
        string replyText;
        try
        {
            var response = await modelClient.SendAsync(history, toolDefinitions, systemInstruction, cancellationToken);
            var round = 0;
            while (response.ToolCall is not null && round < MaxToolRoundTrips)
            {
                round++;
                var toolCall = response.ToolCall;

                // The model is never offered a tool outside allowedTools, but it may still
                // hallucinate a name, or something upstream may have tried to inject one — never
                // execute anything that isn't explicitly in this caller's role-filtered list.
                if (!allowedToolsByName.TryGetValue(toolCall.ToolName, out var tool))
                {
                    response = await modelClient.ContinueWithToolResultAsync(
                        response, """{"error":"That tool is not available."}""", cancellationToken);
                    continue;
                }

                string resultJson;
                try
                {
                    resultJson = await tool.ExecuteAsync(context, toolCall.ArgumentsJson);
                }
                catch (Exception exception)
                {
                    logger.LogError(exception, "Chat tool {ToolName} failed for account {AccountId}",
                        tool.Name, context.AccountId);
                    resultJson = """{"error":"The tool failed to produce a result."}""";
                }

                invocationsToLog.Add((tool.Name, TryExtractTargetEmployeeId(context, tool, toolCall.ArgumentsJson)));
                response = await modelClient.ContinueWithToolResultAsync(response, resultJson, cancellationToken);
            }

            // The model still wants another tool after the budget: close that call and ask for a plain answer.
            if (response.ToolCall is not null)
            {
                response = await modelClient.ContinueWithToolResultAsync(
                    response, ToolBudgetExhaustedJson, cancellationToken);
            }

            replyText = response.ReplyText ?? UnclearReply;
        }
        catch (ChatModelUnavailableException)
        {
            // A half-finished turn must not leave buttons or chips that belong to an answer that never arrived.
            actions.Clear();
            replyText = "The AI assistant is unavailable right now. Please try again shortly.";
        }

        var listsJson = actions.Lists.Count > 0 ? ChatJson.Serialize(actions.Lists) : null;
        var assistantMessage = await store.AddMessageAsync(conversation.Id, "assistant", replyText, listsJson);
        foreach (var (toolName, targetEmployeeId) in invocationsToLog)
        {
            await store.LogToolInvocationAsync(assistantMessage.Id, toolName, targetEmployeeId);
        }

        return new ChatReply(replyText, actions.Actions.ToList(), actions.Suggestions.ToList(), actions.Lists.ToList());
    }

    private static bool MatchesRole(ChatRole toolRole, string callerRole) =>
        toolRole switch
        {
            ChatRole.Any => callerRole is UserRoles.Employee or UserRoles.Admin,
            ChatRole.Employee => callerRole == UserRoles.Employee,
            ChatRole.Admin => callerRole == UserRoles.Admin,
            _ => false
        };

    private static int? TryExtractTargetEmployeeId(ChatCallContext context, IChatTool tool, string argumentsJson)
    {
        // Defensive: argumentsJson always comes from GeminiChatModelClient's own JsonNode
        // round-trip today (always well-formed), but this must never be the thing that turns a
        // successful tool execution into an unhandled exception for the whole request.
        try
        {
            var arguments = ChatToolArguments.Parse(argumentsJson);
            return arguments.GetInt("employeeId") ?? (tool.AllowedRole == ChatRole.Employee ? context.EmployeeId : null);
        }
        catch (Exception)
        {
            return tool.AllowedRole == ChatRole.Employee ? context.EmployeeId : null;
        }
    }
}
