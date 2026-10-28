using System.Text.Json;
using stackflow_api.DTOs;
using stackflow_api.Services;

using StackFlow.Application.Chat;

namespace StackFlow.Application.Chat.Tools;

// Company-wide and department salary aggregates. Admin only. All math happens here in C#.
// Aggregates cover active employees only.

public class GetSalaryStatsTool(ChatLookup lookup, IEmployeeService employeeService) : IChatTool
{
    public string Name => "get_salary_stats";
    public string Description =>
        "Computes an aggregate over active employees' monthly salaries: avg, sum, min, max or count. Optionally limited to one department (fuzzy name). Use for 'average salary of the technical department', 'total salary of all employees', 'how many employees are paid above X'. Report the returned value exactly.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"department":{"type":"string"},"metric":{"type":"string","enum":["avg","sum","min","max","count"]}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var metric = arguments.GetString("metric") ?? "avg";
        var departmentName = arguments.GetString("department");

        int? departmentId = null;
        var scope = "the whole company";
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

        var salaries = (await employeeService.GetAllAsync(search: null, departmentId, isActive: true))
            .Select(employee => employee.Salary)
            .ToList();

        if (salaries.Count == 0)
        {
            return ChatJson.Serialize(new { scope, noData = true, message = $"There are no active employees in {scope}." });
        }

        var value = metric switch
        {
            "sum" => ChatMoney.Format(salaries.Sum()),
            "min" => ChatMoney.Format(salaries.Min()),
            "max" => ChatMoney.Format(salaries.Max()),
            "count" => salaries.Count.ToString(),
            _ => ChatMoney.Format(salaries.Average())
        };

        return ChatJson.Serialize(new
        {
            scope,
            metric,
            activeEmployees = salaries.Count,
            value,
            note = "Active employees only."
        });
    }
}

public class CompareDepartmentsSalaryTool(IDepartmentService departmentService, IEmployeeService employeeService) : IChatTool
{
    public string Name => "compare_departments_salary";
    public string Description =>
        "Compares every department's average, total and headcount of active salaries, highest average first. Use for 'which department pays the most' or 'compare department salaries'.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var departments = await departmentService.GetAllAsync();
        var rows = new List<(string Name, int Count, decimal Total)>();
        foreach (var department in departments)
        {
            var salaries = (await employeeService.GetAllAsync(search: null, department.Id, isActive: true))
                .Select(employee => employee.Salary)
                .ToList();
            rows.Add((department.Name, salaries.Count, salaries.Sum()));
        }

        var comparison = rows
            .Where(row => row.Count > 0)
            .OrderByDescending(row => row.Total / row.Count)
            .Select(row => new
            {
                department = row.Name,
                activeEmployees = row.Count,
                averageSalary = ChatMoney.Format(row.Total / row.Count),
                totalSalary = ChatMoney.Format(row.Total)
            })
            .ToList();

        return ChatJson.Serialize(new
        {
            comparison,
            departmentsWithoutActiveEmployees = rows.Where(row => row.Count == 0).Select(row => row.Name),
            note = "Active employees only."
        });
    }
}

public class GetTopPaidTool(ChatLookup lookup, IEmployeeService employeeService) : IChatTool
{
    private const int MaxResults = 20;

    public string Name => "get_top_paid";
    public string Description =>
        "Lists the highest or lowest paid active employees, optionally within one department (fuzzy name). Use for 'highest paid employee', 'top 5 salaries', 'lowest paid in HR'.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"n":{"type":"integer","minimum":1,"maximum":20},"department":{"type":"string"},"order":{"type":"string","enum":["highest","lowest"]}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var count = Math.Clamp(arguments.GetInt("n") ?? 5, 1, MaxResults);
        var lowest = arguments.GetString("order") == "lowest";
        var departmentName = arguments.GetString("department");

        int? departmentId = null;
        var scope = "the whole company";
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

        var employees = (await employeeService.GetAllAsync(search: null, departmentId, isActive: true)).ToList();
        if (employees.Count == 0)
        {
            return ChatJson.Serialize(new { scope, noData = true, message = $"There are no active employees in {scope}." });
        }

        var ordered = lowest
            ? employees.OrderBy(employee => employee.Salary).ThenBy(employee => employee.Name)
            : employees.OrderByDescending(employee => employee.Salary).ThenBy(employee => employee.Name);
        var ranked = ordered.ToList();

        // People tied with the last place shown are included, so a tie is never silently cut off.
        var cutoff = ranked[Math.Min(count, ranked.Count) - 1].Salary;
        var shown = ranked.Where((employee, index) => index < count || employee.Salary == cutoff);

        return ChatJson.Serialize(new
        {
            scope,
            order = lowest ? "lowest" : "highest",
            tiedAtCutoff = ranked.Count(employee => employee.Salary == cutoff) > 1,
            employees = shown.Select(employee => new
            {
                employee.Name,
                employee.Department,
                salary = ChatMoney.Format(employee.Salary)
            })
        });
    }
}
