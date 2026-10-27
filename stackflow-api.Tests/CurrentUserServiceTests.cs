using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class CurrentUserServiceTests
{
    private static CurrentUserService Build(ClaimsPrincipal? user)
    {
        var context = new DefaultHttpContext { User = user ?? new ClaimsPrincipal() };
        var accessor = new HttpContextAccessor { HttpContext = context };
        return new CurrentUserService(accessor);
    }

    private static ClaimsPrincipal PrincipalFor(int accountId, string role, int? employeeId = null)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, accountId.ToString()),
            new(ClaimTypes.Role, role)
        };
        if (employeeId is not null)
        {
            claims.Add(new Claim("employee_id", employeeId.Value.ToString()));
        }
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
    }

    [Fact]
    public void AccountId_ReadsClaimTypesNameIdentifier()
    {
        var service = Build(PrincipalFor(accountId: 42, role: "Admin"));

        Assert.Equal(42, service.AccountId);
    }

    [Fact]
    public void Role_ReadsClaimTypesRole()
    {
        var service = Build(PrincipalFor(accountId: 42, role: "Admin"));

        Assert.Equal("Admin", service.Role);
    }

    [Fact]
    public void EmployeeId_IsNull_ForAnAdminAccountWithNoLinkedEmployee()
    {
        var service = Build(PrincipalFor(accountId: 42, role: "Admin", employeeId: null));

        Assert.Null(service.EmployeeId);
    }

    [Fact]
    public void AccountId_AndRole_WorkTogether_ForAnEmployeeAccount()
    {
        var service = Build(PrincipalFor(accountId: 7, role: "Employee", employeeId: 101));

        Assert.Equal(7, service.AccountId);
        Assert.Equal("Employee", service.Role);
        Assert.Equal(101, service.EmployeeId);
    }
}
