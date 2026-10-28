using stackflow_api.Models;
using StackFlow.Application.Chat.Projects;

namespace stackflow_api.Tests.Chat;

/// <summary>Project month filter: invalid months, future starts and missing dates.</summary>
public class ProjectMonthNegativeTests
{
    private static ProjectAssignmentRecord Row(string name, DateOnly start, DateOnly? completed = null) =>
        new(1, "Arnav", name.GetHashCode(), name, "desc", ProjectStatus.Active, start, completed, null, null);

    [Theory]
    [InlineData(0)]
    [InlineData(13)]
    public void Filter_InvalidMonth_Throws(int month)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => ProjectMonthFilter.Filter([], 2026, month, ProjectMonthView.Active, null));
    }

    [Fact]
    public void Filter_YearZero_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => ProjectMonthFilter.Filter([], 0, 6, ProjectMonthView.Active, null));
    }

    [Fact]
    public void Filter_ProjectStartingAfterTheMonthWithNullCompletion_IsExcluded()
    {
        var future = Row("Future", new DateOnly(2027, 2, 1));

        Assert.Empty(ProjectMonthFilter.Filter([future], 2026, 10, ProjectMonthView.Active, null));
    }

    [Fact]
    public void Filter_CompletedInMonthButStartedAfterIt_IsExcludedFromActive()
    {
        var odd = Row("Odd", new DateOnly(2026, 11, 1), completed: new DateOnly(2026, 10, 20));

        Assert.Empty(ProjectMonthFilter.Filter([odd], 2026, 10, ProjectMonthView.Active, null));
    }

    [Fact]
    public void Filter_CompletedBeforeTheMonth_IsExcludedFromActive()
    {
        var done = Row("Done", new DateOnly(2026, 1, 1), completed: new DateOnly(2026, 9, 30));

        Assert.Empty(ProjectMonthFilter.Filter([done], 2026, 10, ProjectMonthView.Active, null));
    }
}
