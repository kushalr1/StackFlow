using Microsoft.AspNetCore.Identity;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Security;

public class AccountPasswordHasher(IPasswordHasher<AdminUser> hasher) : IAccountPasswordHasher
{
    public string Hash(AdminUser account, string password) => hasher.HashPassword(account, password);
    public bool Verify(AdminUser account, string password) =>
        hasher.VerifyHashedPassword(account, account.PasswordHash, password) != PasswordVerificationResult.Failed;
}
