using Microsoft.AspNetCore.Identity;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class AccountSessionTests
{
    [Fact]
    public void DisableThenEnable_DoesNotRestoreOldSession()
    {
        var account = new AdminUser { PasswordHash = "hash", Role = UserRoles.Employee, EmployeeId = 7, Employee = new Employee { IsActive = true } };
        var oldStamp = AccountSession.Stamp(account.PasswordHash);
        account.IsActive = false;
        account.SessionVersion++;
        Assert.False(AccountSession.IsValid(account, oldStamp, UserRoles.Employee, "7"));
        account.IsActive = true;
        account.SessionVersion++;
        Assert.False(AccountSession.IsValid(account, oldStamp, UserRoles.Employee, "7"));
        Assert.True(AccountSession.IsValid(account, AccountSession.Stamp(account.PasswordHash, account.SessionVersion), UserRoles.Employee, "7"));
        Assert.Equal("hash", account.PasswordHash);
    }
    [Fact]
    public void PasswordReset_InvalidatesPreviousStamp()
    {
        var account = new AdminUser { Role = UserRoles.Employee, EmployeeId = 7, Employee = new Employee { IsActive = true } };
        var hasher = new PasswordHasher<AdminUser>();
        account.PasswordHash = hasher.HashPassword(account, "old-password-123");
        var oldStamp = AccountSession.Stamp(account.PasswordHash);
        Assert.True(AccountSession.IsValid(account, oldStamp, UserRoles.Employee, "7"));
        account.PasswordHash = hasher.HashPassword(account, "new-password-123");
        Assert.False(AccountSession.IsValid(account, oldStamp, UserRoles.Employee, "7"));
        Assert.True(AccountSession.IsValid(account, AccountSession.Stamp(account.PasswordHash), UserRoles.Employee, "7"));
        Assert.Equal(PasswordVerificationResult.Failed, hasher.VerifyHashedPassword(account, account.PasswordHash, "old-password-123"));
    }

    [Fact]
    public void MissingStampOrWrongIdentity_IsRejected()
    {
        var account = new AdminUser { PasswordHash = "hash", Role = UserRoles.Employee, EmployeeId = 7, Employee = new Employee { IsActive = true } };
        Assert.False(AccountSession.IsValid(account, null, UserRoles.Employee, "7"));
        Assert.False(AccountSession.IsValid(account, AccountSession.Stamp("hash"), UserRoles.Employee, "8"));
        account.Employee.IsActive = false;
        Assert.False(AccountSession.IsValid(account, AccountSession.Stamp("hash"), UserRoles.Employee, "7"));
    }
}
