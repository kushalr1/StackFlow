using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class EmployeeAccountsControllerTests
{
    [Theory]
    [InlineData(EmployeeAccountOutcome.Created, typeof(OkObjectResult))]
    [InlineData(EmployeeAccountOutcome.NotFound, typeof(NotFoundObjectResult))]
    [InlineData(EmployeeAccountOutcome.Inactive, typeof(ConflictObjectResult))]
    public async Task Access_ReturnsExpectedResult(EmployeeAccountOutcome outcome, Type expected)
    {
        var service = new FakeService(outcome);
        var result = await new EmployeeAccountsController(service).SetAccess(7, new SetEmployeeAccessDto { IsActive = true });
        Assert.IsType(expected, result.Result);
        Assert.Equal(7, service.EmployeeId);
    }
    [Theory]
    [InlineData(EmployeeAccountOutcome.Created, typeof(CreatedResult))]
    [InlineData(EmployeeAccountOutcome.NotFound, typeof(NotFoundObjectResult))]
    [InlineData(EmployeeAccountOutcome.Inactive, typeof(ConflictObjectResult))]
    [InlineData(EmployeeAccountOutcome.AlreadyExists, typeof(ConflictObjectResult))]
    public async Task Create_ReturnsExpectedResult(EmployeeAccountOutcome outcome, Type expected)
    {
        var service = new FakeService(outcome);
        var controller = new EmployeeAccountsController(service);
        var result = await controller.Create(7, new CreateEmployeeAccountDto { Password = "long-password-123" });
        Assert.IsType(expected, result.Result);
        Assert.Equal(7, service.EmployeeId);
    }

    [Fact]
    public void AccountManagement_RequiresAdminRole() =>
        Assert.Equal("Admin", typeof(EmployeeAccountsController).GetCustomAttribute<AuthorizeAttribute>()?.Roles);

    [Theory]
    [InlineData("", false)]
    [InlineData("short", false)]
    [InlineData("long-password-123", true)]
    public void PasswordLength_IsValidated(string password, bool expected)
    {
        var dto = new CreateEmployeeAccountDto { Password = password };
        Assert.Equal(expected, Validator.TryValidateObject(dto, new ValidationContext(dto), [], true));
    }

    private sealed class FakeService(EmployeeAccountOutcome outcome) : IEmployeeAccountService
    {
        public int? EmployeeId { get; private set; }
        public Task<EmployeeAccountDto?> GetAsync(int employeeId) => Task.FromResult<EmployeeAccountDto?>(null);
        public Task<EmployeeAccountResult> ResetAsync(int employeeId, string password) => CreateAsync(employeeId, password);
        public Task<EmployeeAccountResult> SetAccessAsync(int employeeId, bool isActive) => CreateAsync(employeeId, "unused");
        public Task<EmployeeAccountResult> CreateAsync(int employeeId, string password)
        {
            EmployeeId = employeeId;
            return Task.FromResult(new EmployeeAccountResult(outcome,
                outcome == EmployeeAccountOutcome.Created ? new EmployeeAccountDto("employee@example.com", true) : null));
        }
    }
}
