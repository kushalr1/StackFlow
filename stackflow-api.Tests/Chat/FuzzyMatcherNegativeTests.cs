using stackflow_api.DTOs;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Tests.Chat;

/// <summary>Fuzzy name matching with hostile, empty, oversized and ambiguous input. A weak match must never become a guess.</summary>
public class FuzzyMatcherNegativeTests
{
    private static readonly EmployeeDto Arnav = new() { Id = 1, Name = "Arnav Sharma", Email = "arnav@stackflow.local" };
    private static readonly EmployeeDto Meera = new() { Id = 2, Name = "Meera Rao", Email = "meera@stackflow.local" };

    private static IReadOnlyList<(EmployeeDto Item, double Score)> Rank(string query) =>
        FuzzyMatcher.Rank(query, new[] { Arnav, Meera }, employee => [employee.Name]);

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Rank_EmptyOrWhitespaceQuery_ReturnsNothing(string query)
    {
        Assert.Empty(Rank(query));
    }

    [Fact]
    public void Rank_VeryLongQuery_CompletesAndMatchesNothing()
    {
        var query = new string('a', 20_000);

        var ranked = Rank(query);

        Assert.DoesNotContain(ranked, match => match.Item.Id == Arnav.Id && match.Score > 0.9);
    }

    [Theory]
    [InlineData("'; DROP TABLE Employees; --")]
    [InlineData("' OR 1=1 --")]
    [InlineData("%_\\")]
    [InlineData("<script>alert(1)</script>")]
    public void Rank_SqlLikeOrSpecialCharacters_ReturnsNothingAndDoesNotThrow(string query)
    {
        var ranked = Rank(query);

        Assert.DoesNotContain(ranked, match => match.Score > 0.9);
    }

    [Fact]
    public void Rank_NameInDifferentCase_StillFindsTheEmployee()
    {
        var ranked = Rank("ARNAV SHARMA");

        Assert.Equal(Arnav.Id, ranked[0].Item.Id);
    }

    [Fact]
    public void Rank_NonLatinQuery_ReturnsNothingWithoutThrowing()
    {
        var ranked = Rank("अर्णव");

        Assert.DoesNotContain(ranked, match => match.Score > 0.9);
    }

    [Fact]
    public void Rank_TwoEmployeesWithTheSameFirstName_ReturnsBothAtTheTopScore()
    {
        var second = new EmployeeDto { Id = 3, Name = "Arnav Gupta" };
        var ranked = FuzzyMatcher.Rank("Arnav", new[] { Arnav, second }, employee => [employee.Name]);

        var top = ranked.Where(match => match.Score == ranked[0].Score).Select(match => match.Item.Id).ToList();
        Assert.Equal(2, top.Count);
    }

    [Fact]
    public void Rank_UnrelatedName_IsNotReturnedAsAGuess()
    {
        var ranked = Rank("Zebediah Quux");

        Assert.DoesNotContain(ranked, match => match.Item.Id == Meera.Id && match.Score > 0.5);
    }
}
