using System.Text.Json;
using stackflow_api.Services;

using StackFlow.Application.Chat;

namespace StackFlow.Application.Chat.Tools;

/// <summary>Returns a button for a whitelisted page. The model names the page; ChatRoutes picks the URL.</summary>
public class OpenPageTool(ChatLookup lookup, ChatActionCollector actions) : IChatTool
{
    public string Name => "open_page";
    public string Description =>
        "Adds a button that opens a page in the app. Use when the user asks where to do something (e.g. 'where can I edit an employee'). Pages: Dashboard, Employees, EmployeeDetails, EmployeeEdit, Attendance, Leaves, Departments, Projects (admin); MyProfile, MyLeaves, MyAttendance, MyProjects, MyTasks, AddTodo (employee). For EmployeeDetails or EmployeeEdit pass the employee name when known.";
    public ChatRole AllowedRole => ChatRole.Any;
    private static readonly string PageNames = string.Join(",", Enum.GetNames<ChatRoutes.Page>().Select(name => $"\"{name}\""));

    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"page":{"type":"string","enum":[""" + PageNames +
        """]},"employee":{"type":"string"}},"required":["page"]}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var pageName = arguments.GetString("page") ?? string.Empty;
        if (!Enum.TryParse<ChatRoutes.Page>(pageName, ignoreCase: true, out var page))
        {
            return ChatJson.Serialize(new { error = "Unknown page.", options = Enum.GetNames<ChatRoutes.Page>() });
        }

        int? employeeId = null;
        string? employeeName = null;
        if (page is ChatRoutes.Page.EmployeeDetails or ChatRoutes.Page.EmployeeEdit && context.Role == stackflow_api.Models.UserRoles.Admin)
        {
            var employeeArgument = arguments.GetString("employee");
            if (!string.IsNullOrWhiteSpace(employeeArgument))
            {
                var employeeResult = await lookup.ResolveEmployeeAsync(context, employeeArgument, id: null);
                if (employeeResult.Json is not null)
                {
                    return employeeResult.Json;
                }

                employeeId = employeeResult.Match!.Id;
                employeeName = employeeResult.Match.Name;
            }
        }

        var action = ChatRoutes.Build(ChatLookup.RoleOf(context), page, employeeId, employeeName);
        if (action is null)
        {
            return ChatJson.Serialize(new { refused = true, message = "That page is not available for your role." });
        }

        actions.AddAction(action);
        return ChatJson.Serialize(new { added = action.Label });
    }
}

/// <summary>Sets the 2–4 quick-reply chips shown under the reply: clarifying options or follow-ups.</summary>
public class SuggestFollowupsTool(ChatActionCollector actions) : IChatTool
{
    public string Name => "suggest_followups";
    public string Description =>
        "Sets 2 to 4 short clickable chips under your reply. Use it whenever you ask a clarifying question (chips = the likely answers) and after answering (chips = 2 or 3 relevant next questions). Each chip is text the user could send as their next message.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"options":{"type":"array","items":{"type":"string"},"minItems":1,"maxItems":4}},"required":["options"]}""";

    public Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var options = ChatToolArguments.Parse(argumentsJson).GetStringArray("options");
        actions.SetSuggestions(options);
        return Task.FromResult("""{"ok":true}""");
    }
}
