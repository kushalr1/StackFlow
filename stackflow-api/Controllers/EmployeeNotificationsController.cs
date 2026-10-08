using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Authorize(Roles = "Employee")]
[Route("api/employee/notifications")]
public class EmployeeNotificationsController(ICurrentUserService currentUser, IEmployeeNotificationService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<EmployeeNotificationInbox>> GetInbox() =>
        currentUser.EmployeeId is not int employeeId ? Unauthorized() : Ok(await service.GetInboxAsync(employeeId));

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id) =>
        currentUser.EmployeeId is not int employeeId ? Unauthorized()
        : await service.MarkReadAsync(employeeId, id) ? NoContent() : NotFound();
}
