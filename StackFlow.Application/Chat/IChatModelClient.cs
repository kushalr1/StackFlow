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
}
