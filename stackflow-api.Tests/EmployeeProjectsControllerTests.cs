using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class EmployeeProjectsControllerTests
{
    [Fact]
    public async Task GetAll_UsesAuthenticatedEmployeeIdentity()
    {
        var service = new FakeService();
        var controller = new EmployeeProjectsController(new FakeUser(7), service);
        Assert.IsType<OkObjectResult>((await controller.GetAll()).Result);
        Assert.Equal(7, service.EmployeeId);
    }

    [Fact]
    public async Task GetAll_MissingIdentity_DoesNotQueryProjects()
    {
        var service = new FakeService();
        var controller = new EmployeeProjectsController(new FakeUser(null), service);
        Assert.IsType<UnauthorizedObjectResult>((await controller.GetAll()).Result);
        Assert.Null(service.EmployeeId);
    }

    private sealed class FakeUser(int? id) : ICurrentUserService
    {
        public int? EmployeeId => id;
    }

    private sealed class FakeService : IEmployeeProjectService
    {
        public int? EmployeeId { get; private set; }
        public Task<IReadOnlyList<EmployeeProjectDto>> GetAllAsync(int employeeId)
        {
            EmployeeId = employeeId;
            return Task.FromResult<IReadOnlyList<EmployeeProjectDto>>([]);
        }
    }
}
