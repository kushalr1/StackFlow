namespace stackflow_api.Services;

public record ChatMessageDto(string Role, string Content);

/// <summary>A function the model is allowed to call, as advertised to it (name/description/schema).</summary>
public record ToolDefinition(string Name, string Description, string ParameterSchemaJson);

/// <summary>What the model asked to do next: either a tool call, or it's ready to reply.</summary>
public record ToolCallRequest(string ToolName, string ArgumentsJson);

/// <summary>
/// ProviderStateJson is an opaque blob only the IChatModelClient implementation understands
/// (e.g. Gemini's thoughtSignature plumbing) — Application threads it through to
/// ContinueWithToolResultAsync without interpreting it, so swapping providers never requires
/// Application-layer changes.
/// </summary>
public record ChatModelResponse(string? ReplyText, ToolCallRequest? ToolCall, string? ProviderStateJson = null);

/// <summary>Thrown by an IChatModelClient when the provider is unreachable, overloaded, or returns
/// something the client can't parse. The orchestrator catches this and degrades to a safe reply.</summary>
public class ChatModelUnavailableException(string message, Exception? innerException = null)
    : Exception(message, innerException);
