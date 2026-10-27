using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class EmployeeLeavesControllerTests
{
    [Fact]
    public async Task GetAll_UsesEmployeeIdFromCurrentUser()
    {
        var service = new FakeEmployeeLeaveService();
        var controller = new EmployeeLeavesController(new FakeCurrentUser(7), service);

        var result = await controller.GetAll();

        Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(7, service.RequestedEmployeeId);
    }

    [Fact]
    public async Task Create_UsesEmployeeIdFromCurrentUserAndReturns201Created()
    {
        var service = new FakeEmployeeLeaveService();
        var controller = new EmployeeLeavesController(new FakeCurrentUser(7), service);

        var result = await controller.Create(ValidRequest());

        Assert.IsType<CreatedResult>(result.Result);
        Assert.Equal(7, service.RequestedEmployeeId);
    }

    [Fact]
    public async Task GetAll_WithoutEmployeeClaim_Returns401Unauthorized()
    {
        var controller = new EmployeeLeavesController(
            new FakeCurrentUser(null),
            new FakeEmployeeLeaveService());

        var result = await controller.GetAll();

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public void Controller_RequiresEmployeeRole()
    {
        var attribute = typeof(EmployeeLeavesController)
            .GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("Employee", attribute.Roles);
    }

    private static CreateEmployeeLeaveDto ValidRequest() => new()
    {
        LeaveType = LeaveType.CasualLeave,
        StartDate = DateOnly.FromDateTime(DateTime.Today).AddDays(2),
        EndDate = DateOnly.FromDateTime(DateTime.Today).AddDays(3),
        Reason = "Family event"
    };

    private sealed class FakeCurrentUser(int? employeeId) : ICurrentUserService
    {
        public int? EmployeeId { get; } = employeeId;
        public int? AccountId => EmployeeId;
        public string? Role => "Employee";
    }

    private sealed class FakeEmployeeLeaveService : IEmployeeLeaveService
    {
        public int? RequestedEmployeeId { get; private set; }

        public Task<IReadOnlyList<EmployeeLeaveDto>> GetAllAsync(int employeeId)
        {
            RequestedEmployeeId = employeeId;
            return Task.FromResult<IReadOnlyList<EmployeeLeaveDto>>([]);
        }

        public Task<EmployeeLeaveCreateResult> CreateAsync(
            int employeeId,
            CreateEmployeeLeaveDto dto)
        {
            RequestedEmployeeId = employeeId;
            return Task.FromResult(new EmployeeLeaveCreateResult(
                EmployeeLeaveCreateOutcome.Created,
                new EmployeeLeaveDto
                {
                    Id = 1,
                    LeaveType = "Casual Leave",
                    StartDate = dto.StartDate!.Value,
                    EndDate = dto.EndDate!.Value,
                    TotalDays = 2,
                    Reason = dto.Reason,
                    Status = "Pending",
                    AppliedOn = DateTime.UtcNow
                }));
        }
    }
}
