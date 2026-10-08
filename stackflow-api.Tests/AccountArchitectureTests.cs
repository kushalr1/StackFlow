using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class AccountArchitectureTests
{
    [Fact]
    public void AccountCoreHasNoDatabaseOrWebDependency()
    {
        foreach (var type in new[] { typeof(AuthService), typeof(EmployeeAccountService), typeof(AccountSession),
            typeof(IAccountStore), typeof(IAccountPasswordHasher), typeof(ITokenIssuer), typeof(LoginRequestDto),
            typeof(LoginResponseDto), typeof(EmployeeAccountDto) })
            Assert.Equal("StackFlow.Application", type.Assembly.GetName().Name);
        Assert.DoesNotContain(typeof(AuthService).Assembly.GetReferencedAssemblies(), reference =>
            reference.Name!.StartsWith("Microsoft.EntityFrameworkCore") || reference.Name.StartsWith("Npgsql") ||
            reference.Name.StartsWith("Microsoft.AspNetCore") || reference.Name is "StackFlow.Infrastructure" or "stackflow-api");
    }
}
