using stackflow_api.Models;
using StackFlow.Application.Chat.Projects;

namespace stackflow_api.Tests.Chat;

public class ProjectMonthFilterTests
{
    private static ProjectAssignmentRecord Row(
        string name, DateOnly start, DateOnly? completed = null, DateOnly? assigned = null, DateOnly? removed = null,
        ProjectStatus status = ProjectStatus.Active) =>
        new(1, "Arnav", name.GetHashCode(), name, "desc", status, start, completed, assigned, removed);

    [Fact]
    public void ProjectSpanningMonths_AppearsInEachActiveMonth_AndInCompletedOnlyInItsCompletionMonth()
    {
        var spanning = Row("Stackindex", new DateOnly(2026, 9, 15), completed: new DateOnly(2026, 11, 10), status: ProjectStatus.Completed);
        var rows = new[] { spanning };

        Assert.Single(ProjectMonthFilter.Filter(rows, 2026, 9, ProjectMonthView.Active, null));
        Assert.Single(ProjectMonthFilter.Filter(rows, 2026, 10, ProjectMonthView.Active, null));
        Assert.Single(ProjectMonthFilter.Filter(rows, 2026, 11, ProjectMonthView.Active, null));
        Assert.Empty(ProjectMonthFilter.Filter(rows, 2026, 12, ProjectMonthView.Active, null));
        Assert.Empty(ProjectMonthFilter.Filter(rows, 2026, 10, ProjectMonthView.Completed, null));
        Assert.Single(ProjectMonthFilter.Filter(rows, 2026, 11, ProjectMonthView.Completed, null));
    }

    [Fact]
    public void NoProjects_ReturnsEmpty()
    {
        Assert.Empty(ProjectMonthFilter.Filter([], 2026, 8, ProjectMonthView.Active, null));
    }

    [Fact]
    public void NullCompletedDate_CountsAsActiveFromStartOnward()
    {
        var ongoing = Row("Big rx-tile", new DateOnly(2026, 8, 1));

        Assert.Single(ProjectMonthFilter.Filter([ongoing], 2026, 8, ProjectMonthView.Active, null));
        Assert.Single(ProjectMonthFilter.Filter([ongoing], 2026, 10, ProjectMonthView.Active, null));
        Assert.Empty(ProjectMonthFilter.Filter([ongoing], 2026, 7, ProjectMonthView.Active, null));
        Assert.Empty(ProjectMonthFilter.Filter([ongoing], 2026, 10, ProjectMonthView.Completed, null));
    }

    [Fact]
    public void ProjectStartingAfterTheMonth_IsExcluded()
    {
        var later = Row("Future", new DateOnly(2026, 12, 1));

        Assert.Empty(ProjectMonthFilter.Filter([later], 2026, 11, ProjectMonthView.Active, null));
    }

    [Fact]
    public void AssignmentRemovedBeforeTheMonth_IsExcluded()
    {
        var removed = Row("Old", new DateOnly(2026, 1, 1), assigned: new DateOnly(2026, 1, 1), removed: new DateOnly(2026, 6, 30));

        Assert.Empty(ProjectMonthFilter.Filter([removed], 2026, 8, ProjectMonthView.Active, null));
        Assert.Single(ProjectMonthFilter.Filter([removed], 2026, 6, ProjectMonthView.Active, null));
    }

    [Fact]
    public void StatusFilter_NarrowsTheActiveView()
    {
        var rows = new[]
        {
            Row("A", new DateOnly(2026, 8, 1), status: ProjectStatus.Active),
            Row("B", new DateOnly(2026, 8, 1), status: ProjectStatus.Planned),
        };

        var inProgress = ProjectMonthFilter.Filter(rows, 2026, 8, ProjectMonthView.Active, ProjectStatus.Active);

        Assert.Equal("A", Assert.Single(inProgress).ProjectName);
    }
}
