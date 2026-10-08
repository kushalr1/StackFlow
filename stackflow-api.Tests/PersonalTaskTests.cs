using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using stackflow_api.Controllers;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class PersonalTaskTests
{
    [Theory]
    [InlineData("", "Daily", 2027, false)]
    [InlineData("   ", "Daily", 2027, false)]
    [InlineData("Work", "Monthly", 2027, false)]
    [InlineData("Work", "Daily", 3455, false)]
    [InlineData("Work", "Weekly", 2099, true)]
    public void ValidatesInput(string title, string period, int year, bool valid)
    {
        var input = new SavePersonalTask { Title = title, Period = period, DueDate = new DateOnly(year, 1, 1) };
        Assert.Equal(valid, Validator.TryValidateObject(input, new(input), new List<ValidationResult>(), true));
    }
    [Fact] public void RejectsPastDeadline()
    {
        var input = new SavePersonalTask { Title = "Work", DueDate = DateOnly.FromDateTime(DateTime.Today).AddDays(-1) };
        Assert.False(Validator.TryValidateObject(input, new(input), new List<ValidationResult>(), true));
    }
    [Fact] public void OnlyEmployeeRole()
    {
        Assert.Equal("Employee", typeof(PersonalTasksController).GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>().Single().Roles);
    }
}
