using stackflow_api.Services;

namespace StackFlow.Application.Chat.Tools;

// Lists that expose other people's rows. Both tools are offered to every caller, so the refusal is
// returned by the .NET code below, never left to the model. Employees never receive a row from either.

public class ListEmployeesTool(IEmployeeService employeeService, ChatActionCollector actions) : IChatTool
{
    public string Name => "list_employees";
    public string Description =>
        "Lists all employees in the company (name, department, job title, email, phone, status) as a list card. Admin only; employees are refused.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        if (context.Role != stackflow_api.Models.UserRoles.Admin)
        {
            return ChatLookup.Refusal();
        }

        var employees = await employeeService.GetAllAsync(search: null, departmentId: null, isActive: null);
        if (employees.Count == 0)
        {
            return ChatJson.Serialize(new { count = 0, message = "There are no employees in the company." });
        }

        actions.AddList(ChatListBuilder.Build(
            "All employees",
            $"{employees.Count} employee(s), active and relieved",
            [new("name", "Name", "text"), new("department", "Department", "text"), new("jobTitle", "Job title", "text"),
             new("email", "Email", "text"), new("phone", "Phone", "text"), new("status", "Status", "status")],
            employees.Select(employee => new Dictionary<string, ChatCell>
            {
                ["name"] = ChatListBuilder.Text(employee.Name),
                ["department"] = ChatListBuilder.Text(employee.Department),
                ["jobTitle"] = ChatListBuilder.Text(employee.JobTitle),
                ["email"] = ChatListBuilder.Text(employee.Email),
                ["phone"] = ChatListBuilder.Text(employee.Phone),
                ["status"] = ChatListBuilder.Status(employee.IsActive ? "Active" : "Relieved")
            }).ToList()));

        return ChatJson.Serialize(new { count = employees.Count, message = "The employee list is shown as a card." });
    }
}

public class ListSalariesTool(ChatLookup lookup, IEmployeeService employeeService, ChatActionCollector actions) : IChatTool
{
    public string Name => "list_salaries";
    public string Description =>
        "Lists active employees' monthly salaries, highest first, optionally for one department (fuzzy name), as a list card. Admin only; employees are refused.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson => """{"type":"object","properties":{"department":{"type":"string"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        if (context.Role != stackflow_api.Models.UserRoles.Admin)
        {
            return ChatLookup.Refusal();
        }

        var departmentName = ChatToolArguments.Parse(argumentsJson).GetString("department");
        int? departmentId = null;
        var scope = "whole company";
        if (!string.IsNullOrWhiteSpace(departmentName))
        {
            var departmentResult = await lookup.ResolveDepartmentAsync(departmentName);
            if (departmentResult.Json is not null)
            {
                return departmentResult.Json;
            }

            departmentId = departmentResult.Match!.Id;
            scope = departmentResult.Match.Name;
        }

        var employees = (await employeeService.GetAllAsync(search: null, departmentId, isActive: true))
            .OrderByDescending(employee => employee.Salary)
            .ThenBy(employee => employee.Name)
            .ToList();
        if (employees.Count == 0)
        {
            return ChatJson.Serialize(new { scope, noData = true, message = $"There are no active employees in {scope}." });
        }

        actions.AddList(ChatListBuilder.Build(
            $"Salaries — {scope}",
            $"{employees.Count} active employee(s), monthly",
            [new("name", "Name", "text"), new("department", "Department", "text"), new("salary", "Monthly salary", "currency")],
            employees.Select(employee => new Dictionary<string, ChatCell>
            {
                ["name"] = ChatListBuilder.Text(employee.Name),
                ["department"] = ChatListBuilder.Text(employee.Department),
                ["salary"] = ChatListBuilder.Currency(employee.Salary)
            }).ToList()));

        return ChatJson.Serialize(new { scope, count = employees.Count, message = "The salary list is shown as a card." });
    }
}
