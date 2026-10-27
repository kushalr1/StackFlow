namespace stackflow_api.Services;

public enum ChatRole
{
    Employee,
    Admin
}

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
