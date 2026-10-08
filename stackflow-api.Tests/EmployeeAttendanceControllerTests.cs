using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class EmployeeAttendanceControllerTests
{
    [Fact]
    public async Task GetMonthly_UsesEmployeeIdFromCurrentUser()
    {
        var service = new FakeEmployeeAttendanceService();
        var controller = new EmployeeAttendanceController(
            new FakeCurrentUser(7),
            service);

        var result = await controller.GetMonthly(2026, 10);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var records = Assert.IsAssignableFrom<IReadOnlyList<EmployeeAttendanceDto>>(ok.Value);
        Assert.Single(records);
        Assert.Equal(7, service.RequestedEmployeeId);
    }

    [Fact]
    public async Task GetMonthly_WithoutEmployeeClaim_Returns401Unauthorized()
    {
        var controller = new EmployeeAttendanceController(
            new FakeCurrentUser(null),
            new FakeEmployeeAttendanceService());

        var result = await controller.GetMonthly(2026, 10);

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(2026, 0)]
    [InlineData(2026, 13)]
    [InlineData(0, 10)]
    public async Task GetMonthly_WithInvalidPeriod_Returns400BadRequest(int year, int month)
    {
        var controller = new EmployeeAttendanceController(
            new FakeCurrentUser(7),
            new FakeEmployeeAttendanceService());

        var result = await controller.GetMonthly(year, month);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public void Controller_RequiresEmployeeRole()
    {
        var attribute = typeof(EmployeeAttendanceController)
            .GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("Employee", attribute.Roles);
    }

    private sealed class FakeCurrentUser(int? employeeId) : ICurrentUserService
    {
        public int? EmployeeId { get; } = employeeId;
    }

    private sealed class FakeEmployeeAttendanceService : IEmployeeAttendanceService
    {
        public int? RequestedEmployeeId { get; private set; }

        public Task<IReadOnlyList<EmployeeAttendanceDto>> GetMonthlyAsync(
            int employeeId,
            int year,
            int month)
        {
            RequestedEmployeeId = employeeId;
            IReadOnlyList<EmployeeAttendanceDto> records =
            [
                new()
                {
                    Date = new DateOnly(year, month, 1),
                    Status = "Present"
                }
            ];
            return Task.FromResult(records);
        }
    }
}
