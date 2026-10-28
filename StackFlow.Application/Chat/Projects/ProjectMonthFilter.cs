using stackflow_api.Models;
using StackFlow.Application.Chat;

namespace StackFlow.Application.Chat.Projects;

/// <summary>One employee's assignment to one project, with the project's dates and status.</summary>
public record ProjectAssignmentRecord(
    int EmployeeId,
    string EmployeeName,
    int ProjectId,
    string ProjectName,
    string Description,
    ProjectStatus ProjectStatus,
    DateOnly StartDate,
    DateOnly? CompletedOn,
    DateOnly? AssignedOn,
    DateOnly? RemovedOn);

public enum ProjectMonthView
{
    /// <summary>Projects the employee was on that were active during the month.</summary>
    Active,
    /// <summary>Projects completed during the month.</summary>
    Completed
}

public static class ProjectMonthFilter
{
    /// <summary>The rule shown to the user alongside the answer.</summary>
    public const string ActiveRule = "A project counts for a month if it was active in that month: it started on or before the month's last day and was not completed before the month's first day.";
    public const string CompletedRule = "A project counts for a month in the Completed view if its completion date falls inside that month.";

    public static IReadOnlyList<ProjectAssignmentRecord> Filter(
        IEnumerable<ProjectAssignmentRecord> rows, int year, int month, ProjectMonthView view, ProjectStatus? status)
    {
        var monthStart = new DateOnly(year, month, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        return rows
            .Where(row => AssignedDuring(row, monthStart, monthEnd))
            .Where(row => view == ProjectMonthView.Active
                ? ActiveDuring(row, monthStart, monthEnd)
                : row.CompletedOn is { } completed && completed >= monthStart && completed <= monthEnd)
            .Where(row => status is null || row.ProjectStatus == status)
            .ToList();
    }

    private static bool AssignedDuring(ProjectAssignmentRecord row, DateOnly monthStart, DateOnly monthEnd) =>
        (row.AssignedOn ?? row.StartDate) <= monthEnd && (row.RemovedOn is null || row.RemovedOn >= monthStart);

    private static bool ActiveDuring(ProjectAssignmentRecord row, DateOnly monthStart, DateOnly monthEnd) =>
        row.StartDate <= monthEnd && (row.CompletedOn is null || row.CompletedOn >= monthStart);
}
