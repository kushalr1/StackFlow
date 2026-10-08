using System.Security.Cryptography;
using System.Text;
using stackflow_api.Models;

namespace stackflow_api.Services;

public static class AccountSession
{
    public const string ClaimName = "account_session";
    public static string Stamp(string passwordHash, int version = 0) => Convert.ToHexString(SHA256.HashData(
        Encoding.UTF8.GetBytes(version == 0 ? passwordHash : $"{passwordHash}|{version}")));
    public static bool IsValid(AdminUser? account, string? stamp, string? role, string? employeeId) =>
        account is not null && account.IsActive && stamp == Stamp(account.PasswordHash, account.SessionVersion) && role == account.Role &&
        (account.Role != UserRoles.Employee ||
         (account.Employee is { IsActive: true } && employeeId == account.EmployeeId?.ToString()));
}
