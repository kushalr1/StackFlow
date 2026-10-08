using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class EmployeeProfileControllerTests
{
    [Fact]
    public async Task Get_WithLinkedEmployee_ReturnsOnlyCurrentEmployeeProfile()
    {
        var controller = new EmployeeProfileController(
            new FakeCurrentUser(7),
            new FakeEmployeeProfileService());

        var result = await controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var profile = Assert.IsType<EmployeeProfileDto>(ok.Value);
        Assert.Equal(7, profile.Id);
    }

    [Fact]
    public async Task Get_WithoutEmployeeClaim_Returns401Unauthorized()
    {
        var controller = new EmployeeProfileController(
            new FakeCurrentUser(null),
            new FakeEmployeeProfileService());

        var result = await controller.Get();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Get_WhenLinkedEmployeeIsMissing_Returns404NotFound()
    {
        var controller = new EmployeeProfileController(
            new FakeCurrentUser(999),
            new FakeEmployeeProfileService());

        var result = await controller.Get();

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public void Controller_RequiresEmployeeRole()
    {
        var attribute = typeof(EmployeeProfileController)
            .GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("Employee", attribute.Roles);
    }

    private sealed class FakeCurrentUser(int? employeeId) : ICurrentUserService
    {
        public int? EmployeeId { get; } = employeeId;
    }

    private sealed class FakeEmployeeProfileService : IEmployeeProfileService
    {
        public Task<EmployeeProfileDto?> GetAsync(int employeeId)
        {
            EmployeeProfileDto? profile = employeeId == 7
                ? new EmployeeProfileDto
                {
                    Id = 7,
                    Name = "Aarav Mehta",
                    Email = "aarav@example.com",
                    Phone = "+919876543210",
                    Department = "Engineering",
                    JobTitle = "Developer",
                    Salary = 75000,
                    DateOfJoining = new DateOnly(2026, 1, 15),
                    IsActive = true
                }
                : null;

            return Task.FromResult(profile);
        }
    }
}
