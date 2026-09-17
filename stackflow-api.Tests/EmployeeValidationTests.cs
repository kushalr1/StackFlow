using System.ComponentModel.DataAnnotations;
using stackflow_api.DTOs;

namespace stackflow_api.Tests;

public class EmployeeValidationTests
{
    [Theory]
    [InlineData("Kushal Sharma", true)]
    [InlineData("Rahul", true)]
    [InlineData("  Kushal Sharma  ", true)]
    [InlineData("12345", false)]
    [InlineData("Kushal123", false)]
    [InlineData("123Kushal", false)]
    [InlineData("Kushal@123", false)]
    [InlineData("Kushal#", false)]
    [InlineData("Kushal_123", false)]
    [InlineData("Kushal  Sharma", false)]
    [InlineData("   ", false)]
    [InlineData("", false)]
    public void CreateEmployee_NameValidation_MatchesExpectedResult(
        string name,
        bool expectedValid)
    {
        // Arrange
        var employee = CreateValidEmployee();
        employee.Name = name;

        // Act
        var errors = Validate(employee);

        // Assert
        Assert.Equal(expectedValid, errors.Count == 0);
    }

    [Theory]
    [InlineData("Kushal Sharma", true)]
    [InlineData("12345", false)]
    [InlineData("Kushal123", false)]
    [InlineData("Kushal@123", false)]
    [InlineData("   ", false)]
    [InlineData("", false)]
    public void UpdateEmployee_NameValidation_MatchesExpectedResult(
        string name,
        bool expectedValid)
    {
        // Arrange
        var employee = CreateValidUpdateEmployee();
        employee.Name = name;

        // Act
        var errors = Validate(employee);

        // Assert
        Assert.Equal(expectedValid, errors.Count == 0);
    }

    [Fact]
    public void CreateEmployee_WithoutName_IsInvalid()
    {
        // Arrange
        var employee = CreateValidEmployee();
        employee.Name = string.Empty;

        // Act
        var errors = Validate(employee);

        // Assert
        Assert.Contains(errors, error => error.ErrorMessage == "Name is required.");
    }

    [Fact]
    public void CreateEmployee_WithInvalidEmail_IsInvalid()
    {
        // Arrange
        var employee = CreateValidEmployee();
        employee.Email = "not-an-email";

        // Act
        var errors = Validate(employee);

        // Assert
        Assert.Contains(errors, error => error.ErrorMessage == "Enter a valid email address.");
    }

    [Fact]
    public void CreateEmployee_WithInvalidSalary_IsInvalid()
    {
        // Arrange
        var employee = CreateValidEmployee();
        employee.Salary = 0;

        // Act
        var errors = Validate(employee);

        // Assert
        Assert.Contains(errors, error => error.ErrorMessage == "Salary must be greater than 0.");
    }

    private static CreateEmployeeDto CreateValidEmployee()
    {
        return new CreateEmployeeDto
        {
            Name = "Kushal Sharma",
            Email = "kushal@example.com",
            Phone = "9876543210",
            DepartmentId = 1,
            JobTitle = "Developer",
            Salary = 75000,
            DateOfJoining = new DateOnly(2026, 1, 15),
            IsActive = true
        };
    }

    private static UpdateEmployeeDto CreateValidUpdateEmployee()
    {
        return new UpdateEmployeeDto
        {
            Name = "Kushal Sharma",
            Email = "kushal@example.com",
            Phone = "9876543210",
            DepartmentId = 1,
            JobTitle = "Developer",
            Salary = 75000,
            DateOfJoining = new DateOnly(2026, 1, 15),
            IsActive = true
        };
    }

    private static List<ValidationResult> Validate(object model)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(model, new ValidationContext(model), results, true);
        return results;
    }
}
