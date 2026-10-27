using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using stackflow_api.Services;

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

    public record SendMessageResponse(string Reply);
    public record ChatMessageResponse(string Role, string Content, DateTime CreatedAt);

    [EnableRateLimiting("chat")]
    [HttpPost("messages")]
    public async Task<IActionResult> Send(SendMessageRequest request, CancellationToken cancellationToken)
    {
        if (user.AccountId is not int accountId || user.Role is not string role)
        {
            return Unauthorized();
        }

        var context = new ChatCallContext(accountId, user.EmployeeId, role);
        var reply = await orchestrator.HandleAsync(context, request.Message.Trim(), cancellationToken);
        return Ok(new SendMessageResponse(reply));
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
        return Ok(messages.Select(message => new ChatMessageResponse(message.Role, message.Content, message.CreatedAt)));
    }
}
