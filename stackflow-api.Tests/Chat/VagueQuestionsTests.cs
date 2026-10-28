using StackFlow.Application.Chat;
using stackflow_api.Services;

namespace stackflow_api.Tests.Chat;

public class VagueQuestionsTests
{
    [Theory]
    [InlineData("salary")]
    [InlineData("Projects?")]
    [InlineData("  HELP ")]
    [InlineData("hi!")]
    [InlineData("to-do")]
    public void BareTopicsAndGreetings_AreVague(string message) =>
        Assert.True(VagueQuestions.IsVague(message));

    [Theory]
    [InlineData("what is the salary?")]
    [InlineData("total projects of Arnav in September")]
    [InlineData("salary of Dhruv")]
    [InlineData("")]
    public void SpecificQuestions_AreNotVague(string message) =>
        Assert.False(VagueQuestions.IsVague(message));

    [Theory]
    [InlineData("what is the salary?")]
    [InlineData("salary kya hai")]
    [InlineData("Salary?")]
    public void UnscopedSalary_IsAskedBackForAdmins(string message) =>
        Assert.True(VagueQuestions.IsUnscopedSalaryQuestion(message, ChatRole.Admin));

    [Theory]
    [InlineData("what is the salary?")]
    [InlineData("what is Dhruv's salary?")]
    [InlineData("total salary of all employees")]
    public void UnscopedSalary_IsNeverAskedBackForEmployees(string message) =>
        Assert.False(VagueQuestions.IsUnscopedSalaryQuestion(message, ChatRole.Employee));

    [Theory]
    [InlineData("what is Dhruv's salary?")]
    [InlineData("total salary of all employees")]
    public void UnscopedSalary_ScopedQuestionsAreNotAskedBack(string message) =>
        Assert.False(VagueQuestions.IsUnscopedSalaryQuestion(message, ChatRole.Admin));

    [Fact]
    public void Options_DifferByRole()
    {
        Assert.Contains("Salary stats", VagueQuestions.OptionsFor(ChatRole.Admin));
        Assert.Contains("My salary", VagueQuestions.OptionsFor(ChatRole.Employee));
        Assert.DoesNotContain("Salary stats", VagueQuestions.OptionsFor(ChatRole.Employee));
    }
}
