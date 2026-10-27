using System.Security.Claims;

namespace stackflow_api.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor)
    : ICurrentUserService
{
    public int? EmployeeId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User.FindFirstValue("employee_id");
            return int.TryParse(value, out var employeeId) ? employeeId : null;
        }
    }

    public int? AccountId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(value, out var accountId) ? accountId : null;
        }
    }

    public string? Role => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
}
