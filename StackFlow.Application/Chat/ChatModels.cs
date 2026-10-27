namespace stackflow_api.Services;

public record ChatMessageDto(string Role, string Content);

/// <summary>A function the model is allowed to call, as advertised to it (name/description/schema).</summary>
public record ToolDefinition(string Name, string Description, string ParameterSchemaJson);

/// <summary>What the model asked to do next: either a tool call, or it's ready to reply.</summary>
public record ToolCallRequest(string ToolName, string ArgumentsJson);

public record ChatModelResponse(string? ReplyText, ToolCallRequest? ToolCall);
