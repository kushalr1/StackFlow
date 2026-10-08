using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class EmployeeNotificationsControllerTests
{
    [Fact]
    public async Task InboxAndRead_UseAuthenticatedEmployeeIdentity()
    {
        var service = new FakeNotifications();
        var controller = new EmployeeNotificationsController(new User(7), service);
        Assert.IsType<OkObjectResult>((await controller.GetInbox()).Result);
        Assert.Equal(7, service.EmployeeId);
        Assert.IsType<NoContentResult>(await controller.MarkRead(10));
        Assert.Equal(7, service.EmployeeId);
        Assert.Equal(10, service.Id);
    }

    [Fact]
    public async Task MissingIdentity_IsUnauthorized()
    {
        var controller = new EmployeeNotificationsController(new User(null), new FakeNotifications());
        Assert.IsType<UnauthorizedResult>((await controller.GetInbox()).Result);
        Assert.IsType<UnauthorizedResult>(await controller.MarkRead(1));
    }

    [Fact]
    public async Task ForeignOrMissingNotification_IsNotFound()
    {
        var controller = new EmployeeNotificationsController(new User(7), new FakeNotifications { Found = false });
        Assert.IsType<NotFoundResult>(await controller.MarkRead(1));
    }

    [Fact]
    public void RequiresEmployeeRole()
    {
        var attribute = Assert.Single(typeof(EmployeeNotificationsController).GetCustomAttributes(typeof(AuthorizeAttribute), false));
        Assert.Equal("Employee", ((AuthorizeAttribute)attribute).Roles);
    }

    private sealed class User(int? id) : ICurrentUserService { public int? EmployeeId => id; }
    private sealed class FakeNotifications : IEmployeeNotificationService
    {
        public int EmployeeId { get; private set; }
        public int Id { get; private set; }
        public bool Found { get; init; } = true;
        public Task<EmployeeNotificationInbox> GetInboxAsync(int employeeId)
        {
            EmployeeId = employeeId;
            return Task.FromResult(new EmployeeNotificationInbox(0, []));
        }
        public Task<bool> MarkReadAsync(int employeeId, int id)
        {
            EmployeeId = employeeId; Id = id; return Task.FromResult(Found);
        }
    }
}
