namespace stackflow_api.Services;

public interface IChatOrchestrator
{
    Task<ChatReply> HandleAsync(ChatCallContext context, string userMessage, CancellationToken cancellationToken = default);
}
