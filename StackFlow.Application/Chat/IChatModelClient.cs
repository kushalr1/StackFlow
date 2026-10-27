namespace stackflow_api.Services;

/// <summary>
/// The AI-vendor port. Application depends only on this — never on Gemini-specific types —
/// so the concrete provider is swappable by changing only the Infrastructure implementation.
/// </summary>
public interface IChatModelClient
{
    Task<ChatModelResponse> SendAsync(
        IReadOnlyList<ChatMessageDto> history,
        IReadOnlyList<ToolDefinition> allowedTools,
        CancellationToken cancellationToken = default);

    /// <summary>Continues the turn started by a SendAsync response that returned a ToolCall,
    /// supplying the tool's result. May itself return another ToolCall (another round).</summary>
    Task<ChatModelResponse> ContinueWithToolResultAsync(
        ChatModelResponse previousResponse,
        string toolResultJson,
        CancellationToken cancellationToken = default);
}
