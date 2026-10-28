using StackFlow.Application.Chat;

namespace stackflow_api.Services;

public enum ChatRole
{
    Employee,
    Admin,
    /// <summary>Available to both roles. Such tools must scope the data they return themselves.</summary>
    Any
}

/// <summary>A button the chat renders. Route comes only from the ChatRoutes whitelist, never from the model.</summary>
public record ChatAction(string Label, string Route);

/// <summary>The final reply for one message, plus UI actions and follow-up chips collected while answering.</summary>
public record ChatReply(string Text, IReadOnlyList<ChatAction> Actions, IReadOnlyList<string> Suggestions, IReadOnlyList<ChatList>? Lists = null);

/// <summary>
/// The caller's identity as resolved server-side by ICurrentUserService — never from the model
/// or the client. Tools must read identity only from here.
/// </summary>
public record ChatCallContext(int AccountId, int? EmployeeId, string Role);

/// <summary>
/// A single function the chat model may call. Each tool wraps one existing Application service —
/// it adds no new business logic or persistence of its own.
/// </summary>
public interface IChatTool
{
    string Name { get; }
    string Description { get; }
    ChatRole AllowedRole { get; }

    /// <summary>A JSON Schema object (as sent to the model) describing the function's parameters.</summary>
    string ParameterSchemaJson { get; }

    Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson);
}
