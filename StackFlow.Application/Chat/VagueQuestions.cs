using System.Text.RegularExpressions;
using stackflow_api.Services;

namespace StackFlow.Application.Chat;

/// <summary>
/// A message that is only a bare topic or a greeting has no answer to fetch. The chat asks what the
/// user wants instead of guessing, so this check runs before the model and never needs data.
/// </summary>
public static class VagueQuestions
{
    public const string Question = "What would you like to know?";

    private static readonly HashSet<string> BareTopics =
    [
        "salary", "salaries", "projects", "project", "leave", "leaves", "attendance", "payroll",
        "todo", "todos", "to do", "to-do", "tasks", "task", "employee", "employees", "help", "hi", "hello", "hey",
        "namaste", "hii", "kya", "menu"
    ];

    public static bool IsVague(string message)
    {
        var normalized = Regex.Replace(message.ToLowerInvariant(), @"[^\p{L}\s-]", " ");
        normalized = Regex.Replace(normalized, @"\s+", " ").Trim();
        return normalized.Length > 0 && BareTopics.Contains(normalized);
    }

    private static readonly HashSet<string> SalaryFillerWords =
        ["what", "is", "the", "whats", "kya", "hai", "kitni", "kitna", "ki", "ka", "salary"];

    /// <summary>
    /// "what is the salary?" from an admin names no employee and no scope, so it is asked back rather than
    /// answered with a company total. Employees never get this: the salary they ask about is always their own.
    /// </summary>
    public static bool IsUnscopedSalaryQuestion(string message, ChatRole role)
    {
        if (role != ChatRole.Admin)
        {
            return false;
        }

        var words = Regex.Replace(message.ToLowerInvariant(), @"[^\p{L}\s']", " ")
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return words.Contains("salary") && words.All(SalaryFillerWords.Contains);
    }

    /// <summary>Options for an admin asked about a salary with no subject.</summary>
    public static readonly IReadOnlyList<string> SalaryOptions =
        ["Whole company", "Average by department", "Highest paid employee", "Name an employee"];

    /// <summary>The starting chips for a role, used as the clarifying options.</summary>
    public static IReadOnlyList<string> OptionsFor(ChatRole role) =>
        role == ChatRole.Admin
            ? ["Salary stats", "Employee details", "Leaves", "Attendance", "Projects", "To-dos"]
            : ["My salary", "My leaves", "My projects", "Today's work", "My attendance"];
}
