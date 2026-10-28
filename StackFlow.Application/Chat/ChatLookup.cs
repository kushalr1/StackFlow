using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat.Tools;

namespace StackFlow.Application.Chat;

/// <summary>
/// Outcome of resolving a name or id for a tool. When Json is set, the tool returns it to the model as-is
/// (refusal, missing value, ambiguity, not found). Otherwise Match holds the single resolved item.
/// </summary>
public sealed record ChatLookupResult<T>(T? Match, string? Json) where T : class;

/// <summary>
/// The one place that decides which employee or department a tool may read. The employee scope is
/// enforced here in C#, so no prompt text or model output can widen it.
/// </summary>
public class ChatLookup(IEmployeeService employeeService, IDepartmentService departmentService)
{
    public static ChatRole RoleOf(ChatCallContext context) =>
        context.Role == UserRoles.Admin ? ChatRole.Admin : ChatRole.Employee;

    public static readonly string RefusalMessage = "You can only view your own information.";

    public async Task<ChatLookupResult<EmployeeDto>> ResolveEmployeeAsync(ChatCallContext context, string? name, int? id)
    {
        if (context.Role == UserRoles.Employee)
        {
            return await ResolveOwnEmployeeAsync(context, name, id);
        }

        if (id is int employeeId)
        {
            var byId = await employeeService.GetByIdAsync(employeeId);
            return byId is null
                ? new(null, Json(new { notFound = true, searched = employeeId.ToString() }))
                : new(byId, null);
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            return new(null, Json(new { missing = "employee", message = "Which employee?" }));
        }

        var matches = (await employeeService.GetAllAsync(name.Trim(), departmentId: null, isActive: null)).ToList();
        if (matches.Count == 0)
        {
            var everyone = await employeeService.GetAllAsync(search: null, departmentId: null, isActive: null);
            var ranked = FuzzyMatcher.Rank(name, everyone, employee => [employee.Name, employee.Email.Split('@')[0]]);
            matches = ranked.Where(match => match.Score >= ranked[0].Score - 0.05).Select(match => match.Item).ToList();
        }

        return matches.Count switch
        {
            0 => new(null, Json(new { notFound = true, searched = name })),
            1 => new(matches[0], null),
            _ => new(null, Json(new { ambiguous = true, options = matches.Select(employee => employee.Name).Take(8) }))
        };
    }

    public async Task<ChatLookupResult<DepartmentDto>> ResolveDepartmentAsync(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return new(null, Json(new { missing = "department", message = "Which department?" }));
        }

        var departments = await departmentService.GetAllAsync();
        var ranked = FuzzyMatcher.Rank(name, departments, department => [department.Name]);
        if (ranked.Count == 0)
        {
            return new(null, Json(new { notFound = true, searched = name, availableDepartments = departments.Select(department => department.Name) }));
        }

        var close = ranked.Where(match => match.Score >= ranked[0].Score - 0.05).Select(match => match.Item).ToList();
        return close.Count == 1
            ? new(close[0], null)
            : new(null, Json(new { ambiguous = true, options = close.Select(department => department.Name) }));
    }

    public static string Refusal() => Json(new { refused = true, message = RefusalMessage });

    private async Task<ChatLookupResult<EmployeeDto>> ResolveOwnEmployeeAsync(ChatCallContext context, string? name, int? id)
    {
        if (context.EmployeeId is not int selfId)
        {
            return new(null, Json(new { notFound = true, message = "No employee profile is linked to this account." }));
        }

        var self = await employeeService.GetByIdAsync(selfId);
        if (self is null)
        {
            return new(null, Json(new { notFound = true, message = "No employee profile is linked to this account." }));
        }

        // Asking for another id or another person's name is a refusal, whatever the model was told.
        if (id is int requested && requested != selfId)
        {
            return new(null, Refusal());
        }

        if (!string.IsNullOrWhiteSpace(name) && FuzzyMatcher.Rank(name, [self], employee => [employee.Name, employee.Email.Split('@')[0]]).Count == 0)
        {
            return new(null, Refusal());
        }

        return new(self, null);
    }

    private static string Json(object value) => ChatJson.Serialize(value);
}
