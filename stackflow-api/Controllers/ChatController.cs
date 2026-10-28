using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.Json;
using stackflow_api.Services;
using StackFlow.Application.Chat;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize]
[Route("api/chat")]
public class ChatController(ICurrentUserService user, IChatOrchestrator orchestrator, IChatConversationStore store)
    : ControllerBase
{
    public class SendMessageRequest
    {
        [Required(ErrorMessage = "Message is required.")]
        [StringLength(4000, MinimumLength = 1, ErrorMessage = "Message must be 1-4000 characters.")]
        public string Message { get; set; } = string.Empty;
    }

    public record ChatActionResponse(string Label, string Route);
    public record SendMessageResponse(string Reply, IReadOnlyList<ChatActionResponse> Actions, IReadOnlyList<string> Suggestions, IReadOnlyList<ChatList> Lists);
    public record ChatMessageResponse(string Role, string Content, DateTime CreatedAt, IReadOnlyList<ChatList> Lists);

    [EnableRateLimiting("chat")]
    [HttpPost("messages")]
    public async Task<IActionResult> Send(SendMessageRequest request, CancellationToken cancellationToken)
    {
        if (user.AccountId is not int accountId || user.Role is not string role)
        {
            return Unauthorized();
        }

        var message = request.Message.Trim();
        if (message.Length == 0)
        {
            ModelState.AddModelError(nameof(request.Message), "Message is required.");
            return ValidationProblem(ModelState);
        }

        var context = new ChatCallContext(accountId, user.EmployeeId, role);
        var reply = await orchestrator.HandleAsync(context, message, cancellationToken);
        return Ok(new SendMessageResponse(
            reply.Text,
            reply.Actions.Select(action => new ChatActionResponse(action.Label, action.Route)).ToList(),
            reply.Suggestions,
            reply.Lists ?? []));
    }

    [HttpGet("messages")]
    public async Task<IActionResult> History()
    {
        if (user.AccountId is not int accountId)
        {
            return Unauthorized();
        }

        var conversation = await store.GetOrCreateActiveAsync(accountId);
        var messages = await store.ListMessagesAsync(conversation.Id, take: 50);
        return Ok(messages.Select(message => new ChatMessageResponse(
            message.Role,
            message.Content,
            message.CreatedAt,
            message.ListsJson is null ? [] : JsonSerializer.Deserialize<List<ChatList>>(message.ListsJson) ?? [])));
    }

    [HttpDelete("messages")]
    public async Task<IActionResult> Clear()
    {
        if (user.AccountId is not int accountId)
        {
            return Unauthorized();
        }

        var conversation = await store.GetOrCreateActiveAsync(accountId);
        await store.ClearAsync(conversation.Id);
        return NoContent();
    }
}
